import PackOut from "../../models/packOut/index.js";
import PackIn from "../../models/packIn/index.js";
import Master from "../../models/master/index.js";
import ExcelJS from "exceljs";
import { v4 as uuidv4 } from "uuid";

 //add color function
function getRackColor(used, total) {
  const percentage = (used / total) * 100;

  if (percentage === 0) return "green";
  if (percentage <= 50) return "green";
  if (percentage > 50 && percentage <= 70) return "yellow";
  if (percentage > 70 && percentage < 100) return "orange";
  return "red"; // >= 100
}

const packOutService = {
async  createPackOut(req, res) {
  try {
    const data = req.body;

    const quantity = Number(data.quantity);

    if (!data.rack_id || !data.package_id || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔹 VALIDATE PACKIN EXISTS
    const packIn = await PackIn.findOne({
      "invoice.invoice_number": data.invoice_number,
      is_deleted: false
    });

    if (!packIn) {
      return res.status(400).json({ message: "Invalid invoice" });
    }

    // 🔹 FIND RACK
    const master = await Master.findOne({
      "racks.rack_id": data.rack_id
    });

    if (!master) {
      return res.status(400).json({ message: "Rack not found" });
    }

    const rack = master.racks.find(
      r => r.rack_id === data.rack_id && !r.is_deleted
    );

    if (!rack) {
      return res.status(400).json({ message: "Rack not found" });
    }

    // 🔴 CHECK PACKAGE
    const existing = rack.package_details.find(
      p => p.pack_id === data.package_id
    );

    if (!existing) {
      return res.status(400).json({
        message: "Package not in rack"
      });
    }

    // 🔴 CHECK QUANTITY
    if (existing.package_quantity < quantity) {
      return res.status(400).json({
        message: "Not enough quantity"
      });
    }

    // 🔹 REDUCE
    existing.package_quantity -= quantity;

    // REMOVE IF ZERO
    if (existing.package_quantity === 0) {
      rack.package_details = rack.package_details.filter(
        p => p.pack_id !== data.package_id
      );
    }

    // 🔹 UPDATE SPACE
    rack.used_space -= quantity;
    rack.available_space = rack.total_space - rack.used_space;

    // 🔹 UPDATE RACK STATUS
if (rack.used_space >= rack.total_space) {
  rack.rack_status = "Inactive";
} else {
  rack.rack_status = "Active";
}

    // 🔹 COLOR UPDATE
    rack.color = getRackColor(rack.used_space, rack.total_space);

    await master.save();

    // 🔹 SAVE PACKOUT
    const pack = new PackOut({
      pack_out_id: `PACKOUT_${uuidv4()}`,
      invoice_number: data.invoice_number,
      package_id: data.package_id,
      quantity,
      rack_id: data.rack_id
    });

    await pack.save();

    return res.status(201).json({
      message: "Pack-Out success",
      rack
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
  async listPackOut(req, res) {
    try {
      const packs = await PackOut.find({ is_deleted: false });

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Pack OUT list fetched",
        data: packs
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        code: 500,
        message: err.message
      });
    }
  },

  async getPackOutById(req, res) {
    try {
      const { id } = req.query;

      const pack = await PackOut.findOne({ _id: id, is_deleted: false });

      if (!pack) {
        return res.status(404).json({
          status: "error",
          message: "Pack OUT not found"
        });
      }

      return res.status(200).json({
        status: "success",
        data: pack
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },

  async updatePackOut(req, res) {
    try {
      const { id } = req.params;

      await PackOut.findByIdAndUpdate(id, {
        $set: req.body
      });

      return res.status(200).json({
        status: "success",
        message: "Pack OUT updated"
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },

  async deletePackOut(req, res) {
  try {
    const { id } = req.query;

    // 🔹 Step 1: Get PackOut record
    const packOut = await PackOut.findById(id);

    if (!packOut) {
      return res.status(404).json({
        status: "error",
        message: "Pack OUT not found"
      });
    }

    // 🔹 Step 2: Update PackOut → is_deleted = true
    packOut.is_deleted = true;
    await packOut.save();

    // 🔹 Step 3: ALSO update PackIn (IMPORTANT FIX)
    await PackIn.updateMany(
      {
        "invoice.invoice_number": packOut.invoice_number,
        "package.package_id": packOut.package_id,
         "rack.rack_id":packOut.rack_id,
        is_deleted: false
      },
      {
        $set: { is_deleted: true }
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Pack OUT deleted and Pack IN updated"
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
},
  // ✅ KEEP THIS 
  async getPackDetails(req, res) {
    try {
      const { invoice_number } = req.query;

      if (!invoice_number) {
        return res.status(400).json({
          status: "error",
          message: "invoice_number is required"
        });
      }

      const pack = await PackIn.findOne({
        "invoice.invoice_number": invoice_number,
        is_deleted: false
      });

      if (!pack) {
        return res.status(200).json({
          status: "success",
          keyframe: false,
          data: null
        });
      }

      return res.status(200).json({
        status: "success",
        keyframe: true,
        data: {
          invoice_number: pack.invoice?.invoice_number,
          customer_name: pack.invoice?.customer_name,
          part_number: pack.part?.part_number,
          package_id: pack.package?.package_id,
          quantity: pack.package?.quantity
        }
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },

  // ✅ KEEP THIS (no changes)
  async invoiceDropdown(req, res) {
    try {
      const invoices = await PackIn.find(
        {
          type: "CUSTOMER",
          is_deleted: false
        },
        {
          "invoice.invoice_number": 1,
          "invoice.customer_name": 1,
          //"part.part_number": 1,
          _id: 0
        }
      );

      const formattedData = invoices.map(item => ({
        invoice_number: item.invoice?.invoice_number,
        customer_name: item.invoice?.customer_name,
        //part_number: item.part?.part_number
      }));

      return res.status(200).json({
        status: "success",
        data: formattedData
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },
  async downloadPackOutExcel(req, res) {
  try {
    const { startDate, endDate, rack_id, package_id, invoice_number } = req.query;

    let filter = { is_deleted: false };

    // 🔹 Date Filter
    if (startDate && endDate) {
      filter.created_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // 🔹 Rack Filter
    if (rack_id) {
      filter.rack_id = rack_id;
    }

    // 🔹 Package Filter
    if (package_id) {
      filter.package_id = package_id;
    }

    // 🔹 Invoice Filter
    if (invoice_number) {
      filter.invoice_number = invoice_number;
    }

    const data = await PackOut.find(filter).sort({ created_at: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PackOut");

    // ✅ Headers
    sheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Time", key: "time", width: 15 },
      { header: "Invoice Number", key: "invoice", width: 25 },
      { header: "Package ID", key: "package", width: 20 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Rack ID", key: "rack", width: 20 }
    ];

    // ✅ Data Rows
    data.forEach(item => {
      const createdAt = item.created_at ? new Date(item.created_at) : new Date();

      sheet.addRow({
        date: createdAt.toLocaleDateString("en-GB"),
        time: createdAt.toLocaleTimeString("en-IN"),
        invoice: item.invoice_number || "-",
        package: item.package_id || "-",
        quantity: item.quantity || 0,
        rack: item.rack_id || "-"
      });
    });

    // ✅ Excel Filter
    sheet.autoFilter = { from: "A1", to: "F1" };

    // ✅ Header Style
    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=packout.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
  async rackDropdown(req, res) {
  try {
    const { package_id } = req.query;

    // Step 1: get PackIn data (invoice + package)
    const packInData = await PackIn.find(
      package_id
        ? { "package.package_id": package_id, is_deleted: false }
        : { is_deleted: false },
      {
        "invoice.invoice_number": 1,
        "package.package_id": 1,
        _id: 0
      }
    );

    // Step 2: get Master data (rack mapping)
    const masterData = await Master.find(
      package_id
        ? { "racks.package_details.pack_id": package_id }
        : {},
      {
        "racks.rack_id": 1,
        "racks.package_details": 1,
        _id: 0
      }
    );

    const result = [];

    masterData.forEach(master => {
      master.racks?.forEach(rack => {
        rack.package_details?.forEach(pkg => {

          if (!package_id || pkg.pack_id === package_id) {

            const pack = packInData.find(
              p => p.package?.package_id === pkg.pack_id
            );

            result.push({
              invoice_number: pack?.invoice?.invoice_number || null,
              package_id: pkg.pack_id,
              rack_id: rack.rack_id
            });
          }

        });
      });
    });

    return res.status(200).json({
      status: "success",
      data: result
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
}
};

export default packOutService;
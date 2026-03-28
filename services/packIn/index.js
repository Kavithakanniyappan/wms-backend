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

const packInService = {

  // CREATE
  async  createPackIn(req, res) {
  try {
    const data = req.body;

    const quantity = Number(data.quantity);

    if (!data.rack_id || !data.package_id || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
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

    // 🔴 SPACE VALIDATION
    if (rack.available_space < quantity) {
      return res.status(400).json({
        message: `Rack full. Available: ${rack.available_space}`
      });
    }

    // 🔹 UPDATE SPACE
    rack.used_space += quantity;
    rack.available_space = rack.total_space - rack.used_space;

    // 🔹 UPDATE RACK STATUS
if (rack.used_space >= rack.total_space) {
  rack.rack_status = "Inactive";
} else {
  rack.rack_status = "Active";
}

    // 🔹 PACKAGE UPDATE
    const existing = rack.package_details.find(
      p => p.pack_id === data.package_id
    );

    if (existing) {
      existing.package_quantity += quantity;
    } else {
      rack.package_details.push({
        pack_id: data.package_id,
        package_name: data.package_id,
        package_quantity: quantity
      });
    }

    // 🔹 COLOR UPDATE
    rack.color = getRackColor(rack.used_space, rack.total_space);

    await master.save();

    // 🔹 SAVE PACKIN
    const pack = new PackIn({
      pack_in_id: `PACKIN_${uuidv4()}`,
      type: "CUSTOMER",
      invoice: {
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        invoice_number: data.invoice_number
      },
      package: {
        package_id: data.package_id,
        quantity: quantity
      },
      rack: {
        rack_id: data.rack_id
      },
      completion: {
          notes: data.notes
        }
    });

    await pack.save();

    return res.status(201).json({
      message: "Pack-In success",
      rack,
      data: pack
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
// LIST
  async listPackIn(req, res) {
    try {
      const data = await PackIn.find({
        type: "CUSTOMER",
        is_deleted: false
      }).sort({ created_at: -1 });

      return res.status(200).json({ data });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  // GET BY ID (?id=)
  async getPackInById(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const data = await PackIn.findOne({
        _id: id,
        type: "CUSTOMER",
        is_deleted: false
      });

      if (!data) {
        return res.status(404).json({ message: "Not found" });
      }

      return res.status(200).json({ data });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  // UPDATE
  async updatePackIn(req, res) {
    try {
      const { id } = req.params;

      const data = await PackIn.findOneAndUpdate(
        { _id: id, type: "CUSTOMER", is_deleted: false },
        { $set: req.body, updated_at: new Date() },
        { new: true }
      );

      if (!data) {
        return res.status(404).json({ message: "Not found or deleted" });
      }

      return res.status(200).json({ message: "Updated successfully", data });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  // DELETE (?id=)
  async deletePackIn(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const data = await PackIn.findOneAndUpdate(
        { _id: id, type: "CUSTOMER", is_deleted: false },
        { $set: { is_deleted: true, updated_at: new Date() } },
        { new: true }
      );

      if (!data) {
        return res.status(404).json({ message: "Not found or already deleted" });
      }

      return res.status(200).json({ message: "Deleted successfully" });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  /* ================= BARCODE ================= */

  // CREATE
  async createBarcodePackIn(req, res) {
    try {
      const data = req.body;

      const requiredFields = ["invoice_barcode", "package_id", "quantity", "rack_id"];
      for (const field of requiredFields) {
        if (!data[field]) {
          return res.status(400).json({ message: `Missing field: ${field}` });
        }
      }

      // const existing = await PackIn.findOne({
      //   "invoice.invoice_barcode": data.invoice_barcode,
      //   "package.package_id": data.package_id,
      //   type: "BARCODE",
      //   is_deleted: false
      // });

      // if (existing) {
      //   return res.status(400).json({ message: "Duplicate Barcode Pack-In not allowed" });
      // }

      const pack = new PackIn({
        pack_in_id: `PACKIN_${uuidv4()}`,
        type: "BARCODE",
        invoice: {
          invoice_barcode: data.invoice_barcode
        },
        // part: {
        //  pack_id: data.pack_id,
        //  pack_name: data.pack_name,
        //  part_number: data.part_number
        // },
        package: {
          package_id: data.package_id,
          //quantity_barcode: data.quantity_barcode,
          quantity: data.quantity
        },
        rack: {
          rack_id: data.rack_id,
          //rack_status: data.rack_status
        },
        completion: {
          notes: data.notes
        }
      });

      await pack.save();

      return res.status(201).json({ message: "Barcode Pack-In created", data: pack });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  // LIST
  async listBarcodePackIn(req, res) {
    try {
      const data = await PackIn.find({
        type: "BARCODE",
        is_deleted: false
      }).sort({ created_at: -1 });

      return res.status(200).json({ data });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  // GET BY ID
  async getBarcodePackInById(req, res) {
    try {
      const { id } = req.params;

      const data = await PackIn.findOne({
        _id: id,
        type: "BARCODE",
        is_deleted: false
      });

      if (!data) {
        return res.status(404).json({ message: "Not found" });
      }

      return res.status(200).json({ data });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  // UPDATE
  async updateBarcodePackIn(req, res) {
    try {
      const { id } = req.params;

      const data = await PackIn.findOneAndUpdate(
        { _id: id, type: "BARCODE", is_deleted: false },
        { $set: req.body, updated_at: new Date() },
        { new: true }
      );

      if (!data) {
        return res.status(404).json({ message: "Not found or deleted" });
      }

      return res.status(200).json({ message: "Updated successfully", data });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  // DELETE
  async deleteBarcodePackIn(req, res) {
    try {
      const { id } = req.params;

      const data = await PackIn.findOneAndUpdate(
        { _id: id, type: "BARCODE", is_deleted: false },
        { $set: { is_deleted: true, updated_at: new Date() } },
        { new: true }
      );

      if (!data) {
        return res.status(404).json({ message: "Not found or already deleted" });
      }

      return res.status(200).json({ message: "Deleted successfully" });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  
async downloadPackInExcel(req, res) {
  try {
    const { startDate, endDate, rack_id, package_id, customer_id } = req.query;

    let filter = { is_deleted: false };

    // 🔹 Date Filter
    if (startDate && endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  end.setHours(23, 59, 59, 999); // 🔥 IMPORTANT

  filter.created_at = {
    $gte: start,
    $lte: end
  };
}
    // 🔹 Rack Filter
    if (rack_id) {
      filter["rack.rack_id"] = rack_id;
    }

    // 🔹 Package Filter
    if (package_id) {
      filter["package.package_id"] = package_id;
    }

    // 🔹 Customer Filter
    if (customer_id) {
      filter["invoice.customer_id"] = customer_id;
    }

    const data = await PackIn.find(filter).sort({ created_at: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PackIn");

    // ✅ Headers
    sheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Time", key: "time", width: 15 },
      { header: "Customer ID", key: "customer_id", width: 20 },
      { header: "Customer Name", key: "customer_name", width: 25 },
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
        customer_id: item.invoice?.customer_id || "-",
        customer_name: item.invoice?.customer_name || "-",
        invoice: item.invoice?.invoice_number || "-",
        package: item.package?.package_id || "-",
        quantity: item.package?.quantity || 0,
        rack: item.rack?.rack_id || "-"
      });
    });

    // ✅ Excel Filter
    sheet.autoFilter = { from: "A1", to: "H1" };

    // ✅ Header Style
    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=packin.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

};

export default packInService;
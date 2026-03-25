import PackOut from "../../models/packOut/index.js";
import PackIn from "../../models/packIn/index.js";
import Master from "../../models/master/index.js";
import ExcelJS from "exceljs";
import { v4 as uuidv4 } from "uuid";

 //add color function
function getRackColor(used, total) {
  if (used === 0) return "green";
  if (used < total) return "yellow";
  return "red";
}


const packOutService = {
async createPackOut(req, res) {
  try {
    const data = req.body;

    const requiredFields = [
      "invoice_number",
      "package_id",
      "quantity",
      "rack_id"
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({
          message: `Missing field: ${field}`
        });
      }
    }

    // 🔹 VALIDATE PACKIN
    const packInData = await PackIn.findOne({
      "invoice.invoice_number": data.invoice_number,
      is_deleted: false
    });

    if (!packInData) {
      return res.status(400).json({
        message: "Invalid invoice_number"
      });
    }

    if (packInData.package.package_id !== data.package_id) {
      return res.status(400).json({
        message: "Invalid package_id"
      });
    }

    if (packInData.rack?.rack_id !== data.rack_id) {
      return res.status(400).json({
        message: "Invalid rack_id"
      });
    }

    // 🔹 FIND RACK
    const master = await Master.findOne({
      "racks.rack_id": data.rack_id
    });

    const rack = master.racks.find(
      r => r.rack_id === data.rack_id && !r.is_deleted
    );

    // 🔹 FIND PACKAGE
    const existingPackage = rack.package_details.find(
      p => p.pack_id === data.package_id
    );

    if (!existingPackage) {
      return res.status(400).json({
        message: "Package not in rack"
      });
    }

    if (existingPackage.package_quantity < data.quantity) {
      return res.status(400).json({
        message: "Not enough quantity"
      });
    }

    // 🔹 UPDATE PACKAGE
    existingPackage.package_quantity -= data.quantity;

    if (existingPackage.package_quantity === 0) {
      rack.package_details = rack.package_details.filter(
        p => p.pack_id !== data.package_id
      );
    }

    // 🔹 UPDATE SPACE
    rack.used_space -= data.quantity;
    rack.available_space = rack.total_space - rack.used_space;

    // 🔹 UPDATE COLOR
    rack.color = getRackColor(rack.used_space, rack.total_space);

    // 🔹 SAVE RACK
    await master.save();

    // 🔹 SAVE PACKOUT
    const pack = new PackOut({
      pack_out_id: `PACKOUT_${uuidv4()}`,
      invoice_number: data.invoice_number,
      package_id: data.package_id,
      quantity: data.quantity,
      rack_id: data.rack_id
    });

    await pack.save();

    return res.status(201).json({
      message: "Pack-Out created & rack updated"
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

      await PackOut.findByIdAndUpdate(id, {
        is_deleted: true
      });

      return res.status(200).json({
        status: "success",
        message: "Pack OUT deleted"
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },

  // ✅ KEEP THIS (no changes)
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
    const data = await PackOut.find({ is_deleted: false });
  
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PackOut");
  
    sheet.columns = [
      
      { header: "Invoice", key: "invoice" },
      { header: "Package", key: "package" },
      { header: "Quantity", key: "quantity" },
      { header: "Rack", key: "rack" }
    ];
  
    data.forEach(item => {
      sheet.addRow({
  
        invoice: item.invoice?.invoice_number,
        package: item.package?.package_id,
        quantity: item.package?.quantity,
        rack: item.rack?.rack_id
      });
    });
  
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  
    res.setHeader("Content-Disposition", "attachment; filename=packin.xlsx");
  
    await workbook.xlsx.write(res);
    res.end();
  }
  

};

export default packOutService;
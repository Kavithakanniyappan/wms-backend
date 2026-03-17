import PackIn from "../../models/packIn/index.js";
import { v4 as uuidv4 } from "uuid";

const packInService = {

/* ================= CREATE ================= */
async createPackIn(req, res) {
  try {

    const data = req.body;

    const requiredFields = [
      "invoice_type",
      "pack_id",
      "package_id",
      "quantity",
      "rack_id"
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({
          status: "error",
          message: `Missing field: ${field}`
        });
      }
    }

    if (data.invoice_type === "CUSTOMER") {
      if (!data.customer_id || !data.invoice_number) {
        return res.status(400).json({
          message: "Customer & Invoice required"
        });
      }
    }

    if (data.invoice_type === "BARCODE") {
      if (!data.invoice_barcode) {
        return res.status(400).json({
          message: "Invoice barcode required"
        });
      }
    }

    const pack = new PackIn({
      pack_in_id: `PACKIN_${uuidv4()}`,

      invoice_type: data.invoice_type,

      customer_id: data.customer_id,
      customer_name: data.customer_name,
      invoice_number: data.invoice_number,
      invoice_barcode: data.invoice_barcode,

      pack_id: data.pack_id,
      pack_name: data.pack_name,

      package_id: data.package_id,
      quantity_barcode: data.quantity_barcode,
      quantity: data.quantity,

      rack_id: data.rack_id,
      rack_status: data.rack_status,

      notes: data.notes
    });

    await pack.save();

    return res.status(201).json({
      message: "Pack IN created successfully"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

/* ================= LIST ================= */
async listPackIn(req, res) {
  try {

    const data = await PackIn.find({ is_deleted: false });

    return res.status(200).json({
      data
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

/* ================= GET BY ID ================= */
async getPackInById(req, res) {
  try {

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const data = await PackIn.findById(id);

    return res.status(200).json({ data });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

/* ================= UPDATE ================= */
async updatePackIn(req, res) {
  try {

    const { id } = req.params;

    const data = await PackIn.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Updated successfully",
      data
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

/* ================= DELETE ================= */
async deletePackIn(req, res) {
  try {

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    await PackIn.findByIdAndUpdate(id, {
      is_deleted: true
    });

    return res.status(200).json({
      message: "Deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

};

export default packInService;
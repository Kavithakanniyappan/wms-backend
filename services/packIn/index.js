import PackIn from "../../models/packIn/index.js";
import { v4 as uuidv4 } from "uuid";

const packInService = {

  /* ================= CUSTOMER ================= */

  // CREATE
  async createPackIn(req, res) {
    try {
      const data = req.body;

      const requiredFields = ["customer_id", "customer_name", "invoice_number", "pack_id", "package_id", "quantity", "rack_id"];
      for (const field of requiredFields) {
        if (!data[field]) {
          return res.status(400).json({ message: `Missing field: ${field}` });
        }
      }

      const existing = await PackIn.findOne({
        "invoice.customer_id": data.customer_id,
        "invoice.invoice_number": data.invoice_number,
        "part.pack_id": data.pack_id,
        "package.package_id": data.package_id,
        type: "CUSTOMER",
        is_deleted: false
      });

      if (existing) {
        return res.status(400).json({ message: "Duplicate Customer Pack-In not allowed" });
      }

      const pack = new PackIn({
        pack_in_id: `PACKIN_${uuidv4()}`,
        type: "CUSTOMER",
        invoice: {
          customer_id: data.customer_id,
          customer_name: data.customer_name,
          invoice_number: data.invoice_number
        },
        part: {
          pack_id: data.pack_id,
          pack_name: data.pack_name,
          part_number: data.part_number
        },
        package: {
          package_id: data.package_id,
          quantity_barcode: data.quantity_barcode,
          quantity: data.quantity
        },
        rack: {
          rack_id: data.rack_id,
          rack_status: data.rack_status
        },
        completion: {
          notes: data.notes
        }
      });

      await pack.save();

      return res.status(201).json({ message: "Customer Pack-In created", data: pack });

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

      const requiredFields = ["invoice_barcode", "pack_id", "package_id", "quantity", "rack_id"];
      for (const field of requiredFields) {
        if (!data[field]) {
          return res.status(400).json({ message: `Missing field: ${field}` });
        }
      }

      const existing = await PackIn.findOne({
        "invoice.invoice_barcode": data.invoice_barcode,
        "part.pack_id": data.pack_id,
        "package.package_id": data.package_id,
        type: "BARCODE",
        is_deleted: false
      });

      if (existing) {
        return res.status(400).json({ message: "Duplicate Barcode Pack-In not allowed" });
      }

      const pack = new PackIn({
        pack_in_id: `PACKIN_${uuidv4()}`,
        type: "BARCODE",
        invoice: {
          invoice_barcode: data.invoice_barcode
        },
        part: {
          pack_id: data.pack_id,
          pack_name: data.pack_name,
          part_number: data.part_number
        },
        package: {
          package_id: data.package_id,
          quantity_barcode: data.quantity_barcode,
          quantity: data.quantity
        },
        rack: {
          rack_id: data.rack_id,
          rack_status: data.rack_status
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
  }

};

export default packInService;
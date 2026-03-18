import mongoose from "mongoose";

const packInSchema = new mongoose.Schema({
  pack_in_id: { type: String, unique: true },
  type: { type: String }, // "CUSTOMER" or "BARCODE"

  // invoice
  invoice: {
    customer_id: { type: String, default: null },
    customer_name: { type: String, default: null },
    invoice_number: { type: String, default: null },
    invoice_barcode: { type: String, default: null }
  },

  // ✅ Plain object (NO sub-schema → NO _id)
  part: {
    pack_id: { type: String, unique: true },
    pack_name: { type: String, default: null },
    part_number: { type: String, default: null }
  },

  package: {
    package_id: { type: String, default: null },
    quantity_barcode: { type: String, default: null },
    quantity: { type: Number, default: null }
  },

  rack: {
    rack_id: { type: String, default: null },
    rack_status: { type: String, default: null }
  },

  completion: {
    notes: { type: String, default: null }
  },

  is_deleted: { type: Boolean, default: false },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }

});

export default mongoose.model("PackIn", packInSchema, "pack_in");
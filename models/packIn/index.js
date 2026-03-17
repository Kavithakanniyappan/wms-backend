import mongoose from "mongoose";

const packInSchema = new mongoose.Schema({

  pack_in_id: String,

  invoice_type: { type: String, enum: ["CUSTOMER", "BARCODE"] },

  customer_id: String,
  customer_name: String,
  invoice_number: String,
  invoice_barcode: String,

  pack_id: String,
  pack_name: String,

  package_id: String,
  quantity_barcode: String,
  quantity: Number,

  rack_id: String,
  rack_status: String,

  notes: String,
  status: { type: String, default: "COMPLETED" },

  is_deleted: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model("PackIn", packInSchema, "pack_in");
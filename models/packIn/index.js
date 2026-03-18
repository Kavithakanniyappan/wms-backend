import mongoose from "mongoose";

/* ================= CUSTOMER BASED INVOICE ================= */
const customerInvoiceSchema = new mongoose.Schema({
  customer_id: { type: String },
  customer_name: { type: String },
  invoice_number: { type: String }
});

/* ================= BARCODE BASED INVOICE ================= */
const barcodeInvoiceSchema = new mongoose.Schema({
  invoice_barcode: { type: String } // BC-INV-XXXX
});

/* ================= PART SCHEMA ================= */
const partSchema = new mongoose.Schema({
  pack_id: { type: String },
  pack_name: { type: String },
  part_number: { type: String }
});

/* ================= PACKAGE SCHEMA ================= */
const packageSchema = new mongoose.Schema({
  package_id: { type: String },
  quantity_barcode: { type: String },
  quantity: { type: Number }
});

/* ================= RACK SCHEMA ================= */
const rackSchema = new mongoose.Schema({
  rack_id: { type: String },
  rack_status: { type: String }
});

/* ================= COMPLETION SCHEMA ================= */
const completionSchema = new mongoose.Schema({
  notes: { type: String }
});

/* ================= MAIN PACK-IN SCHEMA ================= */
const packInSchema = new mongoose.Schema({
  type: { type: String }, // "CUSTOMER" or "BARCODE"

  invoice: { 
    type: mongoose.Schema.Types.Mixed // can store customerInvoiceSchema or barcodeInvoiceSchema
  },
  part: partSchema,
  package: packageSchema,
  rack: rackSchema,
  completion: completionSchema,

  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model("PackIn", packInSchema, "pack_in");
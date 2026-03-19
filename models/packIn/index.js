import mongoose from "mongoose";

const packInSchema = new mongoose.Schema({
  pack_in_id: { type: String, unique: true },
  type: { type: String }, // "CUSTOMER" or "BARCODE"

  // invoice
  invoice: {
    customer_id: { type: String },
    customer_name: { type: String },
    invoice_number: { type: String },
    invoice_barcode: { type: String }
  },

  // // part
  // part: {
  //   pack_id: { type: String, unique: true },
  //    pack_name: { type: String},
  //    part_number: { type: String }
  // },

  package: {
    package_id: { type: String },
    quantity_barcode: { type: String },
    quantity: { type: Number}
  },

  rack: {
    rack_id: { type: String},
    //rack_status: { type: String, default: null }
  },

  completion: {
    notes: { type: String, default: null }
  },

  is_deleted: { type: Boolean, default: false },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }

});

export default mongoose.model("PackIn", packInSchema, "pack_in");
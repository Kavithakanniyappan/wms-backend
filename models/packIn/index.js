import mongoose from "mongoose";

const packInSchema = new mongoose.Schema({

  pack_in_id: { type: String, unique: true },

  customer_name: { type: String },

  invoice_number: { type: String },

  package_id: { type: String },

  quantity: { type: Number },

  rack_id: { type: String },

  is_deleted: {
    type: Boolean,
    default: false
  },

  created_at: {
    type: Date,
    default: Date.now
  },

  updated_at: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("pack_in", packInSchema, "pack_in");
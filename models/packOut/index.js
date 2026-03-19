import mongoose from "mongoose";

const packOutSchema = new mongoose.Schema({

  pack_out_id: { type: String, unique: true },

  invoice_number: { type: String },

  package_id: { type: String },

  quantity: { type: Number },

  rack_id: { type: String },

//  part_number:{type: String},
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

export default mongoose.model("pack_out", packOutSchema, "pack_out");
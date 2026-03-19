import mongoose from "mongoose";

//   CUSTOMER SCHEMA
const customerSchema = new mongoose.Schema({
  customer_id: { type: String },
  customer_name: { type: String },
  customer_code: { type: String },
  contact_person: { type: String },
  contact_number: { type: String },
  email: { type: String },
  address: { type: String },
  status: { type: String, default: "Active" }
});

//PACK SCHEMA
const packSchema = new mongoose.Schema({
  pack_id: { type: String },
  part_number:{type:String},
  part_name: { type: String },
  customer_id: { type: String },
  uom: { type: String },
  description: { type: String },
  barcode:{type: String},
  status: { type: String, default: "Active" }
});
  // MASTER SCHEMA

const masterSchema = new mongoose.Schema({
  type: { type: String }, // CUSTOMER / PACK

  customer: customerSchema,
  pack: packSchema,

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model("Master", masterSchema, "master");
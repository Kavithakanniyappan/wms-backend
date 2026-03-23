import mongoose from "mongoose";

//CUSTOMER SCHEMA
const customerSchema = new mongoose.Schema({
  customer_id: String,
  customer_name: String,
  customer_code: String,
  contact_person: String,
  contact_number: String,
  email: String,
  address: String,
  status: { type: String, default: "Active" }
});

// PACK SCHEMA

const packSchema = new mongoose.Schema({
  type:"PACK",
  pack: {
  pack_id: { type: String },
  part_number:{type:String},
  part_name: { type: String },
  customer_id: { type: String },
  uom: { type: String },
  description: { type: String },
  barcode:{type: String},
   status: { type: String, default: "Active" }
});


  // RACK SCHEMA

const rackSchema = new mongoose.Schema({
  rack_id: String,
  pack_id: String,
  quantity: Number,
  rack_status: String,
  is_deleted: { type: Boolean, default: false }
});


  // MASTER SCHEMA
const masterSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["CUSTOMER", "PACK"], 
    required: true 
  },

  customer: customerSchema,
  pack: packSchema,
  racks: {
    type: [rackSchema],
    default: []
  },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model("Master", masterSchema, "master");

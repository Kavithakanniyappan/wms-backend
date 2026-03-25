import mongoose from "mongoose";

// CUSTOMER 
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

// PACK 
const packSchema = new mongoose.Schema({
  pack_id: String,
  part_number: String,
  part_name: String,
  customer_id: String,
  uom: String,
  description: String,
  barcode: String,
  status: { type: String, default: "Active" }
});

const packageDetailsSchema = new mongoose.Schema({
  pack_id: String,
  package_name: String,
  package_quantity: Number
});
//rack
const rackSchema = new mongoose.Schema({
  rack_id: { type: String, required: true },

  total_space: { type: Number, required: true },
  used_space: { type: Number, default: 0 },
  available_space: { type: Number },

  rack_status: { type: String, default: "Active" },

  color: { type: String, default: "green" },

  package_details: {
    type: [packageDetailsSchema],
    default: []
  },

  is_deleted: { type: Boolean, default: false }
});

// MASTER 
const masterSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["CUSTOMER", "PART"], 
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
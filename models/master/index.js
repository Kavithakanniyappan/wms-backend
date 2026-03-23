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
},
 racks: [] 
});
//Rack Shema
const rackSchema = new mongoose.Schema({
  rack_id: { type: String },
  pack_id:{type:String},
  quantity: { type: Number },
  rack_status:{type:String},
   is_deleted: { type: Boolean, default: false } 
});

  // MASTER SCHEMA

const masterSchema = new mongoose.Schema({
  type: { type: String }, // CUSTOMER / PACK

  customer: customerSchema,
  pack: packSchema,
  racks: {
  type: [rackSchema],
  default: []
} ,

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model("Master", masterSchema, "master");

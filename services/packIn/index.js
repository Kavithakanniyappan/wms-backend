import PackIn from "../../models/packIn/index.js";
import { v4 as uuidv4 } from "uuid";

const packInService = {

async createPackIn(req,res){

try{

const data=req.body;

const requiredFields=[
"customer_name",
"invoice_number",
"package_id",
"quantity",
"rack_id"
];

for(const field of requiredFields){

if(!data[field]){

return res.status(400).json({
status:"error",
code:400,
message:`Missing required field: ${field}`,
data:null
})

}

}

const packInData={

pack_in_id:`packin_${uuidv4()}`,
customer_name:data.customer_name,
invoice_number:data.invoice_number,
package_id:data.package_id,
quantity:data.quantity,
rack_id:data.rack_id

};

const pack=new PackIn(packInData);

await pack.save();

return res.status(201).json({
status:"success",
code:201,
message:"Pack IN created successfully",
data:null
});

}
catch(err){

return res.status(500).json({
status:"error",
code:500,
message:err.message,
data:null
})

}

},

async listPackIn(req,res){

try{

const packs=await PackIn.find({is_deleted:false});

return res.status(200).json({
status:"success",
code:200,
message:"Pack IN list fetched",
data:packs
})

}
catch(err){

return res.status(500).json({
status:"error",
code:500,
message:err.message
})

}

},

async getPackInById(req,res){

try{

const {id}=req.query;

const pack=await PackIn.findOne({_id:id,is_deleted:false});

if(!pack){

return res.status(404).json({
status:"error",
message:"Pack IN not found"
})

}

return res.status(200).json({
status:"success",
data:pack
})

}
catch(err){

return res.status(500).json({
status:"error",
message:err.message
})

}

},

async updatePackIn(req,res){

try{

const {id}=req.params;

await PackIn.findByIdAndUpdate(id,{
$set:req.body
});

return res.status(200).json({
status:"success",
message:"Pack IN updated"
})

}
catch(err){

return res.status(500).json({
status:"error",
message:err.message
})

}

},

async deletePackIn(req,res){

try{

const {id}=req.query;

await PackIn.findByIdAndUpdate(id,{
is_deleted:true
});

return res.status(200).json({
status:"success",
message:"Pack IN deleted"
})

}
catch(err){

return res.status(500).json({
status:"error",
message:err.message
})

}

}

};

export default packInService;
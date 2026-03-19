import PackOut from "../../models/packOut/index.js";
import PackIn from "../../models/packIn/index.js";
import ExcelJS from "exceljs";
import { v4 as uuidv4 } from "uuid";

const packOutService = {

async createPackOut(req, res) {
  try {
    const data = req.body;

    const requiredFields = ["invoice_number", "package_id", "quantity", "rack_id"];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({
          status: "error",
          message: `Missing required field: ${field}`
        });
      }
    }

    //  1. CHECK invoice exists in PackIn
    const packInData = await PackIn.findOne({
      "invoice.invoice_number": data.invoice_number,
      "package.package_id": data.package_id,
      is_deleted: false
    });

    if (!packInData) {
      return res.status(400).json({
        status: "error",
        message: "Invalid invoice number. No PackIn found"
      });
    }

    // 2. TOTAL PACK IN QUANTITY
    const totalPackIn = await PackIn.aggregate([
      {
        $match: {
          "invoice.invoice_number": data.invoice_number,
          "package.package_id": data.package_id,
          is_deleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$package.quantity" }
        }
      }
    ]);

    const totalIn = totalPackIn[0]?.total || 0;

    // 3. TOTAL PACK OUT QUANTITY
    const totalPackOut = await PackOut.aggregate([
      {
        $match: {
          invoice_number: data.invoice_number,
          package_id: data.package_id,
          is_deleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" }
        }
      }
    ]);

    const totalOut = totalPackOut[0]?.total || 0;

    const availableQty = totalIn - totalOut;

    // 🔹  VALIDATE QUANTITY
    if (data.quantity > availableQty) {
      return res.status(400).json({
        status: "error",
        message: `Only ${availableQty} quantity available`
      });
    }

    // 🔹 RACK CAPACITY (Example: max 10 per rack)
    const MAX_RACK_CAPACITY = 10;

    const rackUsed = await PackIn.aggregate([
      {
        $match: {
          "rack.rack_id": data.rack_id,
          is_deleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$package.quantity" }
        }
      }
    ]);

    const usedSpace = rackUsed[0]?.total || 0;
    const availableSpace = MAX_RACK_CAPACITY - usedSpace;

    if (availableSpace <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Rack is FULL"
      });
    }

    if (data.quantity > availableSpace) {
      return res.status(400).json({
        status: "error",
        message: `Only ${availableSpace} space available in rack`
      });
    }

    //  CREATE PACK OUT
    const pack = new PackOut({
      pack_out_id: `PACKOUT_${uuidv4()}`,
      invoice_number: data.invoice_number,
      package_id: data.package_id,
      quantity: data.quantity,
      rack_id: data.rack_id
      // customer optional → no validation
    });

    await pack.save();

    return res.status(201).json({
      status: "success",
      message: "Pack OUT created",
      rack_status: `${availableSpace - data.quantity} space left`
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
},

async listPackOut(req,res){

try{

const packs=await PackOut.find({is_deleted:false});

return res.status(200).json({
status:"success",
code:200,
message:"Pack OUT list fetched",
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

async getPackOutById(req,res){

try{

const {id}=req.query;

const pack=await PackOut.findOne({_id:id,is_deleted:false});

if(!pack){

return res.status(404).json({
status:"error",
message:"Pack OUT not found"
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

async updatePackOut(req,res){

try{

const {id}=req.params;

await PackOut.findByIdAndUpdate(id,{
$set:req.body
});

return res.status(200).json({
status:"success",
message:"Pack OUT updated"
})

}
catch(err){

return res.status(500).json({
status:"error",
message:err.message
})

}

},

async deletePackOut(req,res){

try{

const {id}=req.query;

await PackOut.findByIdAndUpdate(id,{
is_deleted:true
});

return res.status(200).json({
status:"success",
message:"Pack OUT deleted"
})

}
catch(err){

return res.status(500).json({
status:"error",
message:err.message
})

}

},
async getPackDetails(req, res) {
  try {

    const { invoice_number } = req.query;

    if (!invoice_number) {
      return res.status(400).json({
        status: "error",
        message: "invoice_number is required"
      });
    }

    // 🔥 FIX: use nested field
    const pack = await PackIn.findOne({
      "invoice.invoice_number": invoice_number,
      is_deleted: false
    });

    // If not found
    if (!pack) {
      return res.status(200).json({
        status: "success",
        keyframe: false,
        data: null
      });
    }

    // If found
    return res.status(200).json({
      status: "success",
      keyframe: true,
      data: {
        invoice_number: pack.invoice?.invoice_number,
        customer_name: pack.invoice?.customer_name,
       //part_number: pack.part?.part_number,
        package_id: pack.package?.package_id,
        quantity: pack.package?.quantity,
        rack_id: pack.rack?.rack_id
      }
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
},
async invoiceDropdown(req, res) {
  try {

    // Fetch only CUSTOMER type invoices
    const invoices = await PackIn.find(
      { 
        type: "CUSTOMER", 
        is_deleted: false 
      },
      { 
        "invoice.invoice_number": 1,
        "invoice.customer_name": 1,
        //"part.part_number": 1,
        _id: 0
      }
    );

    // Format response (clean structure for UI)
    const formattedData = invoices.map(item => ({
      invoice_number: item.invoice?.invoice_number,
      customer_name: item.invoice?.customer_name,
      part_number: item.part?.part_number
    }));

    return res.status(200).json({
      status: "success",
      data: formattedData
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
},
async downloadPackOutExcel(req, res) {
  const data = await PackOut.find({ is_deleted: false });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("PackOut");

  sheet.columns = [
    { header: "Invoice", key: "invoice" },
    { header: "Package", key: "package" },
    { header: "Quantity", key: "quantity" },
    { header: "Rack", key: "rack" }
  ];

  data.forEach(item => {
    sheet.addRow({
      invoice: item.invoice_number,
      package: item.package_id,
      quantity: item.quantity,
      rack: item.rack_id
    });
  });

  res.setHeader("Content-Disposition", "attachment; filename=packout.xlsx");

  await workbook.xlsx.write(res);
  res.end();
}

};

export default packOutService;
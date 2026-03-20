import PackOut from "../../models/packOut/index.js";
import PackIn from "../../models/packIn/index.js";
import { v4 as uuidv4 } from "uuid";

const packOutService = {

 async createPackOut(req, res) {
  try {
    const data = req.body;

    const requiredFields = [
      "invoice_number",
      "package_id",
      "quantity",
      "rack_id"
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({
          status: "error",
          message: `Missing required field: ${field}`
        });
      }
    }

    // ✅ STEP 1: CHECK PACKIN EXISTS
    const packInData = await PackIn.findOne({
      "invoice.invoice_number": data.invoice_number,
      is_deleted: false
    });

    if (!packInData) {
      return res.status(400).json({
        status: "error",
        message: "Invalid invoice_number: No PackIn record found"
      });
    }

    // ✅ STEP 2: VALIDATE PACKAGE MATCH
    if (packInData.package?.package_id !== data.package_id) {
      return res.status(400).json({
        status: "error",
        message: "Invalid package_id for this invoice"
      });
    }

    // ✅ STEP 3: VALIDATE RACK (if stored in PackIn)
    if (packInData.rack_id && packInData.rack_id !== data.rack_id) {
      return res.status(400).json({
        status: "error",
        message: "Invalid rack_id for this invoice"
      });
    }

    // ✅ STEP 4: CHECK DUPLICATE (invoice + package + rack)
    const existingPackOut = await PackOut.findOne({
      invoice_number: data.invoice_number,
      package_id: data.package_id,
      rack_id: data.rack_id,
      is_deleted: false
    });

    if (existingPackOut) {
      return res.status(400).json({
        status: "error",
        message: "Duplicate entry: PackOut already exists for this combination"
      });
    }

    // ✅ STEP 5: CHECK AVAILABLE QUANTITY
    const totalPackedInQty = packInData.package?.quantity || 0;

    const totalPackedOutQty = await PackOut.aggregate([
      {
        $match: {
          invoice_number: data.invoice_number,
          package_id: data.package_id,
          rack_id: data.rack_id,
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

    const usedQty = totalPackedOutQty.length > 0 ? totalPackedOutQty[0].total : 0;

    const remainingQty = totalPackedInQty - usedQty;

    if (data.quantity > remainingQty) {
      return res.status(400).json({
        status: "error",
        message: `Quantity exceeded. Available: ${remainingQty}`
      });
    }

    // ✅ STEP 6: CREATE PACKOUT
    const packOutData = {
      pack_out_id: `packout_${uuidv4()}`,
      customer_name: packInData.invoice?.customer_name,
      invoice_number: data.invoice_number,
      package_id: data.package_id,
      quantity: data.quantity,
      rack_id: data.rack_id
    };

    const pack = new PackOut(packOutData);
    await pack.save();

    return res.status(201).json({
      status: "success",
      message: "Pack OUT created successfully"
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
},

  async listPackOut(req, res) {
    try {
      const packs = await PackOut.find({ is_deleted: false });

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Pack OUT list fetched",
        data: packs
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        code: 500,
        message: err.message
      });
    }
  },

  async getPackOutById(req, res) {
    try {
      const { id } = req.query;

      const pack = await PackOut.findOne({ _id: id, is_deleted: false });

      if (!pack) {
        return res.status(404).json({
          status: "error",
          message: "Pack OUT not found"
        });
      }

      return res.status(200).json({
        status: "success",
        data: pack
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },

  async updatePackOut(req, res) {
    try {
      const { id } = req.params;

      await PackOut.findByIdAndUpdate(id, {
        $set: req.body
      });

      return res.status(200).json({
        status: "success",
        message: "Pack OUT updated"
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },

  async deletePackOut(req, res) {
    try {
      const { id } = req.query;

      await PackOut.findByIdAndUpdate(id, {
        is_deleted: true
      });

      return res.status(200).json({
        status: "success",
        message: "Pack OUT deleted"
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },

  // ✅ KEEP THIS (no changes)
  async getPackDetails(req, res) {
    try {
      const { invoice_number } = req.query;

      if (!invoice_number) {
        return res.status(400).json({
          status: "error",
          message: "invoice_number is required"
        });
      }

      const pack = await PackIn.findOne({
        "invoice.invoice_number": invoice_number,
        is_deleted: false
      });

      if (!pack) {
        return res.status(200).json({
          status: "success",
          keyframe: false,
          data: null
        });
      }

      return res.status(200).json({
        status: "success",
        keyframe: true,
        data: {
          invoice_number: pack.invoice?.invoice_number,
          customer_name: pack.invoice?.customer_name,
          part_number: pack.part?.part_number,
          package_id: pack.package?.package_id,
          quantity: pack.package?.quantity
        }
      });

    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },

  // ✅ KEEP THIS (no changes)
  async invoiceDropdown(req, res) {
    try {
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

      const formattedData = invoices.map(item => ({
        invoice_number: item.invoice?.invoice_number,
        customer_name: item.invoice?.customer_name,
        //part_number: item.part?.part_number
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
  }

};

export default packOutService;
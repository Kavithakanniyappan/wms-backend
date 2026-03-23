import Master from "../../models/master/index.js";
import { v4 as uuidv4 } from "uuid";

const masterService = {
// CREATE
async createCustomerMaster(req, res) {
  try {
    const data = req.body;

    const requiredFields = ["customer_name", "customer_code"];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({
          status: "error",
          message: `Missing field: ${field}`
        });
      }
    }
    // DUPLICATE CHECK 
const existingCustomer = await Master.findOne({
  type: "CUSTOMER",
  "customer.customer_code": data.customer_code
});

if (existingCustomer) {
  return res.status(400).json({
    status: "error",
    message: "Customer already exists with this code"
  });
}

    const customer = new Master({
      type: "CUSTOMER",
      customer: {
        customer_id: `CUST_${uuidv4()}`,
        customer_name: data.customer_name,
        customer_code: data.customer_code,
        contact_person: data.contact_person,
        contact_number: data.contact_number,
        email: data.email,
        address: data.address,
        status:data.status
      }
    });

    await customer.save();

    return res.status(201).json({
      status: "success",
      message: "Customer created"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// LIST
async listCustomerMaster(req, res) {
  try {
    const data = await Master.find({ type: "CUSTOMER" });

    return res.status(200).json({
      status: "success",
      data
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// GET BY ID
async getCustomerMasterById(req, res) {
  try {
    const data = await Master.findById(req.params.id);

    return res.status(200).json({ data });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// UPDATE
async updateCustomerMaster(req, res) {
  try {
    const data = await Master.findByIdAndUpdate(
      req.params.id,
      { $set: { customer: req.body } },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      data
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// DELETE
async deleteCustomerMaster(req, res) {
  try {
    await Master.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "Deleted"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// CREATE
async createPackMaster(req, res) {
  try {
    const data = req.body;

    const requiredFields = ["part_name", "customer_id", "uom"];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({
          status: "error",
          message: `Missing field: ${field}`
        });
      }
    }
    // DUPLICATE CHECK (PACK)
const existingPack = await Master.findOne({
  type: "PACK",
  "pack.part_number": data.part_number
});

if (existingPack) {
  return res.status(400).json({
    status: "error",
    message: "Part already exists with this part number"
  });
}

    const pack = new Master({
      type: "PACK",
      pack: {
        pack_id: `PACK_${uuidv4()}`,
        part_number:data.part_number,
        part_name: data.part_name,
        customer_id: data.customer_id,
        uom: data.uom,
        description: data.description,
        barcode:data.barcode,
        status:data.status
       
      }
    });

    await pack.save();

    return res.status(201).json({
      status: "success",
      message: "Pack created"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// LIST
async listPackMaster(req, res) {
  try {
    const data = await Master.find({ type: "PACK" });

    return res.status(200).json({
      status: "success",
      data
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// GET BY ID
async getPackMasterById(req, res) {
  try {
    const data = await Master.findById(req.params.id);

    return res.status(200).json({ data });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// UPDATE
async updatePackMaster(req, res) {
  try {
    const data = await Master.findByIdAndUpdate(
      req.params.id,
      { $set: { pack: req.body } },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      data
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// DELETE
async deletePackMaster(req, res) {
  try {
    await Master.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: "success",
      message: "Deleted"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
async customerDropdown(req, res) {
  try {
    const data = await Master.find(
      { type: "CUSTOMER" },
      { "customer.customer_id": 1, "customer.customer_name": 1 }
    );

    const result = data.map(item => ({
      label: item.customer?.customer_name,
      value: item.customer?.customer_id
    }));

    return res.status(200).json({
      status: "success",
      data: result
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
async statusDropdown(req, res) {
  try {
    const result = [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" }
    ];

    return res.status(200).json({
      status: "success",
      data: result
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
async commonFilter(req, res) {
  try {
    const { type, customer_name, part_name } = req.query;

    let query = {};

    if (type === "CUSTOMER") {
      query.type = "CUSTOMER";
      if (customer_name) {
        query["customer.customer_name"] = { $regex: customer_name, $options: "i" };
      }
    }

    if (type === "PACK") {
      query.type = "PACK";
      if (pack_name) {
        query["pack.part_name"] = { $regex: part_name, $options: "i" };
      }
    }

    const data = await Master.find(query);

    return res.status(200).json({
      status: "success",
      data
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// CREATE RACK
async createRack(req, res) {
  try {
    const data = req.body;

    const requiredFields = ["pack_id", "rack_id"];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({
          status: "error",
          message: `Missing field: ${field}`
        });
      }
    }

    const pack = await Master.findOne({
      type: "PACK",
      "pack.pack_id": data.pack_id
    });

    if (!pack) {
      return res.status(400).json({
        status: "error",
        message: "Pack not found"
      });
    }

    //  FIX: initialize racks array
    if (!pack.racks) {
      pack.racks = [];
    }

    // DUPLICATE CHECK
    const existingRack = pack.racks.find(
      r => r.rack_id === data.rack_id && !r.is_deleted
    );

    if (existingRack) {
      return res.status(400).json({
        status: "error",
        message: "Rack already exists"
      });
    }

    pack.racks.push({
      rack_id: data.rack_id,
      pack_id: data.pack_id,
      quantity: data.quantity || 0,
      rack_status: data.rack_status || "Active",
      is_deleted: false
    });

    await pack.save();

    return res.status(201).json({
      status: "success",
      message: "Rack created"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
   //LIST RACKS

async listRack(req, res) {
  try {
    const { pack_id } = req.query;

    if (!pack_id) {
      return res.status(400).json({
        status: "error",
        message: "pack_id is required"
      });
    }

    const pack = await Master.findOne({
      type: "PACK",
      "pack.pack_id": pack_id
    });

    if (!pack) {
      return res.status(400).json({
        status: "error",
        message: "Pack not found"
      });
    }

    const data = (pack.racks || []).filter(r => !r.is_deleted);

    return res.status(200).json({
      status: "success",
      data
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
// GET RACK BY ID

async getRackById(req, res) {
  try {
    const { pack_id, rack_id } = req.query;

    if (!pack_id || !rack_id) {
      return res.status(400).json({
        status: "error",
        message: "pack_id and rack_id required"
      });
    }

    const pack = await Master.findOne({
      type: "PACK",
      "pack.pack_id": pack_id
    });

    if (!pack) {
      return res.status(400).json({
        status: "error",
        message: "Pack not found"
      });
    }

    const rack = (pack.racks || []).find(
      r => r.rack_id === rack_id && !r.is_deleted
    );

    if (!rack) {
      return res.status(400).json({
        status: "error",
        message: "Rack not found"
      });
    }

    return res.status(200).json({
      status: "success",
      data: rack
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},


   //UPDATE RACK

async updateRack(req, res) {
  try {
    const data = req.body;

    const { pack_id, rack_id } = data;

    if (!pack_id || !rack_id) {
      return res.status(400).json({
        status: "error",
        message: "pack_id and rack_id required"
      });
    }

    const pack = await Master.findOne({
      type: "PACK",
      "pack.pack_id": pack_id
    });

    if (!pack) {
      return res.status(400).json({
        status: "error",
        message: "Pack not found"
      });
    }

    const rack = (pack.racks || []).find(
      r => r.rack_id === rack_id && !r.is_deleted
    );

    if (!rack) {
      return res.status(400).json({
        status: "error",
        message: "Rack not found"
      });
    }

    // update fields
    if (data.quantity !== undefined) rack.quantity = data.quantity;
    if (data.rack_status) rack.rack_status = data.rack_status;

    await pack.save();

    return res.status(200).json({
      status: "success",
      data: rack
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

 //DELETE RACK 

async deleteRack(req, res) {
  try {
    const { pack_id, rack_id } = req.body;

    if (!pack_id || !rack_id) {
      return res.status(400).json({
        status: "error",
        message: "pack_id and rack_id required"
      });
    }

    const pack = await Master.findOne({
      type: "PACK",
      "pack.pack_id": pack_id
    });

    if (!pack) {
      return res.status(400).json({
        status: "error",
        message: "Pack not found"
      });
    }

    const rack = (pack.racks || []).find(
      r => r.rack_id === rack_id && !r.is_deleted
    );

    if (!rack) {
      return res.status(400).json({
        status: "error",
        message: "Rack not found"
      });
    }

    //  SOFT DELETE
    rack.is_deleted = true;

    await pack.save();

    return res.status(200).json({
      status: "success",
      message: "Rack deleted"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
};

export default masterService;
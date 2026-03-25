import Master from "../../models/master/index.js";
import { v4 as uuidv4 } from "uuid";

//add color function
function getRackColor(used, total) {
  const percentage = (used / total) * 100;

  if (percentage === 0) return "green";
  if (percentage <= 50) return "green";
  if (percentage > 50 && percentage <= 70) return "yellow";
  if (percentage > 70 && percentage < 100) return "orange";
  return "red"; // >= 100
}

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

    const requiredFields = ["part_number","part_name", "customer_id", "uom"];

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
  type: "PART",
  "pack.part_number": data.part_number
});

if (existingPack) {
  return res.status(400).json({
    status: "error",
    message: "Part already exists with this part number"
  });
}

    const pack = new Master({
      type: "PART",
      pack: {
        part_id: `PART_${uuidv4()}`,
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
      message: "Part created"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},

// LIST
async listPackMaster(req, res) {
  try {
    const data = await Master.find({ type: "PART" });

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
    const updateData = {};

    // Dynamically map fields to pack.*
    for (let key in req.body) {
      updateData[`pack.${key}`] = req.body[key];
    }

    const data = await Master.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
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

    if (type === "PART") {
      query.type = "PART";
      if (part_name) {
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
    const { rack_id, total_space } = req.body;

    if (!rack_id || !total_space) {
      return res.status(400).json({
        status: "error",
        message: "rack_id and total_space are required"
      });
    }

    //  DUPLICATE CHECK
   const existing = await Master.findOne({
  racks: {
    $elemMatch: {
      rack_id: rack_id,
      is_deleted: false
    }
  }
});
    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "Rack already exists"
      });
    }

    const rack = {
      rack_id,
      total_space,
      used_space: 0,
      available_space: total_space,
      rack_status: "Active",
      color: "green",
      package_details: []
    };

    await Master.updateOne({}, { $push: { racks: rack } });

    return res.status(201).json({
      status: "success",
      message: "Rack created successfully"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
async listRack(req, res) {
  try {
    const data = await Master.find(
      {},
      { racks: 1, _id: 0 }
    );

    const racks = data.flatMap(item =>
      item.racks.filter(r => !r.is_deleted)
    );

    return res.status(200).json({
      status: "success",
      data: racks
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
//get by id
async getRackById(req, res) {
  try {
    const { id } = req.params;

    const master = await Master.findOne({
      "racks._id": id
    });

    if (!master) {
      return res.status(404).json({
        status: "error",
        message: "Rack not found"
      });
    }

    const rack = master.racks.find(
      r => r._id.toString() === id && !r.is_deleted
    );

    if (!rack) {
      return res.status(404).json({
        status: "error",
        message: "Rack not found or deleted"
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
//update 
async updateRack(req, res) {
  try {
    const { id } = req.params;
    const { total_space, rack_status } = req.body;

    const master = await Master.findOne({
      "racks._id": id
    });

    if (!master) {
      return res.status(404).json({
        message: "Rack not found"
      });
    }

    const rack = master.racks.find(
      r => r._id.toString() === id && !r.is_deleted
    );

    if (!rack) {
      return res.status(404).json({
        message: "Rack not found or deleted"
      });
    }

    // ✅ VALIDATION
    if (total_space && total_space < rack.used_space) {
      return res.status(400).json({
        message: "total_space cannot be less than used space"
      });
    }

    // ✅ UPDATE
    if (total_space) {
      rack.total_space = total_space;
      rack.available_space = rack.total_space - rack.used_space;
    }

    if (rack_status) {
      rack.rack_status = rack_status;
    }

    // ✅ COLOR
    rack.color = getRackColor(rack.used_space, rack.total_space);

    await master.save();

    return res.status(200).json({
      status: "success",
      data: rack
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
},
//delete
async deleteRack(req, res) {
  try {
    const { id } = req.params;

    const master = await Master.findOne({
      "racks._id": id
    });

    if (!master) {
      return res.status(404).json({
        message: "Rack not found"
      });
    }

    const rack = master.racks.find(
      r => r._id.toString() === id && !r.is_deleted
    );

    if (!rack) {
      return res.status(404).json({
        message: "Rack not found or already deleted"
      });
    }

    // ✅ SOFT DELETE
    rack.is_deleted = true;

    await master.save();

    return res.status(200).json({
      status: "success",
      message: "Rack deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
};

export default masterService;
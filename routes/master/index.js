import express from "express";
import { masterController } from "../../controllers/master/index.js";

const router = express.Router();

/* ================= CUSTOMER ================= */
router.post("/customer", masterController.createCustomerMaster);
router.get("/customer", masterController.listCustomerMaster);
router.get("/customer/:id", masterController.getCustomerMasterById);
router.put("/customer/:id", masterController.updateCustomerMaster);
router.delete("/customer/:id", masterController.deleteCustomerMaster);

/* ================= PACK ================= */
router.post("/pack", masterController.createPackMaster);
router.get("/pack", masterController.listPackMaster);
router.get("/pack/:id", masterController.getPackMasterById);
router.put("/pack/:id", masterController.updatePackMaster);
router.delete("/pack/:id", masterController.deletePackMaster);
/* ================= DROPDOWN ================= */
router.get("/dropdown/customer", masterController.customerDropdown);
router.get("/dropdown/status", masterController.statusDropdown);

//FILTER 
router.get("/filter", masterController.commonFilter);
//racks
router.post("/rack", masterController.createRack);
router.get("/rack", masterController.listRack);
router.get("/rack/:id", masterController.getRackById);
router.put("/rack/:id", masterController.updateRack);
router.delete("/rack/:id", masterController.deleteRack);


export default router;
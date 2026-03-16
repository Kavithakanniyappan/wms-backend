import express from "express";
import { packOutController } from "../../controllers/packOut/index.js";

const router=express.Router();

router.post("/create",(req,res)=>packOutController.createPackOut(req,res));

router.put("/update/:id",(req,res)=>packOutController.updatePackOut(req,res));

router.get("/list",(req,res)=>packOutController.listPackOut(req,res));

router.get("/getById",(req,res)=>packOutController.getPackOutById(req,res));

router.delete("/delete",(req,res)=>packOutController.deletePackOut(req,res));

router.get("/invoice-dropdown",(req,res) =>packOutController.invoiceDropdown(req,res));

router.get("/pack-details",(req,res)=>packOutController.getPackDetails(req,res));

export default router;
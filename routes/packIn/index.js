import express from "express";
import { packInController } from "../../controllers/packIn/index.js";

const router=express.Router();

router.post("/create",(req,res)=>packInController.createPackIn(req,res));

router.put("/update/:id",(req,res)=>packInController.updatePackIn(req,res));

router.get("/list",(req,res)=>packInController.listPackIn(req,res));

router.get("/getById",(req,res)=>packInController.getPackInById(req,res));

router.delete("/delete",(req,res)=>packInController.deletePackIn(req,res));

export default router;
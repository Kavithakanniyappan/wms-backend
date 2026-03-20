import express from "express";
import { packInController } from "../../controllers/packIn/index.js";

const router=express.Router();
//customer routes
router.post("/",(req,res)=>packInController.createPackIn(req,res));
router.put("/update/:id",(req,res)=>packInController.updatePackIn(req,res));
router.get("/list",(req,res)=>packInController.listPackIn(req,res));
router.get("/getById",(req,res)=>packInController.getPackInById(req,res));
router.delete("/delete",(req,res)=>packInController.deletePackIn(req,res));
//barcode routes
router.post("/barcode/create", (req, res) => packInController.createBarcodePackIn(req, res));
router.get("/barcode/list", (req, res) =>packInController.listBarcodePackIn(req, res));
router.get("/barcode/:id", (req, res) =>packInController.getBarcodePackInById(req, res));
router.put("/barcode/update:id", (req, res) =>packInController.updateBarcodePackIn(req, res));
router.delete("/barcode/delete/:id", (req, res) =>packInController.deleteBarcodePackIn(req, res));
//excel routes
router.get("/download-excel", (req, res) => packInController.downloadPackInExcel(req, res));

export default router;
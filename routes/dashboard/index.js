import express from "express";
import dashboardController from "../../controllers/dashboard/index.js";

const router = express.Router();

router.get("/summary", dashboardController.getSummary);

export default router;
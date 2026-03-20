import express from "express";
import reportsController from "../../controllers/reports/index.js";

const router = express.Router();

router.get("/", reportsController.getReports);

export default router;
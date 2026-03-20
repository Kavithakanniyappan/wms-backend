import express from "express";
import dashboardController from "../../controllers/dashboard/index.js";

const router = express.Router();

// 🔹 Dashboard APIs
router.get("/active-customers", dashboardController.getActiveCustomers);
router.get("/active-parts", dashboardController.getActiveParts);
router.get("/today-moves", dashboardController.getTodayMoves);
router.get("/dashboard/summary", dashboardController.getDashboardSummary);

export default router;
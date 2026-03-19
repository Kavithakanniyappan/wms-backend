import dashboardService from "../../services/dashboard/index.js";

const dashboardController = {

  // 🔹 Active Customers
  async getActiveCustomers(req, res) {
    try {
      const data = await dashboardService.getActiveCustomers();

      return res.status(200).json({
        status: "success",
        data
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  },

  // 🔹 Active Parts
  async getActiveParts(req, res) {
    try {
      const data = await dashboardService.getActiveParts();

      return res.status(200).json({
        status: "success",
        data
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  },

  // 🔹 Today Moves
  async getTodayMoves(req, res) {
    try {
      const data = await dashboardService.getTodayMoves();

      return res.status(200).json({
        status: "success",
        data
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  }

};

export default dashboardController;
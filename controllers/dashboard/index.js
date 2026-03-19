import dashboardService from "../../services/dashboard/index.js";

const dashboardController = {

  async getSummary(req, res) {
    try {
      const data = await dashboardService.getSummary();

      res.status(200).json({
        status: "success",
        data
      });

    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  }
};

export default dashboardController;
import reportsService from "../../services/reports/index.js";

const reportsController = {

  async getReports(req, res) {
    try {
      const filters = req.query;

      const data = await reportsService.getReports(filters);

      res.status(200).json({
        status: "success",
        message: "Reports fetched successfully",
        count: data.length,
        data
      });

    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message
      });
    }
  }

};

export default reportsController;
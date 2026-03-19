import Master from "../../models/master/index.js";
import PackIn from "../../models/packIn/index.js";
import PackOut from "../../models/packOut/index.js";

const dashboardService = {

  // 🔹 Active Customers
  async getActiveCustomers() {
    try {
      const count = await Master.countDocuments({
        type: "CUSTOMER",
        "customer.status": "Active"
      });

      return { activeCustomers: count };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // 🔹 Active Parts
  async getActiveParts() {
    try {
      const count = await Master.countDocuments({
        type: "PACK",
        "pack.status": "Active"
      });

      return { activeParts: count };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // 🔹 Today Moves (PackIn + PackOut)
  async getTodayMoves() {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [packIn, packOut] = await Promise.all([
        PackIn.countDocuments({
          created_at: { $gte: todayStart },
          is_deleted: false
        }),
        PackOut.countDocuments({
          created_at: { $gte: todayStart },
          is_deleted: false
        })
      ]);

      return { todayMoves: packIn + packOut };
    } catch (error) {
      throw new Error(error.message);
    }
  }

};

export default dashboardService;
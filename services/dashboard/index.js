import Master from "../../models/master/index.js";
import PackIn from "../../models/packIn/index.js";
import PackOut from "../../models/packOut/index.js";

const dashboardService = {

  async getSummary() {

    try {

      // ✅ Today start
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // ✅ Parallel execution (optimized)
      const [
        activeCustomers,
        activeParts,
        todayPackIn,
        todayPackOut,
        usedRacks
      ] = await Promise.all([

        // 🔹 Active Customers
        Master.countDocuments({
          type: "CUSTOMER",
          "customer.status": "Active"
        }),

        // 🔹 Active Parts
        Master.countDocuments({
          type: "PACK",
          "pack.status": "Active"
        }),

        // 🔹 Today Pack IN
        PackIn.countDocuments({
          created_at: { $gte: todayStart },
          is_deleted: false
        }),

        // 🔹 Today Pack OUT
        PackOut.countDocuments({
          created_at: { $gte: todayStart },
          is_deleted: false
        }),

        // 🔹 Used racks only
        PackIn.distinct("rack.rack_id", {
          is_deleted: false
        })

      ]);

      // ✅ Today Moves
      const todayMoves = todayPackIn + todayPackOut;

      // ✅ FIXED: Rack Occupancy
      const TOTAL_RACKS = 10; // 🔥 change based on your warehouse

      const occupancy =
        TOTAL_RACKS === 0
          ? 0
          : Math.round((usedRacks.length / TOTAL_RACKS) * 100);

      return {
        activeCustomers,
        activeParts,
        todayMoves,
        occupancy
      };

    } catch (error) {
      throw new Error(error.message);
    }

  }

};

export default dashboardService;
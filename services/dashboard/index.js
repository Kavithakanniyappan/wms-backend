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
  },
 async getDashboardSummary() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      activeCustomers,
      activeParts,
      packInToday,
      packOutToday,
      masters
    ] = await Promise.all([

      // Active Customers
      Master.countDocuments({
        type: "CUSTOMER",
        "customer.status": "Active"
      }),

      // Active Parts
      Master.countDocuments({
        type: "PACK",
        "pack.status": "Active"
      }),

      // PackIn Today
      PackIn.countDocuments({
        created_at: { $gte: todayStart },
        is_deleted: false
      }),

      // PackOut Today
      PackOut.countDocuments({
        created_at: { $gte: todayStart },
        is_deleted: false
      }),

      // Fetch Masters with active racks
      Master.find({ "racks.rack_status": "Active" })
    ]);

    // 🔹 Calculate occupancy for one rack (first active found)
    let rackOccupancy = null;
    for (const master of masters) {
      const rack = master.racks.find(r => r.rack_status === "Active");
      if (rack) {
        rackOccupancy = rack.total_space
          ? Math.round((rack.used_space / rack.total_space) * 100)
          : 0;
        break; // only first rack
      }
    }

    return {
      activeCustomers,
      activeParts,
      todayMoves: packInToday + packOutToday,
      rackOccupancy // <-- added single rack occupancy
    };

  } catch (error) {
    throw new Error(error.message);
  }
}
};

export default dashboardService;
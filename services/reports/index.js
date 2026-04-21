import PackIn from "../../models/packIn/index.js";
import PackOut from "../../models/packOut/index.js";

const reportsService = {
  async getReports(filters) {
    try {
      let { type, customer, invoice, part, place, from, to } = filters;

      const normalizedType = type ? type.toUpperCase() : null;

      // Separate Queries
      let packInQuery = { is_deleted: false };
      let packOutQuery = { is_deleted: false };

      // Customer Filter
      if (customer) {
        packInQuery["invoice.customer_name"] = {
          $regex: customer,
          $options: "i"
        };
      }

      // Invoice Filter
      if (invoice) {
        packInQuery["invoice.invoice_number"] = invoice;
        packOutQuery.invoice_number = invoice;
      }

      // Part Filter
      if (part) {
        packInQuery["part.part_number"] = part;
      }

      // Place Filter
      if (place) {
        packInQuery["rack.place_id"] = place;
        packOutQuery.place_id = place;
      }

      // Date Filter
      if (from && to) {
        const dateFilter = {
          $gte: new Date(from),
          $lte: new Date(to)
        };

        packInQuery.created_at = dateFilter;
        packOutQuery.created_at = dateFilter;
      }

      let data = [];

      if (normalizedType === "PART_IN") {
        data = await PackIn.find(packInQuery).sort({ created_at: -1 });

      } else if (normalizedType === "PART_OUT") {
        data = await PackOut.find(packOutQuery).sort({ created_at: -1 });

      } else if (!normalizedType) {
        const packInData = await PackIn.find(packInQuery);
        const packOutData = await PackOut.find(packOutQuery);

        data = [...packInData, ...packOutData].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

      } else {
        throw new Error("Invalid type. Use PART_IN or PART_OUT");
      }

      return data;

    } catch (error) {
      throw new Error(error.message);
    }
  }
};

export default reportsService;

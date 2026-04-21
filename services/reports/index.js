import PackIn from "../../models/packIn/index.js";
import PackOut from "../../models/packOut/index.js";

const reportsService = {

  async getReports(filters) {
    try {
      let { type, customer, invoice, part, place, from, to } = filters;

      // Normalize type
      const normalizedType = type ? type.toUpperCase() : null;

      // Common Query
      let query = {
        is_deleted: false
      };

if (customer) {
  query.customer_name = { $regex: customer, $options: "i" };
}

      if (invoice) {
        query.invoice_number = invoice;
      }

      if (part) {
        query.part_number = part;
      }

      if (place) {
        query.place_id = place;
      }

      // Date Filter
      if (from && to) {
        query.created_at = {
          $gte: new Date(from),
          $lte: new Date(to)
        };
      }

      let data = [];

      // Main Logic
      if (normalizedType === "PART_IN") {

        data = await PackIn.find(query).sort({ created_at: -1 });

      } else if (normalizedType === "PART_OUT") {

        data = await PackOut.find(query).sort({ created_at: -1 });

      } else if (!normalizedType) {

        const packInData = await PackIn.find(query);
        const packOutData = await PackOut.find(query);

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

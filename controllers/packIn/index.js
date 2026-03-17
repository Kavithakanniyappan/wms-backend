import packInService from "../../services/packIn/index.js";

export const packInController = {

  createPackIn: (req, res) => packInService.createPackIn(req, res),
  updatePackIn: (req, res) => packInService.updatePackIn(req, res),
  listPackIn: (req, res) => packInService.listPackIn(req, res),
  getPackInById: (req, res) => packInService.getPackInById(req, res),
  deletePackIn: (req, res) => packInService.deletePackIn(req, res)

};

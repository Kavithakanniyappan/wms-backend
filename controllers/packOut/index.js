import packOutService from "../../services/packOut/index.js";

export const packOutController = {

  createPackOut: (req,res) => packOutService.createPackOut(req,res),

  updatePackOut: (req,res) => packOutService.updatePackOut(req,res),

  listPackOut: (req,res) => packOutService.listPackOut(req,res),

  getPackOutById: (req,res) => packOutService.getPackOutById(req,res),

  deletePackOut: (req,res) => packOutService.deletePackOut(req,res),

 invoiceDropdown:(req, res) => packOutService.invoiceDropdown(req, res),

 getPackDetails:(req, res) => packOutService.getPackDetails(req, res),


downloadPackOutExcel: (req, res) => packOutService.downloadPackOutExcel(req, res)

};
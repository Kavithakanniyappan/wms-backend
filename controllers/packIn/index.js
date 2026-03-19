import packInService from "../../services/packIn/index.js";
export const packInController = {


  createPackIn: (req, res) => packInService.createPackIn(req, res),
  updatePackIn: (req, res) => packInService.updatePackIn(req, res),
  listPackIn: (req, res) => packInService.listPackIn(req, res),
  getPackInById: (req, res) => packInService.getPackInById(req, res),
  deletePackIn: (req, res) => packInService.deletePackIn(req, res),
  
  //barcode based 
  createBarcodePackIn: (req, res) => packInService.createBarcodePackIn(req, res),
  updateBarcodePackIn: (req, res) => packInService.updateBarcodePackIn(req, res),
  listBarcodePackIn: (req, res) => packInService.listBarcodePackIn(req, res),
  getBarcodePackInById: (req, res) => packInService.getBarcodePackInById(req, res),
  deleteBarcodePackIn: (req, res) => packInService.deleteBarcodePackIn(req, res), 
  //excel
  downloadPackInExcel: (req, res) => packInService.downloadPackInExcel(req, res)

};


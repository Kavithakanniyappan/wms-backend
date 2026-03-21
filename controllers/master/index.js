import masterService from "../../services/master/index.js";

export const masterController = {

  // Customer
  createCustomerMaster: (req, res) =>masterService.createCustomerMaster(req, res),
  listCustomerMaster: (req, res) =>masterService.listCustomerMaster(req, res),
  getCustomerMasterById: (req, res) =>masterService.getCustomerMasterById(req, res),
  updateCustomerMaster: (req, res) => masterService.updateCustomerMaster(req, res),
  deleteCustomerMaster: (req, res) =>masterService.deleteCustomerMaster(req, res),

  // Pack
  createPackMaster: (req, res) =>masterService.createPackMaster(req, res),
  listPackMaster: (req, res) =>masterService.listPackMaster(req, res),
  getPackMasterById: (req, res) =>masterService.getPackMasterById(req, res),
  updatePackMaster: (req, res) => masterService.updatePackMaster(req, res),
  deletePackMaster: (req, res) =>masterService.deletePackMaster(req, res),
   //  Dropdown
  customerDropdown: (req, res) => masterService.customerDropdown(req, res),
  statusDropdown: (req, res) => masterService.statusDropdown(req, res),

  //  Filter
  commonFilter: (req, res) => masterService.commonFilter(req, res),
  //Racks
  createRack: (req, res) => masterService.createRack(req, res),
  listRack: (req, res) => masterService.listRack(req, res),
  getRackById: (req, res) => masterService.getRackById(req, res),
  updateRack: (req, res) => masterService.updateRack(req, res),
  deleteRack: (req, res) => masterService.deleteRack(req, res)

};

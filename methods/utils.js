const crawler_methods = {
  Brand: "crawlAllBrands",
  Brands: "crawlAllBrands",
  Devices: "crawlAllBrandsDevices",
  Device: "crawlDeviceData",
  DailyIntrest: "crawlDailyIntrest",
  updateDevices: "crawlNewDevices",
  incompleteDevices: "crawlIncompleteDevices"
};
const mongo_methods = {
  Brand: "getAllBrands",
  Brands: "getAllBrands",
  Devices: "getAllBrandsDevices",
  Device: "getDeviceData",
  DailyIntrest: "getDailyIntrest",
  removeDevice: "removeDeviceData"
};
module.exports = { crawler_methods, mongo_methods };

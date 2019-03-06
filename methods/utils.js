const crawler_methods = {
  Brand: "crawlAllBrands",
  Brands: "crawlAllBrands",
  Devices: "crawlAllBrandsDevices",
  Device: "crawlDeviceData",
  DailyIntrest: "crawlDailyIntrest"
};
const mongo_methods = {
  Brand: "getAllBrands",
  Brands: "getAllBrands",
  Devices: "getAllBrandsDevices",
  Device: "getDeviceData",
  DailyIntrest: "getDailyIntrest"
};
module.exports = { crawler_methods, mongo_methods };

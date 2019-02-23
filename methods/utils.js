const crawler_methods = {
  Brands: "crawlAllBrands",
  Devices: "crawlAllBrandsDevices",
  Device: "crawlDeviceData"
};
const mongo_methods = {
  Brands: "getAllBrands",
  Devices: "getAllBrandsDevices",
  Device: "getDeviceData"
};
module.exports = { crawler_methods, mongo_methods };
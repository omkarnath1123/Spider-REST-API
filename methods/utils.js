const crawler_methods = {
  Brand: "crawlAllBrands",
  Brands: "crawlAllBrands",
  Devices: "crawlAllBrandsDevices",
  Device: "crawlDeviceData"
};
const mongo_methods = {
  Brand: "getAllBrands",
  Brands: "getAllBrands",
  Devices: "getAllBrandsDevices",
  Device: "getDeviceData"
};
module.exports = { crawler_methods, mongo_methods };

/*
All Brand data : list of Brands
All Devices data : list of Devices
Single Brand data : device count of single brand
Single Device data : device data of single device
*/
/*
crawler methods :
crawlAllBrands, crawlAllBrandsDevices, crawlDeviceData
mongo methods :
getAllBrands, getAllBrandsDevices, getDeviceData
*/

class Master_Operator {
  // Todo : used to return all brands count data
  static getAllBrands(request) {
    return (async () => {
      // Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.type) {
        throw new Error(
          "method is mendatory for response and database collection"
        );
      }

      const Mongo = require(`./mongo_methods/${request.method}.js`);
      return new Mongo(request);
    })();
  }

  // Todo : used to return brand devices data from db
  static getAllBrandsDevices(request) {
    return (async () => {
      // Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.type) {
        throw new Error(
          "method is mendatory for response and database collection"
        );
      }

      const Mongo = require(`./mongo_methods/${request.method}.js`);
      return new Mongo(request);
    })();
  }

  // Todo: used to crawl and update all brands count data ( also return data and write to db )
  static crawlAllBrands(request) {
    return (async () => {
      // Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.method) {
        throw new Error("method is mendatory for response and crawling");
      }

      const Crawler = require(`./child_crawler/${request.method}.js`);
      return new Crawler(request).header();
    })();
  }

  // Todo: used to crawl and update all brand devices data of db ( also return data and write to db )
  static crawlAllBrandsDevices(request) {
    return (async () => {
      // Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.method) {
        throw new Error("method is mendatory for response and crawling");
      }

      const Crawler = require(`./child_crawler/${request.method}.js`);
      return new Crawler(request);
    })();
  }

  // Todo : Triggered by get, post request ( return a device data )
  static getDeviceData(request) {
    return (async () => {
      // Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.type) {
        throw new Error(
          "method is mendatory for response and database collection"
        );
      }

      const Mongo = require(`./mongo_methods/${request.method}.js`);
      return new Mongo(request);
    })();
  }

  // Todo : Triggered by post, patch request ( crawl a device data ) ( also return data and write to db )
  static crawlDeviceData(request) {
    return (async () => {
      // Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.method) {
        throw new Error("method is mendatory for response and crawling");
      }

      const Crawler = require(`./child_crawler/${request.method}.js`);
      return new Crawler(request);
    })();
  }

  // Todo : add Deletion item from collection
}

module.exports = {
  getAllBrands: Master_Operator.getAllBrands,
  getAllBrandsDevices: Master_Operator.getAllBrandsDevices,
  crawlAllBrands: Master_Operator.crawlAllBrands,
  crawlAllBrandsDevices: Master_Operator.crawlAllBrandsDevices,
  getDeviceData: Master_Operator.getDeviceData,
  crawlDeviceData: Master_Operator.crawlDeviceData
};

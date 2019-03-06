/*
NOTE 
All Brand data : list of Brands
All Devices data : list of Devices
Single Brand data : device count of single brand
Single Device data : device data of single device
*/
/*
NOTE 
crawler methods :
crawlAllBrands, crawlAllBrandsDevices, crawlDeviceData
mongo methods :
getAllBrands, getAllBrandsDevices, getDeviceData
*/

class Master_Operator {
  // ANCHOR  used to return all brands and single brand count data
  static getAllBrands(request) {
    return (async () => {
      // SECTION Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.method) {
        throw new Error(
          "method is mandatory for response and database collection"
        );
      } else if (request.method === "Brand") {
        request.method = request.method + "s";
      }

      const Mongo = require(`./mongo_methods/${request.method}.js`);
      return new Mongo(request).header();
    })();
  }

  // ANCHOR  used to return brand devices data from db
  static getAllBrandsDevices(request) {
    return (async () => {
      // SECTION Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.method || !request.company) {
        throw new Error(
          "method and company is mandatory for response and database collection"
        );
      }

      const Mongo = require(`./mongo_methods/${request.method}.js`);
      return new Mongo(request).header();
    })();
  }

  // ANCHOR  used to crawl and update all brands and single brand count data ( also return data and write to db )
  static crawlAllBrands(request) {
    return (async () => {
      // SECTION Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.method) {
        throw new Error("method is mandatory for response and crawling");
      } else if (request.method === "Brand") {
        request.method = request.method + "s";
      }

      const Crawler = require(`./child_crawler/${request.method}.js`);
      return new Crawler(request).header();
    })();
  }

  // ANCHOR  used to crawl and update all brand devices data of db ( also return data and write to db )
  static crawlAllBrandsDevices(request) {
    return (async () => {
      // SECTION Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.method || !request.company) {
        throw new Error(
          "method and company is mandatory for response and crawling"
        );
      }

      const Crawler = require(`./child_crawler/${request.method}.js`);
      return new Crawler(request).header();
    })();
  }

  // ANCHOR  Triggered by get, post request ( return a device data )
  static getDeviceData(request) {
    return (async () => {
      // SECTION Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.method || !request.company || !request.model) {
        throw new Error(
          "method, company and model is mandatory for response and database collection"
        );
      }

      const Mongo = require(`./mongo_methods/${request.method}.js`);
      return new Mongo(request).header();
    })();
  }

  // ANCHOR  Triggered by post, patch request ( crawl a device data ) ( also return data and write to db )
  static crawlDeviceData(request) {
    return (async () => {
      // SECTION Validate parameters needed for this operation
      if (!request || typeof request !== "object") {
        throw new Error("Invalid param. Expecting param of type object.");
      }
      if (!request.method || !request.company || !request.model) {
        throw new Error(
          "method, company and model is mandatory for response and crawling"
        );
      }

      const Crawler = require(`./child_crawler/${request.method}.js`);
      return new Crawler(request).header();
    })();
  }

  // ANCHOR crawl customer daily intrest
  static crawlDailyIntrest(request) {
    return (async () => {
      const Crawler = require(`./child_crawler/UserData.js`);
      return new Crawler(request).header();
    })();
  }

  // ANCHOR get customer daily intrest
  static getDailyIntrest(request) {
    return (async () => {
      const Mongo = require(`./mongo_methods/UserData.js`);
      return new Mongo(request).header();
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
  crawlDeviceData: Master_Operator.crawlDeviceData,
  crawlDailyIntrest: Master_Operator.crawlDailyIntrest,
  getDailyIntrest: Master_Operator.getDailyIntrest
};

"use strict";

const Company = require("../../models/Brands");

class Brands {
  constructor(context) {
    this.context = context;
  }
  async header() {
    // also update in crawler_methods
    if (this.context.company) {
      let filtered_brand = await Company.find(
        { company: this.context.company },
        { company: 1, no_of_devices: 1, _id: 0 }
      );
      console.log(JSON.stringify(filtered_brand));
      return filtered_brand;
    }
    let all_current_brands = await Company.find(
      {
        company: { $exists: true, $ne: null },
        no_of_devices: { $exists: true, $ne: null }
      },
      { company: 1, no_of_devices: 1, _id: 0 }
    );
    console.log(JSON.stringify(all_current_brands));
    return all_current_brands;
  }
}

module.exports = Brands;

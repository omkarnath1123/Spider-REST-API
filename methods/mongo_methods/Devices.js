"use strict";

const Company = require("../../models/Brands");
const Devices = require("../../models/Devices");

class DevicesClass {
  constructor(context) {
    this.context = context;
  }

  async header() {
    try {
      // try to aggregate and update in db as processing ? is necessary : maybe

      let data = await Devices.find(
        { company: this.context.company },
        {
          _id: 0,
          company: 1,
          product_image: 1,
          product_name: 1,
          desc: 1
        }
      );
      console.log(JSON.stringify(data));
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async updateDB(Brands) {}
}

module.exports = DevicesClass;

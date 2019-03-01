"use strict";

const Devices = require("../../models/Devices");

class DevicesData {
  constructor(context) {
    this.context = context;
  }

  async header() {
    try {
      let data;
      data = await Devices.findOne(
        { company: this.context.company, product_name: this.context.model },
        {
          _id: 0,
          company: 1,
          product_image: 1,
          desc: 1,
          product_name: 1,
          device_images: 1,
          storage: 1,
          os: 1,
          dimensions: 1,
          release_date: 1,
          review: 1
        }
      );
      console.log(JSON.stringify(data));
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = DevicesData;

"use strict";

const Devices = require("../../models/Devices");
const Company = require("../../models/Brands");

class RemoveDevicesClass {
  constructor(context) {
    this.context = context;
  }

  async header() {
    try {
      if (!this.context.company || !this.context.device) {
        throw new Error("company and device is mandatory for deletion query");
      }
      let canBeDel = await Devices.findOne({
        company: this.context.company,
        product_name: this.context.device
      });
      if (!canBeDel) {
        throw new Error(
          `${this.context.device} of ${
            this.context.company
          } is already removed or this device does not exist`
        );
      }

      await Devices.findOneAndRemove({
        company: this.context.company,
        product_name: this.context.device
      });

      let company_products = await Devices.find(
        { company: this.context.company },
        { _id: 1 }
      );
      await Company.findOneAndUpdate(
        { company: this.context.company },
        {
          all_devices: company_products,
          devices_list_count: company_products.length
        }
      );
      return {
        message: `${this.context.device} of ${
          this.context.company
        } is removed successfully`
      };
    } catch (error) {
      console.error(error);
      return { message: error.message, stack: error.stack };
    }
  }
}

module.exports = RemoveDevicesClass;

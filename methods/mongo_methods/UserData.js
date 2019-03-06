"use strict";

const DailyIntrest = require("../../models/UserData");

class DailyIntrestMethod {
  constructor(context) {
    this.context = context;
  }

  async header() {
    try {
      let data = await DailyIntrest.findOne(
        { status: "UPDATED" },
        {
          daily_intrest: 1,
          fan_favorite: 1,
          _id: 0
        },
        { upsert: true }
      );
      // console.log(JSON.stringify(data));
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = DailyIntrestMethod;

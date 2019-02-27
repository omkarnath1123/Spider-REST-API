const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define pending service request schema for data modeling
var operator_schema = new Schema({
  company: { type: String, index: true, default: null },
  no_of_devices: { type: Number },
  web_page_link: { type: String },
  previous_devices_count: { type: Number, default: 0 },
  all_devices: { type: [Schema.Types.ObjectId], default: [] },
  devices_list_count: { type: Number, default: 0 },

  status: { type: String },
  attempt: { type: Number },
  error: { type: Schema.Types.Mixed, default: [] },
  crawler_error: { type: Schema.Types.Mixed, default: [] },
  crawled_dates: { type: [Date] },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date }
});

let Brands = mongoose.model("Brands", operator_schema, "Brands");

// make pending service request model for external use
module.exports = Brands;

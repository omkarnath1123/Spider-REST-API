const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define pending service request schema for data modeling
var operator_schema = new Schema({
  company: { type: String },
  attempt: { type: Number },
  error: { type: Schema.Types.Mixed, default: [] },
  crawler_error: { type: Schema.Types.Mixed, default: [] },
  crawled_dates: { type: [Date] },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date },
  devices: { type: Number },
  previous_devices_count: { type: Number },
  all_devices: { type: Schema.Types.Mixed }
});

let operators = mongoose.model("operators", operator_schema, "operators");

// make pending service request model for external use
module.exports = operators;

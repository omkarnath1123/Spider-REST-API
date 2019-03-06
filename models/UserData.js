const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var operator_schema = new Schema({
  daily_intrest: { type: [Schema.Types.Mixed], default: [] },
  fan_favorite: { type: [Schema.Types.Mixed], default: [] },

  status: { type: String },
  attempt: { type: Number },
  error: { type: Schema.Types.Mixed, default: [] },
  crawler_error: { type: Schema.Types.Mixed, default: [] },
  crawled_dates: { type: [Date] },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date }
});

let UserData = mongoose.model("User_Data", operator_schema, "User_Data");

// NOTE make pending service request model for external use
module.exports = UserData;

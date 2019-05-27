const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  user_name: { type: String, index: true, lowercase: true, unique: true },
  email: { type: String },
  hash: { type: String },
  key: { type: String },
  user_level: { type: String, default: "FREE_USER" }
});

let Users = mongoose.model("Users", UsersSchema, "Users");
module.exports = Users;

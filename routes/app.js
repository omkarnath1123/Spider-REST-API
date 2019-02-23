"use strict";
require("./mongoose.connection");
let express = require("express");
const path = require("path");
let app = express();

// for 3 type parallel methods
// var kue = require('kue');
// app.use(kue.app);

app.use(require("body-parser").json({ limit: "5mb" }));
app.use(require("body-parser").urlencoded({ extended: false }));
app.use("/", require("./api-routes"));
process.on("uncaughtException", function(err) {
  console.log(err);
});
const port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Running SPIDER Rest Hub on port " + port);
});

// for react app
// app.get('*', (req, res)=> {
//   res.sendFile((process.env.APP_ROOT_PATH || path.join(__dirname, '/build')) + '/index.html');
// });

// Todo: test middleware
let request_time = (req, res, next) => {
  req.request_time = new Date();
  next();
};

app.listen(function() {
  console.log("Environment Loaded | " + process.env.TEST || "development");
  console.log("App current environment  | " + process.env.NODE_ENV || "local");
  console.log(
    "App Screenshots DIR | " + process.env.SCREENSHOTS_DIR || "default"
  );
});

app.listen(3000);
app.use(request_time);

"use strict";

const fs = require("fs");
require("./mongoose.connection");
let express = require("express");
const path = require("path");
let app = express();

// for n type parallel methods
// print response for every request
// var kue = require('kue');
// app.use(kue.app);

app.use(logResponseBody);
app.use(require("body-parser").json({
  limit: "10mb"
}));
app.use(require("body-parser").urlencoded({
  extended: false
}));
app.use("/", require("./api-routes"));
process.on("uncaughtException", function (err) {
  console.log(err);
});
const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log("Running SPIDER Rest Hub on port " + port);
});

// for react app
// app.get('*', (req, res)=> {
//   res.sendFile((process.env.APP_ROOT_PATH || path.join(__dirname, '/build')) + '/index.html');
// });

(function () {
  let _log = console.log;
  let _error = console.error;
  let _warning = console.warning;

  console.error = function (errMessage) {
    if (process.env.NODE_ENV === "production") {
      if (!fs.existsSync(`${process.env.LOG_PATH}/error.txt`)) {
        fs.writeFileSync(`${process.env.LOG_PATH}/error.txt`, fileContent, (err) => {
          if (err) throw err;
        });
      }
      fs.appendFileSync(
        `${process.env.LOG_PATH}/error.txt`,
        new Date() + " : " + errMessage + "\n"
      );
    }
    _error.apply(console, arguments);
  };
  console.log = function (logMessage) {
    if (process.env.NODE_ENV !== "production") {
      // delete file if it exeeds 25mb
      if (!fs.existsSync(`${process.env.LOG_PATH}/log.txt`)) {
        fs.writeFileSync(`${process.env.LOG_PATH}/log.txt`);
      }
      const stats = fs.statSync(`${process.env.LOG_PATH}/log.txt`);
      const fileSizeInBytes = stats.size;
      const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
      if (fileSizeInMegabytes > 25) {
        fs.unlink(`${process.env.LOG_PATH}/log.txt`, (err) => {
          if (err) throw err;
          console.log('path/file.txt was deleted');
        });
      }
      fs.appendFileSync(
        `${process.env.LOG_PATH}/log.txt`,
        new Date() + " : " + logMessage + "\n"
      );
    }
    _log.apply(console, arguments);
  };
  console.warning = function (warnMessage) {
    if (process.env.NODE_ENV === "production") {
      if (!fs.existsSync(`${process.env.LOG_PATH}/warning.txt`)) {
        fs.writeFileSync(`${process.env.LOG_PATH}/warning.txt`, fileContent, (err) => {
          if (err) throw err;
        });
      }
      fs.appendFileSync(
        `${process.env.LOG_PATH}/warning.txt`,
        new Date() + " : " + warnMessage + "\n"
      );
    }
    _warning.apply(console, arguments);
  };
})();

function logResponseBody(req, res, next) {
  const oldWrite = res.write,
    oldEnd = res.end;
  const chunks = [];
  res.write = function (chunk) {
    chunks.push(chunk);
    oldWrite.apply(res, arguments);
  };
  res.end = function (chunk) {
    if (chunk) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");
    console.log(
      `http://localhost:${port}${req.path} : `,
      "Response Body : " + body
    );
    // add all this log to file
    oldEnd.apply(res, arguments);
  };
  next();
}

app.listen(function () {
  console.log("Environment Loaded | " + process.env.TEST || "development");
  console.log("App current environment  | " + process.env.NODE_ENV || "local");
  console.log(
    "App Screenshots DIR | " + process.env.SCREENSHOTS_DIR || "default"
  );
});
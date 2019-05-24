"use strict";

const fs = require("fs");
require("./mongoose.connection");
require("../models/Users");
let express = require("express");
require("./redis.connection");
const responseTime = require("response-time");
const path = require("path");
let app = express();
const LOG_PATH = path.dirname(__dirname);

const MAX_LOG_FILE_SIZE = Number(process.env.MAX_LOG_FILE_SIZE || 5);
const JSON_MEMORY_LIMIT = process.env.JSON_MEMORY_LIMIT || "5mb";

app.use(logResponseBody);
// JSON_MEMORY_LIMIT memory limit to pass json
app.use(
  require("body-parser").json({
    limit: JSON_MEMORY_LIMIT
  })
);
app.use(
  require("body-parser").urlencoded({
    extended: false
  })
);

// Allow cross origin access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    req.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

// get respose time in browsers
app.use(responseTime());
app.use("/", require("./api-routes"));
process.on("uncaughtException", function(err) {
  console.log(err);
});
const port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Running SPIDER Rest Hub on port | " + port);
});

// for react server side rendering
// app.get('*', (req, res)=> {
//   res.sendFile((process.env.APP_ROOT_PATH || path.join(__dirname, '/build')) + '/index.html');
// });

// reset LOG, WARNING and ERROR .log
(function() {
  if (process.env.RESET_LOGS === "true") {
    if (fs.existsSync(`${LOG_PATH}/log.log`)) {
      fs.unlinkSync(`${LOG_PATH}/log.log`);
    }
    if (fs.existsSync(`${LOG_PATH}/error.log`)) {
      fs.unlinkSync(`${LOG_PATH}/error.log`);
    }
    if (fs.existsSync(`${LOG_PATH}/warning.log`)) {
      fs.unlinkSync(`${LOG_PATH}/warning.log`);
    }
    if (!fs.existsSync(`${LOG_PATH}/log.log`)) {
      fs.writeFileSync(`${LOG_PATH}/log.log`);
    }
    if (!fs.existsSync(`${LOG_PATH}/error.log`)) {
      fs.writeFileSync(`${LOG_PATH}/error.log`);
    }
    if (!fs.existsSync(`${LOG_PATH}/warning.log`)) {
      fs.writeFileSync(`${LOG_PATH}/warning.log`);
    }
  }
})();

(function() {
  let _log = console.log;
  let _error = console.error;
  let _warning = console.warning;

  // create .error automatically and use path library
  console.error = function(errMessage) {
    if (!fs.existsSync(`${LOG_PATH}/error.log`)) {
      fs.writeFileSync(`${LOG_PATH}/error.log`);
    }
    fs.appendFileSync(`${LOG_PATH}/error.log`, new Date() + " : " + errMessage + "\n");
    _error.apply(console, arguments);
  };

  // create .log automatically and use path library
  console.log = function(logMessage) {
    if (!fs.existsSync(`${LOG_PATH}/log.log`)) {
      fs.writeFileSync(`${LOG_PATH}/log.log`);
    }
    const stats = fs.statSync(`${LOG_PATH}/log.log`);
    const fileSizeInBytes = stats.size;
    const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
    // delete file if it exeeds MAX_LOG_FILE_SIZE
    if (fileSizeInMegabytes > MAX_LOG_FILE_SIZE) {
      fs.unlink(`${LOG_PATH}/log.log`, err => {
        if (err) throw err;
      });
    }

    fs.appendFileSync(`${LOG_PATH}/log.log`, new Date() + " : " + logMessage + "\n");
    _log.apply(console, arguments);
  };

  // create .warning automatically and use path library
  console.warning = function(warnMessage) {
    if (!fs.existsSync(`${LOG_PATH}/warning.log`)) {
      fs.writeFileSync(`${LOG_PATH}/warning.log`);
    }
    fs.appendFileSync(`${LOG_PATH}/warning.log`, new Date() + " : " + warnMessage + "\n");
    _warning.apply(console, arguments);
  };
})();

// log return response body
function logResponseBody(req, res, next) {
  // if (process.env.NODE_ENV === "production") return;
  const oldWrite = res.write,
    oldEnd = res.end;
  const chunks = [];
  res.write = function(chunk) {
    chunks.push(chunk);
    oldWrite.apply(res, arguments);
  };

  if (`${req.protocol}://${req.get("host")}${req.originalUrl}`.match(/favicon/i)) {
    console.log(`${req.protocol}://${req.get("host")}${req.originalUrl}  | Response Body : Rest API favicon.`);
    return next();
  }
  res.end = function(chunk) {
    if (chunk) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");
    console.log(`${req.protocol}://${req.get("host")}${req.originalUrl}  | Response Body : ${body}`);
    oldEnd.apply(res, arguments);
  };
  next();
}

app.listen(function() {
  if (process.env.NODE_ENV === "development") {
    console.error("Authentication is disabled in Development environment.");
  }
  console.log("Environment Loaded | " + process.env.TEST || "development");
  console.log("App current environment  | " + process.env.NODE_ENV || "local");
  console.log("App Screenshots DIR | " + LOG_PATH || "default");
  console.log(`Is logs are reset | ${process.env.RESET_LOGS}`);
  console.log(`Maximum log file size | ${MAX_LOG_FILE_SIZE}`);
  console.log(`Response json maximum memory limit | ${JSON_MEMORY_LIMIT}`);
  console.log(`Is chromium is in headless mode | ${process.env.NODE_ENV === "production" || (process.env.CHROMIUM_HEADLESS || true)}`);
});

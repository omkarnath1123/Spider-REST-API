"use strict";

const fs = require("fs");
require("./mongoose.connection");
let express = require("express");
require("./redis.connection");
const responseTime = require("response-time");
const path = require("path");
let app = express();
const LOG_PATH = path.dirname(__filename);

app.use(logResponseBody);
app.use(
  require("body-parser").json({
    limit: "5mb"
  })
);
app.use(
  require("body-parser").urlencoded({
    extended: false
  })
);
// NOTE used to see respose time in browsers
app.use(responseTime());
app.use("/", require("./api-routes"));
process.on("uncaughtException", function(err) {
  console.log(err);
});
const port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Running SPIDER Rest Hub on port " + port);
});

// NOTE for react app
// app.get('*', (req, res)=> {
//   res.sendFile((process.env.APP_ROOT_PATH || path.join(__dirname, '/build')) + '/index.html');
// });

// NOTE reset LOG, WARNING and ERROR .txt
(function() {
  if (process.env.RESET_LOGS === "true") {
    if (fs.existsSync(`${LOG_PATH}/log.txt`)) {
      fs.unlinkSync(`${LOG_PATH}/log.txt`);
    }
    if (fs.existsSync(`${LOG_PATH}/error.txt`)) {
      fs.unlinkSync(`${LOG_PATH}/error.txt`);
    }
    if (fs.existsSync(`${LOG_PATH}/warning.txt`)) {
      fs.unlinkSync(`${LOG_PATH}/warning.txt`);
    }
    if (!fs.existsSync(`${LOG_PATH}/log.txt`)) {
      fs.writeFileSync(`${LOG_PATH}/log.txt`);
    }
    if (!fs.existsSync(`${LOG_PATH}/error.txt`)) {
      fs.writeFileSync(`${LOG_PATH}/error.txt`);
    }
    if (!fs.existsSync(`${LOG_PATH}/warning.txt`)) {
      fs.writeFileSync(`${LOG_PATH}/warning.txt`);
    }
  }
})();

(function() {
  let _log = console.log;
  let _error = console.error;
  let _warning = console.warning;

  // TODO  create .error automatically and use path library
  console.error = function(errMessage) {
    if (!fs.existsSync(`${LOG_PATH}/error.txt`)) {
      fs.writeFileSync(`${LOG_PATH}/error.txt`);
    }
    fs.appendFileSync(
      `${LOG_PATH}/error.txt`,
      new Date() + " : " + errMessage + "\n"
    );
    _error.apply(console, arguments);
  };

  // TODO  create .log automatically and use path library
  console.log = function(logMessage) {
    if (!fs.existsSync(`${LOG_PATH}/log.txt`)) {
      fs.writeFileSync(`${LOG_PATH}/log.txt`);
    }
    const stats = fs.statSync(`${LOG_PATH}/log.txt`);
    const fileSizeInBytes = stats.size;
    const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
    // NOTE delete file if it exeeds 5mb
    if (fileSizeInMegabytes > 5) {
      fs.unlink(`${LOG_PATH}/log.txt`, err => {
        if (err) throw err;
      });
    }

    fs.appendFileSync(
      `${LOG_PATH}/log.txt`,
      new Date() + " : " + logMessage + "\n"
    );
    _log.apply(console, arguments);
  };

  // TODO  create .warning automatically and use path library
  console.warning = function(warnMessage) {
    if (!fs.existsSync(`${LOG_PATH}/warning.txt`)) {
      fs.writeFileSync(`${LOG_PATH}/warning.txt`);
    }
    fs.appendFileSync(
      `${LOG_PATH}/warning.txt`,
      new Date() + " : " + warnMessage + "\n"
    );
    _warning.apply(console, arguments);
  };
})();

function logResponseBody(req, res, next) {
  if (process.env.NODE_ENV === "production") return;
  const oldWrite = res.write,
    oldEnd = res.end;
  const chunks = [];
  res.write = function(chunk) {
    chunks.push(chunk);
    oldWrite.apply(res, arguments);
  };
  // FIXME fix response for favicon.ico
  res.end = function(chunk) {
    if (chunk) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");
    console.log(
      `http://localhost:${port}${req.path} : Response Body : ${body}`
    );
    oldEnd.apply(res, arguments);
  };
  next();
}

app.listen(function() {
  console.log("Environment Loaded | " + process.env.TEST || "development");
  console.log("App current environment  | " + process.env.NODE_ENV || "local");
  console.log("App Screenshots DIR | " + LOG_PATH || "default");
  console.log(`Is logs are reset | ${process.env.RESET_LOGS}`);
});

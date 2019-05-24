let router = require("express").Router();
let Master_Operator = require("../methods/master_operator");
const { crawler_methods, mongo_methods } = require("../methods/utils");
const crypto = require("crypto");
const redis = require("./redis.connection");
const client = redis.client;
const path = require("path");
const ROOT_DIR = path.dirname(__dirname);
const mongoose = require("mongoose");
const Users = mongoose.model("Users");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.PRIVATE_KEY || "secret");
const REDIS_CACHE_UNTIL = Number(process.env.REDIS_CACHE_UNTIL || 3600 * 1);

// NOTE for server status read server-status.txt

// get current hour
let getCurretHours = () => {
  return Number((new Date().getTime() / (1000 * 60 * 60)).toString().split(".")[0]);
};

// catch statement for server error
async function catchServerError(req, res, next, error) {
  console.error(error);
  console.log(error.stack);
  res.header("Content-Type", "application/json");
  let results = {
    success: false,
    message: `Server Crashed contact your network administrator : ${error}`,
    stack: error.stack
  };
  await res.status(500).send(JSON.stringify(results, null, 4));
}

// create new user
async function newUser(req, res, next) {
  try {
    const { user_name, email, user_level, password } = req.body;
    res.header("Content-Type", "application/json");
    if (!user_name || !password) {
      let results = {
        errors: {
          user_name: "User Name is required",
          password: "Password is required"
        }
      };
      await res.status(422).send(JSON.stringify(results, null, 4));
      return;
    }
    let isCustomer = await Users.findOne({ user_name: user_name });
    if (isCustomer) {
      let results = {
        errors: {
          auth: false,
          message: "This User Name is already used. Select a new user name"
        }
      };
      await res.status(401).send(JSON.stringify(results, null, 4));
      return;
    }
    let key = crypto.randomBytes(16).toString("hex");
    let hash = crypto.pbkdf2Sync(password, key, 10000, 32, "sha512").toString("hex");
    let new_user = await new Users({
      user_name: user_name,
      key: key,
      hash: hash,
      email: email,
      user_level: user_level || "USER"
    });
    await new_user.save();
    let results = {
      success: true,
      message: "New user is created successfully"
    };
    await res.status(200).send(JSON.stringify(results, null, 4));
  } catch (error) {
    await catchServerError(req, res, next, error);
    return;
  }
  return;
}

// sign up new user
router.post("/API/new_user", [printRequest, newUser]);

// login using user_name and password or auth token
async function userLoginAndTokenLogin(req, res, next) {
  try {
    // FIXME login does not give token when expired token is present with username and password.
    const { user_name, email, user_level, password } = req.body;
    const { authorization } = req.headers;
    res.header("Content-Type", "application/json");
    if (authorization) {
      try {
        let data = cryptr.decrypt(authorization);
        data = JSON.parse(data);
        const { user_name, hours, password } = data;
        let isValid = await Users.findOne({ user_name: user_name });
        if (isValid) {
          if (hours !== getCurretHours()) {
            let results = {
              errors: {
                auth: false,
                message: "Your token has expired .Please login again."
              }
            };
            await res.status(401).send(JSON.stringify(results, null, 4));
            return;
          }
          let results = {
            auth: true,
            user_name: isValid.user_name,
            message: "Welcome! Now you are Logged In."
          };
          await res.status(200).send(JSON.stringify(results, null, 4));
          return;
        }
        let results = {
          errors: {
            auth: false,
            message: "Invalid token. Please login again."
          }
        };
        await res.status(401).send(JSON.stringify(results, null, 4));
        return;
      } catch (error) {
        let results = {
          errors: {
            auth: false,
            message: "Invalid token. Please login again."
          }
        };
        await res.status(401).send(JSON.stringify(results, null, 4));
        return;
      }
    }
    if (!user_name || !password) {
      let results = {
        errors: {
          user_name: "User Name is required.",
          password: "Password is required."
        }
      };
      await res.status(422).send(JSON.stringify(results, null, 4));
      return;
    }
    let isCustomer = await Users.findOne({ user_name: user_name });
    if (isCustomer) {
      let pass = crypto.pbkdf2Sync(password, isCustomer.key, 10000, 32, "sha512").toString("hex");
      if (pass !== isCustomer.hash) {
        let results = {
          errors: {
            user_name: "User Name is not correct.",
            password: "Password is not correct."
          }
        };
        await res.status(422).send(JSON.stringify(results, null, 4));
        return;
      }
      let obj = {
        user_name: isCustomer.user_name,
        password: pass,
        hours: getCurretHours()
      };
      let results = {
        loggedIn: true,
        token: cryptr.encrypt(JSON.stringify(obj))
      };
      await res.status(200).send(JSON.stringify(results, null, 4));
    } else {
      let results = {
        errors: {
          success: false,
          message: "Invalid user name. Please Sign up."
        }
      };
      await res.status(401).send(JSON.stringify(results, null, 4));
      return;
    }
  } catch (error) {
    await catchServerError(req, res, next, error);
    return;
  }
  return;
}

// sign in existing user user
router.post("/API/login/", [printRequest, userLoginAndTokenLogin]);

// types of routes parameter
let methods = ["Brand", "Brands", "Device", "Devices"];

// check str is json
let checkIsJson = function(str) {
  try {
    var json = JSON.parse(str);
    return typeof json === "object";
  } catch (e) {
    return false;
  }
};

// validate auth token on request
async function validateToken(req, res, next) {
  try {
    // ignore token validation in development
    if (process.env.NODE_ENV === "development") {
      return next();
    }
    const { authorization } = req.headers;
    if (!authorization) {
      res.header("Content-Type", "application/json");
      let results = {
        errors: {
          auth: false,
          message: "AUTH TOKEN is mendatory for api request. Please login again."
        }
      };
      await res.status(401).send(JSON.stringify(results, null, 4));
      return;
    }
    let data = cryptr.decrypt(authorization);
    let check = checkIsJson(data);
    if (!check) {
      res.header("Content-Type", "application/json");
      let results = {
        errors: {
          auth: false,
          message: "Invalid token. Please login again."
        }
      };
      await res.status(401).send(JSON.stringify(results, null, 4));
      return;
    }
    data = JSON.parse(data);
    const { user_name, hours, password } = data;
    let isValid = await Users.findOne({ user_name: user_name });
    if (isValid) {
      if (hours !== getCurretHours()) {
        let results = {
          errors: {
            auth: false,
            message: "Your token has expired .Please login again."
          }
        };
        await res.status(401).send(JSON.stringify(results, null, 4));
        return;
      }
      console.log(`THIS TOKEN IS VALID | ${authorization}`);
    }
  } catch (error) {
    res.header("Content-Type", "application/json");
    let results = {
      errors: {
        auth: false,
        message: "Invalid token. Please login again."
      }
    };
    await res.status(401).send(JSON.stringify(results, null, 4));
    return;
  }
  return next();
}

// show and read request parameter
async function showRequestParams(req, res, next) {
  console.log("Request created at : " + new Date());
  console.log("Request URL :" + req.originalUrl);
  console.log("Request params :" + JSON.stringify(req.params));
  console.log("Request Body :" + JSON.stringify(req.body));
  req.body.method = req.params.method;
  req.body.company = req.params.company;
  req.body.model = req.params.model;
  req.body.company = req.body.company ? req.body.company.replace(/%20/g, " ") : req.body.company;
  req.body.model = req.body.model ? req.body.model.replace(/%20/g, " ") : req.body.model;
  if (
    (req.params.method === "Brand" && !req.params.company) ||
    (req.params.method === "Device" && !req.params.company) ||
    (req.params.method === "Device" && !req.params.model) ||
    (req.params.method === "Brands" && req.params.company) ||
    (req.params.method === "Devices" && !req.params.company) ||
    (req.params.method === "Devices" && req.params.model)
  ) {
    res.header("Content-Type", "application/json");
    let results = {
      success: false,
      message: "{ UNKNOWN URI } Please hit a valid URI"
    };
    await res.send(JSON.stringify(results, null, 4));
    return;
  }
  return next();
}

// read company data from Redis/Mongo
async function readBrands(req, res, next) {
  if (!methods.includes(req.params.method)) {
    res.header("Content-Type", "application/json");
    let results = {
      success: false,
      message: "{ UNKNOWN URI } Please hit a valid URI"
    };
    await res.send(JSON.stringify(results, null, 4));
    return;
  }
  try {
    let params = JSON.stringify(req.params);
    let hash_string = crypto
      .createHash("md5")
      .update(params, "utf-8")
      .digest("hex");
    console.log(`Hash string for Redis : ${hash_string}`);

    // wrap Redis into promises
    let redis_result = await new Promise(function(resolve, reject) {
      try {
        client.get(hash_string, function(error, result) {
          if (error || !result) {
            console.log(`${hash_string} is not present in Redis`);
            resolve(false);
          } else {
            console.log(`${hash_string} is present in Redis : ${result}`);
            res.header("Content-Type", "application/json");
            let results = { success: true, response: JSON.parse(result) };
            res.send(JSON.stringify(results, null, 4));
            resolve(true);
          }
        });
      } catch (err) {
        reject(err);
      }
      setTimeout(() => {
        reject("Redis timeout : 20 sec");
      }, 20000);
    });
    // if redis has value corresponding to hash
    if (redis_result) {
      return next();
    }

    let response = await Master_Operator[mongo_methods[req.params.method]](req.body);
    res.header("Content-Type", "application/json");
    let results = { success: true, response: response };
    await res.send(JSON.stringify(results, null, 4));

    // wrap Redis into promises

    await new Promise(function(resolve, reject) {
      try {
        client.get(hash_string, function(error, result) {
          if (error || !result) {
            console.log(`Adding ${hash_string} to Redis`);
            // REVIEW add callback as fourth parameter
            // NOTE cache value till 1hour and don't cache value for empty response
            client.set(hash_string, JSON.stringify(response), "EX", REDIS_CACHE_UNTIL);
            resolve(true);
          } else {
            console.log(`${hash_string} is already in Redis : ${result}`);
            console.log("UPDATING the current Redis value");
            // NOTE cache value till 1hour and don't cache value for empty response
            client.set(hash_string, JSON.stringify(response), "EX", REDIS_CACHE_UNTIL);
            resolve(true);
          }
        });
      } catch (err) {
        reject(err);
      }
      setTimeout(() => {
        reject("Redis timeout : 20 sec");
      }, 20000);
    });
  } catch (error) {
    await catchServerError(req, res, next, error);
    return;
  }
  return next();
}

// crawl company data
async function crawlBrands(req, res, next) {
  if (!methods.includes(req.params.method)) {
    res.header("Content-Type", "application/json");
    let results = {
      success: false,
      message: "{ UNKNOWN URI } please hit correct api URI"
    };
    await res.send(JSON.stringify(results, null, 4));
    return;
  }
  try {
    let response = await Master_Operator[crawler_methods[req.params.method]](req.body);
  } catch (error) {
    await catchServerError(req, res, next, error);
    return;
  }
  return next();
}

// for page icon
router.get("/favicon.ico/", function(req, res, next) {
  return res.status(418).sendFile(`${ROOT_DIR}/Examples/favicon.ico`);
});

// READ DATA METHODS
router.get(["/:method/", "/:method/:company/", "/:method/:model/", "/:method/:company/:model/"], [validateToken, showRequestParams, readBrands]);

// READ & UPDATE DATA METHODS
router.post(
  ["/:method/", "/:method/:company/", "/:method/:model/", "/:method/:company/:model/"],
  [validateToken, showRequestParams, readBrands, crawlBrands]
);

// fetch TOP 10 BY DAILY INTEREST and TOP 10 BY FANS in patch
async function printRequest(req, res, next) {
  console.log("Request created at : " + new Date());
  console.log("Request URL :" + req.originalUrl);
  console.log("Request TYPE :" + req.method);
  console.log("Request Body :" + JSON.stringify(req.body));
  return next();
}

// read daily intrest
async function readDailyIntrest(req, res, next) {
  try {
    let response = await Master_Operator[mongo_methods.DailyIntrest](req.body);
    res.header("Content-Type", "application/json");
    let results = { success: true, response: response };
    await res.send(JSON.stringify(results, null, 4));
  } catch (error) {
    await catchServerError(req, res, next, error);
    return;
  }
  return next();
}

// update daily intrest
async function getDailyIntrest(req, res, next) {
  try {
    let response = await Master_Operator[crawler_methods.DailyIntrest](req.body);
  } catch (error) {
    await catchServerError(req, res, next, error);
    return;
  }
  return next();
}

// READ & UPDATE DAILY INTEREST
router.patch("/Device/DAILY%20INTEREST", [validateToken, printRequest, readDailyIntrest, getDailyIntrest]);

// update new devices
async function updateNewDevices(req, res, next) {
  try {
    res.header("Content-Type", "application/json");
    let results = {
      success: true,
      response: "All latest devices will be updated soon."
    };
    await res.send(JSON.stringify(results, null, 4));
    await Master_Operator[crawler_methods.updateDevices](req.body);
  } catch (error) {
    await catchServerError(req, res, next, error);
    return;
  }
  return next();
}

// add LATEST DEVICES and IN STORES NOW in put
router.put("/UPDATE/", [validateToken, printRequest, updateNewDevices]);

// delete brands/devices from data
router.delete("/REMOVE/:company/:device/", [validateToken, printRequest, removeDevice]);

// delete brands/devices from Mongo
async function removeDevice(req, res, next) {
  try {
    if (req.params.company && req.params.device) {
      req.body.company = req.params.company;
      req.body.device = req.params.device;
    } else {
      res.header("Content-Type", "application/json");
      let results = {
        success: false,
        message: "{ UNKNOWN URI } please hit correct api URI"
      };
      await res.send(JSON.stringify(results, null, 4));
      return;
    }
    let response = await Master_Operator[mongo_methods.removeDevice](req.body);
    res.header("Content-Type", "application/json");
    let results;
    if (response.stack) {
      results = {
        success: false,
        message: response.message,
        stack: response.stack
      };
    } else {
      results = {
        success: true,
        response: response.message
      };
    }
    await res.send(JSON.stringify(results, null, 4));
  } catch (error) {
    await catchServerError(req, res, next, error);
    return;
  }
  return next();
}

// insert specs of those devices whose link and name is present but secs is not present
router.put("/INCOMPLETE_DATA/", [validateToken, printRequest, updateIncompleteDevices]);

// update incomplete data in Mongo
async function updateIncompleteDevices(req, res, next) {
  try {
    res.header("Content-Type", "application/json");
    let results = {
      success: true,
      response: "All un-updated devices will be updated soon."
    };
    await res.send(JSON.stringify(results, null, 4));
    await Master_Operator[crawler_methods.incompleteDevices](req.body);
  } catch (error) {
    await catchServerError(req, res, next, error);
    return;
  }
  return next();
}

// for unknown route
router.use(async function(req, res, next) {
  if (!req.route) {
    res.header("Content-Type", "application/json");
    let results = {
      success: false,
      response: "{ UNKNOWN URI } Please hit a valid URI"
    };
    await res.send(JSON.stringify(results, null, 4));
  }
  return next();
});

module.exports = router;

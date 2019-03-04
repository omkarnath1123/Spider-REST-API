let router = require("express").Router();
let Master_Operator = require("../methods/master_operator");
const { crawler_methods, mongo_methods } = require("../methods/utils");

// TODO add nodemon -save to restart server automatically
// TODO add Authentication Later after release v1.0.1
/*
TODO Types of users
1. administrator => read , write , delete
2. developer/premium_user => read , write
3. customer => read
*/
/*
TODO get => only read data from db
post => get current data from db and start crawling for new data
patch => only crawl data and return "will done" response
delete => only delete data to db ( need Admin/developer access )
*/

/*
NOTE : only shows data return format
REVIEW ( includes crawler_methods and mongo_methods both )
For more information, visit: https://github.com/omkarnath1123/Spider-REST-API
http://localhost:8080/Brands ( array of Brands )
warning : never throw web_page_link in REST API ( REST API should not know the consumer where the data come from )
i.e.
[ { "company" : "ACER", "no_of_devices" : 100 },
  { "company" : "ALCATEL", "no_of_devices" : 381 } ]

http://localhost:8080/Brand/Company ( single object ( that object is inside an array ) that return count of Devices and company )
# no_of_devices
# company
warning : never throw web_page_link in REST API ( REST API should not know the consumer where the data come from )
i.e.
[ { "company" : "ACER", "no_of_devices" : 100 } ]

http://localhost:8080/Devices ( read the all_devices array from Brands and return array of Devices)
warning : never throw web_page_link ( in this case device info link ) in REST API ( REST API should not know the consumer where the data come from )
Todo : crawler and object is to be made

http://localhost:8080/Device/Model
warning : never throw web_page_link ( in this case device info link ) in REST API ( REST API should not know the consumer where the data come from )
Todo : crawler and object is to be made
*/

/*
REVIEW 
For more information, visit: https://github.com/omkarnath1123/Spider-REST-API/wiki
Types of router call or Crawler call
1. get all Mobile phone companies page
2. get all devices of particular company
3. get all all info about a device
4. get if response is not there send work is pending to json
*/

let methods = ["Brand", "Brands", "Device", "Devices"];
// REVIEW 
// Brands : return [] DONE
// Brand::company : return [] DONE
// Devices: return [] { "company" : "XYZ" } DONE
// Device::model : return [] { "company" : "XYZ" } DONE

async function showRequestParams(req, res, next) {
  console.log("Request created at : " + new Date());
  console.log("Request URL :" + req.originalUrl);
  console.log("Request params :" + JSON.stringify(req.params));
  console.log("Request Body :" + JSON.stringify(req.body));
  req.body.method = req.params.method; // method => Brands : return [] // method => Devices: return []
  req.body.company = req.params.company; // company => Brand::company : return []
  req.body.model = req.params.model; // Device::model : return []
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
    let response = await Master_Operator[mongo_methods[req.params.method]](
      req.body
    );
    res.header("Content-Type", "application/json");
    let results = { success: true, response: response };
    await res.send(JSON.stringify(results, null, 4));
  } catch (error) {
    console.error(error);
    console.log(error.stack);
    res.header("Content-Type", "application/json");
    let results = {
      success: false,
      message: "Server Crashed contact your network administrator",
      stack: error.stack
    };
    await res.send(JSON.stringify(results, null, 4));
    return;
  }
  return next();
}

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
    let response = await Master_Operator[crawler_methods[req.params.method]](
      req.body
    );
    // FIXME  fix return statement for put req
    // res.header("Content-Type", "application/json");
    // let results = {success: false,response: response};
    // await res.send(JSON.stringify(results, null, 4));
    return next();
  } catch (error) {
    console.error(error);
    console.log(error.stack);
    res.header("Content-Type", "application/json");
    let results = {
      success: false,
      message: "Server Crashed contact your network administrator",
      stack: error.stack
    };
    await res.send(JSON.stringify(results, null, 4));
  }
  return next();
}

// for page icon
router.get("/favicon.ico/", function(req, res, next) {
  return res.sendFile(`${process.env.ROOT_DIR}/Examples/favicon.ico`);
});

// BRAND DATA METHODS
router.get(
  [
    "/:method/",
    "/:method/:company/",
    "/:method/:model/",
    "/:method/:company/:model/"
  ],
  [showRequestParams, readBrands]
);

// TODO post method is only accessible to developer and admin
router.post(
  [
    "/:method/",
    "/:method/:company/",
    "/:method/:model/",
    "/:method/:company/:model/"
  ],
  [showRequestParams, readBrands, crawlBrands]
);

// TODO  implement others
// FIXME change 3.5mm jack to 35mm_jack
// these methods are idempotent { and res should be implemented in that way }
router.patch("/:method/", [showRequestParams]);
router.delete("/:method/", [showRequestParams]);
router.put("/:method/", [showRequestParams]);

router.use(function(req, res, next) {
  if (!req.route) return next(new Error("404"));
  next();
});

module.exports = router;

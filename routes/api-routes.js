let router = require("express").Router();
let Master_Operator = require("../methods/master_operator");
const { crawler_methods, mongo_methods } = require("../methods/utils");

// add Authentication Later after first release
// release github version after first successful routes

/*
Routes calls: ( includes crawler_methods and mongo_methods both )
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
Types of router call or Crawler call
1. get all Mobile phone companies page
2. get all devices of particular company
3. get all all info about a device
4. get if response is not there send work is pending to json
*/

/*
Types of users
1. administrator => read , write , delete
2. developer => read , write
3. customer => read
*/

/*
get => only read data from db
post => get current data from db and start crawling for new data
patch => only crawl data and return "will done" response
delete => only delete data to db ( need Admin and developer access )
*/

let methods = ["Brands", "Device", "Devices"];

router.get("/:method/", (req, res, next) => {
  console.log("request created at : " + (req.request_time || new Date()));
  console.log("Get Request Body:" + JSON.stringify(req.body));
  (async () => {
    // only read data from db
    if (!methods.includes(req.params.method)) {
      await res.json({
        success: 0,
        message: "unknown URL"
      });
      next();
    } else {
      req.body.type = req.params.method;
    }
    // Send old data as response
    try {
      let response = await Master_Operator[mongo_methods[req.params.method]](
        req.body
      );
      await res.send(response);
      next();
    } catch (error) {
      console.error(error);
      // FixMe: write error to db
    }
  })();
});

router.post("/:method/", (req, res, next) => {
  console.log("request created at : " + (req.request_time || new Date()));
  console.log("Post Request Body:" + JSON.stringify(req.body));
  (async () => {
    // get current data from db and start crawling for new data
    if (!methods.includes(req.params.method)) {
      await res.json({
        success: 0,
        message: "unknown URL"
      });
      next();
    } else {
      req.body.method = req.params.method;
      req.body.type = req.params.method;
    }
    // Send old data as response and Start fetching crawler
    try {
      let response = await Master_Operator[mongo_methods[req.params.method]](
        req.body
      );
      await res.send(response);
      // Later add job to kue
      await Master_Operator[crawler_methods[req.params.method]](req.body);
      next();
    } catch (error) {
      console.error(error);
      // FixMe: write error to db
    }
  })();
});

router.patch("/:method/", (req, res, next) => {
  console.log("request created at : " + (req.request_time || new Date()));
  console.log("Patch Request Body:" + JSON.stringify(req.body));
  (async () => {
    // only crawl data and return "will done" response
    if (!methods.includes(req.params.method)) {
      await res.json({
        success: 0,
        message: "unknown URL"
      });
      next();
    } else {
      req.body.method = req.params.method;
    }
    // Start fetching crawler
    try {
      await res.json({
        success: 1,
        message: `db will of ${
          req.params.method
        } will be updated within 10 - 30 min.`
      });
      // Later add job to kue
      await Master_Operator[crawler_methods[req.params.method]](req.body);
      next();
    } catch (error) {
      console.error(error);
      // FixMe: write error to db
    }
  })();
});

router.delete("/:method/", (req, res, next) => {
  console.log("request created at : " + (req.request_time || new Date()));
  console.log("Delete Request Body:" + JSON.stringify(req.body));
  (async () => {
    // Todo: create methods , auth and function for deletion
    // only delete data to db ( need Admin and developer access )
    // if (!methods.includes(req.params.method)) {
    //   await res.json({
    //     success: 0,
    //     message: "unknown URL"
    //   });
    //   next();
    // } else {
    //   req.body.type = req.params.method;
    // }
    // // Send old data as response
    // try {
    //   await Master_Operator[mongo_methods[req.params.method]](req.body);
    //   await res.json({
    //     success: 1,
    //     message: `query has been deleted from ${req.params.method} collection`
    //   });
    //   next();
    // } catch (error) {
    //   console.error(error);
    //   // FixMe: write error to db
    // }
  })();
});

router.copy("/:method/", (req, res, next) => {
  console.log("request created at : " + (req.request_time || new Date()));
  console.log("Copy Request Body:" + JSON.stringify(req.body));
  (async () => {
    // crawl data and write it to db and then return crawler response
    if (!methods.includes(req.params.method)) {
      await res.json({
        success: 0,
        message: "unknown URL"
      });
      next();
    } else {
      req.body.method = req.params.method;
    }
    // Start fetching data from crawler and then return this as response after write it to db
    try {
      // Later add job to kue
      let response = await Master_Operator[crawler_methods[req.params.method]](
        req.body
      );
      await res.json({
        success: 1,
        data: response
      });
      next();
    } catch (error) {
      console.error(error);
      await res.json({
        success: 1,
        data: {
          message: "Internal SERVER error",
          error: error,
          stack: error.stack
        }
      });
      next();
      // FixMe: write error to db
    }
  })();
});

module.exports = router;

require("./routes/mongoose.connection");
const Brands = require("./models/Brands");
const Devices = require("./models/Devices");
let axios = require("axios");

async function doAxios(url) {
  try {
    await axios
      .post(url)
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });
  } catch (error) {
    console.error(error);
  }
}

let wait = ms => new Promise((r, j) => setTimeout(r, ms));

async function process() {
  // For Brands
  // await doAxios("http://localhost:5000/Brands");

  // For Devices list
  // let res = await Brands.find({}, { company: 1, _id: 0 });
  // for (let i = 0; i < res.length; i++) {
  //   await doAxios(`http://localhost:5000/Devices/${res[i].company}`);
  //   await wait(30000);
  // }

  // For a Device data
  // let res = await Devices.find({}, { product_name: 1, company: 1, _id: 0 });
  // for (let i = 0; i < res.length; i++) {
  //   await doAxios(
  //     `http://localhost:5000/Device/${res[i].company}/${res[i].product_name}`
  //   );
  //   await wait(15000);
  // }

  // For missing unscraped data
  // let res = await Devices.find(
  //   { review: { $exists: false }, os: { $exists: false } },
  //   { product_name: 1, company: 1, _id: 0 }
  // );
  // res.reverse();
  // for (let i = 0; i < res.length; i++) {
  //   await doAxios(
  //     `http://localhost:5000/Device/${res[i].company}/${res[i].product_name}`
  //   );
  //   await wait(15000);
  // }

  // jshint
  await doAxios("https://spider-rest-api.herokuapp.com/Brands");
  await doAxios("https://spider-rest-api.herokuapp.com/Brand/SAMSUNG");
  await doAxios("https://spider-rest-api.herokuapp.com/Devices/SAMSUNG");
  await doAxios(
    "https://spider-rest-api.herokuapp.com/Device/SAMSUNG/Galaxy%20Fold"
  );
}

process();

module.exports = {
  wait: wait,
  doAxios: doAxios
};

/*
Sun Mar 03 21:06:02 IST 2019:  [JSON] :
An error occurred while writing to target database

Stacktrace: 
|_/ java.lang.Exception: [JSON] :
|_... An error occurred while writing to target database
|____/ t3.utils.q.d.f: An error occurred while writing to target database
|_______/ Illegal argument: Invalid BSON field name 3.5mm_jack
*/

/*
Sun Mar 03 21:01:29 IST 2019:  [JSON] :
An error occurred while writing to target database

Stacktrace: 
|_/ java.lang.Exception: [JSON] :
|_... An error occurred while writing to target database
|____/ t3.utils.q.d.f: An error occurred while writing to target database
|_______/ Illegal argument: Invalid BSON field name 3.5mm jack
*/

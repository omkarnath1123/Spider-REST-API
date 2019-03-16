const Devices = require("../models/Devices");
const Brands = require("../models/Brands");
const User = require("../models/Users");
const axios = require("axios");
const { wait } = require("../seed_DB");

const company = "ONEPLUS";
const devices = "7";

let url;
let token;

async function login() {
  if (process.env.NODE_ENV === "production") {
    url = "https://spider-rest-api.herokuapp.com/API/new_user";
  } else {
    url = "http://localhost:5000/API/new_user";
  }
  await axios({
    method: "post",
    url,
    timeout: 30000,
    data: {
      email: "test@test.com",
      user_name: "test",
      password: "test"
    }
  });
  if (process.env.NODE_ENV === "production") {
    url = "https://spider-rest-api.herokuapp.com/API/login";
  } else {
    url = "http://localhost:5000/API/login";
  }
  let res = await axios({
    method: "post",
    url,
    timeout: 30000,
    data: {
      email: "test@test.com",
      user_name: "test",
      password: "test"
    }
  });
  if (!res.loggedIn && !res.token) {
    throw new Error("error while logged in");
  }
  token = res.data.token;
}
async function testBrands() {
  if (process.env.NODE_ENV === "production") {
    url = `https://spider-rest-api.herokuapp.com//Brands/${company}`;
  } else {
    url = `http://localhost:5000/Brands/${company}`;
  }
  await axios({
    method: "get",
    url,
    headers: { authorization: token }
  });
  await wait(15000);
}

async function testDevice() {
  if (process.env.NODE_ENV === "production") {
    url = `https://spider-rest-api.herokuapp.com//Devices/${company}`;
  } else {
    url = `http://localhost:5000/Devices/${company}`;
  }
}

async function testDevices() {
  if (process.env.NODE_ENV === "production") {
    url = `https://spider-rest-api.herokuapp.com//Device/${company}/${devices}`;
  } else {
    url = `http://localhost:5000/Device/${company}/${devices}`;
  }
}

(async () => {
  await wait(5000);
  await login();

  await User.findOneAndRemove({ email: "test@test.com", user_name: "test" });
})();

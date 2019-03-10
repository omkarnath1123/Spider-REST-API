"use strict";

const Puppeteer = require("../../core/puppeteer");
const CrawledDevices = require("../../models/Devices");
const Company = require("../../models/Brands");
const { wait } = require("../../seed_DB");
let axios = require("axios");

class crawlNewDevices {
  constructor(context) {
    this.context = context;
    this.url = process.env.PAGE_BASE_URL;
    this.free_proxy_url = process.env.PROXY_URL;
    this.browserInstance = new Puppeteer();
    this.page = null;
  }

  async header() {
    try {
      // TODO implement select proxy later
      // let proxies = await this.getProxyAndPort();
      // try to aggregate and update in db as processing

      let data = [];
      this.page = await this.browserInstance.openWebPage(this.url);
      data = await this.LatestDevices();
      // console.log(JSON.stringify(data));
      this.page = null;
      await this.browserInstance.close();
      await this.updateDB(data);
      // call all axios calls
      await this.callAxios(data);
      console.log(`NEW LAUNCHED DEVICES COUNT : ${data.length}`);
      return data;
    } catch (error) {
      // FIXME add error to crawler_error feild
      console.error(error);
      if (this.page) await this.browserInstance.close();
    }
  }

  async LatestDevices() {
    let array = [];
    let Devices = await this.page.$$eval("a.module-phones-link", nodes =>
      nodes.map(node => {
        return {
          name: node.innerText.trim(),
          link: "https://www.gsmarena.com/" + node.getAttribute("href"),
          image: node.querySelector("img").getAttribute("src")
        };
      })
    );
    for (let i = 0; i < Devices.length; i++) {
      if (!Devices[i]) continue;
      let company = Devices[i].name.split(" ")[0].toUpperCase();
      let device = Devices[i].name.split(" ");
      device.shift();
      device = device.toString().replace(/,/g, " ");
      let isPresent = await CrawledDevices.findOne({
        company: company,
        product_name: device,
        // REVIEW forcefully UPDATE unitl data is not fetched
        review: { $exists: true, $ne: null }
      });
      if (!isPresent) {
        array.push({
          company: company,
          device: device,
          link: Devices[i].link,
          image: Devices[i].image
        });
      }
    }
    return array;
  }

  async updateDB(data) {
    for (let i = 0; i < data.length; i++) {
      await CrawledDevices.findOneAndUpdate(
        { company: data[i].company, product_name: data[i].device },
        {
          attempt: 1,
          status: "CRAWLED",
          $push: { crawled_dates: new Date() },
          updated_at: new Date(),
          created_at: new Date(),

          company: data[i].company,
          product_image: data[i].image,
          product_page_link: data[i].link,
          desc: null,
          product_name: data[i].device
        },
        { upsert: true }
      );
      let company_products = await CrawledDevices.find(
        { company: data[i].company },
        { _id: 1 }
      );
      await Company.findOneAndUpdate(
        { company: data[i].company },
        {
          all_devices: company_products,
          devices_list_count: company_products.length
        }
      );
    }
  }

  async callAxios(data) {
    for (let i = 0; i < data.length; i++) {
      let url;
      if (process.env.NODE_ENV === "production") {
        url = `https://spider-rest-api.herokuapp.com//Device/${
          data[i].company
        }/${data[i].device}`;
      } else {
        url = `http://localhost:5000/Device/${data[i].company}/${
          data[i].device
        }`;
      }
      console.log(`Calling POST request to : ${url}`);
      await axios.post(url);
      // 15 sec is average waiting time for getting data
      await wait(15000);
    }
  }

  // FIXME complete implemention
  async getProxyAndPort() {
    this.page = await this.browserInstance.openWebPage(this.free_proxy_url);
    await this.page.evaluate(() => {
      document.querySelector('select[name="proxylisttable_length"]').value = 80;
    });
  }
}

module.exports = crawlNewDevices;

"use strict";

const Puppeteer = require("../../core/puppeteer");
const CrawledDevices = require("../../models/Devices");
const { wait } = require("../../seed_DB");
let axios = require("axios");

class crawlUncrawledDevices {
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

      // FIXME token varification needed on sending api request

      let data = await this.unCrawledDevices();
      await this.callAxios(data);
      console.log(`UNCRAWLED DEVICES COUNT : ${data.length}`);
    } catch (error) {
      // FIXME add error to crawler_error feild
      console.error(error);
    }
  }

  async unCrawledDevices() {
    let array = await CrawledDevices.find({ review: { $exists: false } });
    return array;
  }

  async callAxios(data) {
    for (let i = 0; i < data.length; i++) {
      let url;
      if (process.env.NODE_ENV === "production") {
        url = `https://spider-rest-api.herokuapp.com//Device/${
          data[i].company
        }/${data[i].product_name}`;
      } else {
        url = `http://localhost:5000/Device/${data[i].company}/${
          data[i].product_name
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

module.exports = crawlUncrawledDevices;

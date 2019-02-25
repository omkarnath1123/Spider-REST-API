"use strict";

// later add every job in queue [mongo_methods, crawler_methods]
const Puppeteer = require("../../core/puppeteer");
const Company = require("../../models/Brands");

class Brands {
  constructor(context) {
    this.context = context;
    this.url = "https://www.gsmarena.com/";
    this.free_proxy_url = "https://www.socks-proxy.net/";
    this.browserInstance = new Puppeteer();
    this.page = null;
  }

  // Later master function called from queue (kue)
  async header() {
    try {
      // implement select proxy later
      // let proxies = await this.getProxyAndPort();

      // try to aggregate and update in db as processing
      this.page = await this.browserInstance.openWebPage(this.url);
      let Brands = await this.getTableData();
      // console.log(Brands);
      await this.updateDB(Brands);
      await this.browserInstance.close();
      console.log("here");
      return Brands;
    } catch (error) {
      console.error(error);
    }
  }


  async updateDB(Brands) {
    for (let i = 0; i < Brands.length; i++) {
      let company = await Company.find({ company: Brands[i].company });
      await Company.findOneAndUpdate(
        { company: Brands[i].company },
        {
          attempt: (company[0] && company[0].attempt + 1) || 1,
          status: "CRAWLED",
          $push: { crawled_dates: new Date() },
          updated_at: new Date(),
          created_at: (company[0] && company[0].created_at) || new Date(),

          company: Brands[i].company,
          no_of_devices: Brands[i].no_of_devices,
          web_page_link: Brands[i].link,
          previous_devices_count: (company[0] && company[0].no_of_devices) || 0,
          // conform all_devices types and model later
          all_devices: (company[0] && company[0].all_devices) || []
        },
        { upsert: true }
      );
    }
  }

  async getProxyAndPort() {
    this.page = await this.browserInstance.openWebPage(this.free_proxy_url);
    await this.page.evaluate(() => {
      document.querySelector('select[name="proxylisttable_length"]').value = 80;
    });
    await this.page.$$("");
  }

  async getTableData() {}

  // create or update collection
  async createOrUpdateCollection() {}
}

module.exports = Brands;

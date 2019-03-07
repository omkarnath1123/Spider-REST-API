"use strict";

const Puppeteer = require("../../core/puppeteer");
const Company = require("../../models/Brands");
const Devices = require("../../models/Devices");

class BrandsDevices {
  constructor(context) {
    this.context = context;
    this.url = null;
    this.free_proxy_url = process.env.PROXY_URL;
    this.browserInstance = new Puppeteer();
    this.page = null;
  }

  async header() {
    try {
      // TODO implement select proxy later
      // let proxies = await this.getProxyAndPort();
      // try to aggregate and update in db as processing

      this.url = await this.getURL();
      if (!this.url) {
        return new ErrorEvent("404 server error wrong data in DB");
      }
      this.page = await this.browserInstance.openWebPage(
        this.url.web_page_link
      );
      let Devices = await this.getJSON();
      // console.log(JSON.stringify(Devices));
      this.page = null;
      await this.browserInstance.close();
      await this.updateDB(Devices);
      Devices.forEach(value => {
        delete value.product_page_link;
      });
      return Devices;
    } catch (error) {
      // FIXME add error to crawler_error feild
      console.error(error);
      if (this.page) await this.browserInstance.close();
    }
  }

  async getJSON() {
    let all_devices = [];
    try {
      await this.page.waitForSelector(".nav-pages > a");
    } catch (error) {
      let devices = await this.page.$$(".makers > ul > li");
      for (let i = 0; i < devices.length; i++) {
        let device = {};
        device.product_page_link = await devices[i].$eval(
          "a",
          node => node.href
        );
        device.product_image = await devices[i].$eval(
          "a > img",
          node => node.src
        );
        device.desc = await devices[i].$eval("a > img", node => node.title);
        device.product_name = await devices[i].$eval(
          "a",
          node => node.innerText
        );
        device.product_name = device.product_name.replace(/\//g, " ");
        all_devices.push(device);
      }
      return all_devices;
    }
    // REVIEW check why process.env.PAGE_BASE_URL ? undefined
    let pages_links = await this.page.$$eval(".nav-pages > a", nodes =>
      nodes.map(node => {
        return "https://www.gsmarena.com/" + node.getAttribute("href");
      })
    );
    await this.get_data(all_devices, pages_links, 0);
    return all_devices;
  }

  async get_data(all_devices, pages_links, i) {
    let devices = await this.page.$$(".makers > ul > li");
    for (let i = 0; i < devices.length; i++) {
      let device = {};
      device.product_page_link = await devices[i].$eval("a", node => node.href);
      device.product_image = await devices[i].$eval(
        "a > img",
        node => node.src
      );
      device.desc = await devices[i].$eval("a > img", node => node.title);
      device.product_name = await devices[i].$eval("a", node => node.innerText);
      all_devices.push(device);
    }
    let is_last_page = await this.page.$(".pages-next.disabled");
    let next_page = await this.page.$(".pages-next");
    // NOTE && false to disable pagination
    if (!is_last_page && next_page) {
      try {
        await this.page.goto(pages_links[i]);
      } catch (e) {}
      i++;
      await this.get_data(all_devices, pages_links, i);
    }
  }

  async getURL() {
    if (this.context.company) {
      return await Company.findOne(
        { company: this.context.company },
        {
          web_page_link: 1,
          _id: 0
        }
      );
    }
  }

  async updateDB(Brands) {
    let company_id = await Company.findOne(
      { company: this.context.company },
      { _id: 1 }
    );
    for (let i = 0; i < Brands.length; i++) {
      let device = await Devices.findOne({
        product_name: Brands[i].product_name
      });
      await Devices.findOneAndUpdate(
        { product_name: Brands[i].product_name },
        {
          attempt: (device && device.attempt + 1) || 1,
          status: "CRAWLED",
          $push: { crawled_dates: new Date() },
          updated_at: new Date(),
          created_at: (device && device.created_at) || new Date(),

          company: this.context.company,
          company_id: company_id._id,

          product_page_link: Brands[i].product_page_link,
          product_image: Brands[i].product_image,
          desc: Brands[i].desc,
          product_name: Brands[i].product_name
        },
        { upsert: true }
      );
    }
    let company_products = await Devices.find(
      { company: this.context.company },
      { _id: 1 }
    );
    await Company.findOneAndUpdate(
      { company: this.context.company },
      {
        all_devices: company_products,
        devices_list_count: company_products.length
      }
    );
  }

  // FIXME complete implemention
  async getProxyAndPort() {
    this.page = await this.browserInstance.openWebPage(this.free_proxy_url);
    await this.page.evaluate(() => {
      document.querySelector('select[name="proxylisttable_length"]').value = 80;
    });
  }
}

module.exports = BrandsDevices;

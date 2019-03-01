"use strict";

const Puppeteer = require("../../core/puppeteer");
const Company = require("../../models/Brands");
const Devices = require("../../models/Devices");

class BrandsDeviceData {
  constructor(context) {
    this.context = context;
    this.url = null;
    this.free_proxy_url = process.env.PROXY_URL;
    this.browserInstance = new Puppeteer();
    this.page = null;
  }

  async header() {
    try {
      // implement select proxy later
      // let proxies = await this.getProxyAndPort();
      // try to aggregate and update in db as processing

      this.url = await this.getURL();
      if (!this.url) {
        return new Error("404 server error wrong data in DB");
      }
      this.page = await this.browserInstance.openWebPage(
        this.url.product_page_link
      );
      let Devices = await this.getJSON();
      console.log(JSON.stringify(Devices));
      await this.browserInstance.close();
      Devices = await this.updateDB(Devices);
      return Devices;
    } catch (error) {
      console.error(error);
    }
  }

  async getJSON() {
    let device_info = {};
    let tables = await this.page.$$("#specs-list > table");
    for (let i = 0; i < tables.length; i++) {
      let obj = {};
      let heading;
      let tr = await tables[i].$$("tr");
      for (let j = 0; j < tr.length; j++) {
        let temp_keys = 0;
        if (j === 0) {
          heading = await tr[j].$eval("th", node => node.innerText);
          heading = heading ? heading.trim().toLowerCase() : heading;
        }
        let type = await tr[j].$eval("td.ttl", node => node.innerText);
        type = type.trim();
        if (!type) {
          type = `${heading}_spec_${temp_keys}`;
          temp_keys++;
        }
        let data = await tr[j].$eval("td.nfo", node => node.innerText);
        data = data ? data.trim() : data;
        obj[type] = data;
      }
      device_info[heading] = obj;
    }
    let info = await this.page.$$("span.specs-brief-accent");
    if (info[0])
      device_info.release_date = await info[0].$eval(
        "span",
        node => node.innerText
      );
    if (info[1])
      device_info.dimensions = await info[1].$eval(
        "span",
        node => node.innerText
      );
    if (info[2])
      device_info.os = await info[2].$eval("span", node => node.innerText);
    if (info[3])
      device_info.storage = await info[3].$eval("span", node => node.innerText);

    let url = await this.page.$eval(
      ".article-info-meta-link.light > a",
      node => node.href
    );
    let images = [];
    if (url) {
      await this.page.goto(url);
      let links = await this.page.$("#pictures-list");
      images = await links.$$eval("#pictures-list > img", nodes =>
        nodes.map(node => {
          return node.getAttribute("src");
        })
      );
    }
    device_info.device_images = images;
    return device_info;
  }

  async getURL() {
    if (this.context.company && this.context.model) {
      return await Devices.findOne(
        { company: this.context.company, product_name: this.context.model },
        { product_page_link: 1, _id: 0 }
      );
    }
  }

  async updateDB(devices) {
    let keys = ["release_date", "dimensions", "os", "storage", "device_images"];
    let DeviceKeys = Object.keys(devices);
    let filtered = DeviceKeys.filter(word => !keys.includes(word));
    let review = {};
    filtered.forEach(value => {
      review[value] = devices[value];
    });

    let previous_data = await Devices.findOne({
      product_name: this.context.model
    });
    await Devices.findOneAndUpdate(
      { product_name: this.context.model },
      {
        review: review,
        release_date: devices.release_date,
        dimensions: devices.dimensions,
        os: devices.os,
        storage: devices.storage,
        device_images: devices.device_images,

        status: "UPDATED",
        attempt: (previous_data && previous_data.attempt + 1) || 0,
        $push: { crawled_dates: new Date() },
        updated_at: new Date(),
        created_at: (previous_data && previous_data.created_at) || new Date()
      },
      { upsert: false }
    );
    devices.company = previous_data.company;
    devices.product_image = previous_data.product_image;
    devices.desc = previous_data.desc;
    devices.product_name = previous_data.product_name;
    return devices;
  }

  async getProxyAndPort() {
    this.page = await this.browserInstance.openWebPage(this.free_proxy_url);
    await this.page.evaluate(() => {
      document.querySelector('select[name="proxylisttable_length"]').value = 80;
    });
  }
}

module.exports = BrandsDeviceData;

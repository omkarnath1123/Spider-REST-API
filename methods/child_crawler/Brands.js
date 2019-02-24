"use strict";

// later add every job in queue [mongo_methods, crawler_methods]
const Puppeteer = require("../../core/puppeteer");
class Brands {
  constructor(context) {
    this.context = context;
    this.url = "https://www.gsmarena.com/makers.php3";
    this.free_proxy_url = "https://www.socks-proxy.net/";
    this.browserInstance = new Puppeteer();
    this.page = null;
  }

  // Later master function called from queue (kue)
  async header() {
    try {
      // implement select proxy later
      // let proxies = await this.getProxyAndPort();
      this.page = await this.browserInstance.openWebPage(this.url);
      let Brands = await this.getTableData();
      console.log(Brands);
    } catch (error) {
      console.error(error);
    }
  }

  async getProxyAndPort() {
    this.page = await this.browserInstance.openWebPage(this.free_proxy_url);
    await this.page.evaluate(() => {
      document.querySelector('select[name="proxylisttable_length"]').value = 80;
    });
    await this.page.$$('');
  }

  async getTableData() {
    let td = await this.page.$$("td");
    let parentLink = "https://www.gsmarena.com/";
    let Brands = [];
    for (let i = 0; i < td.length; i++) {
      let link = await this.page.evaluate(td => {
        return td.querySelector("a").getAttribute("href");
      }, td[i]);
      link = parentLink + link.trim();
      let devices_count = await this.page.evaluate(td => {
        return td.querySelector("a > span").innerText;
      }, td[i]);
      devices_count = devices_count.match(/\d+/g)[0];
      devices_count = Number(devices_count);
      let brand = await this.page.evaluate(td => {
        return td.querySelector("a").innerText;
      }, td[i]);
      brand = brand.split(/\d+/g)[0];
      brand = brand.trim();
      Brands.push({
        link: link,
        no_of_devices: devices_count,
        company: brand
      });
    }
    return Brands;
  }

  // create or update collection
  async createOrUpdateCollection() {}
}

module.exports = Brands;

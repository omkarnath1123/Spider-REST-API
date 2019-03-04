"use strict";

const Puppeteer = require("../../core/puppeteer");
const Company = require("../../models/Brands");

class Brands {
  constructor(context) {
    this.context = context;
    this.url = `${process.env.PAGE_BASE_URL}makers.php3`;
    this.free_proxy_url = process.env.PROXY_URL;
    this.browserInstance = new Puppeteer();
    this.page = null;
  }

  async header() {
    try {
      // TODO update code syntax {take reference from Devices}
      // implement select proxy later
      // let proxies = await this.getProxyAndPort();
      // try to aggregate and update in db as processing ? is necessary : to check for which company res has failed

      this.page = await this.browserInstance.openWebPage(this.url);
      let Brands = await this.getTableData();
      this.page = null;
      await this.browserInstance.close();
      // console.log(JSON.stringify(Brands));
      Brands = await this.updateDB(Brands);
      return Brands;
    } catch (error) {
      if (this.page) await this.browserInstance.close();
      console.error(error);
    }
  }

  async updateDB(Brands) {
    if (!Brands.length) return;
    if (this.context.company) {
      Brands = Brands.filter(val => val.company === this.context.company);
      Brands = Brands[0];
      let company = await Company.find({ company: this.context.company });
      company = company[0];
      await Company.findOneAndUpdate(
        { company: this.context.company },
        {
          attempt: (company && company.attempt + 1) || 1,
          status: "CRAWLED",
          $push: { crawled_dates: new Date() },
          updated_at: new Date(),
          created_at: (company && company.created_at) || new Date(),

          company: Brands.company,
          no_of_devices: Brands.no_of_devices,
          web_page_link: Brands.link,
          previous_devices_count: (company && company.no_of_devices) || 0,
          all_devices: (company && company.all_devices) || []
        }
      );
      let array = [];
      array.push(Brands);
      return array;
    }
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
          all_devices: (company[0] && company[0].all_devices) || [],
          devices_list_count: (company[0] && company[0].devices_list_count) || 0
        },
        { upsert: true }
      );
    }
    return Brands;
  }

  // FIXME complete implemention
  async getProxyAndPort() {
    this.page = await this.browserInstance.openWebPage(this.free_proxy_url);
    await this.page.evaluate(() => {
      document.querySelector('select[name="proxylisttable_length"]').value = 80;
    });
  }

  async getTableData() {
    let td = await this.page.$$("td");
    let parentLink = process.env.PAGE_BASE_URL;
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
}

module.exports = Brands;

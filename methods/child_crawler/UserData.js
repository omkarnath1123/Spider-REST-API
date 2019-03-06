"use strict";

const Puppeteer = require("../../core/puppeteer");
const DailyIntrest = require("../../models/UserData");

class DailyIntrestMethod {
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

      let data = {};
      this.page = await this.browserInstance.openWebPage(this.url);
      data.daily_intrest = await this.DailyIntrest();
      data.fan_favorite = await this.FanFavorite();
      // console.log(JSON.stringify(data));
      this.page = null;
      await this.browserInstance.close();
      await this.updateDB(data);
      return data;
    } catch (error) {
      // FIXME add error to crawler_error feild
      console.error(error);
      if (this.page) await this.browserInstance.close();
    }
  }

  async FanFavorite() {
    let array = [];
    await this.page.waitForSelector("table.module-fit.blue > tbody > tr");
    let selector = await this.page.$$("table.module-fit.blue > tbody > tr");
    for (let i = 1; i < selector.length; i++) {
      let obj = {};
      obj.position = await selector[i].$eval(
        'td[headers="th3a"]',
        node => node.innerText
      );
      obj.position = Number(obj.position.replace(/[^\d]/g, ""));
      obj.device = await selector[i].$eval(
        'th[headers="th3b"]',
        node => node.innerText
      );
      obj.fan_count = await selector[i].$eval(
        'td[headers="th3c"]',
        node => node.innerText
      );
      obj.fan_count = Number(obj.fan_count.replace(/[^\d]/g, ""));
      array.push(obj);
    }
    return array;
  }

  async DailyIntrest() {
    let array = [];
    await this.page.waitForSelector("table.module-fit.green > tbody > tr");
    let selector = await this.page.$$("table.module-fit.green > tbody > tr");
    for (let i = 1; i < selector.length; i++) {
      let obj = {};
      obj.position = await selector[i].$eval(
        'td[headers="th3a"]',
        node => node.innerText
      );
      obj.position = Number(obj.position.replace(/[^\d]/g, ""));
      obj.device = await selector[i].$eval(
        'th[headers="th3b"]',
        node => node.innerText
      );
      obj.daily_hits = await selector[i].$eval(
        'td[headers="th3c"]',
        node => node.innerText
      );
      obj.daily_hits = Number(obj.daily_hits.replace(/[^\d]/g, ""));
      array.push(obj);
    }
    return array;
  }

  async updateDB(data) {
    let previous_data = await DailyIntrest.find();
    await DailyIntrest.findOneAndUpdate(
      { status: "UPDATED" },
      {
        daily_intrest: data.daily_intrest,
        fan_favorite: data.fan_favorite,

        status: "UPDATED",
        attempt: (previous_data[0] && previous_data[0].attempt + 1) || 1,
        $push: { crawled_dates: new Date() },
        updated_at: new Date(),
        created_at:
          (previous_data[0] && previous_data[0].created_at) || new Date()
      },
      { upsert: true }
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

module.exports = DailyIntrestMethod;

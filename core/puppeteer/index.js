const puppeteer = require("puppeteer");
const env = process.env.NODE_ENV;
const path = require("path");
const PUPPETEER_DIR = path.dirname(__filename);
module.exports = class Puppeteer {
  constructor(options) {
    // STUB Merge the default options with the client submitted options
    this.options = {
      params: {
        ignoreHTTPSErrors: true,
        headless:
          env === "production" || (process.env.CHROMIUM_HEADLESS || true),
        devtools:
          env !== "production" && env !== "staging" && env !== "development",
        args: [
          "--ash-host-window-bounds=1920x1080",
          "--window-size=1920,1048",
          "--window-position=0,0",
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage"
        ],
        defaultViewport: {
          width: 1366,
          height: 768
        },
        env
      },
      ...options
    };
  }

  // bing page events
  bindPageEvents() {
    if (typeof process.env.APP_PAGE_EVENS === "undefined") {
      process.env.APP_PAGE_EVENS = true;
    }
    if (process.env.APP_PAGE_EVENS && process.env.APP_PAGE_EVENS !== "false") {
      this.webPage.on("error", msg => {
        console.error("console error : " + msg);
      });
      this.webPage.on("warning", msg => {
        console.log("console warning : " + msg);
      });
      this.webPage.on("log", msg => {
        console.log("console log : " + msg);
      });
      this.webPage.on("confirm", msg => {
        console.log("Page confirmation dialog confirm found");
        msg.accept();
      });
      this.webPage.on("alert", msg => {
        console.log("Page confirmation alert dialog found");
      });
      this.webPage.on("prompt", () => {
        console.log("Page confirmation prompt dialog found");
      });
      this.webPage.on("beforeunload", () => {
        console.log("Page confirmation beforeunload dialog found");
      });
      // REVIEW below this lines events are verified
      this.webPage.on("close", () => {
        console.log("Page closed");
      });
      this.webPage.on("load", () => {
        console.log("Page loaded");
      });
      this.webPage.on("domcontentloaded", () => {
        console.log("DOM content loaded");
      });
      this.webPage.on("framenavigated", () => {
        console.log("Frame navigated");
      });
      this.webPage.on("response", msg => {
        console.log(`Res URL - ${msg.url()}`);
      });
      this.webPage.on("request", msg => console.log(`Req URL - ${msg.url()}`));
      this.webPage.on("pageerror", error => {
        console.log(`Page Error - ${error}`);
      });
      this.webPage.on("error", error => {
        console.log(`Error - ${JSON.stringify(error)}`);
      });
      this.webPage.on("requestfailed", error => {
        console.log(`Request Failed - ${error.url()}`);
      });
    }
  }

  // open page
  async openWebPage(url) {
    this.browserInstance = await puppeteer.launch(this.options.params);
    this.webPage = await this.browserInstance.newPage();
    this.bindPageEvents();
    let page = await this.webPage.goto(url, {
      waitUntil: "load",
      timeout: 60000
    });
    if (page.status() !== 200) {
      throw new Error("could not open web page -> " + url);
    }
    return this.webPage;
  }

  // close browser
  async close() {
    if (this.webPage) await this.webPage.close();
    delete this.webPage;
    if (this.browserInstance) await this.browserInstance.close();
    delete this.browserInstance;
  }
};

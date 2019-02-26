const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const __tempDir =
  process.env.SCREENSHOTS_DIR || path.join(__dirname, "/../../../tmp/");
const env = process.env.NODE_ENV;

module.exports = class Puppeteer {
  constructor(options) {
    // Merge the default options with the client submitted options
    this.options = {
      params: {
        // userDataDir: process.env.PUPPETEER_DIR || __tempDir,
        // slowMo: 100,
        ignoreHTTPSErrors: true,
        headless: env === "production" || env === "staging",
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
    this.screenShotDir = __tempDir;
  }

  bindPageEvents() {
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
    // below this lines events are verified
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

  async openWebPage(url) {
    this.browserInstance = await puppeteer.launch(this.options.params);
    // Todo: see why targetdestroyed is UnhandledPromiseRejectionWarning
    // this.browserInstance.on("targetdestroyed", async () =>
    //   console.log(
    //     "Target destroyed. Pages count :" +
    //       ((await this.browserInstance.pages()) || []).length
    //   )
    // );
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

  setScreenShotSubDir(path, absPath, isPathOptional) {
    return new Promise((resolve, reject) => {
      path = (path || "").trim().replace(/\//g, "");
      if (path) {
        path += `_v${this.options.tryAttempt}`;
      }
      if (!isPathOptional && !path) resolve();
      absPath = absPath || __tempDir;
      this.screenShotDir = absPath + path + "/";
      fs.stat(this.screenShotDir, err => {
        if (err) {
          fs.mkdir(this.screenShotDir, err => {
            if (!err) {
              resolve(true);
            }
            reject("Screenshot directory not created try again!!");
          });
        } else {
          resolve(true);
        }
      });
    });
  }

  captureScreenshot(name) {
    if (process.env.KONNECT_MONGODB_AUTH === "production") {
      return null;
    } else {
      name = name.trim();
      if (name.match(/\.jpg$/) == null) name = name + ".jpg";
      let path = this.screenShotDir + name;
      return this.webPage.screenshot({
        path: path,
        type: "jpeg",
        quality: 75,
        fullPage: true
      });
    }
  }

  async close() {
    if (this.webPage) await this.webPage.close();
    delete this.webPage;
    if (this.browserInstance) await this.browserInstance.close();
    delete this.browserInstance;
  }
};

"use strict";

const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright-chromium");
const morgan = require("morgan");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.send("Hello from Web Converter :)");
});

app.post("/url-to-pdf", async (req, res) => {
  try {
    if (!req.body.url) {
      return res.status(400).json("Body url is required");
    }

    if (!req.body.format) {
      req.body.format = "a4";
    }

    const browser = await chromium.launch({
      chromiumSandbox: false,
    });
    const page = await browser.newPage();
    // 'https://mauju-invoice-staging.herokuapp.com/pdf/iT5u5sQgcv'
    await page.goto(req.body.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    const pdf = await page.pdf({
      format: req.body.format,
      printBackground: true,
    });

    await browser.close();

    res.contentType("application/pdf");
    res.send(pdf);
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
});

app.post("/html-to-png", async (req, res) => {
  try {
    if (!req.body.html) {
      res.status(400).json("Body html is required");
    }

    if (!req.body.width) {
      req.body.width = 368;
    }

    if (!req.body.height) {
      req.body.height = 570;
    }

    const browser = await chromium.launch({
      chromiumSandbox: false,
    });
    const page = await browser.newPage({
      viewport: { width: req.body.width, height: req.body.height },
      deviceScaleFactor: 3,
    });

    await page.setContent(req.body.html);

    const image = await page.screenshot({
      type: "png",
    });

    await browser.close();

    res.contentType("image/png");
    res.send(image);
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
});

app.listen(PORT);
console.log(`Running on port ${PORT}`);

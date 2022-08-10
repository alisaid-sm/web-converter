"use strict";

const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright-chromium");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from Web Converter :)");
});

app.get("/url-to-pdf", async (req, res) => {
  try {
    if (!req.query.url) {
      return res.status(400).json("Query url is required");
    }

    console.log(req.query.url);

    const browser = await chromium.launch({
      chromiumSandbox: false,
    });
    const page = await browser.newPage();
    // 'https://mauju-invoice-staging.herokuapp.com/pdf/iT5u5sQgcv'
    await page.goto(req.query.url);
    await page.waitForTimeout(3000);

    const pdf = await page.pdf({ format: "a4", printBackground: true });

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

    const browser = await chromium.launch({
      chromiumSandbox: false,
    });
    const page = await browser.newPage({
      viewport: { width: 368, height: 570 },
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

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const urlParser = require("url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// Store URLs in memory (or use a DB later)
let urlDatabase = [];
let counter = 1;

app.get("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  try {
    const hostname = urlParser.parse(originalUrl).hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.status(400).json({ error: "Invalid URL" });
      }

      const shortUrl = counter++;
      urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
      res.json({ original_url: originalUrl, short_url: shortUrl });
    });
  } catch (err) {
    res.json({ error: "Invalid URL" });
  }
});

// GET endpoint to redirect to original URL
app.get("/api/shorturl/:short_url", (req, res) => {
  const short = parseInt(req.params.short_url);
  const found = urlDatabase.find((url) => url.short_url === short);
  if (found) {
    res.redirect(found.original_url);
  } else {
    res.status(404).json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

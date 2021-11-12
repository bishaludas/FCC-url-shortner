require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.urlencoded());
app.use(express.json());

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(process.env["MONGO_URI"]);

const URLShortnerSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: String,
});

let Shortner = mongoose.model("URLShortner", URLShortnerSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
  const url = req.body.url;
  // check if url exists and return if it does
  let shortnedURL = await Shortner.find({ original_url: url });
  if (shortnedURL.length >= 1) {
    console.log("Already exists");
    return res.json(shortnedURL[0]);
  }

  // Add new url shortner
  console.log("creating new url shortner");
  let multiplier = new Date().getMilliseconds();
  let random_short_url = Math.round(Math.random() * multiplier);

  let shortnerObj = new Shortner({
    original_url: url,
    short_url: random_short_url,
  });

  shortnerObj.save((err, data) => {
    if (err) return console.error(err);
    res.json(data);
  });
});

app.get("/api/shorturl/:id", async (req, res) => {
  let short_url_id = req.params.id;
  let shortnedURL = await Shortner.findOne({ short_url: short_url_id });
  console.log(shortnedURL.original_url);
  return res.redirect(shortnedURL.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

const express = require("express");
const morgan = require("morgan");

const PORT = 3000;
const HOST = "0.0.0.0";

const app = express();

app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/api", (req, res) => {
  res.send("Hello world");
});

app.get("/validate", (req, res) => {
  console.log("headers", req.headers);
  res
    .status(200)
    .set({
      User: JSON.stringify({
        name: "username"
      })
    })
    .send("Success");
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

import * as express from "express";
import * as morgan from "morgan";
import { UserInput } from "./models/User";

const PORT = 3000;
const HOST = "0.0.0.0";

const app = express();

app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/api", (req, res) => {
  res.send("api route");
});

app.get("/validate", (req, res) => {
  const { authorization } = req.headers;

  res
    .status(200)
    .set({
      User: JSON.stringify({
        name: "username"
      })
    })
    .send();
});

app.post("/login", (req, res) => {});

app.post("/signup", (req, res) => {
  const user: UserInput = req.body;

  res.status(200).send();
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

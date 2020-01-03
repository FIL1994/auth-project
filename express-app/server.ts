import * as express from "express";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import * as bcrypt from "bcryptjs";
import { UserInput } from "./models/User";
import { validate } from "class-validator";
import { pool } from "./db";

const PORT = 3000;
const HOST = "0.0.0.0";

const app = express();

app.use(bodyParser.json());
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

app.post("/login", async (req, res) => {});

app.post("/signup", async (req, res) => {
  const user: UserInput = Object.assign(new UserInput(), req.body);

  const errors = await validate(user, {
    whitelist: true
  });

  const error = errors
    .map(error => Object.values(error.constraints).join(". "))
    .join(". ");

  if (error) {
    res.status(400).send({ error });
    return;
  }

  user.password = await bcrypt.hash(user.password, 10);

  const client = await pool.connect();

  try {
    const result = await client.query(
      `INSERT into app_user (email, name, password) VALUES ($1, $2, $3) RETURNING id, user_id, password`,
      [user.email, user.name, user.password]
    );

    console.log("Res: ", result.rows[0]);

    res.status(200).send(user);
  } catch (e) {
    res.status(500).send({ error: "An error occurred" });
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

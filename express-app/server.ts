require("dotenv").config();
import * as express from "express";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as HttpStatus from "http-status-codes";
import * as _ from "lodash";
import { UserInput, User } from "./models/User";
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

  if (_.isEmpty(authorization)) {
    res.status(HttpStatus.BAD_REQUEST).send("Authorization header is required");
    return;
  }

  const user = jwt.verify(
    authorization.replace("Bearer ", ""),
    process.env.JWT_SECRET
  );

  res
    .status(HttpStatus.OK)
    .set({
      User: JSON.stringify(user)
    })
    .send();
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (_.isEmpty(email))
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ error: "Email is required" });
  if (_.isEmpty(password))
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ error: "Password is required" });

  let user: User;
  try {
    const result = await pool.query(
      `SELECT user_id as id, email, name, password FROM app_user WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (result.rowCount === 0) {
      res
        .status(HttpStatus.NOT_FOUND)
        .send({ error: `No user with the email "${email}" was found` });
    }

    user = result.rows[0];
  } catch (e) {
    console.log(e);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    return;
  }

  const doPasswordsMatch = await bcrypt.compare(password, user.password);
  if (!doPasswordsMatch) {
    res.status(HttpStatus.BAD_REQUEST).send({ error: "Invalid password" });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d"
    }
  );

  delete user.password;
  res.send({ user, token });
});

app.post("/signup", async (req, res) => {
  const user: UserInput = Object.assign(new UserInput(), req.body);

  const errors = await validate(user, {
    whitelist: true
  });

  const error = errors
    .map(error => Object.values(error.constraints).join(". "))
    .join(". ");

  if (error) {
    res.status(HttpStatus.BAD_REQUEST).send({ error });
    return;
  }

  user.password = await bcrypt.hash(user.password, 10);

  const client = await pool.connect();

  try {
    await client.query(
      `INSERT into app_user (email, name, password) VALUES ($1, $2, $3)`,
      [user.email, user.name, user.password]
    );
    client.release();

    res.status(HttpStatus.OK).send(user);
  } catch (e) {
    client.release();
    console.log("Error", e);

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send({ error: "An error occurred" });
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

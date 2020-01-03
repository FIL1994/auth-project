import * as pg from "pg";

export const pool = new pg.Pool({
  host: "db",
  user: "root",
  database: "auth",
  max: 10
});

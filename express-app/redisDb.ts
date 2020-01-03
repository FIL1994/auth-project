import * as redis from "redis";

export const client = redis.createClient({
  host: "auth_db"
});

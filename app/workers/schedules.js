import { Config } from "@local/lib/index.js";
import * as Workers from "./index.js";

// const schedules = [["0 */2 * * * *", Workers.syncBalances]];
const schedules = [];

if (Config.env === "production") {
  schedules.push(["*/15 * * * * *", Workers.syncBalances]);
}

export default schedules;

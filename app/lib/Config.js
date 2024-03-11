import fs from "fs";
import { env } from "node:process";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENVIRONMENT = env.NODE_ENV || "development";
const file = fs.readFileSync(
  path.resolve(__dirname, "../../config/config.json")
);
// ts-expect-error
const Config = JSON.parse(file)[ENVIRONMENT];

Config.env = ENVIRONMENT;
export default Config;

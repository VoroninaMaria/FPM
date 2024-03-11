const ENVIRONMENT = process.env.NODE_ENV || "development";

import AllConfig from "./config/config.json";
const Config = AllConfig[ENVIRONMENT];

Config.env = ENVIRONMENT;

export default Config;

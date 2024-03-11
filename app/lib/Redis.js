import { createClient } from "redis";
import Config from "./Config.js";
const client = createClient({ url: Config.redis });
const publisher = createClient({ url: Config.redis });
const subscriber = createClient({ url: Config.redis });

export { client, publisher, subscriber };

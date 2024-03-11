import bcrypt from "bcrypt";

import { Config, Logger } from "@local/lib/index.js";

const encrypt = (data) =>
  bcrypt
    .genSalt(Config.encryption.saltRounds)
    .then((salt) => bcrypt.hash(data, salt))
    .catch((error) => Logger.error(error));

const encryptPassword = (password) => encrypt(password);

const isPasswordValid = (password, hash) =>
  bcrypt
    .compare(password, hash)
    .then((res) => res)
    .catch((error) => Logger.error(error));

export { isPasswordValid, encryptPassword };

import crypto from "crypto";

import jwt from "jsonwebtoken";
import { Config } from "@local/lib/index.js";

const jwtConfig = [Config.jwtSecret, { algorithm: "HS512" }];

const buildJwt = (account) => {
  const { id, session_identifier, plugins } = account;

  return jwt.sign(
    { id, session_identifier, ...(plugins && { plugins }) },
    ...jwtConfig
  );
};

const decodeJwt = (token) =>
  jwt.verify(token, Config.jwtSecret, { algorithm: "HS512" });

const generateSessionIdentifier = () => crypto.randomBytes(32).toString("hex");

export { buildJwt, decodeJwt, generateSessionIdentifier };

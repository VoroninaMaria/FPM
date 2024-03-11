import morgan from "morgan";
import logger from "../Logger.js";

const stream = {
  // Use the http severity
  write: (message) => logger.http(message),
};

const skip = () => false;

const morganMiddleware = morgan(
  ":remote-addr :method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

export default morganMiddleware;

import express from "express";
import cron from "node-cron";
import schedules from "@local/app/workers/schedules.js";
import morganMiddleware from "@local/lib/middlewares/morganMiddleware.js";
import { Config } from "@local/lib/index.js";
import bodyParser from "body-parser";
import cors from "cors";
import indexRouter from "@local/routes/index.js";
import expressWs from "express-ws";

const App = express();

schedules.forEach((item) => cron.schedule(...item));

expressWs(App);
App.use(cors());
App.use(bodyParser.json({ type: "application/json", limit: "20mb" }));
App.use(morganMiddleware);
App.use("/", indexRouter);

App.listen(Config.port, Config.host);

export default App;

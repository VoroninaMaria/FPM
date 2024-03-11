import express from "express";
import pumb from "./pumb.js";

const pgwstRouter = express.Router();

pgwstRouter.use("/pumb", pumb);

export default pgwstRouter;

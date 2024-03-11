import express from "express";
import auth from "./auth.js";
import { ping } from "@local/lib/controller_actions/index.js";
import graphql from "./graphql.js";
const merchantRouter = express.Router();

merchantRouter.get("/ping", ping);
merchantRouter.use("/auth", auth);
merchantRouter.use("/graphql", graphql);

export default merchantRouter;

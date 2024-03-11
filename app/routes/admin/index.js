import express from "express";
import auth from "./auth.js";
import graphql from "./graphql.js";
import { ping } from "@local/lib/controller_actions/index.js";
const adminRouter = express.Router();

adminRouter.get("/ping", ping);
adminRouter.use("/auth", auth);
adminRouter.use("/graphql", graphql);

export default adminRouter;

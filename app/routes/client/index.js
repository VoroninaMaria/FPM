import express from "express";
import auth from "./auth.js";
import graphql from "./graphql.js";

const clientRouter = express.Router();

clientRouter.use("/auth", auth);

clientRouter.use("/graphql", graphql);

export default clientRouter;

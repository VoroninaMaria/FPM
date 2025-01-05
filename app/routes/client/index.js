import express from "express";
import graphql from "./graphql.js";

const clientRouter = express.Router();

clientRouter.use("/graphql", graphql);

export default clientRouter;

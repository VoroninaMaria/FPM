import express from "express";
import auth from "./auth.js";
import {
  ping,
  serveDesigns,
  serveDesignsMD5,
} from "@local/lib/controller_actions/index.js";
import graphql from "./graphql.js";

const clientRouter = express.Router();

clientRouter.get("/ping", ping);
clientRouter.get("/design", serveDesigns);
clientRouter.get("/design/md5", serveDesignsMD5);
clientRouter.use("/auth", auth);

clientRouter.use("/graphql", graphql);

export default clientRouter;

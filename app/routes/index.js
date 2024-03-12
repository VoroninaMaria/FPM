import express from "express";
import clientRouter from "./client/index.js";
import adminRouter from "./admin/index.js";
import merchantRouter from "./merchant/index.js";
import { files } from "./shared/index.js";
import expressWs from "express-ws";
import { onConnection } from "./ws.js";
import callbacks from "./callbacks/index.js";

const router = express.Router();

expressWs(router);

router.use("/api/client", clientRouter);
router.use("/api/admin", adminRouter);
router.use("/api/merchant", merchantRouter);
router.get("/files/:id", files);
router.use("/api/callbacks", callbacks);
router.ws("/ws/merchant", (ws, req) => onConnection(ws, req, "merchants"));
router.ws("/ws/client", (ws, req) => onConnection(ws, req, "clients"));
router.use(express.static("public"));
export default router;

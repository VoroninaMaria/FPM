// app/routes/index.js
import express from "express";
import clientRouter from "./client/index.js";
import adminRouter from "./admin/index.js";
import merchantRouter from "./merchant/index.js";
import { files } from "./shared/index.js";
import expressWs from "express-ws";
import callbacks from "./callbacks/index.js";
import graphqlRouter from "./client/graphql.js"; // Импорт маршрута GraphQL

const router = express.Router();

expressWs(router);

router.use("/api/client", clientRouter);
router.use("/api/admin", adminRouter);
router.use("/api/merchant", merchantRouter);
router.get("/files/:id", files);
router.use("/api/callbacks", callbacks);
router.use(express.static("public"));
router.use("/graphql", graphqlRouter); // Настройка маршрута для GraphQL

export default router;

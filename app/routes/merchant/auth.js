import express from "express";
import { sharedLogin, checkAuth } from "@local/lib/controller_actions/index.js";

const router = express.Router();

router.use(express.json());
router.post("/login", sharedLogin("merchants"));
router.post("/checkAuth", checkAuth("merchants"));

export default router;

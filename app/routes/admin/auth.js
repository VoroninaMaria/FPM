import express from "express";
import { sharedLogin, checkAuth } from "@local/lib/controller_actions/index.js";

const router = express.Router();

router.use(express.json());
router.post("/login", sharedLogin("admins"));
router.post("/checkAuth", checkAuth("admins"));

export default router;

import express from "express";
import {
  confirmClient,
  register,
  clientLogin,
  clientResetPassword,
  clientConfirmResetPassword,
  clientCheckAuth,
  clientResendPassword,
} from "@local/lib/controller_actions/index.js";

const router = express.Router();

router.use(express.json());
router.post("/register", register);
router.post("/confirm", confirmClient);
router.post("/login", clientLogin);
router.post("/resend_password", clientResendPassword);
router.post("/reset_password", clientResetPassword);
router.post("/confirm_reset_password", clientConfirmResetPassword);
router.post("/checkAuth", clientCheckAuth);

export default router;

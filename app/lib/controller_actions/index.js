import ping from "./ping.js";
import register from "./client_register.js";
import confirmClient from "./client_confirm.js";
import clientLogin from "./client_login.js";
import sharedLogin from "./shared_login.js";
import clientResetPassword from "./client_reset_password.js";
import clientConfirmResetPassword from "./client_confirm_reset_password.js";
import checkAuth from "./checkAuth.js";
import clientCheckAuth from "./clientCheckAuth.js";
import clientResendPassword from "./client_resend_password.js";

export {
  checkAuth,
  clientConfirmResetPassword,
  clientLogin,
  clientResetPassword,
  confirmClient,
  ping,
  register,
  sharedLogin,
  clientCheckAuth,
  clientResendPassword,
};

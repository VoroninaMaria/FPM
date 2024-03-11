import { regex } from "react-admin";

export const intRegex = regex(
  /^\d+$/,
  "resources.notifications.errors.invalid_syntax"
);

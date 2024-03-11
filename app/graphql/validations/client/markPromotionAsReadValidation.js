import yup from "yup";
import {
  validatePresence,
  validatePresenceWithFields,
  validateUUID,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("valid", "invalid id", validateUUID)
    .test(
      "present",
      "promotion not found",
      validatePresenceWithFields("promotions", ["id", "merchant_id"])
    ),
  merchant_id: yup
    .string()
    .required()
    .test("valid", "invalid id", validateUUID)
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
});

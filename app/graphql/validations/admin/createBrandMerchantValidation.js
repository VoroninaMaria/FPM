import yup from "yup";
import {
  validatePresence,
  validateUniquenessWithFields,
} from "@local/graphql/validations/shared/index.js";
import { BRAND_MERCHANT_STATUSES } from "@local/constants/index.js";

export default yup.object({
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  brand_id: yup
    .string()
    .required()
    .test("present", "brand_not_found", validatePresence("brands", "id"))
    .test(
      "unique",
      "already_exist",
      validateUniquenessWithFields("brand_merchants", [
        "brand_id",
        "merchant_id",
      ])
    ),
  config: yup.object().required(),
  status: yup
    .string()
    .required()
    .test("status_check", "unknown_status", (value) =>
      Object.keys(BRAND_MERCHANT_STATUSES).includes(value)
    ),
});

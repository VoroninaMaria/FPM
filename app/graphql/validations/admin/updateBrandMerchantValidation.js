import yup from "yup";
import {
  validatePresence,
  validatePresenceWithFields,
  validateUniquenessOnUpdateWithFields,
} from "@local/graphql/validations/shared/index.js";
import { BRAND_MERCHANT_STATUSES } from "@local/app/constants/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test(
      "present",
      "brand_merchant_not_found",
      validatePresenceWithFields("brand_merchants", ["id", "merchant_id"])
    )
    .test(
      "unique",
      "already_exist",
      validateUniquenessOnUpdateWithFields("brand_merchants", [
        "brand_id",
        "merchant_id",
      ])
    ),
  brand_id: yup
    .string()
    .required()
    .test("present", "brand_not_found", validatePresence("brands", "id")),
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  status: yup
    .string()
    .required()
    .test("status", "unknown_status", (value) =>
      Object.keys(BRAND_MERCHANT_STATUSES).includes(value)
    ),
  config: yup.object().required(),
});

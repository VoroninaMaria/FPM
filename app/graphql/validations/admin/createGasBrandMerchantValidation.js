import yup from "yup";
import {
  validatePresence,
  validateUniquenessWithFields,
} from "@local/graphql/validations/shared/index.js";
import { GAS_BRAND_MERCHANT_STATUSES } from "@local/constants/index.js";

export default yup.object({
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  gas_brand_id: yup
    .string()
    .required()
    .test(
      "present",
      "gas_brand_not_found",
      validatePresence("gas_brands", "id")
    )
    .test(
      "present",
      "already_exist",
      validateUniquenessWithFields("gas_brand_merchants", [
        "gas_brand_id",
        "merchant_id",
      ])
    ),
  status: yup
    .string()
    .required()
    .test("status_check", "unknown_status", (value) =>
      Object.keys(GAS_BRAND_MERCHANT_STATUSES).includes(value)
    ),
});

import { Database } from "@local/lib/index.js";
import yup from "yup";
import {
  validatePresence,
  validatePresenceWithFields,
  validateUniquenessOnUpdateWithFields,
} from "@local/graphql/validations/shared/index.js";
import { MERCHANT_PAYMENT_GATEWAY_STATUSES } from "@local/app/constants/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test(
      "present",
      "merchant_payment_gateway_not_found",
      validatePresenceWithFields("merchant_payment_gateways", [
        "id",
        "merchant_id",
      ])
    ),
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  name: yup
    .string()
    .required()
    .test(
      "present",
      "already_exist",
      validateUniquenessOnUpdateWithFields("merchant_payment_gateways", [
        "name",
        "merchant_id",
      ])
    ),
  status: yup
    .string()
    .required()
    .test("status", "unknown_status", (value) =>
      Object.keys(MERCHANT_PAYMENT_GATEWAY_STATUSES).includes(value)
    ),
  default: yup.boolean().test("default", "default_not_found", function (value) {
    const { parent } = this;
    const { merchant_id } = parent;

    if (value) {
      return Database("merchant_payment_gateways")
        .where({ default: true, merchant_id })
        .whereNot("id", parent.id)
        .then((result) => result.length === 0);
    }

    return true;
  }),
  config: yup.object().required(),
});

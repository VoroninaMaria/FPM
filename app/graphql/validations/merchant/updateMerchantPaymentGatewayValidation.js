import { Database } from "@local/lib/index.js";
import yup from "yup";
import {
  validatePresence,
  validatePresenceWithFields,
  validateUniquenessOnUpdateWithFields,
} from "@local/graphql/validations/shared/index.js";
import { MERCHANT_PAYMENT_GATEWAY_STATUSES } from "@local/app/constants/index.js";
import { GraphQLError } from "graphql";

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
    )
    .test("valid", "can_not_edit", async function (id) {
      const merchantPaymentGateways = await Database(
        "merchant_payment_gateways"
      )
        .where({ id: id })
        .first();

      if (!merchantPaymentGateways) {
        throw new GraphQLError("merchant_payment_gateway_not_found");
      }

      if (
        merchantPaymentGateways.status ===
        MERCHANT_PAYMENT_GATEWAY_STATUSES.blocked.name
      ) {
        return false;
      } else {
        return true;
      }
    })
    .test("valid", "can_not_edit_parent", async function (id) {
      const merchantPaymentGateways = await Database(
        "merchant_payment_gateways"
      )
        .where({ id: id })
        .first();

      if (!merchantPaymentGateways) {
        throw new GraphQLError("merchant_payment_gateway_not_found");
      }

      const paymentGateway = await Database("payment_gateways")
        .where({ id: merchantPaymentGateways.payment_gateway_id })
        .first();

      if (
        paymentGateway.status !== MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name
      ) {
        return false;
      } else {
        return true;
      }
    }),
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id"))
    .test("active", "plugin_inactive", function (merchant_id) {
      return Database("merchants")
        .where({
          id: merchant_id,
        })
        .then(([merchant]) => {
          if (merchant.plugins.merchantPaymentGateways) {
            return true;
          }
          return false;
        });
    }),
  name: yup
    .string()
    .required()
    .test(
      "unique",
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

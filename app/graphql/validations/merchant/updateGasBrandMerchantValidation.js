import yup from "yup";
import {
  validateUniquenessOnUpdateWithFields,
  validatePresence,
  validatePresenceWithFields,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { GAS_BRAND_MERCHANT_STATUSES } from "@local/constants/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

let id_validation_fuels_name;

export default yup.object({
  id: yup
    .string()
    .test(
      "present",
      "gas_brand_merchant_not_found",
      validatePresenceWithFields("gas_brand_merchants", ["id", "merchant_id"])
    )
    .test(
      "present",
      "already_exist",
      validateUniquenessOnUpdateWithFields("gas_brand_merchants", [
        "gas_brand_id",
        "merchant_id",
      ])
    )
    .test("getId", "wrong_getId", async function (id) {
      id_validation_fuels_name = id;
      return true;
    })
    .test("valid", "can_not_edit", async function (id) {
      const gasBrandMerchant = await Database("gas_brand_merchants")
        .where({ id: id })
        .first();

      if (gasBrandMerchant.status === "blocked") {
        return false;
      } else {
        return true;
      }
    }),
  merchant_id: yup
    .string()
    .test("present", "merchant_not_found", validatePresence("merchants", "id"))
    .test("active", "plugin_inactive", function (merchant_id) {
      return Database("merchants")
        .where({
          id: merchant_id,
        })
        .then(([merchant]) => {
          if (merchant.plugins.gasBrandMerchants) {
            return true;
          }
          return false;
        });
    }),
  gas_brand_id: yup
    .string()
    .test(
      "present",
      "gas_brand_not_found",
      validatePresence("gas_brands", "id")
    ),
  fuels: yup
    .array()
    .test("unique", "dublicate_name_of_fuel_update", async function (fuels) {
      let res = false;

      if (fuels?.length > 0) {
        const names = fuels.map(({ name }) => name);

        const namesUniq = names.filter(function (arg1, arg2, self) {
          return arg2 === self.indexOf(arg1);
        });

        if (names.length === namesUniq.length) {
          res = true;
        }
      } else {
        res = true;
      }

      return res;
    })
    .of(
      yup.object({
        id: yup.string().test("valid", "can_not_edit", async function (id) {
          let res = true;

          if (id) {
            const fuel = await Database("gbm_fuels").where({ id }).first();

            if (
              fuel.name !== this.parent.name ||
              fuel.regular_price !== this.parent.regular_price ||
              fuel.discount_price !== this.parent.discount_price
            ) {
              if (fuel.status === "blocked") {
                res = false;
              }
            }
          }
          return res;
        }),
        name: yup
          .string()
          .required()
          .test("valid", "invalid_syntax", validateTextInput)
          .test("unique", "name_of_fuel_already_exist", async function (name) {
            if (this.parent.id) {
              return Database("gbm_fuels")
                .whereNot({ id: this.parent.id })
                .where({
                  name,
                  gas_brand_merchant_id: id_validation_fuels_name,
                })
                .first()
                .then((gas_brand_merchant) => !gas_brand_merchant)
                .catch(() => {
                  throw new GraphQLError("Forbidden");
                });
            } else {
              return Database("gbm_fuels")
                .where({
                  name,
                  gas_brand_merchant_id: id_validation_fuels_name,
                })
                .first()
                .then((gas_brand_merchant) => !gas_brand_merchant)
                .catch(() => {
                  throw new GraphQLError("Forbidden");
                });
            }
          }),
        regular_price: yup.number().integer("invalid_syntax").required(),
        discount_price: yup.number().integer("invalid_syntax").required(),
        status: yup
          .string()
          .required()
          .test("status", "unknown_status_of_gas_brand_merchant", (value) =>
            Object.keys(GAS_BRAND_MERCHANT_STATUSES).includes(value)
          ),
      })
    ),
  status: yup
    .string()
    .required()
    .test("status_check", "unknown_status", (value) =>
      Object.keys(GAS_BRAND_MERCHANT_STATUSES).includes(value)
    ),
});

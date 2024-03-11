import yup from "yup";
import { Database } from "@local/lib/index.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";
import { validatePresence } from "@local/graphql/validations/shared/index.js";
import { GraphQLError } from "graphql";

let merchant_id;

export default yup.object({
  status: yup
    .string()
    .required()
    .test("status", `unknown_status`, (value) =>
      Object.keys(MERCHANT_STATUSES).includes(value)
    ),
  storage_capacity: yup.number().required().integer().min(0),
  id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id"))
    .test("getId", "wrong_getId", async function (id) {
      merchant_id = id;
      return true;
    }),
  plugins: yup
    .object({
      datex: yup
        .bool()
        .notRequired()
        .when({
          is: (exists) => !!exists,
          then: (rule) =>
            rule.test("present", "datex_not_found", async function () {
              const merchant = await Database("merchants")
                .where({
                  id: merchant_id,
                })
                .first()
                .catch(() => {
                  throw new GraphQLError("Forbidden");
                });

              const datexBrand = await Database("brands")
                .where({
                  name: "Datex",
                })
                .first()
                .catch(() => {
                  throw new GraphQLError("datex_not_found");
                });

              return Database("brand_merchants")
                .where({ merchant_id: merchant.id, brand_id: datexBrand?.id })
                .first()
                .catch(() => {
                  throw new GraphQLError("datex_not_found");
                });
            }),
        }),
      clients: yup.bool().notRequired(),
      brandMerchants: yup.bool().notRequired(),
      files: yup.bool().notRequired(),
      gasBrandMerchants: yup.bool().notRequired(),
      merchantPaymentGateways: yup.bool().notRequired(),
      smsServices: yup.bool().notRequired(),
      support: yup.bool().notRequired(),
      notifications: yup.bool().notRequired(),
      designEditor: yup.bool().notRequired(),
      pageEditor: yup.bool().notRequired(),
      blocksEditor: yup.bool().notRequired(),
      categoriesEditor: yup.bool().notRequired(),
      tagsEditor: yup.bool().notRequired(),
    })
    .required(),
  design_id: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test("present", "design_not_found", async function (design_id) {
          const { id } = this.parent;
          const merchant = await Database("merchants")
            .where({
              id,
            })
            .first()
            .catch(() => {
              throw new GraphQLError("Forbidden");
            });

          return Database("designs")
            .where({ merchant_id: merchant.id, id: design_id })
            .first()
            .catch(() => {
              throw new GraphQLError("Forbidden");
            });
        }),
    }),
});

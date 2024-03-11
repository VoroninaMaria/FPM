import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import {
  validatePresence,
  validateCssPosition,
  validateColor,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "page_not_found", async function (id) {
      return Database("designs")
        .where({
          id: await Database("pages")
            .select("design_id")
            .where({ id })
            .first()
            .then(({ design_id }) => design_id)
            .catch(() => {
              throw new GraphQLError("Forbidden");
            }),
          merchant_id: this.parent.merchant_id,
        })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  design_id: yup
    .string()
    .required()
    .test("present", "design_not_found", function (id) {
      return Database("designs")
        .where({
          id,
          merchant_id: this.parent.merchant_id,
        })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
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
          if (merchant.plugins.pageEditor) {
            return true;
          }
          return false;
        });
    }),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("unique", "already_exist", async function (name) {
      return Database("pages")
        .whereNot({ id: this.parent.id })
        .where({
          name,
          design_id: await Database("pages")
            .select("design_id")
            .where({ id: this.parent.id })
            .first()
            .then(({ design_id }) => design_id)
            .catch(() => {
              throw new GraphQLError("Forbidden");
            }),
        })
        .first()
        .then((page) => !page)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  styles: yup.object({
    alignItems: yup
      .string()
      .required()
      .test("value", "unknown_alignItems_value", validateCssPosition),
    justifyContent: yup
      .string()
      .required()
      .test("value", "unknown_justifyContent_value", validateCssPosition),
    color: yup
      .string()
      .required()
      .test("value", "invalid_syntax", validateColor),
    backgroundColor: yup
      .string()
      .required()
      .test("value", "invalid_syntax", validateColor),
  }),
});

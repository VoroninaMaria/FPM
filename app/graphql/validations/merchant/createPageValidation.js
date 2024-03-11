import yup from "yup";
import {
  validatePresence,
  validateUniquenessWithFields,
  validateColor,
  validateCssPosition,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
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
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "unique",
      "already_exist",
      validateUniquenessWithFields("pages", ["name", "design_id"])
    ),
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

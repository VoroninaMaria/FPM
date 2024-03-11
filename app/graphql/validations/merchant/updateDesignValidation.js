import yup from "yup";
import {
  validatePresence,
  validatePresenceWithFields,
  validateUniquenessOnUpdateWithFields,
  validateCssPosition,
  validateColor,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  id: yup
    .string()
    .required()
    .test(
      "present",
      "design_not_found",
      validatePresenceWithFields("designs", ["id", "merchant_id"])
    ),
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
          if (merchant.plugins.designEditor) {
            return true;
          }
          return false;
        });
    }),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test(
      "unique",
      "already_exist",
      validateUniquenessOnUpdateWithFields("designs", ["name", "merchant_id"])
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
  default_page_id: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test("present", "page_not_found", function (id) {
          return Database("pages")
            .where({ id, design_id: this.parent.id })
            .first()
            .catch(() => {
              throw new GraphQLError("Forbidden");
            });
        }),
    }),
  authenticated_page_id: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test("present", "page_not_found", function (id) {
          return Database("pages")
            .where({ id, design_id: this.parent.id })
            .first()
            .catch(() => {
              throw new GraphQLError("Forbidden");
            });
        }),
    }),
  loader_page_id: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test("present", "page_not_found", function (id) {
          return Database("pages")
            .where({ id, design_id: this.parent.id })
            .first()
            .catch(() => {
              throw new GraphQLError("Forbidden");
            });
        }),
    }),
  error_page_id: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test("present", "page_not_found", function (id) {
          return Database("pages")
            .where({ id, design_id: this.parent.id })
            .first()
            .catch(() => {
              throw new GraphQLError("Forbidden");
            });
        }),
    }),
});

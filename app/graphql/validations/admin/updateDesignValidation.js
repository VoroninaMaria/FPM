import yup from "yup";
import {
  validatePresence,
  validateColor,
  validateCssPosition,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "design_not_found", validatePresence("designs", "id")),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("unique", "already_exist", async function (name) {
      return Database("designs")
        .whereNot({ id: this.parent.id })
        .where({
          name,
          merchant_id: await Database("designs")
            .select("merchant_id")
            .where({ id: this.parent.id })
            .first()
            .then(({ merchant_id }) => merchant_id)
            .catch(() => {
              throw new GraphQLError("Forbidden");
            }),
        })
        .first()
        .then((design) => !design)
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

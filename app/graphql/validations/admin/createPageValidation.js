import yup from "yup";
import {
  validateUniquenessWithFields,
  validateCssPosition,
  validateColor,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  design_id: yup
    .string()
    .required()
    .test("present", "design_not_found", function (id) {
      return Database("designs")
        .where({
          id,
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

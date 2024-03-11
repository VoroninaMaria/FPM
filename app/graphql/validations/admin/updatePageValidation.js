import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import {
  validatePresence,
  validateColor,
  validateCssPosition,
  validateTextInput,
  validateUniquenessOnUpdateWithFields,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("present", "page_not_found", validatePresence("pages", "id")),
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
    })
    .test(
      "present",
      "already_exist",
      validateUniquenessOnUpdateWithFields("pages", ["name", "design_id"])
    ),
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

import yup from "yup";
import { validatePhone } from "@local/helpers/index.js";
import {
  validatePresence,
  validateUniquenessWithFields,
  validateEmail,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  merchant_id: yup
    .string()
    .required()
    .test("present", "client_not_found", validatePresence("merchants", "id")),
  first_name: yup.string().test("valid", "invalid_syntax", validateTextInput),
  last_name: yup.string().test("valid", "invalid_syntax", validateTextInput),
  phone: yup
    .string()
    .required()
    .test("valid", "invalid_phone_format", validatePhone)
    .test(
      "unique",
      "already_exist",
      validateUniquenessWithFields("clients", ["phone", "merchant_id"])
    ),
  email: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) => rule.test("valid", "invalid_email_format", validateEmail),
    }),
  password: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .min(4, "min_length")
    .max(10, "max_length"),
  entity: yup.number().integer(),
  category_id: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test("present", "category_not_found", function (id) {
          const { merchant_id } = this.parent;

          return Database("client_categories")
            .where({ id, merchant_id })
            .first()
            .then((category) => category)
            .catch(() => {
              throw new GraphQLError("Forbidden");
            });
        }),
    }),
  tag_ids: yup
    .array()
    .of(yup.string())
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test("tag_ids", "specified_tag_doesnt_exist", function (tag_ids) {
          const { merchant_id } = this.parent;

          return Promise.all(
            tag_ids.map((tag_id) =>
              Database("tags")
                .where({ id: tag_id, merchant_id })
                .first()
                .then((tag) => {
                  if (!tag) return Promise.reject();
                })
                .catch(() => {
                  throw new GraphQLError("Forbidden");
                })
            )
          );
        }),
    }),
});

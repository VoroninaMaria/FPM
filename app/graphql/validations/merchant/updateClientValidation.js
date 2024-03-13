import yup from "yup";
import {
  CLIENT_STATUSES,
  CLIENT_CHANGE_STATUSES,
} from "@local/constants/index.js";
import {
  validatePresence,
  validatePresenceWithFields,
  validateUniquenessOnUpdateWithFields,
  validateEmail,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import { validatePhone } from "@local/helpers/index.js";

export default yup.object({
  merchant_id: yup
    .string()
    .required()
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  id: yup
    .string()
    .required()
    .test(
      "present",
      "client_not_found",
      validatePresenceWithFields("clients", ["id", "merchant_id"])
    ),
  first_name: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) => rule.test("valid", "invalid_syntax", validateTextInput),
    }),
  last_name: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) => rule.test("valid", "invalid_syntax", validateTextInput),
    }),
  city: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) => rule.test("valid", "invalid_syntax", validateTextInput),
    }),
  address: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) => rule.test("valid", "invalid_syntax", validateTextInput),
    }),
  phone: yup
    .string()
    .required()
    .test("valid", "invalid_phone_format", validatePhone)
    .test(
      "unique",
      "already_exist",
      validateUniquenessOnUpdateWithFields("clients", ["phone", "merchant_id"])
    ),
  email: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) => rule.test("valid", "invalid_email_format", validateEmail),
    }),
  status: yup
    .string()
    .required()
    .nullable(true)
    .test("status", "unknown_status", (value) =>
      Object.keys(CLIENT_STATUSES).includes(value)
    ),
  category_id: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test("present", "category_not_found", function (category_id) {
          const { merchant_id } = this.parent;

          return Database("client_categories")
            .where({ id: category_id, merchant_id })
            .first()
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
  unconfirmed_changes: yup.array().of(
    yup.object({
      id: yup
        .number()
        .required()
        .test(
          "present",
          "client_changes_not_found",
          validatePresence("client_changes", "id")
        ),
      status: yup
        .string()
        .required()
        .test("status", "unknown_status", (value) =>
          Object.keys(CLIENT_CHANGE_STATUSES).includes(value)
        ),
    })
  ),
});

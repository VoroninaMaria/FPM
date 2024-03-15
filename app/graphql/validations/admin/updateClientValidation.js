import yup from "yup";
import {
  CLIENT_STATUSES,
  CLIENT_CHANGE_STATUSES,
} from "@local/constants/index.js";
import { validatePhone } from "@local/helpers/index.js";
import {
  validatePresence,
  validateUUID,
  validateEmail,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("valid", "invalid_id_format", validateUUID)
    .test("present", "client_not_found", validatePresence("clients", "id")),
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
  phone: yup
    .string()
    .required()
    .test("valid", "invalid_id_format", function () {
      const { id } = this.parent;

      return validateUUID(id);
    })
    .test("valid", "invalid_phone_format", validatePhone)
    .test("unique", "already_exist", async function (phone) {
      const { id } = this.parent;

      const [client] = await Database("clients")
        .where({ id: id })
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });

      if (!client) {
        throw new GraphQLError("client_not_found");
      }

      return Database("clients")
        .whereNot({ id })
        .where({ phone, merchant_id: client.merchant_id })
        .first()
        .then((existing_client) => !existing_client)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
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
    .test("status", "unknown_status", (value) =>
      Object.keys(CLIENT_STATUSES).includes(value)
    ),
  category_id: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test(
          "present",
          "category_not_found",
          async function (category_id) {
            const { id: client_id } = this.parent;
            const client = await Database("clients")
              .where({
                id: client_id,
              })
              .first()
              .catch(() => {
                throw new GraphQLError("Forbidden");
              });

            return Database("client_categories")
              .where({ merchant_id: client.merchant_id, id: category_id })
              .first()
              .catch(() => {
                throw new GraphQLError("Forbidden");
              });
          }
        ),
    }),
  discount_id: yup
    .string()
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test(
          "present",
          "discount_not_found",
          async function (discount_id) {
            const { id: client_id } = this.parent;
            const client = await Database("clients")
              .where({
                id: client_id,
              })
              .first()
              .catch(() => {
                throw new GraphQLError("Forbidden");
              });

            return Database("discounts")
              .where({ merchant_id: client.merchant_id, id: discount_id })
              .first()
              .catch(() => {
                throw new GraphQLError("Forbidden");
              });
          }
        ),
    }),
  tag_ids: yup
    .array()
    .of(yup.string())
    .notRequired()
    .when({
      is: (exists) => !!exists,
      then: (rule) =>
        rule.test(
          "tag_ids",
          "specified_tag_doesnt_exist",
          async function (tag_ids) {
            const { id: client_id } = this.parent;

            const client = await Database("clients")
              .where({
                id: client_id,
              })
              .first()
              .catch(() => {
                throw new GraphQLError("Forbidden");
              });

            return Promise.all(
              tag_ids.map((tag_id) =>
                Database("tags")
                  .where({ id: tag_id, merchant_id: client.merchant_id })
                  .first()
                  .then((tag) => {
                    if (!tag) return Promise.reject();
                  })
                  .catch(() => {
                    throw new GraphQLError("Forbidden");
                  })
              )
            );
          }
        ),
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

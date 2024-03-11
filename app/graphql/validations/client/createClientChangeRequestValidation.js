import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import {
  validatePresence,
  validateFieldName,
  validateEmail,
} from "@local/graphql/validations/shared/index.js";
import { validatePhone } from "@local/helpers/index.js";

const createClientChangeRequestValidation = yup.object({
  client_id: yup
    .string()
    .required()
    .test("present", "client_not_found", validatePresence("clients", "id")),
  field_name: yup
    .string()
    .required()
    .test("validate", "unknown_field_name_value", validateFieldName),
  value: yup
    .string()
    .required()
    .test("validate", "invalid_value", function (value) {
      const { field_name } = this.parent;

      if (field_name === "email") {
        return validateEmail(value);
      }

      if (field_name === "phone") {
        return validatePhone(value);
      }

      return true;
    })
    .test("value", "value_already_exist", function (value) {
      const { client_id } = this.parent;

      return Database("clients")
        .where({ id: client_id })
        .first()
        .then((client) => {
          if (
            client.first_name === value ||
            client.last_name === value ||
            client.email === value ||
            client.phone === value
          ) {
            return false;
          }

          return true;
        })
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
});

export default createClientChangeRequestValidation;

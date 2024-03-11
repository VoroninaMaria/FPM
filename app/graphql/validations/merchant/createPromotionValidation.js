import yup from "yup";
import {
  validatePresence,
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
          if (merchant.plugins.notifications) {
            return true;
          }
          return false;
        });
    }),
  file_id: yup
    .string()
    .required()
    .test("present", "file_not_found", validatePresence("files", "id"))
    .test("present", "file_id_not_found", function (id) {
      return Database("files")
        .where({
          id,
          account_id: this.parent.merchant_id,
        })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  title: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput),
  text: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput),
  start_date: yup.date().required(),
  end_date: yup.date().required(),
});

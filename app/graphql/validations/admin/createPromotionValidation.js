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
    .test("present", "merchant_not_found", validatePresence("merchants", "id")),
  file_id: yup
    .string()
    .required()
    .test("present", "file_not_found", function (id) {
      return Database("files")
        .where({
          id,
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

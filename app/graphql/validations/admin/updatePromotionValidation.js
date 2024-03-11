import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test(
      "present",
      "promotion_not_found",
      validatePresence("promotions", "id")
    ),
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

import yup from "yup";
import { GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { GAS_BRAND_STATUSES } from "@local/constants/index.js";

export default yup.object({
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("unique", "already_exist", function (name) {
      return Database("gas_brands")
        .where({ name })
        .first()
        .then((name) => !name)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
  logo_file_id: yup
    .string()
    .required()
    .test("present", "file_not_found", validatePresence("files", "id"))
    .test("valid", "forbidden_image_type", function (logo_file_id) {
      return Database("files")
        .where({
          id: logo_file_id,
        })
        .then(([file]) => {
          if (file.mimetype === "application/pdf") {
            return false;
          }
          return true;
        });
    }),
  status: yup
    .string()
    .required()
    .test("status_check", "unknown_status", (value) =>
      Object.keys(GAS_BRAND_STATUSES).includes(value)
    ),
});

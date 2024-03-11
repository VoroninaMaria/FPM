import yup from "yup";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import {
  validateUUID,
  validatePresence,
  validateTextInput,
} from "@local/graphql/validations/shared/index.js";
import { GAS_BRAND_STATUSES } from "@local/constants/index.js";

export default yup.object({
  id: yup
    .string()
    .required()
    .test("valid", "invalid_id_format", validateUUID)
    .test(
      "present",
      "gas_brand_not_found",
      validatePresence("gas_brands", "id")
    ),
  name: yup
    .string()
    .required()
    .test("valid", "invalid_syntax", validateTextInput)
    .test("unique", "already_exist", async function (name) {
      return Database("gas_brands")
        .whereNot({ id: this.parent.id })
        .where({
          name,
        })
        .first()
        .then((gas_brand) => !gas_brand)
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

import yup from "yup";
import { Database } from "@local/lib/index.js";
import {
  validatePresence,
  validatePresenceWithFields,
} from "@local/graphql/validations/shared/index.js";
import { GraphQLError } from "graphql";

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
      "discount_not_found",
      validatePresenceWithFields("discounts", ["id", "merchant_id"])
    )
    .test("empty", "delete_error", (discount_id) =>
      Database("clients")
        .where({ discount_id })
        .first()
        .then((client) => !client)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
});

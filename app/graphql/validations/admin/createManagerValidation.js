import yup from "yup";
import {
  validatePresence,
  validateUniquenessWithFields,
} from "@local/graphql/validations/shared/index.js";
import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

export default yup.object({
  client_id: yup
    .string()
    .required()
    .test("present", "client_not_found", validatePresence("clients", "id"))
    .test(
      "present",
      "already_exist",
      validateUniquenessWithFields("managers", ["client_id", "company_id"])
    ),
  company_id: yup
    .string()
    .required()
    .test("present", "company_not_found", validatePresence("companies", "id"))
    .test("present", "invalid_client", async function (company_id) {
      const { client_id } = this.parent;
      const client = await Database("clients")
        .where({
          id: client_id,
        })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });

      return Database("companies")
        .where({ merchant_id: client.merchant_id, id: company_id })
        .first()
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }),
});

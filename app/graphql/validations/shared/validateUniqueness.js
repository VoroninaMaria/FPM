import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

const validateUniqueness = (table, field) => (value) =>
  Database(table)
    .where({ [field]: value })
    .first()
    .then((record) => !record)
    .catch(() => {
      throw new GraphQLError("Forbidden");
    });

export default validateUniqueness;

import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

const validatePresence = (table, field) => (value) =>
  Database(table)
    .where({ [field]: value })
    .first()
    .catch(() => {
      throw new GraphQLError("Forbidden");
    });

export default validatePresence;

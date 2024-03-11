import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

const validatePresenceWithFields = (table, fields) =>
  function () {
    const values = Object.assign(
      {},
      ...fields.map((field) => ({ [field]: this.parent[field] }))
    );

    return Database(table)
      .where(values)
      .first()
      .then((result) => result)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  };

export default validatePresenceWithFields;

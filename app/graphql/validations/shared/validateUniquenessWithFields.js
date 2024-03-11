import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

const validateUniquenessWithFields = (table, fields) =>
  function () {
    const values = Object.assign(
      {},
      ...fields.map((field) => ({ [field]: this.parent[field] }))
    );

    return Database(table)
      .where(values)
      .first()
      .then((record) => !record)
      .catch(() => {
        throw new GraphQLError("Forbidden uniqueness");
      });
  };

export default validateUniquenessWithFields;

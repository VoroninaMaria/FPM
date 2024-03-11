import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

const validateUniquenessOnUpdateWithFields = (table, fields) =>
  function () {
    const { id } = this.parent;
    const values = Object.assign(
      {},
      ...fields.map((field) => ({ [field]: this.parent[field] }))
    );

    return Database(table)
      .whereNot({ id })
      .where(values)
      .first()
      .then((record) => !record)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  };

export default validateUniquenessOnUpdateWithFields;

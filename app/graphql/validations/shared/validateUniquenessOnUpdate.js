import { Database } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

const validateUniquenessOnUpdate = (table, field) =>
  function (value) {
    const { id } = this.parent;

    return Database(table)
      .whereNot({ id })
      .where({ [field]: value })
      .first()
      .then((record) => !record)
      .catch(() => {
        throw new GraphQLError("Forbidden1");
      });
  };

export default validateUniquenessOnUpdate;

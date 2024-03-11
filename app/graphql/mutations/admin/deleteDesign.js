import { Database } from "@local/lib/index.js";
import { Design } from "@local/graphql/types/index.js";
import { deleteDesignValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Design,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async (_, args) => {
    await deleteDesignValidation.validate(args);

    await Database("designs").where({ id: args.id }).update({
      default_page_id: null,
      error_page_id: null,
      loader_page_id: null,
      authenticated_page_id: null,
    });

    await Database("blocks")
      .whereIn(
        "page_id",
        Database("pages").select("id").where({ design_id: args.id })
      )
      .del();

    await Database("pages").where({ design_id: args.id }).del();

    await Database("merchants").where({ design_id: args.id }).update({
      design_id: null,
    });

    return Database("designs")
      .where({ id: args.id })
      .del()
      .returning("*")
      .then(([design]) => design)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  },
};

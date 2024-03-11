import { Database } from "@local/lib/index.js";
import { Design } from "@local/graphql/types/index.js";
import { deleteDesignValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
  type: Design,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async (_, params, { merchant }) => {
    await deleteDesignValidation.validate({
      ...params,
      merchant_id: merchant.id,
    });

    await Database("designs")
      .where({ id: params.id })
      .update({
        default_page_id: null,
        error_page_id: null,
        loader_page_id: null,
        authenticated_page_id: null,
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

    await Database("blocks")
      .whereIn(
        "page_id",
        Database("pages").select("id").where({ design_id: params.id })
      )
      .del();

    await Database("pages").where({ design_id: params.id }).del();

    return Database("designs")
      .where({ id: params.id })
      .del()
      .returning("*")
      .then(([design]) => design)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  },
};

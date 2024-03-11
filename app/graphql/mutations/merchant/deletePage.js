import { Database } from "@local/lib/index.js";
import { Page } from "@local/graphql/types/index.js";
import { deletePageValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLNonNull, GraphQLID } from "graphql";
import { GraphQLError } from "graphql";

export default {
  type: Page,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, params, { merchant }) =>
    deletePageValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("blocks")
          .where({
            page_id: params.id,
          })
          .del()
          .then(() =>
            Database("pages")
              .where({
                id: params.id,
              })
              .del()
              .returning("*")
              .then(([Page]) => Page)
              .catch(() => {
                throw new GraphQLError("Forbidden");
              })
          )
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};

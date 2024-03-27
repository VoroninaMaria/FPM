import { Database } from "@local/lib/index.js";
import { Membership } from "@local/graphql/types/index.js";
import { updateMembershipValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLFloat,
  GraphQLError,
} from "graphql";
import { GraphQLInt, GraphQLList } from "graphql/index.js";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: Membership,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    term: { type: new GraphQLNonNull(GraphQLInt) },
    status: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLFloat) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    location_id: { type: new GraphQLNonNull(GraphQLID) },
    abilities: { type: new GraphQLList(GraphQLJSONObject) },
  },
  resolve: (_, args) =>
    updateMembershipValidation.validate({ ...args }).then(() =>
      Database("memberships")
        .where({
          id: args.id,
        })
        .update({
          name: args.name,
          price: args.price,
          term: args.term,
          status: args.status,
          merchant_id: args.merchant_id,
          location_id: args.location_id,
          updated_at: Database.fn.now(),
        })
        .returning("*")
        .then(async ([membership]) => {
          if (args.abilities?.length > 0) {
            await Promise.all(
              args.abilities.map(
                ({ id, name, description, regular_price, discount_price }) => {
                  if (id) {
                    return Database("abilities")
                      .where({
                        id,
                        membership_id: membership.id,
                      })
                      .update({
                        name,
                        description,
                        regular_price,
                        discount_price,
                      })
                      .catch((e) => {
                        throw new GraphQLError(e.message);
                      });
                  } else {
                    return Database("abilities")
                      .insert({
                        membership_id: membership.id,
                        name,
                        description,
                        regular_price,
                        discount_price,
                      })
                      .catch((e) => {
                        throw new GraphQLError(e.message);
                      });
                  }
                }
              )
            );

            return { ...membership, abilities: args.abilities ?? [] };
          }
          return membership;
        })
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};

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
import GraphQLDateTime from "graphql-type-datetime";
import { GraphQLList } from "graphql/index.js";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: Membership,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLFloat) },
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    location_id: { type: new GraphQLNonNull(GraphQLID) },
    abilities: { type: new GraphQLList(GraphQLJSONObject) },
    start_date: { type: new GraphQLNonNull(GraphQLDateTime) },
    end_date: { type: new GraphQLNonNull(GraphQLDateTime) },
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
          merchant_id: args.merchant_id,
          location_id: args.location_id,
          start_date: args.start_date,
          end_date: args.end_date,
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
          throw new GraphQLError("Forbidden1");
        })
    ),
};

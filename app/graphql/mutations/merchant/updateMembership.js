import { Database } from "@local/lib/index.js";
import { Membership } from "@local/graphql/types/index.js";
import { createMembershipValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";
import { GraphQLFloat } from "graphql/index.js";
import { GraphQLID } from "graphql/index.js";
import { GraphQLJSONObject } from "graphql-type-json";
import { GraphQLList, GraphQLInt } from "graphql/index.js";

export default {
  type: Membership,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLFloat) },
    location_id: { type: new GraphQLNonNull(GraphQLID) },
    abilities: { type: new GraphQLList(GraphQLJSONObject) },
    term: { type: new GraphQLNonNull(GraphQLInt) },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args, { merchant }) =>
    createMembershipValidation
      .validate({ ...args, merchant_id: merchant.id })
      .then(() =>
        Database("memberships")
          .where({
            id: args.id,
          })
          .update({
            name: args.name,
            price: args.price,
            location_id: args.location_id,
            start_date: args.start_date,
            term: args.term,
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(async ([membership]) => {
            if (args.abilities?.length > 0) {
              await Promise.all(
                args.abilities.map(
                  ({
                    id,
                    name,
                    description,
                    regular_price,
                    discount_price,
                  }) => {
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

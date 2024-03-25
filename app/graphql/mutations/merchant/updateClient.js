import { Database } from "@local/lib/index.js";
import { Client } from "@local/graphql/types/index.js";
import { updateClientValidation } from "@local/graphql/validations/merchant/index.js";
import {
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLError,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";
import { CLIENT_CHANGE_STATUSES } from "@local/constants/index.js";

export default {
  type: Client,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    status: { type: new GraphQLNonNull(GraphQLString) },
    category_id: { type: GraphQLID },
    membership_id: { type: GraphQLID },
    tag_ids: { type: new GraphQLList(GraphQLID) },
    unconfirmed_changes: { type: new GraphQLList(GraphQLJSONObject) },
  },
  resolve: async (_, args, { merchant }) => {
    await updateClientValidation.validate({
      ...args,
      merchant_id: merchant.id,
    });

    await Database("client_tags")
      .where({ client_id: args.id })
      .del()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

    if (args.tag_ids?.length > 0) {
      await Database("client_tags")
        .insert(args.tag_ids.map((tag_id) => ({ tag_id, client_id: args.id })))
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }

    await Database("clients")
      .where({
        id: args.id,
        merchant_id: merchant.id,
      })
      .update({
        id: args.id,
        status: args.status,
        category_id: args.category_id,
        membership_id: args.membership_id,
        phone: args.phone,
        email: args.email,
        first_name: args.first_name,
        last_name: args.last_name,
        updated_at: Database.fn.now(),
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

    if (args.unconfirmed_changes.length > 0) {
      await Promise.all(
        args.unconfirmed_changes.map((change) =>
          Database("client_changes")
            .where({ id: change.id })
            .update({
              status: change.status,
            })
            .catch(() => {
              throw new GraphQLError("Forbidden");
            })
        )
      );

      const changesList = await Database("client_changes")
        .where({
          status: CLIENT_CHANGE_STATUSES.confirmed.name,
        })
        .whereIn(
          "id",
          args.unconfirmed_changes.map((change) => change.id)
        )
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });

      const changes = changesList.reduce((acc, change) => {
        acc[change.field_name] = change.value;

        return acc;
      }, {});

      await Database("clients")
        .where({
          id: args.id,
          merchant_id: merchant.id,
        })
        .update({
          ...changes,
          updated_at: Database.fn.now(),
        })
        .catch(() => {
          throw new GraphQLError("Forbidden");
        });
    }

    return Database("clients")
      .where({ id: args.id, merchant_id: merchant.id })
      .first()
      .then((client) => ({ ...client, tag_ids: args.tag_ids ?? [] }))
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  },
};

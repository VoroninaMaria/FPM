import { Database } from "@local/lib/index.js";
import { Client } from "@local/graphql/types/index.js";
import { updateClientValidation } from "@local/graphql/validations/admin/index.js";
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
    merchant_id: { type: new GraphQLNonNull(GraphQLID) },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString },
    status: { type: new GraphQLNonNull(GraphQLString) },
    category_id: { type: GraphQLID },
    membership_id: { type: GraphQLID },
    tag_ids: { type: new GraphQLList(GraphQLID) },
    unconfirmed_changes: { type: new GraphQLList(GraphQLJSONObject) },
  },
  resolve: async (_, args) => {
    await updateClientValidation.validate(args, { strict: true });

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
      })
      .update({
        id: args.id,
        first_name: args.first_name,
        last_name: args.last_name,
        phone: args.phone,
        email: args.email,
        status: args.status,
        membership_id: args.membership_id,
        merchant_id: args.merchant_id,
        category_id: args.category_id,
        updated_at: Database.fn.now(),
      })
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });

    if (args.unconfirmed_changes.length > 0) {
      await Promise.all(
        args.unconfirmed_changes.map((change) =>
          Database("client_changes")
            .where({ id: change.id, client_id: args.id })
            .update({ status: change.status })
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
      .where({ id: args.id })
      .first()
      .then((client) => ({ ...client, tag_ids: args.tag_ids ?? [] }))
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  },
};

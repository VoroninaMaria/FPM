import { Database } from "@local/lib/index.js";
import { Merchant } from "@local/graphql/types/index.js";
import { updatePasswordValidation } from "@local/graphql/validations/merchant/index.js";
import {
  GraphQLString,
  GraphQLError,
  GraphQLBoolean,
  GraphQLID,
} from "graphql";

import {
  encryptPassword,
  generateSessionIdentifier,
} from "@local/helpers/index.js";

export default {
  type: Merchant,
  args: {
    newbie: { type: GraphQLBoolean },
    current_password: { type: GraphQLString },
    new_password: { type: GraphQLString },
    design_id: { type: GraphQLID },
  },
  resolve: async (_, args, { merchant }) => {
    if (args.current_password || args.new_password) {
      await updatePasswordValidation.validate({
        ...args,
        id: merchant.id,
      });
    }

    return Database("merchants")
      .where({
        id: merchant.id,
      })
      .update({
        ...(args.new_password && {
          encrypted_password: await encryptPassword(args.new_password),
          session_identifier: generateSessionIdentifier(),
        }),
        newbie: args.newbie,
        design_id: args.design_id,
        updated_at: Database.fn.now(),
      })
      .returning("*")
      .then(([merchant]) => merchant)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  },
};

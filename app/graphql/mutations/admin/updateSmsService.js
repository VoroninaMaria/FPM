import { Database } from "@local/lib/index.js";
import { SmsService } from "@local/graphql/types/index.js";
import { updateSmsServiceValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLError,
} from "graphql";

export default {
  type: SmsService,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    status: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: (_, args) =>
    updateSmsServiceValidation.validate({ ...args }).then(() =>
      Database("sms_services")
        .where({
          id: args.id,
        })
        .update({
          status: args.status,
          config: args.config,
          updated_at: Database.fn.now(),
        })
        .returning("*")
        .then(([sms_service]) => sms_service)
        .catch(() => {
          throw new GraphQLError("Forbidden");
        })
    ),
};

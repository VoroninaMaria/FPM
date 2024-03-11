import { Database } from "@local/lib/index.js";
import { SmsService } from "@local/graphql/types/index.js";
import { updateSmsServiceValidation } from "@local/graphql/validations/merchant/index.js";
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
  resolve: (_, args, context) =>
    updateSmsServiceValidation
      .validate({ ...args, merchant_id: context.merchant.id })
      .then(() =>
        Database("sms_services")
          .where({
            id: args.id,
            merchant_id: context.merchant.id,
          })
          .update({
            status: args.status,
            updated_at: Database.fn.now(),
          })
          .returning("*")
          .then(([sms_service]) => sms_service)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};

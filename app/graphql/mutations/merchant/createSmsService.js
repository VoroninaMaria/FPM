import { Database } from "@local/lib/index.js";
import { SmsService } from "@local/graphql/types/index.js";
import { createSmsServiceValidation } from "@local/graphql/validations/merchant/index.js";
import { GraphQLString, GraphQLNonNull, GraphQLError } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: SmsService,
  args: {
    status: { type: new GraphQLNonNull(GraphQLString) },
    service_name: { type: new GraphQLNonNull(GraphQLString) },
    config: { type: new GraphQLNonNull(GraphQLJSONObject) },
  },
  resolve: (_, params, { merchant }) =>
    createSmsServiceValidation
      .validate({ ...params, merchant_id: merchant.id })
      .then(() =>
        Database("sms_services")
          .insert({
            ...params,
            merchant_id: merchant.id,
          })
          .returning("*")
          .then(([sms_service]) => sms_service)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};

import { Database } from "@local/lib/index.js";
import { SmsService } from "@local/graphql/types/index.js";
import { createSmsServiceValidation } from "@local/graphql/validations/admin/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLError,
  GraphQLID,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: SmsService,
  args: {
    status: { type: new GraphQLNonNull(GraphQLString) },
    service_name: { type: new GraphQLNonNull(GraphQLString) },
    config: { type: new GraphQLNonNull(GraphQLJSONObject) },
    merchant_id: { type: GraphQLID },
  },
  resolve: (_, params) =>
    createSmsServiceValidation
      .validate({
        ...params,
      })
      .then(() =>
        Database("sms_services")
          .insert({
            ...params,
          })
          .returning("*")
          .then(([sms_service]) => sms_service)
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};

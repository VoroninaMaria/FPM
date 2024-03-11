import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "SmsService",
  fields: {
    id: { type: GraphQLID },
    balance: { type: GraphQLFloat },
    merchant_id: { type: GraphQLID },
    config: { type: GraphQLJSONObject },
    status: { type: GraphQLString },
    service_name: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});

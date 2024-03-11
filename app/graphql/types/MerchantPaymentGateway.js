import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "MerchantPaymentGateway",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    merchant_id: { type: GraphQLID },
    payment_gateway_id: { type: GraphQLID },
    default: { type: GraphQLBoolean },
    config: { type: GraphQLJSONObject },
    status: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});

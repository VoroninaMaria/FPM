import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "GasBrandMerchant",
  fields: {
    id: { type: GraphQLID },
    merchant_id: { type: GraphQLID },
    gas_brand_id: { type: GraphQLID },
    name: { type: GraphQLString },
    status: { type: GraphQLString },
    fuels: { type: new GraphQLList(GraphQLJSONObject) },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});

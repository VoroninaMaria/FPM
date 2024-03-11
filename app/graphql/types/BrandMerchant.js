import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "BrandMerchant",
  fields: {
    id: { type: GraphQLID },
    merchant_id: { type: GraphQLID },
    brand_id: { type: GraphQLID },
    config: { type: GraphQLJSONObject },
    status: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});

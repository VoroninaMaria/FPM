import { GraphQLInputObjectType, GraphQLID, GraphQLList } from "graphql";

export default new GraphQLInputObjectType({
  name: "BrandMerchantFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    merchant_id: { type: GraphQLID },
    brand_id: { type: GraphQLID },
  }),
});

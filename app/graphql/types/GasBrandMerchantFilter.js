import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "GasBrandMerchantFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    merchant_id: { type: GraphQLID },
    gas_brand_id: { type: GraphQLID },
    status: { type: GraphQLString },
  }),
});

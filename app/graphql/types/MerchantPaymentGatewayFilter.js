import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "MerchantPaymentGatewayFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    status: { type: GraphQLString },
  }),
});

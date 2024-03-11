import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLID,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "PaymentGatewayFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    name: { type: GraphQLString },
    status: { type: GraphQLString },
  }),
});

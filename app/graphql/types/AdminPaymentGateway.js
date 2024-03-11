import { GraphQLObjectType, GraphQLID, GraphQLString } from "graphql";

export default new GraphQLObjectType({
  name: "PaymentGateway",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    status: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});

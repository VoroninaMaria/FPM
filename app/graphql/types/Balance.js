import { GraphQLObjectType, GraphQLFloat } from "graphql";

export default new GraphQLObjectType({
  name: "Balance",
  fields: {
    balance: { type: GraphQLFloat },
  },
});

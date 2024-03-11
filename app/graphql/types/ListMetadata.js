import { GraphQLObjectType, GraphQLNonNull, GraphQLInt } from "graphql";

export default new GraphQLObjectType({
  name: "ListMetadata",
  fields: {
    count: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

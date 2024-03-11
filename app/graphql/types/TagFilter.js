import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLString,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "TagFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    name: { type: GraphQLString },
    merchant_id: { type: GraphQLID },
  }),
});

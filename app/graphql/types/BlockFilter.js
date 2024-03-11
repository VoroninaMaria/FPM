import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "BlockFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    page_id: { type: GraphQLID },
  }),
});

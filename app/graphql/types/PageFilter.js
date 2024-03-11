import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "PageFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    name: { type: GraphQLString },
    design_id: { type: GraphQLString },
  }),
});

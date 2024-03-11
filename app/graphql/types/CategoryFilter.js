import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "CategoryFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    merchant_id: { type: GraphQLString },
    category_id: { type: GraphQLString },
    name: { type: GraphQLString },
  }),
});

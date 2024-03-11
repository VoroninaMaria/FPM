import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "GasBrandFilter",
  fields: {
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    name: { type: GraphQLString },
    status: { type: GraphQLString },
  },
});

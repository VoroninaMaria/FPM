import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "FileFilter",
  fields: {
    id: { type: GraphQLID },
    account_id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    name: { type: GraphQLString },
    mimetype: { type: GraphQLString },
    size: { type: GraphQLFloat },
  },
});

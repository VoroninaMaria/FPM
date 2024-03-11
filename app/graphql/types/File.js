import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
} from "graphql";

export default new GraphQLObjectType({
  name: "File",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    account_id: { type: GraphQLID },
    mimetype: { type: GraphQLString },
    size: { type: GraphQLFloat },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
    url: { type: GraphQLString },
  },
});

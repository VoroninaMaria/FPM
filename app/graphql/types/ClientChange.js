import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
} from "graphql";

export default new GraphQLObjectType({
  name: "ClientChange",
  fields: {
    id: { type: GraphQLInt },
    client_id: { type: GraphQLID },
    field_name: { type: GraphQLString },
    value: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});

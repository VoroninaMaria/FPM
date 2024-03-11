import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "TruncFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    status: { type: GraphQLString },
    title: { type: GraphQLString },
    amount: { type: GraphQLInt },
    client_id: { type: GraphQLID },
  }),
});

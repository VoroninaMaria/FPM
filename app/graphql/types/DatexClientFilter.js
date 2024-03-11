import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "DatexClientFilter",
  fields: () => ({
    id: { type: GraphQLInt },
    ids: { type: new GraphQLList(GraphQLID) },
    fn_clients: { type: GraphQLString },
    sn_clients: { type: GraphQLString },
    city: { type: GraphQLString },
    address: { type: GraphQLString },
    email: { type: GraphQLString },
    phones: { type: GraphQLString },
    external_id: { type: GraphQLID },
  }),
});

import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "MerchantFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    status: { type: GraphQLString },
    login: { type: GraphQLString },
    name: { type: GraphQLString },
    default_category_id: { type: GraphQLID },
    storage_capacity: { type: GraphQLInt },
  }),
});

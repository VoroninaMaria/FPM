import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "ClientFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    merchant_id: { type: GraphQLID },
    status: { type: GraphQLString },
    phone: { type: GraphQLString },
    email: { type: GraphQLString },
    membership_id: { type: GraphQLID },
    discount_id: { type: GraphQLID },
    category_id: { type: GraphQLID },
    company_id: { type: GraphQLID },
    tag_ids: { type: new GraphQLList(GraphQLID) },
  }),
});

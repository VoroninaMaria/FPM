import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "CompanyFilter",
  fields: () => ({
    id: { type: GraphQLID },
    active: { type: GraphQLBoolean },
    ids: { type: new GraphQLList(GraphQLID) },
    brand_merchant_id: { type: GraphQLID },
    merchant_id: { type: GraphQLID },
    name: { type: GraphQLString },
  }),
});

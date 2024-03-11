import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
} from "graphql";

export default new GraphQLObjectType({
  name: "Company",
  fields: {
    id: { type: GraphQLID },
    active: { type: GraphQLBoolean },
    merchant_id: { type: GraphQLID },
    brand_merchant_id: { type: GraphQLID },
    name: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});

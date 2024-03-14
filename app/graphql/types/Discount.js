import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
} from "graphql";

export default new GraphQLObjectType({
  name: "Discount",
  fields: {
    id: { type: GraphQLID },
    merchant_id: { type: GraphQLID },
    name: { type: GraphQLString },
    percent: { type: GraphQLFloat },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});

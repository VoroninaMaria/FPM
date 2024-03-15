import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLFloat,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "DiscountFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    merchant_id: { type: GraphQLString },
    name: { type: GraphQLString },
    percent: { type: GraphQLFloat },
  }),
});

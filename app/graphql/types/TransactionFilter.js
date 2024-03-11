import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "TransactionFilter",
  fields: () => ({
    id: { type: GraphQLID },
    date: { type: GraphQLString },
    type: { type: GraphQLString },
    amount: { type: GraphQLInt },
    fuel_type: { type: GraphQLString },
    place: { type: GraphQLString },
    brand: { type: GraphQLString },
    to: { type: GraphQLString },
  }),
});

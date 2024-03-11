import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
} from "graphql";

export default new GraphQLObjectType({
  name: "Transaction",
  fields: {
    id: { type: GraphQLID },
    type: { type: GraphQLString },
    amount: { type: GraphQLInt },
    date: { type: GraphQLString },
    to: { type: GraphQLString },
    fuel_qty: { type: GraphQLInt },
    saved_money: { type: GraphQLInt },
    fuel_type: { type: GraphQLString },
    place: { type: GraphQLString },
    brand: { type: GraphQLString },
  },
});

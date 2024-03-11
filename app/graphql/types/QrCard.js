import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} from "graphql";
import GraphQLDateTime from "graphql-type-datetime";

export default new GraphQLObjectType({
  name: "QrCard",
  fields: {
    id: { type: GraphQLInt },
    card_holder: { type: GraphQLInt },
    card_owner: { type: GraphQLInt },
    serial_internal: { type: GraphQLString },
    serial_external: { type: GraphQLString },
    serial_visible: { type: GraphQLString },
    begin_date: { type: GraphQLDateTime },
    end_date: { type: GraphQLDateTime },
    status: { type: GraphQLInt },
    pin1: { type: GraphQLString },
    card_name: { type: GraphQLString },
    phone: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

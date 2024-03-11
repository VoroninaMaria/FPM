import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "SmsServiceFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    merchant_id: { type: GraphQLID },
    status: { type: GraphQLString },
    service_name: { type: GraphQLString },
  }),
});

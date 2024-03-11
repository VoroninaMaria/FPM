import {
  GraphQLInputObjectType,
  GraphQLString,
  // GraphQLList,
  GraphQLID,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "NotificationLogsFilter",
  fields: () => ({
    id: { type: GraphQLID },
    sms_service_id: { type: GraphQLID },
    message: { type: GraphQLString },
    account_id: { type: GraphQLID },
    account_type: { type: GraphQLString },
  }),
});

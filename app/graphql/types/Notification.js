import graphql from "graphql";
export default new graphql.GraphQLObjectType({
  name: "Notification",
  fields: {
    id: { type: graphql.GraphQLID },
    sms_service_id: { type: graphql.GraphQLID },
    message: { type: graphql.GraphQLString },
    account_id: { type: graphql.GraphQLID },
    account_type: { type: graphql.GraphQLString },
    code: { type: graphql.GraphQLString },
    created_at: { type: graphql.GraphQLString },
    updated_at: { type: graphql.GraphQLString },
  },
});

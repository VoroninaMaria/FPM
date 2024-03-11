import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLBoolean,
  GraphQLList,
} from "graphql";

export default new GraphQLInputObjectType({
  name: "PromotionFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
    unreadOnly: { type: GraphQLBoolean },
  }),
});

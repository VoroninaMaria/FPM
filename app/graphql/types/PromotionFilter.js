import { GraphQLInputObjectType, GraphQLID, GraphQLList } from "graphql";

export default new GraphQLInputObjectType({
  name: "PromotionFilter",
  fields: () => ({
    id: { type: GraphQLID },
    ids: { type: new GraphQLList(GraphQLID) },
  }),
});

import { GraphQLObjectType } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "Trunc",
  fields: {
    response: { type: GraphQLJSONObject },
  },
});

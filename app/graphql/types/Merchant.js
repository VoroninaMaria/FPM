import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
} from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default new GraphQLObjectType({
  name: "Merchant",
  fields: {
    id: { type: GraphQLID },
    login: { type: GraphQLString },
    name: { type: GraphQLString },
    status: { type: GraphQLString },
    sms_fallback: { type: GraphQLBoolean },
    storage_capacity: { type: GraphQLInt },
    default_category_id: { type: GraphQLID },
    newbie: { type: GraphQLBoolean },
    design_id: { type: GraphQLID },
    plugins: { type: GraphQLJSONObject },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  },
});

// @local/app/graphql/queries/client/index.js
import { GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import { Tag as TagType } from "@local/graphql/types/index.js";

const allTags = {
  type: new GraphQLList(TagType),
  resolve: async () => {
    try {
      const tags = await Database("tags").select("*");

      return tags;
    } catch (error) {
      throw new GraphQLError("Ошибка при выполнении запроса");
    }
  },
};

export default { allTags };

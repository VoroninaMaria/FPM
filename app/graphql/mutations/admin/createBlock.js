import { Block } from "@local/graphql/types/index.js";
import {
  createBlockBaseValidation,
  blockValidations,
} from "@local/graphql/validations/admin/index.js";
import { GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLID } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";
import { Database, Config } from "@local/lib/index.js";
import { GraphQLError } from "graphql";

export default {
  type: Block,
  args: {
    type: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    page_id: { type: new GraphQLNonNull(GraphQLID) },
    position: { type: new GraphQLNonNull(GraphQLInt) },
    blocks: { type: new GraphQLNonNull(GraphQLInt) },
    container_styles: { type: GraphQLJSONObject },
    styles: { type: GraphQLJSONObject },
    props: { type: GraphQLJSONObject },
  },
  resolve: async (_, params) => {
    await createBlockBaseValidation.validate(params, { strict: true });

    await blockValidations[params.type].validate(params, { strict: true });

    return Database("blocks")
      .insert({
        ...params,
        ...(params?.props?.file_id && {
          props: {
            ...params.props,
            uri: `${Config.assetsUrl}/${params.props.file_id}`,
          },
        }),
      })
      .returning("*")
      .then(([block]) => block)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      });
  },
};

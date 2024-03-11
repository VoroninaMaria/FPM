import { Database, Config } from "@local/lib/index.js";
import { GraphQLError } from "graphql";
import { Block } from "@local/graphql/types/index.js";
import {
  updateBlockBaseValidation,
  blockValidations,
} from "@local/graphql/validations/merchant/index.js";
import { GraphQLString, GraphQLInt, GraphQLID, GraphQLNonNull } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export default {
  type: Block,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    page_id: { type: new GraphQLNonNull(GraphQLID) },
    type: { type: new GraphQLNonNull(GraphQLString) },
    position: { type: new GraphQLNonNull(GraphQLInt) },
    blocks: { type: new GraphQLNonNull(GraphQLInt) },
    container_styles: { type: GraphQLJSONObject },
    styles: { type: GraphQLJSONObject },
    props: { type: GraphQLJSONObject },
  },
  resolve: async (_, params, { merchant }) => {
    await updateBlockBaseValidation.validate(
      {
        ...params,
        merchant_id: merchant.id,
      },
      { strict: true }
    );

    await blockValidations[params.type].validate(
      {
        ...params,
      },
      { strict: true }
    );

    return Database("blocks")
      .where({ id: params.id })
      .update({
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

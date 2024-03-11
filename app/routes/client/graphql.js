import express from "express";
import { graphqlHTTP } from "express-graphql";
import graphql from "graphql";

import { Database, Errors } from "@local/lib/index.js";
import { decodeJwt } from "@local/helpers/index.js";
import queries from "@local/app/graphql/queries/client/index.js";
import mutations from "@local/app/graphql/mutations/client/index.js";
import { CLIENT_STATUSES } from "@local/constants/index.js";

const router = express.Router();

// Define the Query type
const query = new graphql.GraphQLObjectType({
  name: "Query",
  fields: queries,
});

let mutation;

if (Object.keys(mutations).length) {
  mutation = new graphql.GraphQLObjectType({
    name: "Mutation",
    fields: mutations,
  });
}

const schema = new graphql.GraphQLSchema({ query, mutation });

router.use(
  "/",
  async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    let decodedToken;

    try {
      decodedToken = decodeJwt(token);
    } catch (e) {
      return Errors.forbidden(res);
    }

    const { id, session_identifier } = decodedToken;

    const account = await Database("clients")
      .where({ id, session_identifier })
      .first();

    if (account) {
      const { status } = await Database("clients")
        .select("status")
        .where({ id })
        .first()
        .catch(() => {
          return Errors.forbidden(res);
        });

      if (
        status === CLIENT_STATUSES.blocked.name ||
        status === CLIENT_STATUSES.disabled.name
      ) {
        return Errors.blocked(res);
      }
      if (status === CLIENT_STATUSES.initial.name) {
        return Errors.forbidden(res);
      }
    }

    if (!account) {
      return Errors.forbidden(res);
    }

    res.client = account;

    const merchant = await Database("merchants")
      .where({ id: account.merchant_id })
      .first();

    if (!merchant) {
      return Errors.forbidden(res);
    }

    res.merchant = merchant;

    next();
  },

  graphqlHTTP((req, res) => {
    return {
      schema,
      context: { client: res.client, merchant: res.merchant },
    };
  })
);

export default router;

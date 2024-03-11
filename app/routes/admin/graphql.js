import graphql from "graphql";
import express from "express";
import { graphqlHTTP } from "express-graphql";

import { Database, Errors } from "@local/lib/index.js";
import { decodeJwt } from "@local/helpers/index.js";
import queries from "@local/app/graphql/queries/admin/index.js";
import mutations from "@local/app/graphql/mutations/admin/index.js";
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

export const schema = new graphql.GraphQLSchema({
  query,
  mutation,
});

router.use(
  "/",
  (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    let decodedToken;

    try {
      decodedToken = decodeJwt(token);
    } catch (e) {
      return Errors.forbidden(res);
    }

    const { id, session_identifier } = decodedToken;

    return Database("admins")
      .where({ id, session_identifier })
      .first()
      .then((account) => {
        res.context = account;

        return account ? next() : Errors.forbidden(res);
      });
  },

  graphqlHTTP((req, res) => {
    return {
      schema,
      context: { admin: res.context },
    };
  })
);

export default router;

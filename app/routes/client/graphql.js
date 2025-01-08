// app/routes/client/graphql.js
import express from "express";
import { graphqlHTTP } from "express-graphql";
import graphql from "graphql";
import queries from "@local/app/graphql/queries/client/index.js";
import mutations from "@local/app/graphql/mutations/client/index.js";

const router = express.Router();

// Define the Query type
const query = new graphql.GraphQLObjectType({
  name: "Query",
  fields: queries,
});

// Define the Mutation type
const mutation = new graphql.GraphQLObjectType({
  name: "Mutation",
  fields: mutations,
});

const schema = new graphql.GraphQLSchema({ query, mutation });

router.use(
  "/",
  graphqlHTTP({
    schema,
    graphiql: true, // Enable GraphiQL for debugging queries
  })
);

export default router;

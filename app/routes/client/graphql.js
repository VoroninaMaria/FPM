// app/routes/client/graphql.js
import express from "express";
import { graphqlHTTP } from "express-graphql";
import graphql from "graphql";
import queries from "@local/app/graphql/queries/client/index.js";

const router = express.Router();

// Define the Query type
const query = new graphql.GraphQLObjectType({
  name: "Query",
  fields: queries,
});

let mutation;

const schema = new graphql.GraphQLSchema({ query, mutation });

router.use(
  "/",
  graphqlHTTP({
    schema,
    graphiql: true, // Включите GraphiQL для отладки запросов
  })
);

export default router;

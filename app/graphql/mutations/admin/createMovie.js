import { Database } from "@local/lib/index.js";
import { Movie } from "@local/graphql/types/index.js";
import { createMovieValidation } from "@local/graphql/validations/admin/index.js";
import {
	GraphQLString,
	GraphQLNonNull,
	GraphQLID,
	GraphQLError,
} from "graphql";

export default {
	type: Movie,
	args: {
		name: { type: new GraphQLNonNull(GraphQLString) },
		category_id: { type: new GraphQLNonNull(GraphQLID) },
		file_id: { type: new GraphQLNonNull(GraphQLID) },
	},
	resolve: (_, params) =>
		createMovieValidation.validate({ ...params }).then(() =>
			Database("movies")
				.insert({
					...params,
				})
				.returning("*")
				.then(([movie]) => movie)
				.catch(() => {
					throw new GraphQLError("Forbidden");
				})
		),
};

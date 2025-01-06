import { Database } from "@local/lib/index.js";
import { Movie } from "@local/graphql/types/index.js";
import { deleteMovieValidation } from "@local/graphql/validations/admin/index.js";
import { GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";

export default {
	type: Movie,
	args: {
		id: { type: new GraphQLNonNull(GraphQLID) },
	},
	resolve: (_, params) =>
		deleteMovieValidation.validate({ ...params }).then(() =>
			Database("movies")
				.where({
					...params,
				})
				.del()
				.returning("*")
				.then(([movie]) => movie)
				.catch(() => {
					throw new GraphQLError("Forbidden");
				})
		),
};

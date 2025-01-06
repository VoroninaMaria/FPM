import { Database } from "@local/lib/index.js";
import { Movie } from "@local/graphql/types/index.js";
import { updateMovieValidation } from "@local/graphql/validations/admin/index.js";
import {
	GraphQLString,
	GraphQLNonNull,
	GraphQLID,
	GraphQLError,
} from "graphql";

export default {
	type: Movie,
	args: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		name: { type: new GraphQLNonNull(GraphQLString) },
		category_id: { type: new GraphQLNonNull(GraphQLID) },
		file_id: { type: new GraphQLNonNull(GraphQLID) },
	},
	resolve: (_, params) =>
		updateMovieValidation.validate({ ...params }).then(() =>
			Database("movies")
				.where({
					id: params.id,
				})
				.update({
					name: params.name,
					category_id: params.category_id,
					file_id: params.file_id,
					updated_at: Database.fn.now(),
				})
				.returning("*")
				.then(([movies]) => movies)
				.catch(() => {
					throw new GraphQLError("Forbidden");
				})
		),
};

import { Database } from "@local/lib/index.js";
import { Movie } from "@local/graphql/types/index.js";
import { createMovieValidation } from "@local/graphql/validations/admin/index.js";
import {
	GraphQLString,
	GraphQLNonNull,
	GraphQLID,
	GraphQLError,
	GraphQLList,
} from "graphql";

export default {
	type: Movie,
	args: {
		name: { type: new GraphQLNonNull(GraphQLString) },
		description: { type: new GraphQLNonNull(GraphQLString) },
		start_date: { type: new GraphQLNonNull(GraphQLString) },
		age: { type: new GraphQLNonNull(GraphQLString) },
		duration: { type: new GraphQLNonNull(GraphQLString) },
		main_roles: { type: new GraphQLNonNull(GraphQLString) },
		file_id: { type: new GraphQLNonNull(GraphQLID) },
		categories_ids: { type: new GraphQLList(GraphQLID) },
	},
	resolve: (_, params) =>
		createMovieValidation.validate({ ...params }).then(() =>
			Database("movies")
				.insert({
					name: params.name,
					description: params.description,
					start_date: params.start_date,
					age: params.age,
					duration: params.duration,
					main_roles: params.main_roles,
					file_id: params.file_id,
				})
				.returning("*")
				.then(async ([movie]) => {
					if (params.categories_ids?.length > 0) {
						await Database("movie_categories")
							.insert(
								params.categories_ids.map((categories_id) => ({
									category_id: categories_id,
									movie_id: movie.id,
								}))
							)
							.catch(() => {
								throw new GraphQLError("Forbidden1");
							});
					}

					return movie;
				})
				.catch(() => {
					throw new GraphQLError("Forbidden2");
				})
		),
};

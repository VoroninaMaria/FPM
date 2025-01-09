import { Database } from "@local/lib/index.js";
import { Movie } from "@local/graphql/types/index.js";
import { updateMovieValidation } from "@local/graphql/validations/admin/index.js";
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
		id: { type: new GraphQLNonNull(GraphQLID) },
		name: { type: new GraphQLNonNull(GraphQLString) },
		description: { type: new GraphQLNonNull(GraphQLString) },
		start_date: { type: new GraphQLNonNull(GraphQLString) },
		age: { type: new GraphQLNonNull(GraphQLString) },
		duration: { type: new GraphQLNonNull(GraphQLString) },
		main_roles: { type: new GraphQLNonNull(GraphQLString) },
		file_id: { type: new GraphQLNonNull(GraphQLID) },
		categories_ids: { type: new GraphQLList(GraphQLID) },
	},
	resolve: async (_, params) => {
		await updateMovieValidation.validate(params, { strict: true });

		await Database("movie_categories")
			.where({ movie_id: params.id })
			.del()
			.catch(() => {
				throw new GraphQLError("Forbidden");
			});

		if (params.categories_ids?.length > 0) {
			await Database("movie_categories")
				.insert(
					params.categories_ids.map((category_id) => ({
						category_id,
						movie_id: params.id,
					}))
				)
				.catch(() => {
					throw new GraphQLError("Forbidden");
				});
		}

		await Database("movies")
			.where({
				id: params.id,
			})
			.update({
				name: params.name,
				description: params.description,
				start_date: params.start_date,
				age: params.age,
				duration: params.duration,
				main_roles: params.main_roles,
				file_id: params.file_id,
				updated_at: Database.fn.now(),
			})
			.returning("*")
			.then(([movies]) => movies)
			.catch(() => {
				throw new GraphQLError("Forbidden");
			});

		return Database("movies")
			.where({ id: params.id })
			.first()
			.then((movie) => ({
				...movie,
				categories_ids: params.categories_ids ?? [],
			}))
			.catch(() => {
				throw new GraphQLError("Forbidden");
			});
	},
};

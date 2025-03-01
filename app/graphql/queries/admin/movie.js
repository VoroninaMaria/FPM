import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
	Movie as MovieType,
	MovieFilter,
	ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";
import { Config } from "@local/lib/index.js";
import { FILE_CONSTANTS } from "@local/constants/index.js";

const Movie = {
	type: MovieType,
	args: { id: { type: new GraphQLNonNull(GraphQLID) } },
	resolve: (_, { id }) =>
		Database("movies")
			.select([
				Database.raw('"movies".*'),
				Database.raw(
					"(select array_agg(category_id) from movie_categories where movie_categories.movie_id = movies.id) as categories_ids"
				),
			])
			.where({ id })
			.first()
			.then((file) => ({
				...file,
				url: `${Config.assetsUrl}/${file.id}`,
				size: file.size / FILE_CONSTANTS.BYTES_IN_MEGABYTE,
			}))
			.catch(() => {
				throw new GraphQLError("Forbidden");
			}),
};

const allMovies = {
	type: new GraphQLList(MovieType),
	args: { ...paginationArgs, filter: { type: MovieFilter } },
	resolve: (
		_,
		{
			perPage = 20,
			page = 0,
			sortField = "name",
			sortOrder = "asc",
			filter: { ids, ...filter },
		}
	) =>
		Database("movies")
			.select([
				Database.raw('"movies".*'),
				Database.raw(
					"(select array_agg(category_id) from movie_categories where movie_categories.movie_id = movies.id) as categories_ids"
				),
			])
			.where({ ...filter })
			.modify((queryBuilder) => {
				if (ids?.length) queryBuilder.whereIn("id", ids);
			})
			.limit(perPage)
			.offset(page * perPage)
			.orderBy(sortField, sortOrder)
			.catch(() => {
				throw new GraphQLError("Forbidden");
			}),
};

const _allMoviesMeta = {
	type: ListMetadata,
	args: { ...paginationArgs, filter: { type: MovieFilter } },
	resolve: (_, { filter: { ids, ...filter } }) =>
		Database("movies")
			.where({ ...filter })
			.modify((queryBuilder) => {
				if (ids?.length) queryBuilder.whereIn("id", ids);
			})
			.count()
			.first()
			.catch(() => {
				throw new GraphQLError("Forbidden");
			}),
};

export default { Movie, allMovies, _allMoviesMeta };

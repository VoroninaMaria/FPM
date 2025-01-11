// @local/app/graphql/queries/client/index.js
import { GraphQLList, GraphQLError, GraphQLID } from "graphql";
import { Database } from "@local/lib/index.js";
import { Tag as TagType } from "@local/graphql/types/index.js";
import { Movie as MovieType } from "@local/graphql/types/index.js";
import { Category as CategoryType } from "@local/graphql/types/index.js";
import { File as FileType } from "@local/graphql/types/index.js";
import { GraphQLNonNull, GraphQLString } from "graphql";
import { Location as LocationType } from "@local/graphql/types/index.js";
import { Session as SessionType } from "@local/graphql/types/index.js";
import { Hall as HallType } from "@local/graphql/types/index.js";
import { Config } from "@local/lib/index.js";
import { FILE_CONSTANTS } from "@local/constants/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";
import { CategoryFilter } from "@local/graphql/types/index.js";

const allTags = {
  type: new GraphQLList(TagType),
  resolve: async () => {
    try {
      const tags = await Database("tags").select("*");

      return tags;
    } catch (error) {
      throw new GraphQLError("Ошибка при выполнении запроса");
    }
  },
};

const allLocations = {
  type: new GraphQLList(LocationType),
  resolve: async () => {
    try {
      const locations = await Database("locations").select("*");

      return locations;
    } catch (error) {
      throw new GraphQLError("Ошибка при выполнении запроса");
    }
  },
};

const location = {
  type: LocationType,
  args: { name: { type: new GraphQLNonNull(GraphQLString) } },
  resolve: (_, { name }) =>
    Database("locations")
      .where({ name })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const categoryById = {
  type: CategoryType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("categories")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allCategories = {
  type: new GraphQLList(CategoryType),
  args: { ...paginationArgs, filter: { type: CategoryFilter } },
  resolve: (
    _,
    {
      perPage = 20,
      page = 0,
      sortField = "merchant_id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    }
  ) =>
    Database("categories")
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

const fileById = {
  type: FileType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("files")
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

const movieById = {
  type: MovieType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("movies")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const locationById = {
  type: LocationType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("locations")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const hallById = {
  type: HallType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("halls")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const sessionById = {
  type: SessionType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("sessions")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const movieByLocation = {
  type: new GraphQLList(MovieType),
  args: {
    location_id: { type: new GraphQLNonNull(GraphQLString) },
    category_name: { type: GraphQLString },
  },
  resolve: async (
    _,
    { location_id, category_name },
    { perPage = 5, page = 0, sortField = "name", sortOrder = "asc" }
  ) => {
    try {
      // Получаем сеансы по локации
      const sessions = await Database("sessions").where({ location_id });
      const movieIds = Array.from(
        new Set(sessions.map((session) => session.movie_id))
      );

      // Если категории не переданы, возвращаем все фильмы
      let categoryId = null;

      if (category_name) {
        const category = await Database("categories")
          .where("name", category_name)
          .first();

        if (!category) {
          throw new GraphQLError("Категория с указанным именем не найдена.");
        }
        categoryId = category.id;
      }

      // Получаем фильмы
      const movies = await Database("movies")
        .select([
          "movies.*",
          Database.raw(
            `(SELECT ARRAY_AGG(category_id) 
              FROM movie_categories 
              WHERE movie_categories.movie_id = movies.id) as categories_ids`
          ),
        ])
        .whereIn("movies.id", movieIds)
        .modify((query) => {
          if (categoryId) {
            query.whereExists(function () {
              this.select("*")
                .from("movie_categories")
                .whereRaw("movie_categories.movie_id = movies.id")
                .andWhere("movie_categories.category_id", categoryId);
            });
          }
        })
        .limit(perPage)
        .offset(page * perPage)
        .orderBy(sortField, sortOrder);

      return movies;
    } catch (error) {
      throw new GraphQLError(
        "Ошибка при получении информации о фильмах по локации"
      );
    }
  },
};

const allSessionByMovieAndLocation = {
  type: new GraphQLList(SessionType),
  args: {
    movie_id: { type: new GraphQLNonNull(GraphQLID) },
    location_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (
    _,
    { movie_id, location_id },
    { perPage = 20, page = 0, sortField = "day", sortOrder = "asc" }
  ) =>
    Database("sessions")
      .where({ movie_id })
      .andWhere({ location_id })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .then((result) => {
        if (!result) {
          throw new GraphQLError("Session not found");
        }
        return result;
      })
      .catch((error) => {
        console.error(error); // Логируем для отладки
        throw new GraphQLError("Forbidden");
      }),
};

export default {
  allTags,
  allLocations,
  allSessionByMovieAndLocation,
  location,
  movieByLocation,
  categoryById,
  fileById,
  movieById,
  locationById,
  hallById,
  sessionById,
  allCategories,
};

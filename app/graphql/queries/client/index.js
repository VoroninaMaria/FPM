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
import { Config } from "@local/lib/index.js";
import { FILE_CONSTANTS } from "@local/constants/index.js";

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

const movieByLocation = {
  type: new GraphQLList(MovieType),
  args: { location_id: { type: new GraphQLNonNull(GraphQLString) } },
  resolve: async (_, { location_id }) => {
    try {
      // Получаем залы по location_id
      const sessions = await Database("sessions").where({ location_id });
      const moviesIds = Array.from(
        new Set(sessions.map((session) => session.movie_id))
      );
      const movies = await Database("movies").whereIn("id", moviesIds);

      return movies;
    } catch (error) {
      throw new GraphQLError(
        "Ошибка при получении информации о фильмах по локации"
      );
    }
  },
};

const sessionByMovieAndLocation = {
  type: new GraphQLList(SessionType),
  args: {
    movie_id: { type: new GraphQLNonNull(GraphQLID) },
    location_id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: (_, { movie_id, location_id }) =>
    Database("sessions")
      .where({ movie_id })
      .andWhere({ location_id })
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
  location,
  movieByLocation,
  categoryById,
  fileById,
  sessionByMovieAndLocation,
};

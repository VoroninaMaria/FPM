import { GraphQLNonNull, GraphQLID, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  Location as LocationType,
  LocationFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const Location = {
  type: LocationType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }, { merchant }) =>
    Database("locations")
      .where({ id, merchant_id: merchant.id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allLocations = {
  type: new GraphQLList(LocationType),
  args: { ...paginationArgs, filter: { type: LocationFilter } },
  resolve: (
    _,
    {
      perPage = 20,
      page = 0,
      sortField = "merchant_id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    },
    { merchant }
  ) =>
    Database("locations")
      .where({ ...filter, merchant_id: merchant.id })
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

const _allLocationsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: LocationFilter } },
  resolve: (_, { filter: { ids, ...filter } }, { merchant }) =>
    Database("locations")
      .where({ ...filter, merchant_id: merchant.id })
      .modify((queryBuilder) => {
        if (ids?.length) queryBuilder.whereIn("id", ids);
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default { Location, allLocations, _allLocationsMeta };

import { GraphQLList, GraphQLID, GraphQLError, GraphQLNonNull } from "graphql";

import { Database } from "@local/lib/index.js";
import {
  SmsServiceFilter,
  SmsService as SmsServiceType,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const SmsService = {
  type: SmsServiceType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("sms_services")
      .where({
        id,
      })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allSmsServices = {
  type: new GraphQLList(SmsServiceType),
  args: { ...paginationArgs, filter: { type: SmsServiceFilter } },
  resolve: (
    _,
    {
      perPage = 10,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    }
  ) =>
    Database("sms_services")
      .where(filter)
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .limit(perPage)
      .offset(page * perPage)
      .orderBy(sortField, sortOrder)
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const _allSmsServicesMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: SmsServiceFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("sms_services")
      .where({ ...filter })
      .modify((queryBuilder) => {
        if (ids?.length) {
          queryBuilder.whereIn("id", ids);
        }
      })
      .count()
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

export default {
  allSmsServices,
  _allSmsServicesMeta,
  SmsService,
};

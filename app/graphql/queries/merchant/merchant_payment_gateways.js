import { GraphQLList, GraphQLID, GraphQLError, GraphQLNonNull } from "graphql";

import { Database } from "@local/lib/index.js";
import {
  MerchantPaymentGatewayFilter,
  MerchantPaymentGateway as MerchantPaymentGatewayType,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const MerchantPaymentGateway = {
  type: MerchantPaymentGatewayType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }, { merchant }) =>
    Database("merchant_payment_gateways")
      .where({
        "merchant_payment_gateways.id": id,
        merchant_id: merchant.id,
      })
      .first()
      .then(({ config, ...bm }) => ({
        config,
        ...bm,
      }))
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allMerchantPaymentGateways = {
  type: new GraphQLList(MerchantPaymentGatewayType),
  args: { ...paginationArgs, filter: { type: MerchantPaymentGatewayFilter } },
  resolve: (
    _,
    {
      perPage = 10,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { id, ids, ...filter },
    },
    { merchant }
  ) =>
    Database("merchant_payment_gateways")
      .where({
        ...(id && {
          "merchant_payment_gateways.id": id,
        }),
        merchant_id: merchant.id,
        ...filter,
      })
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

const _allMerchantPaymentGatewaysMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: MerchantPaymentGatewayFilter } },
  resolve: (_, { filter: { id, ids, ...filter } }, { merchant }) =>
    Database("merchant_payment_gateways")
      .where({
        ...(id && { "merchant_payment_gateways.id": id }),
        merchant_id: merchant.id,
        ...filter,
      })
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
  allMerchantPaymentGateways,
  _allMerchantPaymentGatewaysMeta,
  MerchantPaymentGateway,
};

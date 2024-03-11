import { GraphQLID, GraphQLNonNull, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import {
  AdminPaymentGateway as PaymentGatewayType,
  PaymentGatewayFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const PaymentGateway = {
  type: PaymentGatewayType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: (_, { id }) =>
    Database("payment_gateways")
      .where({ id })
      .first()
      .catch(() => {
        throw new GraphQLError("Forbidden");
      }),
};

const allPaymentGateways = {
  type: new GraphQLList(PaymentGatewayType),
  args: { ...paginationArgs, filter: { type: PaymentGatewayFilter } },
  resolve: (
    _,
    {
      perPage = 4,
      page = 0,
      sortField = "id",
      sortOrder = "asc",
      filter: { ids, ...filter },
    }
  ) =>
    Database("payment_gateways")
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

const _allPaymentGatewaysMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: PaymentGatewayFilter } },
  resolve: (_, { filter: { ids, ...filter } }) =>
    Database("payment_gateways")
      .where(filter)
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

export default { PaymentGateway, allPaymentGateways, _allPaymentGatewaysMeta };

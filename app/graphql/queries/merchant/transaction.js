import { GraphQLNonNull, GraphQLInt, GraphQLList, GraphQLError } from "graphql";
import { Database } from "@local/lib/index.js";
import { Datex } from "@local/app/connectors/brands/index.js";
import {
  DatexTransaction as DatexTransactionType,
  DatexTransactionFilter,
  ListMetadata,
} from "@local/graphql/types/index.js";
import paginationArgs from "@local/graphql/queries/shared/paginationArgs.js";

const DatexTransaction = {
  type: DatexTransactionType,
  args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
  resolve: async (_, { id }, { merchant }) => {
    if (!id) {
      throw new GraphQLError("Forbidden");
    }

    if (!merchant) {
      throw new GraphQLError("Forbidden");
    }

    if (!merchant.plugins.datex) {
      throw new GraphQLError("Forbidden");
    }

    const datexBrand = await Database("brands")
      .where({ name: "Datex" })
      .first();
    const dtxMerchantBrand = await Database("brand_merchants")
      .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
      .first();
    const datex = new Datex(dtxMerchantBrand.config);
    const transaction = await datex.getTransactionById(id);

    await datex.close();

    return transaction;
  },
};

const allDatexTransactions = {
  type: new GraphQLList(DatexTransactionType),
  args: { ...paginationArgs, filter: { type: DatexTransactionFilter } },
  resolve: async (
    _,
    { page = 0, perPage = 2, sortField, sortOrder, filter },
    { merchant }
  ) => {
    if (!merchant) {
      throw new GraphQLError("Forbidden");
    }

    if (!merchant.plugins.datex) {
      throw new GraphQLError("Forbidden");
    }

    const datexBrand = await Database("brands")
      .where({ name: "Datex" })
      .first();
    const dtxMerchantBrand = await Database("brand_merchants")
      .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
      .first();
    const datex = new Datex(dtxMerchantBrand.config);

    const result = await datex.getAllTransactions({
      page,
      per_page: perPage,
      sort_field: sortField,
      sort_order: sortOrder,
      filter: filter,
    });

    const transactions = result.map((result) => {
      return { id: result.out_id, ...result };
    });

    await datex.close();

    return transactions;
  },
};

const _allDatexTransactionsMeta = {
  type: ListMetadata,
  args: { ...paginationArgs, filter: { type: DatexTransactionFilter } },
  resolve: async (_, { filter }, { merchant }) => {
    if (!merchant) {
      throw new GraphQLError("Forbidden");
    }

    if (!merchant.plugins.datex) {
      throw new GraphQLError("Forbidden");
    }

    const datexBrand = await Database("brands")
      .where({ name: "Datex" })
      .first();
    const dtxMerchantBrand = await Database("brand_merchants")
      .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
      .first();
    const datex = new Datex(dtxMerchantBrand.config);
    const [totalTransactions] = await datex.getTotalTransactions(filter);

    await datex.close();

    return totalTransactions;
  },
};

export default {
  DatexTransaction,
  allDatexTransactions,
  _allDatexTransactionsMeta,
};

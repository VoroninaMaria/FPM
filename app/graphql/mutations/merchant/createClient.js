import { Database } from "@local/lib/index.js";
import { Client } from "@local/graphql/types/index.js";
import { Datex } from "@local/app/connectors/brands/index.js";
import { createClientValidation } from "@local/graphql/validations/merchant/index.js";
import { CLIENT_STATUSES } from "@local/app/constants/index.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLError,
  GraphQLID,
  GraphQLList,
  GraphQLInt,
} from "graphql";

export default {
  type: Client,
  args: {
    first_name: { type: new GraphQLNonNull(GraphQLString) },
    last_name: { type: new GraphQLNonNull(GraphQLString) },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString },
    category_id: { type: GraphQLID },
    tag_ids: { type: new GraphQLList(GraphQLID) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    entity: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: (_, args, { merchant }) =>
    createClientValidation
      .validate({ ...args, merchant_id: merchant.id }, { strict: true })
      .then(async () =>
        Database("clients")
          .insert({
            first_name: args.first_name,
            last_name: args.last_name,
            email: args.email,
            phone: args.phone,
            ...(args.category_id && { category_id: args.category_id }),
            merchant_id: merchant.id,
            encrypted_password: await encryptPassword(args.password),
            status: CLIENT_STATUSES.confirmed.name,
          })
          .returning("*")
          .then(async ([client]) => {
            if (args.tag_ids?.length > 0) {
              await Database("client_tags")
                .insert(
                  args.tag_ids.map((tag_id) => ({
                    tag_id,
                    client_id: client.id,
                  }))
                )
                .catch(() => {
                  throw new GraphQLError("Forbidden");
                });
            }
            if (merchant.plugins.datex) {
              const datexBrand = await Database("brands")
                .where({ name: "Datex" })
                .first();
              const dtxMerchantBrand = await Database("brand_merchants")
                .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
                .first();
              const datex = new Datex(dtxMerchantBrand.config);

              const [result] = await datex.createClient({
                euid: client.id,
                fullName: `${args.first_name} ${args.last_name}`,
                shortName: args.first_name,
                ownership: args.entity,
                etalonId: 1,
              });

              const [dtxClient] = await datex.updateClient({
                id_clients: result.out_id_client,
                phones: args.phone,
              });

              await datex.createClientAccount({
                account: 1,
                account_owner: dtxClient.id_clients,
                day_limit: 0.0,
                day_limit_rest: 0.0,
                month_limit: 0.0,
                month_limit_rest: 0.0,
                title: "ДП_ГРН",
                active: true,
                is_main_account: true,
                version_id: dtxClient.version_id,
              });

              await datex.createQRCard(dtxClient.id_clients).then(async () => {
                const qrCard = await datex.getClientQRCard(
                  dtxClient.id_clients
                );

                return datex
                  .createQRCardAccount(qrCard.id)
                  .then((card) => card);
              });

              await datex.close();

              return { ...client, ...dtxClient };
            }
            return client;
          })
          .catch(() => {
            throw new GraphQLError("Forbidden");
          })
      ),
};

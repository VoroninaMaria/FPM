import { Database } from "@local/lib/index.js";
import {
  BRAND_MERCHANT_STATUSES,
  BRAND_STATUSES,
  MERCHANT_STATUSES,
} from "@local/constants";
import { Datex } from "@local/connectors/brands/index.js";

export const syncDatexClients = () =>
  Database("brand_merchants")
    .join("brands", "brands.id", "=", "brand_merchants.brand_id")
    .join("merchants", "merchants.id", "=", "brand_merchants.merchant_id")
    .where({
      "brands.name": "Datex",
      "brands.status": BRAND_STATUSES.active.id,
      "merchants.status": MERCHANT_STATUSES.active.id,
      "brand_merchants.status": BRAND_MERCHANT_STATUSES.active.id,
    })
    .select("brand_merchants.*")
    .then((brand_merchants) =>
      brand_merchants.map(({ config, ...brand_merchant }) =>
        new Datex(config).getClientList().then((companies) =>
          companies.map(async (company) => {
            return Database("companies")
              .insert({
                external_id: company.id_clients,
                brand_merchant_id: brand_merchant.id,
                merchant_id: brand_merchant.merchant_id,
                name: `#${company.id_clients} || ${
                  company.fs_name || company.sn_clients
                } `,
                active: !company.status,
              })
              .onConflict(["external_id", "brand_merchant_id"])
              .merge();
          })
        )
      )
    );

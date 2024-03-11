import express from "express";
import { v4 as uuidv4 } from "uuid";
import { GraphQLError } from "graphql";
import { Datex } from "@local/app/connectors/brands/index.js";
import { Database, Errors, Logger } from "@local/lib/index.js";
const router = express.Router();

router.use(express.json());

const processPumbCallback = async (req, res) => {
  const info = {};

  for (const [key, value] of Object.entries(req)) {
    if (key.startsWith("_")) continue;
    if (key === "client") continue;
    if (key === "res") continue;
    if (key === "socket") continue;
    info[key] = value;
  }
  Logger.info(
    `Callback: ${JSON.stringify(req.params)}, ${JSON.stringify(
      req.headers
    )}, ${JSON.stringify(req.body)} ${JSON.stringify(info)}`
  );

  await Database("payment_truncs")
    .where({ id: req.body.external_id })
    .then(([trunc]) => {
      return Database("payment_truncs")
        .where({ id: trunc.id })
        .update({
          status: req.body.status,
          transactions: JSON.stringify([{ response: req.body }]),
        })
        .returning("*")
        .then(async ([updatedTrunc]) => {
          if (updatedTrunc.status === "PROCESSED") {
            const datexBrand = await Database("brands")
              .where({ name: "Datex" })
              .first()
              .catch((error) => {
                Logger.error(error);
                throw new GraphQLError("Forbidden");
              });
            const merchant = await Database("merchants")
              .where({ name: "Mango" })
              .first()
              .catch((error) => {
                Logger.error(error);
                throw new GraphQLError("Forbidden");
              });

            const dtxMerchantBrand = await Database("brand_merchants")
              .where({ merchant_id: merchant.id, brand_id: datexBrand.id })
              .first()
              .catch((error) => {
                Logger.error(error);
                throw new GraphQLError("Forbidden");
              });

            const datex = new Datex(dtxMerchantBrand.config);

            const client = await datex.clientIdByExternalId(
              updatedTrunc.client_id
            );

            const account = await datex.getClientAccount(client.id_clients);

            const now = new Date();
            const uaTime = now.toLocaleString("uk-UA", {
              timeZone: "Europe/Kiev",
            });
            const isoTime =
              now.toISOString().split("T")[0] + " " + uaTime.split(" ")[1];

            await datex.updateBalance({
              in_external_doc_id: uuidv4(),
              in_id_clients: client.id_clients,
              in_id_account: account.id,
              in_session_time: isoTime,
              in_summ: updatedTrunc.amount,
              in_id_source: 4,
              in_note: "поповнення",
              in_id_vid_docums: 1,
            });

            await datex.close();

            return updatedTrunc;
          }

          return updatedTrunc;
        })
        .catch((error) => {
          Logger.error(error);
          return Errors.badGateway(res, error);
        });
    })
    .catch((error) => {
      Logger.error(error);
      return Errors.badGateway(res, error);
    });

  res.status(200).send();
};

router.all("/", processPumbCallback);

export default router;

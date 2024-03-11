import { Database, Logger } from "@local/lib/index.js";
import smsConnectors from "@local/connectors/sms/index.js";
import {
  MERCHANT_STATUSES,
  SMS_SERVICE_STATUSES,
} from "@local/constants/index.js";

const syncBalances = () =>
  Database("sms_services")
    .where({
      status: SMS_SERVICE_STATUSES.active.name,
    })
    .whereIn(
      "merchant_id",
      Database("merchants").select("id").where({
        status: MERCHANT_STATUSES.active.name,
      })
    )
    .then((services) => {
      Promise.all(
        services.map(
          ({ id, service_name, config }) =>
            smsConnectors[service_name]?.getBalance &&
            smsConnectors[service_name]
              .getBalance({ config: { key: config.key } })
              .then((balance) => {
                return Database("sms_services")
                  .update({ balance })
                  .where({ id })
                  .then(() =>
                    Logger.info(
                      `smsService(${id}#${service_name}) Balance updated ${balance}`
                    )
                  )
                  .catch((error) =>
                    Logger.error(
                      `Failed to update balance for smsService(${id}#${service_name}) reason: ${error}`
                    )
                  );
              })
              .catch((error) =>
                Logger.error(
                  `Failed to update balance for smsService(${id}#${service_name}) reason: ${error}`
                )
              )
        )
      );
    })
    .catch((error) =>
      Logger.error(`Failed to run syncBalancesWorker ${error}`)
    );

export default syncBalances;

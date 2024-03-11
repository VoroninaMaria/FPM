import Database from "../Database.js";
import { smsSender } from "../../services/index.js";
import { MERCHANT_STATUSES, CLIENT_STATUSES } from "../../constants/index.js";
import { validatePhone } from "../../helpers/index.js";
import {
  alreadyConfirmed,
  badGateway,
  forbidden,
  invalidPhone,
  invalidMerchant,
  missingMerchantOrPhone,
  missingFirstNameOrLastName,
  registeringTooOften,
} from "../error_responses/index.js";

const randomCode = () =>
  (Math.floor(Math.random() * 1000000) + 100000).toString().substring(1);

const clientRegister = async (req, res, next) => {
  const { phone, merchant: name, firstName, lastName } = req.body;

  if (!phone || !name) return missingMerchantOrPhone(res);
  if (!firstName || !lastName) return missingFirstNameOrLastName(res);
  if (!validatePhone(phone)) return invalidPhone(res);

  try {
    const merchantInstance = await Database("merchants")
      .where({
        name,
        status: MERCHANT_STATUSES.active.name,
      })
      .first();

    if (!merchantInstance) return invalidMerchant(res);

    const [client] = await Database("clients")
      .insert({
        first_name: firstName,
        last_name: lastName,
        phone,
        merchant_id: merchantInstance.id,
        ...(merchantInstance?.default_category_id && {
          category_id: merchantInstance?.default_category_id,
        }),
      })
      .onConflict(["phone", "merchant_id"])
      .merge()
      .returning("*");

    if (client.status === CLIENT_STATUSES.confirmed.name)
      return alreadyConfirmed(res);

    const notificationInFiveMinutes = await Database("notification_logs")
      .where({ account_id: client.id, account_type: "clients" })
      .whereRaw("created_at >= now() - interval '2 minutes'")
      .orderBy("created_at", "desc")
      .first();

    if (notificationInFiveMinutes) return registeringTooOften(res);

    return smsSender({
      phone,
      code: randomCode(),
      merchant_id: merchantInstance.id,
    })
      .then(([notification]) => res.send({ secret: notification.id }))
      .catch(() => {
        return forbidden(res);
      });
  } catch (err) {
    return badGateway(res, err);
  }
};

export default clientRegister;

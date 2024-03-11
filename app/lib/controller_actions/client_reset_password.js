import { Database, Errors } from "@local/lib/index.js";
import { smsSender } from "@local/services/index.js";
import { MERCHANT_STATUSES, CLIENT_STATUSES } from "@local/constants/index.js";
import { validatePhone } from "@local/helpers/index.js";

const clientResetPassword = async (req, res, next) => {
  const { phone, merchant: name } = req.body;

  const randomCode = () =>
    (Math.floor(Math.random() * 1000000) + 100000).toString().substring(1);

  if (!phone || !name) return Errors.missingMerchantOrPhone(res);
  if (!validatePhone(phone)) return Errors.invalidPhone(res);

  try {
    const merchantInstance = await Database("merchants").first().where({
      name,
      status: MERCHANT_STATUSES.active.name,
    });

    if (!merchantInstance) return Errors.invalidMerchant(res);

    const [client] = await Database("clients").where({
      phone,
      merchant_id: merchantInstance.id,
      status: CLIENT_STATUSES.confirmed.name,
    });

    if (!client) return Errors.forbidden(res);

    const notificationInFiveMinutes = await Database("notification_logs")
      .where({ account_id: client.id, account_type: "clients" })
      .whereRaw("created_at >= now() - interval '2 minutes'")
      .orderBy("created_at", "desc")
      .first();

    if (notificationInFiveMinutes) return Errors.registeringTooOften(res);

    return smsSender({
      phone,
      code: randomCode(),
      merchant_id: merchantInstance.id,
    })
      .then(([notification]) => res.send({ secret: notification.id }))
      .catch(() => Errors.forbidden(res));
  } catch (err) {
    return Errors.badGateway(res, err);
  }
};

export default clientResetPassword;

import { Database, Errors } from "@local/lib/index.js";

import {
  buildJwt,
  generateSessionIdentifier,
  encryptPassword,
} from "@local/helpers/index.js";

import { MERCHANT_STATUSES } from "@local/constants/index.js";

const confirmResetPassword = (req, res, next) => {
  const { code, secret: id } = req.body;

  if (!code?.length) return Errors.forbidden(res);
  if (!id?.length) return Errors.forbidden(res);

  return Database("notification_logs")
    .where({ code, id })
    .whereRaw("created_at >= now() - interval '5 minutes'")
    .first()
    .then(async (notification) => {
      if (!notification) return Errors.forbidden(res);

      return Database("clients")
        .where({
          id: notification.account_id,
        })
        .update({
          encrypted_password: await encryptPassword(code),
          updated_at: Database.fn.now(),
          session_identifier: generateSessionIdentifier(),
        })
        .returning("*")
        .then(([client]) => {
          if (!client) return Errors.forbidden(res);

          return Database("merchants")
            .where({
              id: client.merchant_id,
              status: MERCHANT_STATUSES.active.name,
            })
            .then(([merchant]) => {
              if (!merchant) return Errors.forbidden(res);

              const token = buildJwt({
                id: client.id,
                session_identifier: client.session_identifier,
              });

              return res.send({ token });
            })
            .catch((err) => Errors.badGateway(res, err));
        })
        .catch((err) => Errors.badGateway(res, err));
    })
    .catch((err) => Errors.badGateway(res, err));
};

export default confirmResetPassword;

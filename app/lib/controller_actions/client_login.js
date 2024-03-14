import { Database, Errors } from "@local/lib/index.js";
import {
  buildJwt,
  generateSessionIdentifier,
  isPasswordValid,
  validatePhone,
  encryptPassword,
} from "@local/helpers/index.js";

import { MERCHANT_STATUSES, CLIENT_STATUSES } from "@local/constants/index.js";

const ClientLogin = async (req, res, next) => {
  const { phone, password, merchant: name } = req.body;

  if (!name?.length) return Errors.forbidden(res);

  if (!password?.length) return Errors.forbidden(res);

  if (!validatePhone(phone)) return Errors.forbidden(res);

  const merchantInstance = await Database("merchants")
    .select("id")
    .where({ name, status: MERCHANT_STATUSES.active.name })
    .first();

  return Database("clients")
    .where({
      phone,
      merchant_id: merchantInstance.id,
    })
    .then(async ([client]) => {
      if (!client) {
        const datex = {};

        const dtxClient = await datex.getClient(phone);

        if (!dtxClient) return Errors.forbidden(res);

        const [synced_client] = await Database("clients")
          .insert({
            id_clients: dtxClient.id_clients,
            merchant_id: merchantInstance.id,
            phone: dtxClient.phones,
            first_name: dtxClient.fn_clients,
            last_name: dtxClient.sn_clients,
            email: dtxClient.email,
            status: CLIENT_STATUSES.confirmed.name,
            encrypted_password: await encryptPassword(password),
          })
          .returning("*")
          .onConflict()
          .ignore();

        if (
          !(await isPasswordValid(password, synced_client.encrypted_password))
        )
          return Errors.forbidden(res);

        const session_identifier = generateSessionIdentifier();
        const { id } = synced_client;

        return Database("clients")
          .where({ id })
          .update({ session_identifier })
          .then(() => {
            const token = buildJwt({
              id,
              session_identifier,
            });

            return res.send({ token });
          })
          .catch((err) => Errors.badGateway(res, err));
      }
      if (
        client.status === CLIENT_STATUSES.blocked.name ||
        client.status === CLIENT_STATUSES.disabled.name
      ) {
        return Errors.blocked(res);
      }
      if (client.status === CLIENT_STATUSES.initial.name) {
        return Errors.forbidden(res);
      }

      if (!(await isPasswordValid(password, client.encrypted_password)))
        return Errors.forbidden(res);

      const session_identifier = generateSessionIdentifier();
      const { id } = client;

      return Database("clients")
        .where({ id })
        .update({ session_identifier })
        .then(() => {
          const token = buildJwt({
            id,
            session_identifier,
          });

          return res.send({ token });
        })
        .catch((err) => Errors.badGateway(res, err));
    })
    .catch((err) => Errors.badGateway(res, err));
};

export default ClientLogin;

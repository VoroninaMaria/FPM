import { Database, Errors } from "@local/lib/index.js";
import {
  buildJwt,
  generateSessionIdentifier,
  isPasswordValid,
} from "@local/helpers/index.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

const sharedLogin = (table) => (req, res, next) => {
  const { login, password } = req.body;

  if (!login?.length) return Errors.invalidLoginData(res);
  if (!password?.length) return Errors.invalidLoginData(res);

  return Database(table)
    .where({
      login,
    })
    .then(async ([account]) => {
      if (!account) return Errors.invalidLoginData(res);
      if (!(await isPasswordValid(password, account.encrypted_password)))
        return Errors.invalidLoginData(res);

      if (
        table === "merchants" &&
        account.status === MERCHANT_STATUSES.blocked.name
      )
        return Errors.blocked(res);

      if (
        table === "merchants" &&
        [
          MERCHANT_STATUSES.inactive.name,
          MERCHANT_STATUSES.disabled.name,
        ].includes(account.status)
      )
        return Errors.invalidLoginData(res);

      const session_identifier = generateSessionIdentifier();
      const { id } = account;

      return Database(table)
        .where({ id })
        .update({ session_identifier })
        .returning("*")
        .then(([account]) => {
          const token = buildJwt({
            id: account.id,
            session_identifier: account.session_identifier,
            ...(table === "merchants" && {
              plugins: account.plugins,
            }),
          });

          return res.send({
            token,
            id,
            ...(table === "merchants" && {
              plugins: JSON.stringify(account.plugins),
            }),
          });
        })
        .catch((err) => Errors.badGateway(res, err));
    })
    .catch((err) => Errors.badGateway(res, err));
};

export default sharedLogin;

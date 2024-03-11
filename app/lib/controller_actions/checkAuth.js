import { Database, Errors } from "@local/lib/index.js";
import { decodeJwt } from "@local/helpers/index.js";
import { MERCHANT_STATUSES } from "@local/app/constants/index.js";

const checkAuth = (table) => (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = decodeJwt(token);
  } catch (e) {
    return Errors.forbidden(res);
  }

  const { id, session_identifier, plugins } = decodedToken;

  return Database(table)
    .where({
      id,
      session_identifier,
    })
    .first()
    .then((account) => {
      if (
        !account ||
        (table === "merchants" &&
          (account?.status !== MERCHANT_STATUSES.active.name ||
            JSON.stringify(account?.plugins) !== JSON.stringify(plugins)))
      ) {
        return Errors.forbidden(res);
      }

      return res.send("");
    });
};

export default checkAuth;

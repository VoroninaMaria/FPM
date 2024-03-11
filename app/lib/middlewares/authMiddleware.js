import { Database, Errors } from "@local/lib/index.js";
import { decodeJwt } from "@local/helpers/index.js";

const authMiddleware = (table) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = decodeJwt(token);
  } catch (e) {
    return Errors.forbidden(res);
  }

  const { id, session_identifier } = decodedToken;

  return Database(table)
    .where({ id, session_identifier })
    .first()
    .then((account) => {
      if (!account) return Errors.forbidden(res);

      req.account = { id, type: table };
      next();
    });
};

export default authMiddleware;

import { Database, Errors } from "@local/lib/index.js";
import { decodeJwt } from "@local/helpers/index.js";

const checkAuth = (req, res) => {
  const token = req.body.headers.Authorization?.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = decodeJwt(token);
  } catch (e) {
    return Errors.forbidden(res);
  }

  const { id, session_identifier } = decodedToken;

  return Database("clients")
    .where({
      id,
      session_identifier,
    })
    .first()
    .then((result) => res.send(result?.status))
    .catch(() => {
      return Errors.forbidden(res);
    });
};

export default checkAuth;

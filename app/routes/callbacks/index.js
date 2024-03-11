import express from "express";
import { Database } from "@local/lib/index.js";

const router = express.Router();

router.use(express.json());

const processCallback = (req, res) => {
  // eslint-disable-next-line no-console

  const { id, type } = req.params;
  const host = req.get("host").split(":")[0];
  const predomain = host.split(".")[0];

  return Database(type)
    .first()
    .where({
      merchant_id: Database("merchants")
        .where({ name: predomain })
        .select("id"),
      id: id,
    })
    .then((integration) => {
      if (integration) {
        res.send(integration.status);
      } else {
        res.send("fail");
      }
    });
};

router.all("/:type/:id", processCallback);
router.all("/:type/:id/*", processCallback);

export default router;

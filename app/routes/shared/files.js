import { Database } from "@local/lib/index.js";

const files = (req, res) => {
  Database("files")
    .where(req.params)
    .first()
    .then(({ mimetype, data }) => {
      res.setHeader("content-type", mimetype);
      res.send(data);
    })
    .catch(() => {
      res.status(404);
      res.send("Not Found");
    });
};

export default files;

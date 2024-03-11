import md5 from "md5";
import { Database, Errors } from "@local/lib/index.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

const loadDesignsMD5 = (design_id, merchant_id, res) =>
  Database("designs")
    .where({ id: design_id, merchant_id })
    .first()
    .then((design) =>
      Database("pages")
        .select(Database.raw("styles, id"))
        .where({ design_id })
        .then((dbPages) =>
          Database("blocks")
            .whereIn(
              "page_id",
              dbPages.map(({ id }) => id)
            )
            .select(
              Database.raw(
                "id, type, blocks, container_styles, props, styles, position, page_id"
              )
            )
            .orderBy("page_id", "desc")
            .orderBy("position", "asc")
            .then((blocks) => {
              const pages = {};

              dbPages.forEach(
                (page) => (pages[page.id] = { ...page, children: [] })
              );

              blocks.forEach((block) =>
                pages[block.page_id].children.push(block)
              );
              res.setHeader("content-type", "application/json");

              return res.send({
                md5: md5(JSON.stringify({ ...design, pages })),
              });
            })
        )
    );

const serveDesignsMD5 = (req, res, next) => {
  if (!req.query.merchant) return Errors.invalidMerchant(res);

  return Database("merchants")
    .where({ name: req.query.merchant, status: MERCHANT_STATUSES.active.id })
    .first()
    .then((merchant) => {
      if (!merchant) return Errors.invalidMerchant(res);

      const { id, design_id } = merchant;

      if (!design_id) return Errors.invalidMerchant(res);

      return loadDesignsMD5(design_id, id, res);
    });
};

export default serveDesignsMD5;

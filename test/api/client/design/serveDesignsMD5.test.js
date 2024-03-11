import chai from "chai";
import md5 from "md5";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";
import { encryptPassword } from "@local/helpers/index.js";

chai.use(chaiHttp);
let uklonId;
let designJson;
const encrypted_password = await encryptPassword("123123");
const designMD5Request = (merchant, callback) =>
  chai
    .request(App)
    .get(`/api/client/design/md5?merchant=${merchant}`)
    .then(callback);

describe("Client", () => {
  describe("GET /api/client/design/md5", () => {
    before(async () => {
      [{ id: uklonId }] = await Database("merchants")
        .insert([
          {
            name: "uklon",
            encrypted_password,
            status: MERCHANT_STATUSES.active.name,
            login: "uklon",
          },
        ])
        .returning("id");

      await Database("merchants")
        .insert([
          {
            name: "bolt",
            encrypted_password,
            status: MERCHANT_STATUSES.active.name,
            login: "bolt",
          },
        ])
        .returning("id");

      const [{ id: design_id }] = await Database("designs")
        .insert({
          name: "design",
          merchant_id: uklonId,
        })
        .returning("id");

      await Database("merchants").where({ id: uklonId }).update({ design_id });

      designJson = await Database("designs")
        .where({ id: design_id, merchant_id: uklonId })
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

                  return JSON.stringify({ ...design, pages });
                })
            )
        );
    });

    after(async () => {
      await Database("merchants").update({ design_id: null });
      await Database("designs").del();
      await Database("merchants").del();
    });

    it("expected to get valid md5 for merchant with design selected", () =>
      designMD5Request("uklon", (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("md5");
        expect(res.body.md5).to.be.eq(md5(designJson));
      }));

    it("expected to get error for merchant without design selected", () =>
      designMD5Request("bolt", (res) => {
        expect(res).to.have.status(406);
        expect(res.body).to.have.property("error", "invalid_merchant");
      }));

    it("expected to get error for invalid merchant", () =>
      designMD5Request("ddddd", (res) => {
        expect(res).to.have.status(406);
        expect(res.body).to.have.property("error", "invalid_merchant");
      }));
  });
});

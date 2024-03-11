import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";
import { encryptPassword } from "@local/helpers/index.js";

chai.use(chaiHttp);
let uklonId;
const encrypted_password = await encryptPassword("123123");
const designMD5Request = (merchant, callback) =>
  chai
    .request(App)
    .get(`/api/client/design?merchant=${merchant}`)
    .then(callback);

describe("Client", () => {
  describe("GET /api/client/design", () => {
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
    });

    after(async () => {
      await Database("merchants").update({ design_id: null });
      await Database("designs").del();
      await Database("merchants").del();
    });

    it("expected to get valid config for merchant with design selected", () =>
      designMD5Request("uklon", (res) => {
        expect(res).to.have.status(200);
        expect(Object.keys(res.body)).to.eql([
          "id",
          "merchant_id",
          "name",
          "styles",
          "created_at",
          "updated_at",
          "default_page_id",
          "error_page_id",
          "loader_page_id",
          "authenticated_page_id",
          "pages",
        ]);
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

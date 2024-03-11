import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  PROMOTION,
  ALL_PROMOTIONS,
  ALL_PROMOTIONS_META,
} from "@local/test/api/queries.js";
import { MERCHANT_STATUSES, CLIENT_STATUSES } from "@local/constants/index.js";

const TODAY = new Date().toISOString();
const YESTERDAY = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const TOMORROW = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const YEAR_AFTER = new Date(
  Date.now() + 365 * 24 * 60 * 60 * 1000
).toISOString();
const YEAR_AGO = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
const YEAR_AND_DAY_AGO = new Date(
  Date.now() - 366 * 24 * 60 * 60 * 1000
).toISOString();

let variables;
let token;
let uklonId;
const encrypted_password = await encryptPassword("123123");

const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/client/auth/login").send(payload).then(callback);

const accountGraphQLRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/client/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

const defaultMerchant = {
  status: MERCHANT_STATUSES.active.name,
  encrypted_password,
};

describe("Client GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      const merchants = await Database("merchants")
        .insert([
          {
            ...defaultMerchant,
            name: "uklon",
            login: "uklon",
          },
          {
            ...defaultMerchant,
            name: "bolt",
            login: "bolt",
          },
        ])
        .returning("id");

      [{ id: uklonId }] = await Database("merchants")
        .select("id")
        .where({ name: "uklon" });

      const [{ id: client_id }] = await Database("clients")
        .insert({
          merchant_id: uklonId,
          phone: "380630000000",
          encrypted_password: await encryptPassword("123123"),
          session_identifier: "session",
          status: CLIENT_STATUSES.confirmed.name,
        })
        .returning("id");

      await Promise.all(
        merchants.map(async (merchant) => {
          const [{ id: file_id }] = await Database("files")
            .insert({
              name: "test2",
              account_id: merchant.id,
              account_type: "merchants",
              mimetype: "image/jpeg",
              data: Buffer.from("file", "base64"),
            })
            .returning("id");

          await Database("promotions").insert([
            {
              title: "title1",
              text: "text1",
              merchant_id: merchant.id,
              file_id: file_id,
              start_date: YESTERDAY,
              end_date: TOMORROW,
            },
            {
              title: "title2",
              text: "text2",
              merchant_id: merchant.id,
              file_id: file_id,
              start_date: YEAR_AGO,
              end_date: TODAY,
            },
            {
              title: "title3",
              text: "text3",
              merchant_id: merchant.id,
              file_id: file_id,
              start_date: YEAR_AND_DAY_AGO,
              end_date: YESTERDAY,
            },
            {
              title: "title4",
              text: "text3",
              merchant_id: merchant.id,
              file_id: file_id,
              start_date: YESTERDAY,
              end_date: YEAR_AFTER,
            },
          ]);
        })
      );

      const { id: readPromotionId } = await Database("promotions")
        .where({
          merchant_id: uklonId,
          title: "title2",
        })
        .first();

      await Database("client_promotions").insert({
        client_id,
        promotion_id: readPromotionId,
        status: 1,
      });

      ({
        body: { token },
      } = await accountLoginRequest({
        phone: "380630000000",
        password: "123123",
        merchant: "uklon",
      }));
    });

    after(async () => {
      await Database("client_promotions").del();
      await Database("promotions").del();
      await Database("files").del();
      await Database("clients").del();
      await Database("merchants").del();
    });
    afterEach(() => (variables = {}));

    context("MerchantPromotion", () => {
      it("Get merchant promotion without id", () =>
        accountGraphQLRequest(requestBody(PROMOTION), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            'type "ID!" was not provided'
          );
        }));

      it("Get merchant promotion with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(requestBody(PROMOTION), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get merchant promotion with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(requestBody(PROMOTION), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("Promotion", null);
        });
      });

      it("Get merchant promotion with valid id", async () => {
        const { id } = await Database("promotions")
          .where({ merchant_id: uklonId })
          .first();

        variables.id = id;

        return accountGraphQLRequest(requestBody(PROMOTION), (res) => {
          const {
            body: {
              data: { Promotion },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("Promotion", Promotion);
          expect(Object.keys(Promotion)).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get promotion of other merchant by id", async () => {
        const { id } = await Database("promotions")
          .whereNot({ merchant_id: uklonId })
          .first();

        variables.id = id;

        return accountGraphQLRequest(requestBody(PROMOTION), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("Promotion", null);
        });
      });
    });

    context("All Promotions", () => {
      it("Get allPromotions without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(3);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid pagination and empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(3);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid filter(id) and without pagination", async () => {
        const promotion = await Database("promotions")
          .where({ merchant_id: uklonId })
          .first();

        variables.filter = {
          id: promotion.id,
        };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(1);
        });
      });

      it("Get allPromotions with valid filter(id) and pagination", async () => {
        const promotion = await Database("promotions")
          .where({ merchant_id: uklonId })
          .first();

        variables.filter = {
          id: promotion.id,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(1);
        });
      });

      it("Get allPromotions with valid filter(ids) and without pagination", async () => {
        const promotions = await Database("promotions");

        variables.filter = {
          ids: promotions.map((promotion) => promotion.id),
        };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(3);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid filter(ids) and pagination", async () => {
        const promotions = await Database("promotions");

        variables.filter = {
          ids: promotions.map((promotion) => promotion.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(3);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid filter(unreadOnly) and without pagination", () => {
        variables.filter = { unreadOnly: true };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(2);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid filter(unreadOnly) and pagination", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { unreadOnly: true };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(2);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allPromotions with valid perPage", () => {
        variables.perPage = 1;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(1);
        });
      });

      it("Get allPromotions with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allPromotions with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(3);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with invalid sortField", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allPromotions with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPromotions with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(3);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allPromotions with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(3);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(3);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPromotions with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(allPromotions.length).to.be.eq(0);
        });
      });

      it("Get allPromotions with valid filter id", async () => {
        const { id } = await Database("promotions")
          .where({ merchant_id: uklonId })
          .first();

        variables.filter = { id };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(1);
        });
      });

      it("Get allPromotions with invalid filter unreadOnly", () => {
        variables.filter = { unreadOnly: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Boolean cannot represent a non boolean value"
          );
        });
      });

      it("Get allPromotions with filter unreadOnly = false", () => {
        variables.filter = { unreadOnly: false };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(3);
        });
      });

      it("Get allPromotions with filter unreadOnly = true", () => {
        variables.filter = { unreadOnly: true };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(2);
        });
      });

      it("Get allPromotions with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPromotions with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
        };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(allPromotions.length).to.be.eq(0);
        });
      });

      it("Get allPromotions with valid filter ids", async () => {
        const promotions = await Database("promotions");

        variables.filter = { ids: promotions.map((promotion) => promotion.id) };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(3);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });
    });

    context("All Promotions Meta", () => {
      it("Get allPromotionsMeta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(3);
            expect(Object.keys(_allPromotionsMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get allPromotionsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(3);
            expect(Object.keys(_allPromotionsMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter(id) and without pagination", async () => {
        const promotion = await Database("promotions")
          .where({ merchant_id: uklonId })
          .first();

        variables.filter = {
          id: promotion.id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter(id) and pagination", async () => {
        const promotion = await Database("promotions")
          .where({ merchant_id: uklonId })
          .first();

        variables.filter = {
          id: promotion.id,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter(ids) and without pagination", async () => {
        const promotions = await Database("promotions");

        variables.filter = {
          ids: promotions.map((promotion) => promotion.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(3);
            expect(Object.keys(_allPromotionsMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter(ids) and pagination", async () => {
        const promotions = await Database("promotions");

        variables.filter = {
          ids: promotions.map((promotion) => promotion.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(3);
            expect(Object.keys(_allPromotionsMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter(unreadOnly) and without pagination", () => {
        variables.filter = { unreadOnly: true };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(2);
            expect(Object.keys(_allPromotionsMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter(unreadOnly) and pagination", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { unreadOnly: true };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(2);
            expect(Object.keys(_allPromotionsMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get allPromotionsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allPromotionsMeta with valid perPage", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(3);
            expect(Object.keys(_allPromotionsMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get allPromotionsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allPromotionsMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(3);
            expect(Object.keys(_allPromotionsMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get allPromotionsMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allPromotionsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta).to.have.property("count");
            expect(_allPromotionsMeta.count).to.eq(3);
          }
        );
      });

      it("Get allPromotionsMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta).to.have.property("count");
            expect(_allPromotionsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allPromotionsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allPromotionsMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allPromotionsMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta).to.have.property("count");
            expect(_allPromotionsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allPromotionsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allPromotionsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allPromotionsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter id", async () => {
        const { id } = await Database("promotions")
          .where({ merchant_id: uklonId })
          .first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allPromotionsMeta");
            expect(_allPromotionsMeta).to.have.property("count");
            expect(_allPromotionsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allPromotionsMeta with invalid filter unreadOnly", () => {
        variables.filter = { unreadOnly: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Boolean cannot represent a non boolean value"
            );
          }
        );
      });

      it("Get allPromotionsMeta with filter unreadOnly = false", () => {
        variables.filter = { unreadOnly: false };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allPromotionsMeta");
            expect(_allPromotionsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allPromotionsMeta with filter unreadOnly = true", () => {
        variables.filter = { unreadOnly: true };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allPromotionsMeta");
            expect(_allPromotionsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allPromotionsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allPromotionsMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allPromotionsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter ids", async () => {
        const promotions = await Database("promotions");

        variables.filter = { ids: promotions.map((promotion) => promotion.id) };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allPromotionsMeta");
            expect(_allPromotionsMeta).to.have.property("count");
            expect(_allPromotionsMeta.count).to.be.eq(3);
            expect(Object.keys(_allPromotionsMeta)).to.eql(["count"]);
          }
        );
      });
    });
  });
});

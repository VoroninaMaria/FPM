import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  GAS_BRAND_MERCHANT,
  ALL_GAS_BRAND_MERCHANTS,
  ALL_GAS_BRAND_MERCHANTS_META,
} from "@local/test/api/queries.js";
import {
  GAS_BRAND_STATUSES,
  MERCHANT_STATUSES,
  GAS_BRAND_MERCHANT_STATUSES,
} from "@local/constants/index.js";

let variables = {};
let token;
let merchant1;
let merchant2;
let brandKotiki;
let brandKotiki1;

const testImage2 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAEAAQDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9TLS3ktomSS5lu2MjuJJggYBnLBPlVRhQQo4zhRksckpaAf/Z";

const encrypted_password = await encryptPassword("123123");
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

const defaultMerchant = {
  status: MERCHANT_STATUSES.active.name,
};

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/merchant/auth/login")
    .send(payload)
    .then(callback);

const accountGraphQLRequest = (payload, authHeader, callback) =>
  chai
    .request(App)
    .post("/api/merchant/graphql")
    .set("Authorization", authHeader)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Merchant GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      [merchant1] = await Database("merchants")
        .insert({
          ...defaultMerchant,
          name: "uklon",
          encrypted_password,
          login: "uklon",
        })
        .returning("*");

      [merchant2] = await Database("merchants")
        .insert({
          ...defaultMerchant,
          name: "opti",
          encrypted_password,
          login: "opti",
        })
        .returning("*");

      const [file] = await Database("files")
        .insert({
          name: "test2",
          account_id: merchant1.id,
          account_type: "merchants",
          mimetype: "image/jpeg",
          size: "1024",
          data: Buffer.from(testImage2, "base64"),
        })
        .returning("*");

      [brandKotiki] = await Database("gas_brands")
        .insert({
          name: "Kotiki",
          logo_file_id: file.id,
          status: GAS_BRAND_STATUSES.active.name,
        })
        .returning("*");

      [brandKotiki1] = await Database("gas_brands")
        .insert({
          name: "Kotiki1",
          logo_file_id: file.id,
          status: GAS_BRAND_STATUSES.active.name,
        })
        .returning("*");

      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .insert({
          merchant_id: merchant1.id,
          gas_brand_id: brandKotiki.id,
          status: GAS_BRAND_MERCHANT_STATUSES.active.name,
        })
        .returning("*");

      await Database("gas_brand_merchants")
        .insert([
          {
            merchant_id: merchant2.id,
            gas_brand_id: brandKotiki.id,
            status: GAS_BRAND_MERCHANT_STATUSES.active.name,
          },
          {
            merchant_id: merchant1.id,
            gas_brand_id: brandKotiki1.id,
            status: GAS_BRAND_MERCHANT_STATUSES.blocked.name,
          },
        ])
        .returning("*");

      await Database("gbm_fuels").insert({
        gas_brand_merchant_id: gas_brand_merchant.id,
        name: "f1",
        regular_price: 1,
        discount_price: 1,
        status: GAS_BRAND_MERCHANT_STATUSES.active.name,
      });

      ({
        body: { token },
      } = await accountLoginRequest({
        login: "uklon",
        password: "123123",
      }));
    });

    after(async () => {
      await Database("gbm_fuels").del();
      await Database("gas_brand_merchants").del();
      await Database("gas_brands").del();
      await Database("files").del();
      await Database("merchants").del();
    });
    afterEach(() => (variables = {}));

    context("GasBrandMerchant", () => {
      it("Get gasBrandMerchant without id", () =>
        accountGraphQLRequest(
          requestBody(GAS_BRAND_MERCHANT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get gasBrandMerchant with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(GAS_BRAND_MERCHANT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get gasBrandMerchant with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(GAS_BRAND_MERCHANT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("GasBrandMerchant", null);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get gasBrandMerchant with valid id", async () => {
        const gbm = await Database("gas_brand_merchants")
          .where({
            merchant_id: merchant1.id,
            gas_brand_id: brandKotiki.id,
          })
          .first();

        variables.id = gbm.id;

        return accountGraphQLRequest(
          requestBody(GAS_BRAND_MERCHANT),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { GasBrandMerchant },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "GasBrandMerchant",
              GasBrandMerchant
            );
            expect(Object.keys(GasBrandMerchant)).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get gasBrandMerchant with valid id other merchant", async () => {
        const gbm = await Database("gas_brand_merchants")
          .where({
            merchant_id: merchant2.id,
          })
          .first();

        variables.id = gbm.id;

        return accountGraphQLRequest(
          requestBody(GAS_BRAND_MERCHANT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("GasBrandMerchant", null);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });
    });

    context("All gasBrandMerchants", () => {
      it("Get allGasBrandMerchants without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with valid pagination and empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with valid filter(id) and without pagination", async () => {
        const gasBrandMerchant = await Database("gas_brand_merchants")
          .where({ merchant_id: merchant1.id, gas_brand_id: brandKotiki.id })
          .first();

        variables.filter = {
          id: gasBrandMerchant.id,
          merchant_id: gasBrandMerchant.merchant_id,
          gas_brand_id: gasBrandMerchant.gas_brand_id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(1);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with valid filter(ids) and without pagination", async () => {
        const gasBrandMerchants = await Database("gas_brand_merchants");

        variables.filter = {
          ids: gasBrandMerchants.map((gbm) => gbm.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with valid filter(id) and pagination", async () => {
        const gasBrandMerchant = await Database("gas_brand_merchants")
          .where({ merchant_id: merchant1.id, gas_brand_id: brandKotiki.id })
          .first();

        variables.filter = {
          id: gasBrandMerchant.id,
          merchant_id: gasBrandMerchant.merchant_id,
          gas_brand_id: gasBrandMerchant.brand_id,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(1);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with valid filter(ids) and pagination", async () => {
        const gasbrandMerchants = await Database("gas_brand_merchants");

        variables.filter = {
          ids: gasbrandMerchants.map((gbm) => gbm.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allGasBrandMerchants with valid perPage", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allGasBrandMerchants with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with invalid sortField", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrandMerchants with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandMerchants with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrandMerchants with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandMerchants with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allGasBrandMerchants.length).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrandMerchants with valid filter id", async () => {
        const gasBrandMerchant = await Database("gas_brand_merchants")
          .where({ merchant_id: merchant1.id, gas_brand_id: brandKotiki.id })
          .first();

        variables.filter = { id: gasBrandMerchant.id };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(1);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandMerchants with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allGasBrandMerchants.length).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrandMerchants with valid filter ids", async () => {
        const gasBrandMerchants = await Database("gas_brand_merchants");

        variables.filter = { ids: gasBrandMerchants.map((gbm) => gbm.id) };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandMerchants with filter merchant_id which does not exist", () => {
        variables.filter = { merchant_id: "test-merchant-id" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allGasBrandMerchants",
              allGasBrandMerchants,
              null
            );
          }
        );
      });

      it("Get allGasBrandMerchants with valid filter merchant_id", async () => {
        const gasBrandMerchant = await Database("gas_brand_merchants")
          .where({ gas_brand_id: brandKotiki.id })
          .first();

        variables.filter = { merchant_id: gasBrandMerchant.merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrandMerchants with invalid filter brand_id", () => {
        variables.filter = { gas_brand_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandMerchants with filter brand_id which does not exist", () => {
        variables.filter = { gas_brand_id: "test-brand-id" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allGasBrandMerchants",
              allGasBrandMerchants,
              null
            );
          }
        );
      });

      it("Get allGasBrandMerchants with valid filter brand_id", async () => {
        const gasBrandMerchant = await Database("gas_brand_merchants")
          .where({ merchant_id: merchant1.id })
          .first();

        variables.filter = { gas_brand_id: gasBrandMerchant.gas_brand_id };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrandMerchants");
            expect(allGasBrandMerchants.length).to.be.eq(1);
            expect(Object.keys(allGasBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "gas_brand_id",
              "fuels",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Gas Brands Meta", () => {
      it("Get allGasBrandMerchantsMeta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid filter(id) and without pagination", async () => {
        const gasBrandMerchant = await Database("gas_brand_merchants")
          .where({ merchant_id: merchant1.id, gas_brand_id: brandKotiki.id })
          .first();

        variables.filter = {
          id: gasBrandMerchant.id,
          merchant_id: gasBrandMerchant.merchant_id,
          gas_brand_id: gasBrandMerchant.gas_brand_id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid filter(ids) and without pagination", async () => {
        const gasbrandMerchants = await Database("gas_brand_merchants");

        variables.filter = {
          ids: gasbrandMerchants.map((gbm) => gbm.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid filter(id) and pagination", async () => {
        const gasbrandMerchants = await Database("gas_brand_merchants").first();

        variables.filter = {
          id: gasbrandMerchants.id,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid filter(ids) and pagination", async () => {
        const gasbrandMerchants = await Database("gas_brand_merchants");

        variables.filter = {
          ids: gasbrandMerchants.map((gasbrandMerchant) => gasbrandMerchant.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid perPage", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta).to.have.property("count");
            expect(_allGasBrandMerchantsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta).to.have.property("count");
            expect(_allGasBrandMerchantsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allGasBrandMerchantsMeta",
              _allGasBrandMerchantsMeta
            );
            expect(_allGasBrandMerchantsMeta).to.have.property("count");
            expect(_allGasBrandMerchantsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid filter id", async () => {
        const { id } = await Database("gas_brand_merchants").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allGasBrandMerchantsMeta");
            expect(_allGasBrandMerchantsMeta).to.have.property("count");
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid filter ids", async () => {
        const gasbrandMerchants = await Database("brand_merchants");

        variables.filter = {
          ids: gasbrandMerchants.map((gasbrandMerchant) => gasbrandMerchant.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allGasBrandMerchantsMeta");
            expect(_allGasBrandMerchantsMeta).to.have.property("count");
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "09bb7ccf-8b64-4873-bba2-d68ee6e0c098",
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allGasBrandMerchantsMeta).to.have.property("count");
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("gas_brand_merchants")
          .where({ gas_brand_id: brandKotiki.id })
          .first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allGasBrandMerchantsMeta");
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(2);
            expect(_allGasBrandMerchantsMeta).to.have.property("count");
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with invalid filter gas_brand_id", () => {
        variables.filter = { gas_brand_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandMerchantsMeta with filter gas_brand_id which does not exist", () => {
        variables.filter = {
          gas_brand_id: "09bb7ccf-8b64-4873-bba2-d68ee6e0c098",
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allGasBrandMerchantsMeta).to.have.property("count");
            expect(_allGasBrandMerchantsMeta.count).to.be.eq(0);
          }
        );
      });
    });
  });
});

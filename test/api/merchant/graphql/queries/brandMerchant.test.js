import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  BRAND_MERCHANT,
  ALL_BRAND_MERCHANTS,
  ALL_BRAND_MERCHANTS_META,
} from "@local/test/api/queries.js";
import { BRAND_STATUSES, MERCHANT_STATUSES } from "@local/constants/index.js";

let variables = {};
let token;
let brandKotiki;
let brandMinions;
let merchant1;
let merchant2;

const encrypted_password = await encryptPassword("123123");
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/admin/auth/login").send(payload).then(callback);

const accountGraphQLRequest = (payload, authHeader, callback) =>
  chai
    .request(App)
    .post("/api/admin/graphql")
    .set("Authorization", authHeader)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

const defaultMerchant = {
  status: MERCHANT_STATUSES.active.name,
};

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
          name: "bolt",
          encrypted_password,
          login: "bolt",
        })
        .returning("*");

      [brandKotiki] = await Database("brands")
        .insert({
          name: "Kotiki",
          default_config: {
            Apikey: "123123123123",
            partnerId: "businki",
          },
          status: BRAND_STATUSES.active.name,
        })
        .returning("*");

      [brandMinions] = await Database("brands")
        .insert({
          name: "Minions",
          default_config: {
            Apikey: "456456456456",
            partnerId: "bubochki",
          },
          status: BRAND_STATUSES.active.name,
        })
        .returning("*");

      await Database("brand_merchants")
        .insert({
          merchant_id: merchant2.id,
          brand_id: brandKotiki.id,
          config: {
            Apikey: "123123123123",
            partnerId: "kotiki",
          },
        })
        .onConflict(["merchant_id", "brand_id"])
        .merge();

      await Database("brand_merchants")
        .insert({
          merchant_id: merchant1.id,
          brand_id: brandMinions.id,
          config: {},
        })
        .onConflict(["merchant_id", "brand_id"])
        .merge();

      await Database("admins")
        .insert({
          login: "offtop",
          encrypted_password,
        })
        .returning("*");

      ({
        body: { token },
      } = await accountLoginRequest({
        login: "offtop",
        password: "123123",
      }));
    });

    after(async () => {
      await Database("brand_merchants").del();
      await Database("merchants").del();
      await Database("brands").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("BrandMerchant", () => {
      it("Get brandMerchant without id", () =>
        accountGraphQLRequest(
          requestBody(BRAND_MERCHANT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get brandMerchant with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(BRAND_MERCHANT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get brandMerchant with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(BRAND_MERCHANT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("BrandMerchant", null);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get brandMerchant with valid id", async () => {
        const bm = await Database("brand_merchants")
          .where({
            merchant_id: merchant1.id,
            brand_id: brandMinions.id,
          })
          .first();

        variables.id = bm.id;

        return accountGraphQLRequest(
          requestBody(BRAND_MERCHANT),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { BrandMerchant },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "BrandMerchant",
              BrandMerchant
            );
            expect(Object.keys(BrandMerchant)).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All brandMerchants", () => {
      it("Get allBrandMerchants without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with valid pagination and empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with valid filter(id) and without pagination", async () => {
        const brandMerchant = await Database("brand_merchants")
          .where({ merchant_id: merchant2.id, brand_id: brandKotiki.id })
          .first();

        variables.filter = {
          id: brandMerchant.id,
          merchant_id: brandMerchant.merchant_id,
          brand_id: brandMerchant.brand_id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(1);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with valid filter(ids) and without pagination", async () => {
        const brandMerchants = await Database("brand_merchants");

        variables.filter = {
          ids: brandMerchants.map((bm) => bm.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with valid filter(id) and pagination", async () => {
        const brandMerchant = await Database("brand_merchants")
          .where({ merchant_id: merchant2.id, brand_id: brandKotiki.id })
          .first();

        variables.filter = {
          id: brandMerchant.id,
          merchant_id: brandMerchant.merchant_id,
          brand_id: brandMerchant.brand_id,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(1);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with valid filter(ids) and pagination", async () => {
        const brandMerchants = await Database("brand_merchants");

        variables.filter = {
          ids: brandMerchants.map((bm) => bm.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allBrandMerchants with valid perPage", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allBrandMerchants with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with invalid sortField", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allBrandMerchants with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandMerchants with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allBrandMerchants with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandMerchants with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allBrandMerchants.length).to.be.eq(0);
          }
        );
      });

      it("Get allBrandMerchants with valid filter id", async () => {
        const brandMerchant = await Database("brand_merchants")
          .where({ merchant_id: merchant2.id, brand_id: brandKotiki.id })
          .first();

        variables.filter = { id: brandMerchant.id };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(1);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandMerchants with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allBrandMerchants.length).to.be.eq(0);
          }
        );
      });

      it("Get allBrandMerchants with valid filter ids", async () => {
        const brandMerchants = await Database("brand_merchants");

        variables.filter = { ids: brandMerchants.map((bm) => bm.id) };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(2);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandMerchants with filter merchant_id which does not exist", () => {
        variables.filter = { merchant_id: "test-merchant-id" };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allBrandMerchants",
              allBrandMerchants,
              null
            );
          }
        );
      });

      it("Get allBrandMerchants with valid filter merchant_id", async () => {
        const brandMerchant = await Database("brand_merchants")
          .where({ brand_id: brandMinions.id })
          .first();

        variables.filter = { merchant_id: brandMerchant.merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(1);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrandMerchants with invalid filter brand_id", () => {
        variables.filter = { brand_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandMerchants with filter brand_id which does not exist", () => {
        variables.filter = { brand_id: "test-brand-id" };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allBrandMerchants",
              allBrandMerchants,
              null
            );
          }
        );
      });

      it("Get allBrandMerchants with valid filter brand_id", async () => {
        const brandMerchant = await Database("brand_merchants")
          .where({ merchant_id: merchant2.id })
          .first();

        variables.filter = { brand_id: brandMerchant.brand_id };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrandMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrandMerchants");
            expect(allBrandMerchants.length).to.be.eq(1);
            expect(Object.keys(allBrandMerchants[0])).to.eql([
              "id",
              "merchant_id",
              "brand_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Brands Meta", () => {
      it("Get allBrandMerchantsMeta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid filter(id) and without pagination", async () => {
        const brandMerchant = await Database("brand_merchants")
          .where({ merchant_id: merchant1.id, brand_id: brandMinions.id })
          .first();

        variables.filter = {
          id: brandMerchant.id,
          merchant_id: brandMerchant.merchant_id,
          brand_id: brandMerchant.brand_id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid filter(ids) and without pagination", async () => {
        const brandMerchants = await Database("brand_merchants");

        variables.filter = {
          ids: brandMerchants.map((bm) => bm.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid filter(id) and pagination", async () => {
        const brand = await Database("brand_merchants").first();

        variables.filter = {
          id: brand.id,
          name: brand.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid filter(ids) and pagination", async () => {
        const brands = await Database("brand_merchants");

        variables.filter = {
          ids: brands.map((brand) => brand.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandMerchantsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid perPage", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandMerchantsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandMerchantsMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allBrandMerchantsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta).to.have.property("count");
            expect(_allBrandMerchantsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta).to.have.property("count");
            expect(_allBrandMerchantsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allBrandMerchantsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allBrandMerchantsMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allBrandMerchantsMeta",
              _allBrandMerchantsMeta
            );
            expect(_allBrandMerchantsMeta).to.have.property("count");
            expect(_allBrandMerchantsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allBrandMerchantsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandMerchantsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allBrandMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid filter id", async () => {
        const { id } = await Database("brand_merchants").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allBrandMerchantsMeta");
            expect(_allBrandMerchantsMeta).to.have.property("count");
            expect(_allBrandMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allBrandMerchantsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandMerchantsMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allBrandMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid filter ids", async () => {
        const brands = await Database("brand_merchants");

        variables.filter = { ids: brands.map((brand) => brand.id) };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allBrandMerchantsMeta");
            expect(_allBrandMerchantsMeta).to.have.property("count");
            expect(_allBrandMerchantsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandMerchantsMeta with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandMerchantsMeta with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "09bb7ccf-8b64-4873-bba2-d68ee6e0c098",
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allBrandMerchantsMeta).to.have.property("count");
            expect(_allBrandMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("brand_merchants")
          .where({ brand_id: brandKotiki.id })
          .first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allBrandMerchantsMeta");
            expect(_allBrandMerchantsMeta.count).to.be.eq(1);
            expect(_allBrandMerchantsMeta).to.have.property("count");
          }
        );
      });

      it("Get allBrandMerchantsMeta with invalid filter brand_id", () => {
        variables.filter = { brand_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandMerchantsMeta with filter brand_id which does not exist", () => {
        variables.filter = {
          brand_id: "09bb7ccf-8b64-4873-bba2-d68ee6e0c098",
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allBrandMerchantsMeta).to.have.property("count");
            expect(_allBrandMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allBrandMerchantsMeta with valid pagination and filter brand_id", async () => {
        const { brand_id } = await Database("brand_merchants")
          .where({ merchant_id: merchant2.id })
          .first();

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { brand_id };

        return accountGraphQLRequest(
          requestBody(ALL_BRAND_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allBrandMerchantsMeta");
            expect(_allBrandMerchantsMeta.count).to.be.eq(1);
            expect(_allBrandMerchantsMeta).to.have.property("count");
          }
        );
      });
    });
  });
});

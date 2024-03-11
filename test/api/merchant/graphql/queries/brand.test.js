import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  MERCHANT_BRAND as BRAND,
  MERCHANT_ALL_BRANDS as ALL_BRANDS,
  MERCHANT_ALL_BRANDS_META as ALL_BRANDS_META,
} from "@local/test/api/queries.js";
import { BRAND_STATUSES, MERCHANT_STATUSES } from "@local/constants/index.js";

let variables = {};
let token;

const encrypted_password = await encryptPassword("123123");
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

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
      await Database("brands")
        .insert([
          {
            name: "Kotiki",
            default_config: {
              Apikey: "123123123123",
              partnerId: "businki",
            },
            status: BRAND_STATUSES.active.name,
          },
          {
            name: "Minions",
            default_config: {
              Apikey: "456456456456",
              partnerId: "bubochki",
            },
            status: BRAND_STATUSES.active.name,
          },
        ])
        .onConflict("name")
        .merge();

      await Database("merchants")
        .insert({
          login: "bolt",
          name: "bolt",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
        })
        .returning("*");

      ({
        body: { token },
      } = await accountLoginRequest({
        login: "bolt",
        password: "123123",
      }));
    });

    after(async () => {
      await Database("brands").del();
      await Database("merchants").del();
    });
    afterEach(() => (variables = {}));

    context("Merchant Brand", () => {
      it("Get brand without id", () =>
        accountGraphQLRequest(requestBody(BRAND), `Bearer ${token}`, (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            'type "ID!" was not provided'
          );
        }));

      it("Get brand with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(BRAND),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get brand with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(BRAND),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("Brand", null);
          }
        );
      });

      it("Get brand with valid id", async () => {
        const { id } = await Database("brands").first();

        variables.id = id;

        return accountGraphQLRequest(
          requestBody(BRAND),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Brand },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("Brand", Brand);
            expect(Object.keys(Brand)).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All merchantBrands", () => {
      it("Get allBrands without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(2);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with valid pagination and empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(2);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with valid filter(id) and without pagination", async () => {
        const brand = await Database("brands").first();

        variables.filter = {
          id: brand.id,
          name: brand.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(1);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with valid filter(ids) and without pagination", async () => {
        const brands = await Database("brands");

        variables.filter = {
          ids: brands.map((brand) => brand.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(2);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with valid filter(id) and pagination", async () => {
        const brand = await Database("brands").first();

        variables.filter = {
          id: brand.id,
          name: brand.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(1);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with valid filter(ids) and pagination", async () => {
        const brands = await Database("brands");

        variables.filter = {
          ids: brands.map((brand) => brand.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(2);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allBrands with valid perPage", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(2);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allBrands with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(2);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with invalid sortField", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allBrands with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrands with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(2);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allBrands with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(2);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(2);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrands with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allBrands.length).to.be.eq(0);
          }
        );
      });

      it("Get allBrands with valid filter id", async () => {
        const { id } = await Database("brands").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(1);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrands with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allBrands.length).to.be.eq(0);
          }
        );
      });

      it("Get allBrands with valid filter ids", async () => {
        const brands = await Database("brands");

        variables.filter = { ids: brands.map((brand) => brand.id) };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(2);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allBrands with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allBrands with filter name which does not exist", () => {
        variables.filter = { name: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allBrands", allBrands);
            expect(allBrands.length).to.be.eq(0);
          }
        );
      });

      it("Get allBrands with valid filter name", async () => {
        const { name } = await Database("brands").first();

        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allBrands");
            expect(allBrands.length).to.be.eq(1);
            expect(Object.keys(allBrands[0])).to.eql([
              "id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Brands Meta", () => {
      it("Get allBrandsMeta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandsMeta with valid filter(id) and without pagination", async () => {
        const brand = await Database("brands").first();

        variables.filter = {
          id: brand.id,
          name: brand.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allBrandsMeta with valid filter(ids) and without pagination", async () => {
        const brands = await Database("brands");

        variables.filter = {
          ids: brands.map((brand) => brand.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandsMeta with valid filter(id) and pagination", async () => {
        const brand = await Database("brands").first();

        variables.filter = {
          id: brand.id,
          name: brand.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allBrandsMeta with valid filter(ids) and pagination", async () => {
        const brands = await Database("brands");

        variables.filter = {
          ids: brands.map((brand) => brand.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allBrandsMeta with valid perPage", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allBrandsMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandsMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allBrandsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta).to.have.property("count");
            expect(_allBrandsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allBrandsMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta).to.have.property("count");
            expect(_allBrandsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allBrandsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allBrandsMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allBrandsMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allBrandsMeta",
              _allBrandsMeta
            );
            expect(_allBrandsMeta).to.have.property("count");
            expect(_allBrandsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allBrandsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allBrandsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allBrandsMeta with valid filter id", async () => {
        const { id } = await Database("brands").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allBrandsMeta");
            expect(_allBrandsMeta).to.have.property("count");
            expect(_allBrandsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allBrandsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allBrandsMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allBrandsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allBrandsMeta with valid filter ids", async () => {
        const brands = await Database("brands");

        variables.filter = { ids: brands.map((brand) => brand.id) };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allBrandsMeta");
            expect(_allBrandsMeta).to.have.property("count");
            expect(_allBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allBrandsMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allBrandsMeta with filter name which does not exist", () => {
        variables.filter = { name: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allBrandsMeta).to.have.property("count");
            expect(_allBrandsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allBrandsMeta with valid pagination and filter name", async () => {
        const { name } = await Database("brands").first();

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allBrandsMeta");
            expect(_allBrandsMeta.count).to.be.eq(1);
            expect(_allBrandsMeta).to.have.property("count");
          }
        );
      });
    });
  });
});

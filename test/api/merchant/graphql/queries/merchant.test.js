import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  MERCHANT,
  ALL_MERCHANTS,
  ALL_MERCHANTS_META,
} from "@local/test/api/queries.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let variables = {};
let token;

const operationvalue = null;
const requestBody = (query) => ({ query: query, variables, operationvalue });
const encrypted_password = await encryptPassword("123123");

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

const defaultMerchant = {
  status: MERCHANT_STATUSES.active.name,
};

describe("Merchant GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      await Database("merchants")
        .insert({
          ...defaultMerchant,
          name: "uklon",
          encrypted_password,
          login: "uklon",
        })
        .returning("*");

      ({
        body: { token },
      } = await accountLoginRequest({
        login: "uklon",
        password: "123123",
      }));
    });

    after(() => Database("merchants").del());
    afterEach(() => (variables = {}));

    context("Merchant", () => {
      it("Get merchant without id", () =>
        accountGraphQLRequest(
          requestBody(MERCHANT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get merchant with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(MERCHANT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get merchant with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(MERCHANT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("Merchant", null);
          }
        );
      });

      it("Get merchant with valid id", async () => {
        const { id } = await Database("merchants").first();

        variables.id = id;

        return accountGraphQLRequest(
          requestBody(MERCHANT),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Merchant },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("Merchant", Merchant);
            expect(Object.keys(Merchant)).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All merchants", () => {
      it("Get allMerchants without pagination and empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchants with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchants with valid filter and without pagination", async () => {
        const merchant = await Database("merchants").first();

        variables.filter = {
          id: merchant.id,
          login: merchant.login,
        };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchants with valid filter and pagination", async () => {
        const merchant = await Database("merchants").first();

        variables.filter = {
          id: merchant.id,
          value: merchant.value,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchants with invalid perPage and empty filter", () => {
        variables.perPage = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allMerchants with valid perPage empty filter", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchants with invalid page and empty filter", () => {
        variables.page = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allMerchants with valid page and empty filter", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchants with invalid sortField and empty filter", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allMerchants with sortField which does not exist and empty filter", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allMerchants with valid sortField and empty filter", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchants with invalid sortOrder and empty filter", () => {
        variables.sortOrder = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allMerchants with sortOrder which does not exist and empte filter", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchants with valid sortOrder and empty filter", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchants with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allMerchants with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allMerchants.length).to.be.eq(0);
          }
        );
      });

      it("Get allMerchants with valid filter id", async () => {
        const { id } = await Database("merchants").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchants with invalid filter login", () => {
        variables.filter = { login: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allMerchants with filter login which does not exist", () => {
        variables.filter = { login: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allMerchants.length).to.be.eq(0);
          }
        );
      });

      it("Get allMerchants with valid filter login", async () => {
        const { login } = await Database("merchants").first();

        variables.filter = { login };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchants },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(1);
            expect(Object.keys(allMerchants[0])).to.eql([
              "id",
              "default_category_id",
              "login",
              "name",
              "status",
              "sms_fallback",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All merchantsMeta", () => {
      it("Get allMerchantsMeta without pagination and empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with valid filter and without pagination", async () => {
        const merchant = await Database("merchants").first();

        variables.filter = {
          id: merchant.id,
          login: merchant.login,
        };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with valid filter and pagination", async () => {
        const merchant = await Database("merchants").first();

        variables.filter = {
          id: merchant.id,
          value: merchant.value,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with invalid perPage and empty filter", () => {
        variables.perPage = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allMerchantsMeta with valid perPage and empty filter", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with invalid page and empty filter", () => {
        variables.page = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allMerchantsMeta with valid page and empty filter", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with invalid sortField and empty filter", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allMerchantsMeta with sortField which does not exist and empty filter", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with valid sortField and empty filter", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with invalid sortOrder and empty filter", () => {
        variables.sortOrder = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allMerchantsMeta with sortOrder which does not exist and empty filter", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with valid sortOrder and empty filter", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allMerchantsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allMerchantsMeta with valid filter id", async () => {
        const { id } = await Database("merchants").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with invalid filter login", () => {
        variables.filter = { login: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allMerchantsMeta with filter login which does not exist", () => {
        variables.filter = { login: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allMerchantsMeta with valid filter login", async () => {
        const { login } = await Database("merchants").first();

        variables.filter = { login };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });
    });
  });
});

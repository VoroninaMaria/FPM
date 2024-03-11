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

describe("Admin GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      await Database("merchants")
        .insert([
          {
            ...defaultMerchant,
            name: "uklon",
            encrypted_password,
            login: "uklon",
          },
          {
            ...defaultMerchant,
            name: "uber",
            encrypted_password,
            login: "uber",
          },
          {
            ...defaultMerchant,
            name: "bolt",
            encrypted_password,
            login: "bolt",
          },
          {
            ...defaultMerchant,
            name: "opti",
            encrypted_password,
            login: "opti",
          },
        ])
        .onConflict("name")
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
      await Database("merchants").del();
      await Database("admins").del();
    });
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
      it("Get allMerchants without pagination with empty filter", () => {
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
            expect(res.body.data).to.have.property("allMerchants");
            expect(allMerchants.length).to.be.eq(4);
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

      it("Get allMerchants with valid pagination and empty filter", () => {
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
            expect(allMerchants.length).to.be.eq(4);
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

      it("Get allMerchants with valid filter(id) and without pagination", async () => {
        const merchant = await Database("merchants").first();

        variables.filter = {
          id: merchant.id,
          status: merchant.status,
          login: merchant.login,
          name: merchant.name,
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
            expect(res.body.data).to.have.property("allMerchants");
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

      it("Get allMerchants with valid filter(ids) and without pagination", async () => {
        const merchants = await Database("merchants");

        variables.filter = {
          ids: merchants.map((merchant) => merchant.id),
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
            expect(res.body.data).to.have.property("allMerchants");
            expect(allMerchants.length).to.be.eq(4);
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

      it("Get allMerchants with valid filter(id) and pagination", async () => {
        const merchant = await Database("merchants").first();

        variables.filter = {
          id: merchant.id,
          status: merchant.status,
          login: merchant.login,
          name: merchant.name,
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
            expect(res.body.data).to.have.property("allMerchants");
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

      it("Get allMerchants with valid filter(ids) and pagination", async () => {
        const merchants = await Database("merchants");

        variables.filter = {
          ids: merchants.map((merchant) => merchant.id),
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
            expect(res.body.data).to.have.property("allMerchants");
            expect(allMerchants.length).to.be.eq(4);
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

      it("Get allMerchants with invalid perPage", () => {
        variables.perPage = "edrfgh";

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

      it("Get allMerchants with valid perPage", () => {
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
            expect(res.body.data).to.have.property("allMerchants");
            expect(allMerchants.length).to.be.eq(4);
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

      it("Get allMerchants with invalid page", () => {
        variables.page = "edrfgh";

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

      it("Get allMerchants with valid page", () => {
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
            expect(res.body.data).to.have.property("allMerchants");
            expect(allMerchants.length).to.be.eq(4);
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

      it("Get allMerchants with invalid sortField", () => {
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

      it("Get allMerchants with sortField which does not exist", () => {
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

      it("Get allMerchants with valid sortField", () => {
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
            expect(allMerchants.length).to.be.eq(4);
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

      it("Get allMerchants with invalid sortOrder", () => {
        variables.sortOrder = 5;

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

      it("Get allMerchants with sortOrder which does not exist !!!", () => {
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
            expect(allMerchants.length).to.be.eq(4);
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

      it("Get allMerchants with valid sortOrder", () => {
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
            expect(allMerchants.length).to.be.eq(4);
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
            expect(res.body.data).to.have.property("allMerchants");
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

      it("Get allMerchants with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allMerchants with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
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
            expect(allMerchants.length).to.be.eq(0);
          }
        );
      });

      it("Get allMerchants with valid filter ids", async () => {
        const merchants = await Database("merchants");

        variables.filter = { ids: merchants.map((merchant) => merchant.id) };

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
            expect(res.body.data).to.have.property("allMerchants");
            expect(allMerchants.length).to.be.eq(4);
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

      it("Get allMerchants with invalid filter status", () => {
        variables.filter = { status: 2 };

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

      it("Get allMerchants with filter status which does not exist", () => {
        variables.filter = { status: "test" };

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

      it("Get allMerchants with valid filter status", () => {
        variables.filter = { status: MERCHANT_STATUSES.active.name };

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
            expect(res.body.data).to.have.property("allMerchants");
            expect(allMerchants.length).to.be.eq(4);
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

      it("Get allMerchants with invalid filter name", () => {
        variables.filter = { name: 2 };

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

      it("Get allMerchants with filter name which does not exist", () => {
        variables.filter = { name: "show" };

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
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants
            );
            expect(allMerchants.length).to.be.eq(0);
          }
        );
      });

      it("Get allMerchants with valid filter name", async () => {
        const { name } = await Database("merchants").first();

        variables.filter = { name };

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
            expect(res.body.data).to.have.property("allMerchants");
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
        variables.filter = { login: "Zxcvbnjmkl" };

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
            expect(res.body.data).to.have.property(
              "allMerchants",
              allMerchants,
              null
            );
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
            expect(res.body.data).to.have.property("allMerchants");
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

    context("All Merchants Meta", () => {
      it("Get allMerchantsMeta without pagination with empty filter", () => {
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
            expect(_allMerchantsMeta.count).to.be.eq(4);
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
            expect(_allMerchantsMeta.count).to.be.eq(4);
          }
        );
      });

      it("Get allMerchantsMeta with valid filter(id) and without pagination", async () => {
        const merchant = await Database("merchants").first();

        variables.filter = {
          id: merchant.id,
          status: merchant.status,
          login: merchant.login,
          name: merchant.name,
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

      it("Get allMerchantsMeta with valid filter(ids) and without pagination", async () => {
        const merchants = await Database("merchants");

        variables.filter = {
          ids: merchants.map((merchant) => merchant.id),
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
            expect(_allMerchantsMeta.count).to.be.eq(4);
          }
        );
      });

      it("Get allMerchantsMeta with valid filter(id) and pagination", async () => {
        const merchant = await Database("merchants").first();

        variables.filter = {
          id: merchant.id,
          status: merchant.status,
          login: merchant.login,
          name: merchant.name,
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

      it("Get allMerchantsMeta with valid filter(ids) and pagination", async () => {
        const merchants = await Database("merchants");

        variables.filter = {
          ids: merchants.map((merchant) => merchant.id),
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
            expect(_allMerchantsMeta.count).to.be.eq(4);
          }
        );
      });

      it("Get allMerchantsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

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

      it("Get allMerchantsMeta with valid perPage", () => {
        variables.perPage = 4;
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
            expect(_allMerchantsMeta.count).to.be.eq(4);
          }
        );
      });

      it("Get allMerchantsMeta with invalid page", () => {
        variables.page = "edrfgh";

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

      it("Get allMerchantsMeta with valid page", () => {
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
            expect(_allMerchantsMeta.count).to.be.eq(4);
          }
        );
      });

      it("Get allMerchantsMeta with invalid sortField", () => {
        variables.sortField = 5;

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

      it("Get allMerchantsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
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
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta).to.have.property("count");
            expect(_allMerchantsMeta.count).to.eq(4);
          }
        );
      });

      it("Get allMerchantsMeta with valid sortField", () => {
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
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta).to.have.property("count");
            expect(_allMerchantsMeta.count).to.eq(4);
          }
        );
      });

      it("Get allMerchantsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

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

      it("Get allMerchantsMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allMerchantsMeta with valid sortOrder", () => {
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
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta
            );
            expect(_allMerchantsMeta).to.have.property("count");
            expect(_allMerchantsMeta.count).to.eq(4);
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

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("_allMerchantsMeta");
            expect(_allMerchantsMeta).to.have.property("count");
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allMerchantsMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
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
            expect(_allMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allMerchantsMeta with valid filter ids", async () => {
        const merchants = await Database("merchants");

        variables.filter = { ids: merchants.map((merchant) => merchant.id) };

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
            expect(res.body.data).to.have.property("_allMerchantsMeta");
            expect(_allMerchantsMeta).to.have.property("count");
            expect(_allMerchantsMeta.count).to.be.eq(4);
          }
        );
      });

      it("Get allMerchantsMeta with invalid filter status", () => {
        variables.filter = { status: 2 };

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

      it("Get allMerchantsMeta with filter status which does not exist", () => {
        variables.filter = { status: "test" };

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
            expect(_allMerchantsMeta).to.have.property("count");
            expect(_allMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allMerchantsMeta with valid filter status", () => {
        variables.filter = { status: MERCHANT_STATUSES.active.name };

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
            expect(res.body.data).to.have.property("_allMerchantsMeta");
            expect(_allMerchantsMeta).to.have.property("count");
            expect(_allMerchantsMeta.count).to.be.eq(4);
          }
        );
      });

      it("Get allMerchantsMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

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

      it("Get allMerchantsMeta with filter name which does not exist", () => {
        variables.filter = { name: "test" };

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
            expect(_allMerchantsMeta).to.have.property("count");
            expect(_allMerchantsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allMerchantsMeta with valid pagination and filter name", async () => {
        const { name } = await Database("merchants").first();

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { name };

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
            expect(res.body.data).to.have.property("_allMerchantsMeta");
            expect(_allMerchantsMeta.count).to.be.eq(1);
            expect(_allMerchantsMeta).to.have.property("count");
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
            expect(res.body.data).to.have.property(
              "_allMerchantsMeta",
              _allMerchantsMeta,
              null
            );
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
            expect(_allMerchantsMeta).to.have.property("count");
            expect(_allMerchantsMeta.count).to.be.eq(1);
          }
        );
      });
    });
  });
});

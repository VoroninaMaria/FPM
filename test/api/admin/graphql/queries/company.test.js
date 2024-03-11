import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  COMPANY,
  ALL_COMPANIES,
  ALL_COMPANIES_META,
} from "@local/test/api/queries.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let variables = {};
let token;

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

describe("Admin GraphQL", () => {
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

      await Database("companies")
        .insert({
          merchant_id: merchant2.id,
          name: "gggg",
        })
        .returning("*");

      await Database("companies")
        .insert({
          merchant_id: merchant1.id,
          name: "jjjjjj",
        })
        .returning("*");

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
      await Database("companies").del();
      await Database("merchants").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("Company", () => {
      it("Get Company without id", () =>
        accountGraphQLRequest(
          requestBody(COMPANY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get Company with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(COMPANY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get Company with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(COMPANY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("Company", null);
          }
        );
      });

      it("Get Company with valid id", async () => {
        const bm = await Database("companies")
          .where({
            merchant_id: merchant1.id,
          })
          .first();

        variables.id = bm.id;

        return accountGraphQLRequest(
          requestBody(COMPANY),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Company },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("Company", Company);
            expect(Object.keys(Company)).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All companies", () => {
      it("Get allCompanies without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(2);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with valid pagination and empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(2);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with valid filter(id) and without pagination", async () => {
        const company = await Database("companies")
          .where({ merchant_id: merchant2.id })
          .first();

        variables.filter = {
          id: company.id,
          merchant_id: company.merchant_id,
          name: company.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(1);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with valid filter(ids) and without pagination", async () => {
        const company = await Database("companies");

        variables.filter = {
          ids: company.map((c) => c.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(2);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with valid filter(id) and pagination", async () => {
        const company = await Database("companies")
          .where({ merchant_id: merchant2.id })
          .first();

        variables.filter = {
          id: company.id,
          merchant_id: company.merchant_id,
          name: company.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(1);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with valid filter(ids) and pagination", async () => {
        const companys = await Database("companies");

        variables.filter = {
          ids: companys.map((bm) => bm.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(2);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allCompanies with valid perPage", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(2);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allCompanies with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(2);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with invalid sortField", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCompanies with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCompanies with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(2);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCompanies with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(2);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(2);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCompanies with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allCompanies.length).to.be.eq(0);
          }
        );
      });

      it("Get allCompanies with valid filter id", async () => {
        const company = await Database("companies")
          .where({ merchant_id: merchant2.id })
          .first();

        variables.filter = { id: company.id };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(1);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCompanies with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allCompanies.length).to.be.eq(0);
          }
        );
      });

      it("Get allCompanies with valid filter ids", async () => {
        const companys = await Database("companies");

        variables.filter = { ids: companys.map((bm) => bm.id) };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(2);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCompanies with filter merchant_id which does not exist", () => {
        variables.filter = { merchant_id: "test-merchant-id" };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allCompanies",
              allCompanies,
              null
            );
          }
        );
      });

      it("Get allCompanies with valid filter merchant_id", async () => {
        const company = await Database("companies").first();

        variables.filter = { merchant_id: company.merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(1);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCompanies with invalid filter name", () => {
        variables.filter = { name: 1 };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCompanies with filter name which does not exist", () => {
        variables.filter = { name: "testd" };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allCompanies.length).to.be.eq(0);
          }
        );
      });

      it("Get allCompanies with valid filter name", async () => {
        const company = await Database("companies")
          .where({ merchant_id: merchant2.id })
          .first();

        variables.filter = { name: company.name };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCompanies },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allCompanies");
            expect(allCompanies.length).to.be.eq(1);
            expect(Object.keys(allCompanies[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Companies Meta", () => {
      it("Get allCompaniesMeta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allCompaniesMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allCompaniesMeta with valid filter(id) and without pagination", async () => {
        const company = await Database("companies")
          .where({ merchant_id: merchant1.id })
          .first();

        variables.filter = {
          id: company.id,
          merchant_id: company.merchant_id,
          name: company.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allCompaniesMeta with valid filter(ids) and without pagination", async () => {
        const Companies = await Database("companies");

        variables.filter = {
          ids: Companies.map((bm) => bm.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allCompaniesMeta with valid filter(id) and pagination", async () => {
        const company = await Database("companies").first();

        variables.filter = {
          id: company.id,
          name: company.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allCompaniesMeta with valid filter(ids) and pagination", async () => {
        const companys = await Database("companies");

        variables.filter = {
          ids: companys.map((company) => company.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allCompaniesMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allCompaniesMeta with valid perPage", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allCompaniesMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allCompaniesMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allCompaniesMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCompaniesMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta).to.have.property("count");
            expect(_allCompaniesMeta.count).to.eq(2);
          }
        );
      });

      it("Get allCompaniesMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta).to.have.property("count");
            expect(_allCompaniesMeta.count).to.eq(2);
          }
        );
      });

      it("Get allCompaniesMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCompaniesMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allCompaniesMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allCompaniesMeta",
              _allCompaniesMeta
            );
            expect(_allCompaniesMeta).to.have.property("count");
            expect(_allCompaniesMeta.count).to.eq(2);
          }
        );
      });

      it("Get allCompaniesMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCompaniesMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allCompaniesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allCompaniesMeta with valid filter id", async () => {
        const { id } = await Database("companies").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allCompaniesMeta");
            expect(_allCompaniesMeta).to.have.property("count");
            expect(_allCompaniesMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allCompaniesMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCompaniesMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allCompaniesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allCompaniesMeta with valid filter ids", async () => {
        const companys = await Database("companies");

        variables.filter = { ids: companys.map((company) => company.id) };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allCompaniesMeta");
            expect(_allCompaniesMeta).to.have.property("count");
            expect(_allCompaniesMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allCompaniesMeta with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCompaniesMeta with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "09bb7ccf-8b64-4873-bba2-d68ee6e0c098",
        };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allCompaniesMeta).to.have.property("count");
            expect(_allCompaniesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allCompaniesMeta with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("companies").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allCompaniesMeta");
            expect(_allCompaniesMeta.count).to.be.eq(1);
            expect(_allCompaniesMeta).to.have.property("count");
          }
        );
      });

      it("Get allCompaniesMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCompaniesMeta with filter name which does not exist", () => {
        variables.filter = {
          name: "09bb7ccf-8b64-4873-bba2-d68ee6e0c098",
        };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allCompaniesMeta).to.have.property("count");
            expect(_allCompaniesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allCompaniesMeta with valid pagination and filter name", async () => {
        const { name } = await Database("companies")
          .where({ merchant_id: merchant2.id })
          .first();

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_COMPANIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCompaniesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allCompaniesMeta");
            expect(_allCompaniesMeta.count).to.be.eq(1);
            expect(_allCompaniesMeta).to.have.property("count");
          }
        );
      });
    });
  });
});

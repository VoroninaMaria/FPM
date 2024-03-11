import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  MANAGER,
  ALL_MANAGERS,
  ALL_MANAGERS_META,
} from "@local/test/api/queries.js";
import { MERCHANT_STATUSES, CLIENT_STATUSES } from "@local/constants/index.js";

let variables = {};
let token;

let merchant1;
let merchant2;
let client1;
let client2;

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

      [client1] = await Database("clients")
        .insert([
          {
            merchant_id: merchant1.id,
            phone: "380630000000",
            email: "ggg@gmail.com",
            encrypted_password,
            status: CLIENT_STATUSES.confirmed.name,
          },
        ])
        .returning("*");

      [client2] = await Database("clients")
        .insert([
          {
            merchant_id: merchant2.id,
            phone: "380630000001",
            email: "bbb@gmail.com",
            encrypted_password,
            status: CLIENT_STATUSES.confirmed.name,
          },
        ])
        .returning("*");

      const [company1] = await Database("companies")
        .insert({
          merchant_id: merchant1.id,
          name: "gggg",
        })
        .returning("*");

      const [company2] = await Database("companies")
        .insert({
          merchant_id: merchant2.id,
          name: "jjjjjj",
        })
        .returning("*");

      await Database("managers")
        .insert([
          {
            company_id: company1.id,
            client_id: client1.id,
          },
          {
            company_id: company2.id,
            client_id: client2.id,
          },
        ])
        .onConflict()
        .ignore();

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
      await Database("managers").del();
      await Database("clients").del();
      await Database("companies").del();
      await Database("merchants").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("Manager", () => {
      it("Get Manager without id", () =>
        accountGraphQLRequest(
          requestBody(MANAGER),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get Manager with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(MANAGER),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get Manager with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(MANAGER),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("Manager", null);
          }
        );
      });

      it("Get Manager with valid id", async () => {
        const bm = await Database("managers")
          .where({
            client_id: client1.id,
          })
          .first();

        variables.id = bm.id;

        return accountGraphQLRequest(
          requestBody(MANAGER),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Manager },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("Manager", Manager);
            expect(Object.keys(Manager)).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All managers", () => {
      it("Get allManagers without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(2);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with valid pagination and empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(2);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with valid filter(id) and without pagination", async () => {
        const manager = await Database("managers").first();

        variables.filter = {
          id: manager.id,
          company_id: manager.company_id,
          client_id: manager.client_id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(1);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with valid filter(ids) and without pagination", async () => {
        const managers = await Database("managers");

        variables.filter = {
          ids: managers.map((c) => c.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(2);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with valid filter(id) and pagination", async () => {
        const manager = await Database("managers").first();

        variables.filter = {
          id: manager.id,
          company_id: manager.company_id,
          client_id: manager.client_id,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(1);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with valid filter(ids) and pagination", async () => {
        const managers = await Database("managers");

        variables.filter = {
          ids: managers.map((m) => m.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(2);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allManagers with valid perPage", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(2);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allManagers with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(2);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with invalid sortField", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allManagers with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allManagers with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(2);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allManagers with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(2);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(2);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allManagers with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allManagers.length).to.be.eq(0);
          }
        );
      });

      it("Get allManagers with valid filter id", async () => {
        const manager = await Database("managers").first();

        variables.filter = { id: manager.id };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(1);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allManagers with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allManagers.length).to.be.eq(0);
          }
        );
      });

      it("Get allManagers with valid filter ids", async () => {
        const managers = await Database("managers");

        variables.filter = { ids: managers.map((bm) => bm.id) };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(2);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with invalid filter client_id", () => {
        variables.filter = { client_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allManagers with filter client_id which does not exist", () => {
        variables.filter = { client_id: "test-merchant-id" };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allManagers",
              allManagers,
              null
            );
          }
        );
      });

      it("Get allManagers with valid filter client_id", async () => {
        const manager = await Database("managers").first();

        variables.filter = { client_id: manager.client_id };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(1);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allManagers with invalid filter company_id", () => {
        variables.filter = { company_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allManagers with filter company_id which does not exist", () => {
        variables.filter = { company_id: "test-merchant-id" };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allManagers",
              allManagers,
              null
            );
          }
        );
      });

      it("Get allManagers with valid filter company_id", async () => {
        const manager = await Database("managers").first();

        variables.filter = { company_id: manager.company_id };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allManagers },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allManagers");
            expect(allManagers.length).to.be.eq(1);
            expect(Object.keys(allManagers[0])).to.eql([
              "id",
              "company_id",
              "client_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Managers Meta", () => {
      it("Get allManagersMeta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allManagersMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allManagersMeta with valid filter(id) and without pagination", async () => {
        const manager = await Database("managers").first();

        variables.filter = {
          id: manager.id,
          company_id: manager.company_id,
          client_id: manager.client_id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allManagersMeta with valid filter(ids) and without pagination", async () => {
        const managers = await Database("managers");

        variables.filter = {
          ids: managers.map((m) => m.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allManagersMeta with valid filter(id) and pagination", async () => {
        const manager = await Database("managers").first();

        variables.filter = {
          id: manager.id,
          company_id: manager.company_id,
          client_id: manager.client_id,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allManagersMeta with valid filter(ids) and pagination", async () => {
        const managers = await Database("managers");

        variables.filter = {
          ids: managers.map((m) => m.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allManagersMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allManagersMeta with valid perPage", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allManagersMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allManagersMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allManagersMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allManagersMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta).to.have.property("count");
            expect(_allManagersMeta.count).to.eq(2);
          }
        );
      });

      it("Get allManagersMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta).to.have.property("count");
            expect(_allManagersMeta.count).to.eq(2);
          }
        );
      });

      it("Get allManagersMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allManagersMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allManagersMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allManagersMeta",
              _allManagersMeta
            );
            expect(_allManagersMeta).to.have.property("count");
            expect(_allManagersMeta.count).to.eq(2);
          }
        );
      });

      it("Get allManagersMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allManagersMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allManagersMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allManagersMeta with valid filter id", async () => {
        const { id } = await Database("managers").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allManagersMeta");
            expect(_allManagersMeta).to.have.property("count");
            expect(_allManagersMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allManagersMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allManagersMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allManagersMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allManagersMeta with valid filter ids", async () => {
        const managers = await Database("managers");

        variables.filter = { ids: managers.map((m) => m.id) };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allManagersMeta");
            expect(_allManagersMeta).to.have.property("count");
            expect(_allManagersMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allManagersMeta with invalid filter company_id", () => {
        variables.filter = { company_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allManagersMeta with filter company_id which does not exist", () => {
        variables.filter = {
          company_id: "09bb7ccf-8b64-4873-bba2-d68ee6e0c098",
        };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allManagersMeta).to.have.property("count");
            expect(_allManagersMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allManagersMeta with valid filter company_id", async () => {
        const { company_id } = await Database("managers").first();

        variables.filter = { company_id };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allManagersMeta");
            expect(_allManagersMeta.count).to.be.eq(1);
            expect(_allManagersMeta).to.have.property("count");
          }
        );
      });

      it("Get allManagersMeta with invalid filter client_id", () => {
        variables.filter = { client_id: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allManagersMeta with filter client_id which does not exist", () => {
        variables.filter = {
          client_id: "09bb7ccf-8b64-4873-bba2-d68ee6e0c098",
        };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allManagersMeta).to.have.property("count");
            expect(_allManagersMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allManagersMeta with valid filter client_id", async () => {
        const { client_id } = await Database("managers").first();

        variables.filter = { client_id };

        return accountGraphQLRequest(
          requestBody(ALL_MANAGERS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allManagersMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allManagersMeta");
            expect(_allManagersMeta.count).to.be.eq(1);
            expect(_allManagersMeta).to.have.property("count");
          }
        );
      });
    });
  });
});

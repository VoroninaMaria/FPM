import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN, ALL_ADMINS, ALL_ADMINS_META } from "@local/test/api/queries.js";

let variables = {};
let token;
const encrypted_password = await encryptPassword("123123");

const operationvalue = null;
const requestBody = (query) => ({ query: query, variables, operationvalue });

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

describe("Admin GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
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

    after(() => Database("admins").del());
    afterEach(() => (variables = {}));

    context("Admin", () => {
      it("Get admin without id", () =>
        accountGraphQLRequest(requestBody(ADMIN), `Bearer ${token}`, (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            'type "ID!" was not provided'
          );
        }));

      it("Get admin with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(ADMIN),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get admin with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(ADMIN),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("Admin", null);
          }
        );
      });

      it("Get admin with valid id", async () => {
        const { id } = await Database("admins").first();

        variables.id = id;

        return accountGraphQLRequest(
          requestBody(ADMIN),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Admin },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("Admin", Admin);
            expect(Object.keys(Admin)).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All admins", () => {
      it("Get allAdmins without pagination and filter", () => {
        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allAdmins with valid pagination and without filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allAdmins with valid filter and without pagination", async () => {
        const admin = await Database("admins").first();

        variables.filter = {
          id: admin.id,
          login: admin.login,
        };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allAdmins with valid filter and pagination", async () => {
        const admin = await Database("admins").first();

        variables.filter = {
          id: admin.id,
          value: admin.value,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allAdmins with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allAdmins with valid perPage", () => {
        variables.perPage = 5;

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allAdmins with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allAdmins with valid page", () => {
        variables.page = 0;

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allAdmins with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allAdmins with sortField which does not exist", () => {
        variables.sortField = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allAdmins with valid sortField", () => {
        variables.sortField = "id";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allAdmins with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allAdmins with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allAdmins with valid sortOrder", () => {
        variables.sortOrder = "id";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allAdmins with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allAdmins with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allAdmins.length).to.be.eq(0);
          }
        );
      });

      it("Get allAdmins with valid filter id", async () => {
        const { id } = await Database("admins").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allAdmins with invalid filter login", () => {
        variables.filter = { login: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allAdmins with filter login which does not exist", () => {
        variables.filter = { login: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allAdmins.length).to.be.eq(0);
          }
        );
      });

      it("Get allAdmins with valid filter login", async () => {
        const { login } = await Database("admins").first();

        variables.filter = { login };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allAdmins },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allAdmins", allAdmins);
            expect(allAdmins.length).to.be.eq(1);
            expect(Object.keys(allAdmins[0])).to.eql([
              "id",
              "login",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All adminsMeta", () => {
      it("Get allAdminsMeta without pagination and filter", () => {
        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with valid pagination and without filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with valid filter and without pagination", async () => {
        const admin = await Database("admins").first();

        variables.filter = {
          id: admin.id,
          login: admin.login,
        };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with valid filter and pagination", async () => {
        const admin = await Database("admins").first();

        variables.filter = {
          id: admin.id,
          value: admin.value,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allAdminsMeta with valid perPage", () => {
        variables.perPage = 5;

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allAdminsMeta with valid page", () => {
        variables.page = 0;

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allAdminsMeta with sortField which does not exist", () => {
        variables.sortField = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with valid sortField", () => {
        variables.sortField = "id";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allAdminsMeta with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with valid sortOrder", () => {
        variables.sortOrder = "id";

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allAdminsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allAdminsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allAdminsMeta with valid filter id", async () => {
        const { id } = await Database("admins").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allAdminsMeta with invalid filter login", () => {
        variables.filter = { login: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allAdminsMeta with filter login which does not exist", () => {
        variables.filter = { login: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allAdminsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allAdminsMeta with valid filter login", async () => {
        const { login } = await Database("admins").first();

        variables.filter = { login };

        return accountGraphQLRequest(
          requestBody(ALL_ADMINS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allAdminsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allAdminsMeta",
              _allAdminsMeta
            );
            expect(_allAdminsMeta.count).to.be.eq(1);
          }
        );
      });
    });
  });
});

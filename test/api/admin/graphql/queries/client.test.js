import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  CLIENT,
  ALL_CLIENTS,
  ALL_CLIENTS_META,
} from "@local/test/api/queries.js";
import { MERCHANT_STATUSES, CLIENT_STATUSES } from "@local/constants/index.js";

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

      const merchants = await Database("merchants").where({
        status: MERCHANT_STATUSES.active.name,
      });

      await Promise.all(
        merchants.map(async (merchant) => {
          const [category] = await Database("client_categories")
            .insert([
              {
                name: "businki",
                merchant_id: merchant.id,
              },
              {
                name: "bubochki",
                merchant_id: merchant.id,
              },
              {
                name: "pidori",
                merchant_id: merchant.id,
              },
            ])
            .onConflict(["merchant_id", "name"])
            .merge()
            .returning("*");

          const [{ id: current_client_id }, { id: other_client_id }] =
            await Database("clients")
              .insert([
                {
                  merchant_id: merchant.id,
                  category_id: category.id,
                  phone: "380630000000",
                  email: "ggg@gmail.com",
                  encrypted_password,
                  status: CLIENT_STATUSES.confirmed.name,
                },
                {
                  merchant_id: merchant.id,
                  category_id: category.id,
                  phone: "380630000001",
                  email: "bbb@gmail.com",
                  encrypted_password,
                  status: CLIENT_STATUSES.confirmed.name,
                },
              ])
              .onConflict()
              .ignore()
              .returning("*");

          await Database("client_changes").insert([
            {
              client_id: current_client_id,
              field_name: "phone",
              value: "380000000000",
            },
            {
              client_id: other_client_id,
              field_name: "phone",
              value: "380000000000",
            },
          ]);
        })
      );

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
      await Database("client_changes").del();
      await Database("clients").del();
      await Database("client_categories").del();
      await Database("merchants").del();
      await Database("admins").del();
    });

    afterEach(() => (variables = {}));

    context("Client", () => {
      it("Get client without id", () =>
        accountGraphQLRequest(requestBody(CLIENT), `Bearer ${token}`, (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            'type "ID!" was not provided'
          );
        }));

      it("Get client with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(CLIENT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get client with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(CLIENT),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Client },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("Client", Client, null);
          }
        );
      });

      it("Get client with valid id", async () => {
        const client = await Database("clients").first();

        variables.id = client.id;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(CLIENT),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Client },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("Client", Client);
            expect(Object.keys(Client)).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All clients", () => {
      it("Get allClients without pagination and empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(8);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with valid filter and without pagination", async () => {
        const client = await Database("clients").first();

        variables.filter = {
          id: client.id,
          merchant_id: client.merchant_id,
          category_id: client.category_id,
          status: client.status,
          phone: client.phone,
          email: client.email,
        };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(1);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with valid pagination and empty filter", () => {
        variables.filter = {};

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(8);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with valid pagination and filter", async () => {
        const client = await Database("clients").first();

        variables.filter = {
          id: client.id,
          merchant_id: client.merchant_id,
          category_id: client.category_id,
          status: client.status,
          phone: client.phone,
          email: client.email,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(1);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allClients with valid perPage", () => {
        variables.perPage = 10;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(8);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allClients with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(8);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allClients with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allClients with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(8);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allClients with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(8);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with valid sortOrder", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(8);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allClients with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClients with valid filter id", async () => {
        const { id } = await Database("clients").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(1);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu"] };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allClients with filter id which does not exist", () => {
        variables.filter = { ids: ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"] };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClients with valid filter id", async () => {
        const client = await Database("clients").first();

        variables.filter = { ids: [client.id] };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(1);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allClients with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClients with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("clients").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(2);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid filter category_id", () => {
        variables.filter = { category_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allClients with filter category_id which does not exist", () => {
        variables.filter = {
          category_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClients with valid filter category_id", async () => {
        const { category_id } = await Database("clients").first();

        variables.filter = { category_id };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(2);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid filter status", () => {
        variables.filter = { status: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allClients with filter status which does not exist", () => {
        variables.filter = { status: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClients with valid filter status", () => {
        variables.filter = { status: CLIENT_STATUSES.confirmed.name };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(8);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid filter phone", () => {
        variables.filter = { phone: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allClients with filter phone which does not exist", () => {
        variables.filter = { phone: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClients with valid filter phone", async () => {
        const { phone } = await Database("clients").first();

        variables.filter = { phone };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(4);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allClients with invalid filter email", () => {
        variables.filter = { email: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allClients with filter email which does not exist", () => {
        variables.filter = { email: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClients with valid filter email", async () => {
        const { email } = await Database("clients").first();

        variables.filter = { email };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allClients },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allClients", allClients);
            expect(allClients.length).to.be.eq(4);
            expect(Object.keys(allClients[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "tag_ids",
              "status",
              "phone",
              "email",
              "unconfirmed_changes",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Clients Meta", () => {
      it("Get allClientsMeta without pagination and empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta.count).to.be.eq(8);
          }
        );
      });

      it("Get allClientsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta.count).to.be.eq(8);
          }
        );
      });

      it("Get allClientsMeta with valid filter and without pagination", async () => {
        const client = await Database("clients").first();

        variables.filter = {
          id: client.id,
          merchant_id: client.merchant_id,
          category_id: client.category_id,
          status: client.status,
          phone: client.phone,
          email: client.email,
        };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allClientsMeta with valid pagination and filter", async () => {
        const client = await Database("clients").first();

        variables.filter = {
          id: client.id,
          merchant_id: client.merchant_id,
          category_id: client.category_id,
          status: client.status,
          phone: client.phone,
          email: client.email,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allClientsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allClientsMeta with valid perPage", () => {
        variables.perPage = 8;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta.count).to.be.eq(8);
          }
        );
      });

      it("Get allClientsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allClientsMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta.count).to.be.eq(8);
          }
        );
      });

      it("Get allClientsMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allClientsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta.count).to.be.eq(8);
          }
        );
      });

      it("Get allClientsMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta.count).to.be.eq(8);
          }
        );
      });

      it("Get allClientsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allClientsMeta with sortOrder which does not exist", () => {
        variables.sortOrder = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta.count).to.be.eq(8);
          }
        );
      });

      it("Get allClientsMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta.count).to.be.eq(8);
          }
        );
      });

      it("Get allClientsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allClientsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allClientsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allClientsMeta with valid filter id", async () => {
        const { id } = await Database("clients").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta).to.have.property("count");
            expect(_allClientsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allClientsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu"] };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allClientsMeta with filter ids which does not exist", () => {
        variables.filter = { ids: ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"] };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allClientsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allClientsMeta with valid filter ids", async () => {
        const client = await Database("clients").first();

        variables.filter = { ids: [client.id] };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta).to.have.property("count");
            expect(_allClientsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allClientsMeta with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allClientsMeta with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allClientsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allClientsMeta with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("clients").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta).to.have.property("count");
            expect(_allClientsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allClientsMeta with invalid filter category_id", () => {
        variables.filter = { category_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allClientsMeta with filter category_id which does not exist", () => {
        variables.filter = {
          category_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allClientsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allClientsMeta with valid filter category_id", async () => {
        const { category_id } = await Database("clients").first();

        variables.filter = { category_id };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta).to.have.property("count");
            expect(_allClientsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allClientsMeta with invalid filter status", () => {
        variables.filter = { status: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allClientsMeta with filter status which does not exist", () => {
        variables.filter = { status: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allClientsMeta).to.have.property("count");
            expect(_allClientsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allClientsMeta with valid filter status", () => {
        variables.filter = { status: CLIENT_STATUSES.confirmed.name };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta).to.have.property("count");
            expect(_allClientsMeta.count).to.be.eq(8);
          }
        );
      });

      it("Get allClientsMeta with invalid filter phone", () => {
        variables.filter = { phone: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allClientsMeta with filter phone which does not exist", () => {
        variables.filter = { phone: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allClientsMeta).to.have.property("count");
            expect(_allClientsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allClientsMeta with valid filter phone", async () => {
        const { phone } = await Database("clients").first();

        variables.filter = { phone };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta).to.have.property("count");
            expect(_allClientsMeta.count).to.be.eq(4);
          }
        );
      });

      it("Get allClientsMeta with invalid filter email", () => {
        variables.filter = { email: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allClientsMeta with filter email which does not exist", () => {
        variables.filter = { email: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allClientsMeta).to.have.property("count");
            expect(_allClientsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allClientsMeta with valid filter email", async () => {
        const { email } = await Database("clients").first();

        variables.filter = { email };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allClientsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allClientsMeta",
              _allClientsMeta
            );
            expect(_allClientsMeta).to.have.property("count");
            expect(_allClientsMeta.count).to.be.eq(4);
          }
        );
      });
    });
  });
});

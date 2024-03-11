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
let merchant;
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

const defaultMerchant = {
  login: "uklon",
  name: "uklon",
};

chai.use(chaiHttp);

describe("Merchant GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      [merchant] = await Database("merchants")
        .insert({
          ...defaultMerchant,
          encrypted_password: await encryptPassword("123123"),
          status: MERCHANT_STATUSES.active.name,
        })
        .returning("*");

      const [category1] = await Database("client_categories")
        .insert({
          name: "businki",
          merchant_id: merchant.id,
        })
        .returning("*");
      const [category2] = await Database("client_categories")
        .insert({
          name: "bubochki",
          merchant_id: merchant.id,
        })
        .returning("*");

      await Database("clients").insert({
        phone: "380670000000",
        encrypted_password: await encryptPassword("123123"),
        email: "ggg@gmail.com",
        status: CLIENT_STATUSES.confirmed.name,
        merchant_id: merchant.id,
        category_id: category1.id,
      });

      await Database("clients").insert({
        phone: "380670000001",
        encrypted_password: await encryptPassword("123123"),
        email: "ggg2@gmail.com",
        status: CLIENT_STATUSES.confirmed.name,
        merchant_id: merchant.id,
        category_id: category2.id,
      });

      ({
        body: { token },
      } = await accountLoginRequest({
        login: "uklon",
        password: "123123",
      }));
    });

    after(async () => {
      await Database("clients").del();
      await Database("client_categories").del();
      await Database("merchants").del();
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
            expect(res.body.errors[0]).to.have.property("message", "Forrbiden");
          }
        );
      });

      it("Get client with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(CLIENT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("Client", null);
          }
        );
      });

      it("Get client with valid id", async () => {
        const { id } = await Database("clients")
          .where({ merchant_id: merchant.id })
          .first();

        variables.id = id;

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
            expect(res.body.data).to.have.property("Client");
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

    context("AllClient", () => {
      it("Get allClient without pagination and filters", () =>
        accountGraphQLRequest(
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
            expect(res.body.data).to.have.property("allClients");
            expect(allClients).to.be.eq(null);
          }
        ));

      it("Get allClient without pagination with filter phone", () => {
        variables.filter = {
          phone: "",
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient without pagination with filter", async () => {
        const client = await Database("clients")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = {
          id: client.id,
          merchant_id: client.merchant_id,
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with valid pagination without filter", () => {
        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with valid pagination with filter", async () => {
        const client = await Database("clients")
          .where({ merchant_id: merchant.id })
          .first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        variables.filter = {
          id: client.id,
          merchant_id: client.merchant_id,
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with invalid perPage", () => {
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

      it("Get allClient with valid perPage", () => {
        variables.perPage = 2;
        variables.filter = {
          phone: "",
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with invalid page", () => {
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

      it("Get allClient with valid page", () => {
        variables.page = 0;
        variables.filter = {
          phone: "",
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with invalid sortField", () => {
        variables.sortField = 5;

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

      it("Get allClient with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {
          phone: "",
        };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forrbiden");
          }
        );
      });

      it("Get allClient with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {
          phone: "",
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with invalid sortOrder", () => {
        variables.sortOrder = 5;

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

      it("Get allClient with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allClient with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {
          phone: "",
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forrbiden");
          }
        );
      });

      it("Get allClient with filter id which does not exist", () => {
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
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClient with valid pagination and filter id", async () => {
        const { id } = await Database("clients").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forrbiden");
          }
        );
      });

      it("Get allClient with filter merchant_id which does not exist", () => {
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
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClient with valid pagination and filter merchant_id", () => {
        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { merchant_id: merchant.id };

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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with invalid filter category_id", () => {
        variables.filter = { category_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forrbiden");
          }
        );
      });

      it("Get allClient with filter category_id which does not exist", () => {
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
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClient with valid pagination and filter category_id", async () => {
        const { category_id } = await Database("clients").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with invalid filter status", () => {
        variables.filter = { status: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0]).not.to.have.property(
              "message",
              "Forrbiden"
            );
          }
        );
      });

      it("Get allClient with filter status which does not exist", () => {
        variables.filter = { status: "test" };

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
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClient with valid pagination and filter status", () => {
        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with invalid filter phone", () => {
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

      it("Get allClient with filter phone which does not exist", () => {
        variables.filter = { phone: "380670000003" };

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
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClient with valid pagination and filter phone", async () => {
        const { phone } = await Database("clients").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("allClients");
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

      it("Get allClient with invalid filter email", () => {
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

      it("Get allClient with filter email which does not exist", () => {
        variables.filter = { email: "Zxcvbnjmkl" };

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
            expect(allClients.length).to.be.eq(0);
          }
        );
      });

      it("Get allClient with valid pagination and filter email", async () => {
        const { email } = await Database("clients").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("allClients");
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
    });

    context("AllClientMeta", () => {
      it("Get allClientMeta without pagination and filter", () => {
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta).to.be.eq(null);
          }
        );
      });

      it("Get allClientMeta without pagination with filter", async () => {
        const client = await Database("clients")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = {
          id: client.id,
          merchant_id: client.merchant_id,
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(1);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with valid pagination without filter", () => {
        variables.perPage = 2;
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(2);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with valid pagination with filter", async () => {
        const client = await Database("clients")
          .where({ merchant_id: merchant.id })
          .first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        variables.filter = {
          id: client.id,
          merchant_id: client.merchant_id,
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(1);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with invalid perPage", () => {
        variables.perPage = "ewret";

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

      it("Get allClientMeta with valid perPage", () => {
        variables.perPage = 2;
        variables.filter = {
          phone: "",
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(2);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0]).to.have.property(
              "message",
              'Variable "$page" got invalid value "edrfgh"; Int cannot represent non-integer value: "edrfgh"'
            );
          }
        );
      });

      it("Get allClientMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {
          phone: "",
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(2);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with invalid sortField", () => {
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

      it("Get allClientMeta with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {
          phone: "",
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(2);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {
          phone: "",
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(2);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with invalid sortOrder", () => {
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

      it("Get allClientMeta with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allClientMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {
          phone: "",
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(2);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forrbiden");
          }
        );
      });

      it("Get allClientMeta with filter id which does not exist", () => {
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

      it("Get allClientMeta with valid pagination and filter id", async () => {
        const { id } = await Database("clients").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(1);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forrbiden");
          }
        );
      });

      it("Get allClientMeta with filter merchant_id which does not exist", () => {
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

      it("Get allClientMeta with valid pagination and filter merchant_id", () => {
        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { merchant_id: merchant.id };

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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(2);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with invalid filter category_id", () => {
        variables.filter = { category_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CLIENTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forrbiden");
          }
        );
      });

      it("Get allClientMeta with filter category_id which does not exist", () => {
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

      it("Get allClientMeta with valid pagination and filter category_id", async () => {
        const { category_id } = await Database("clients").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(1);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with invalid filter status", () => {
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

      it("Get allClientMeta with filter status which does not exist", () => {
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
            expect(_allClientsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allClientMeta with valid pagination and filter status", () => {
        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(2);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with invalid filter phone", () => {
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

      it("Get allClientMeta with filter phone which does not exist", () => {
        variables.filter = { phone: "380670000003" };

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

      it("Get allClientMeta with valid pagination and filter phone", async () => {
        const { phone } = await Database("clients").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(1);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });

      it("Get allClientMeta with invalid filter email", () => {
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

      it("Get allClientMeta with filter email which does not exist", () => {
        variables.filter = { email: "Zxcvbnjmkl" };

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

      it("Get allClientMeta with valid pagination and filter email", async () => {
        const { email } = await Database("clients").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
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
            expect(res.body.data).to.have.property("_allClientsMeta");
            expect(_allClientsMeta.count).to.be.eq(1);
            expect(_allClientsMeta).to.have.property("count");
          }
        );
      });
    });
  });
});

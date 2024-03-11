import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  ADMIN_PAYMENT_GATEWAY as PAYMENT_GATEWAY,
  ADMIN_ALL_PAYMENT_GATEWAYS as ALL_PAYMENT_GATEWAYS,
  ADMIN_ALL_PAYMENT_GATEWAYS_META as ALL_PAYMENT_GATEWAYS_META,
} from "@local/test/api/queries.js";
import { PAYMENT_GATEWAY_STATUSES } from "@local/constants/index.js";

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

describe("Admin GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      await Database("payment_gateways")
        .insert([
          {
            name: "Pumb",
            status: PAYMENT_GATEWAY_STATUSES.active.name,
          },
          {
            name: "Monobank",
            status: PAYMENT_GATEWAY_STATUSES.active.name,
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
      await Database("payment_gateways").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("Admin Payment Gateway", () => {
      it("Get admin paymentGateway without id", () =>
        accountGraphQLRequest(
          requestBody(PAYMENT_GATEWAY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get admin paymentGateway with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(PAYMENT_GATEWAY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get admin paymentGateway with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(PAYMENT_GATEWAY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("PaymentGateway", null);
          }
        );
      });

      it("Get admin paymentGateway with valid id", async () => {
        const { id } = await Database("payment_gateways").first();

        variables.id = id;

        return accountGraphQLRequest(
          requestBody(PAYMENT_GATEWAY),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { PaymentGateway },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "PaymentGateway",
              PaymentGateway
            );
            expect(Object.keys(PaymentGateway)).to.eql([
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

    context("All Payment Gateways", () => {
      it("Get allPaymentGateways without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with valid pagination and empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with valid filter(id) and without pagination", async () => {
        const payment_gateway = await Database("payment_gateways").first();

        variables.filter = {
          id: payment_gateway.id,
          name: payment_gateway.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(1);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with valid filter(ids) and without pagination", async () => {
        const payment_gateways = await Database("payment_gateways");

        variables.filter = {
          ids: payment_gateways.map((payment_gateway) => payment_gateway.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with valid filter(id) and pagination", async () => {
        const payment_gateway = await Database("payment_gateways").first();

        variables.filter = {
          id: payment_gateway.id,
          name: payment_gateway.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(1);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with valid filter(ids) and pagination", async () => {
        const payment_gateways = await Database("payment_gateways");

        variables.filter = {
          ids: payment_gateways.map((payment_gateway) => payment_gateway.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allPaymentGateways with valid perPage", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allPaymentGateways with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with invalid sortField", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allPaymentGateways with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allPaymentGateways with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allPaymentGateways with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allPaymentGateways with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allPaymentGateways.length).to.be.eq(0);
          }
        );
      });

      it("Get allPaymentGateways with valid filter id", async () => {
        const { id } = await Database("payment_gateways").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(1);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allPaymentGateways with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allPaymentGateways.length).to.be.eq(0);
          }
        );
      });

      it("Get allPaymentGateways with valid filter ids", async () => {
        const payment_gateways = await Database("payment_gateways");

        variables.filter = {
          ids: payment_gateways.map((payment_gateway) => payment_gateway.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
              "id",
              "name",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allPaymentGateways with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allPaymentGateways with filter name which does not exist", () => {
        variables.filter = { name: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allPaymentGateways",
              allPaymentGateways
            );
            expect(allPaymentGateways.length).to.be.eq(0);
          }
        );
      });

      it("Get allPaymentGateways with valid filter name", async () => {
        const { name } = await Database("payment_gateways").first();

        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allPaymentGateways");
            expect(allPaymentGateways.length).to.be.eq(1);
            expect(Object.keys(allPaymentGateways[0])).to.eql([
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

    context("All Payment Gateways Meta", () => {
      it("Get allPaymentGatewaysMeta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid filter(id) and without pagination", async () => {
        const payment_gateway = await Database("payment_gateways").first();

        variables.filter = {
          id: payment_gateway.id,
          name: payment_gateway.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid filter(ids) and without pagination", async () => {
        const payment_gateways = await Database("payment_gateways");

        variables.filter = {
          ids: payment_gateways.map((payment_gateway) => payment_gateway.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid filter(id) and pagination", async () => {
        const payment_gateway = await Database("payment_gateways").first();

        variables.filter = {
          id: payment_gateway.id,
          name: payment_gateway.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid filter(ids) and pagination", async () => {
        const payment_gateways = await Database("payment_gateways");

        variables.filter = {
          ids: payment_gateways.map((payment_gateway) => payment_gateway.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid perPage", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allPaymentGatewaysMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta).to.have.property("count");
            expect(_allPaymentGatewaysMeta.count).to.eq(2);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta).to.have.property("count");
            expect(_allPaymentGatewaysMeta.count).to.eq(2);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allPaymentGatewaysMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allPaymentGatewaysMeta",
              _allPaymentGatewaysMeta
            );
            expect(_allPaymentGatewaysMeta).to.have.property("count");
            expect(_allPaymentGatewaysMeta.count).to.eq(2);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allPaymentGatewaysMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allPaymentGatewaysMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid filter id", async () => {
        const { id } = await Database("payment_gateways").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allPaymentGatewaysMeta");
            expect(_allPaymentGatewaysMeta).to.have.property("count");
            expect(_allPaymentGatewaysMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allPaymentGatewaysMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allPaymentGatewaysMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid filter ids", async () => {
        const payment_gateways = await Database("payment_gateways");

        variables.filter = {
          ids: payment_gateways.map((payment_gateway) => payment_gateway.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allPaymentGatewaysMeta");
            expect(_allPaymentGatewaysMeta).to.have.property("count");
            expect(_allPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allPaymentGatewaysMeta with filter name which does not exist", () => {
        variables.filter = { name: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allPaymentGatewaysMeta).to.have.property("count");
            expect(_allPaymentGatewaysMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allPaymentGatewaysMeta with valid pagination and filter name", async () => {
        const { name } = await Database("payment_gateways").first();

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allPaymentGatewaysMeta");
            expect(_allPaymentGatewaysMeta.count).to.be.eq(1);
            expect(_allPaymentGatewaysMeta).to.have.property("count");
          }
        );
      });
    });
  });
});

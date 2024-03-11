import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  MERCHANT_PAYMENT_GATEWAY,
  ALL_MERCHANT_PAYMENT_GATEWAYS,
  ALL_MERCHANT_PAYMENT_GATEWAYS_META,
} from "@local/test/api/queries.js";
import {
  MERCHANT_PAYMENT_GATEWAY_STATUSES,
  PAYMENT_GATEWAY_STATUSES,
  MERCHANT_STATUSES,
} from "@local/constants/index.js";

let variables = {};
let token;
let uklon;
let bolt;
let pumbGateway;
let monobankGateway;

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
      [uklon] = await Database("merchants")
        .insert({
          ...defaultMerchant,
          name: "uklon",
          encrypted_password,
          login: "uklon",
        })
        .returning("*");

      [bolt] = await Database("merchants")
        .insert({
          ...defaultMerchant,
          name: "bolt",
          encrypted_password,
          login: "bolt",
        })
        .returning("*");

      [pumbGateway] = await Database("payment_gateways")
        .insert({
          name: "Pumb",
          status: PAYMENT_GATEWAY_STATUSES.active.name,
        })
        .returning("*");

      [monobankGateway] = await Database("payment_gateways")
        .insert({
          name: "Monobank",
          status: PAYMENT_GATEWAY_STATUSES.active.name,
        })
        .returning("*");

      await Database("merchant_payment_gateways")
        .insert({
          name: "Pumb Gateway",
          merchant_id: uklon.id,
          payment_gateway_id: pumbGateway.id,
          status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
          config: {},
        })
        .onConflict(["merchant_id", "name"])
        .merge();

      await Database("merchant_payment_gateways")
        .insert({
          name: "Monobank Gateway",
          merchant_id: bolt.id,
          payment_gateway_id: monobankGateway.id,
          config: {},
          status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
        })
        .onConflict(["merchant_id", "name"])
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
      await Database("merchant_payment_gateways").del();
      await Database("merchants").del();
      await Database("payment_gateways").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("Merchant Payment Gateway", () => {
      it("Get merchantPaymentGateway without id", () =>
        accountGraphQLRequest(
          requestBody(MERCHANT_PAYMENT_GATEWAY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get merchantPaymentGateway with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(MERCHANT_PAYMENT_GATEWAY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get merchantPaymentGateway with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(MERCHANT_PAYMENT_GATEWAY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "MerchantPaymentGateway",
              null
            );
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get merchantPaymentGateway with valid id", async () => {
        const mpg = await Database("merchant_payment_gateways")
          .where({
            merchant_id: uklon.id,
            payment_gateway_id: pumbGateway.id,
          })
          .first();

        variables.id = mpg.id;

        return accountGraphQLRequest(
          requestBody(MERCHANT_PAYMENT_GATEWAY),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { MerchantPaymentGateway },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "MerchantPaymentGateway",
              MerchantPaymentGateway
            );
            expect(Object.keys(MerchantPaymentGateway)).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Merchant Payment Gateways", () => {
      it("Get allMerchantPaymentGateways without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid pagination and empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid filter(id) and without pagination", async () => {
        const mpg = await Database("merchant_payment_gateways")
          .where({ merchant_id: uklon.id, payment_gateway_id: pumbGateway.id })
          .first();

        variables.filter = { id: mpg.id };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(1);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid filter(ids) and without pagination", async () => {
        const mpgs = await Database("merchant_payment_gateways");

        variables.filter = {
          ids: mpgs.map((bm) => bm.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid filter(id) and pagination", async () => {
        const mpg = await Database("merchant_payment_gateways")
          .where({ merchant_id: uklon.id, payment_gateway_id: pumbGateway.id })
          .first();

        variables.filter = { id: mpg.id };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(1);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid filter(ids) and pagination", async () => {
        const mpgs = await Database("merchant_payment_gateways");

        variables.filter = {
          ids: mpgs.map((bm) => bm.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid perPage", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with invalid sortField", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allMerchantPaymentGateways with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allMerchantPaymentGateways with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allMerchantPaymentGateways with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allMerchantPaymentGateways.length).to.be.eq(0);
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid filter id", async () => {
        const mpg = await Database("merchant_payment_gateways")
          .where({ merchant_id: uklon.id, payment_gateway_id: pumbGateway.id })
          .first();

        variables.filter = { id: mpg.id };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(1);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allMerchantPaymentGateways with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allMerchantPaymentGateways with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allMerchantPaymentGateways.length).to.be.eq(0);
          }
        );
      });

      it("Get allMerchantPaymentGateways with valid filter ids", async () => {
        const mpgs = await Database("merchant_payment_gateways");

        variables.filter = { ids: mpgs.map((bm) => bm.id) };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allMerchantPaymentGateways },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allMerchantPaymentGateways"
            );
            expect(allMerchantPaymentGateways.length).to.be.eq(2);
            expect(Object.keys(allMerchantPaymentGateways[0])).to.eql([
              "id",
              "name",
              "merchant_id",
              "payment_gateway_id",
              "default",
              "config",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Merchant Payment Gateways Meta", () => {
      it("Get allMerchantPaymentGatewaysMeta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid filter(id) and without pagination", async () => {
        const mpg = await Database("merchant_payment_gateways")
          .where({ merchant_id: uklon.id, payment_gateway_id: pumbGateway.id })
          .first();

        variables.filter = { id: mpg.id };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid filter(ids) and without pagination", async () => {
        const mpgs = await Database("merchant_payment_gateways");

        variables.filter = {
          ids: mpgs.map((bm) => bm.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid filter(id) and pagination", async () => {
        const mpg = await Database("merchant_payment_gateways").first();

        variables.filter = {
          id: mpg.id,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid filter(ids) and pagination", async () => {
        const mpgs = await Database("merchant_payment_gateways");

        variables.filter = {
          ids: mpgs.map((mpg) => mpg.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid perPage", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta).to.have.property("count");
            expect(_allMerchantPaymentGatewaysMeta.count).to.eq(2);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta).to.have.property("count");
            expect(_allMerchantPaymentGatewaysMeta.count).to.eq(2);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta",
              _allMerchantPaymentGatewaysMeta
            );
            expect(_allMerchantPaymentGatewaysMeta).to.have.property("count");
            expect(_allMerchantPaymentGatewaysMeta.count).to.eq(2);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid filter id", async () => {
        const { id } = await Database("merchant_payment_gateways").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta"
            );
            expect(_allMerchantPaymentGatewaysMeta).to.have.property("count");
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allMerchantPaymentGatewaysMeta with valid filter ids", async () => {
        const mpgs = await Database("merchant_payment_gateways");

        variables.filter = { ids: mpgs.map((mpg) => mpg.id) };

        return accountGraphQLRequest(
          requestBody(ALL_MERCHANT_PAYMENT_GATEWAYS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allMerchantPaymentGatewaysMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allMerchantPaymentGatewaysMeta"
            );
            expect(_allMerchantPaymentGatewaysMeta).to.have.property("count");
            expect(_allMerchantPaymentGatewaysMeta.count).to.be.eq(2);
          }
        );
      });
    });
  });
});

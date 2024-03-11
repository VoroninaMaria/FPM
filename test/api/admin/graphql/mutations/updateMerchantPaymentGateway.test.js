import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_UPDATE_MERCHANT_PAYMENT_GATEWAY_MUTATION as UPDATE_MERCHANT_PAYMENT_GATEWAY } from "@local/test/api/mutations.js";
import {
  MERCHANT_STATUSES,
  PAYMENT_GATEWAY_STATUSES,
  MERCHANT_PAYMENT_GATEWAY_STATUSES,
} from "@local/constants/index.js";

let token;
let uklon;
let bolt;
let pumbGateway;
let monobankGateway;
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/admin/auth/login").send(payload).then(callback);

const encrypted_password = await encryptPassword("123123");

const accountGraphQLRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/admin/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Admin GraphQL", () => {
  beforeEach(async () => {
    await Database("admins").insert({
      login: "offtop",
      encrypted_password,
    });

    [uklon] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("*");

    [bolt] = await Database("merchants")
      .insert({
        login: "bolt",
        name: "bolt",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
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
        status: PAYMENT_GATEWAY_STATUSES.disabled.name,
      })
      .returning("*");

    await Database("merchant_payment_gateways").insert([
      {
        name: "Pumb Gateway",
        merchant_id: uklon.id,
        payment_gateway_id: pumbGateway.id,
        status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
        config: {},
      },
      {
        name: "Monobank Gateway",
        merchant_id: bolt.id,
        payment_gateway_id: monobankGateway.id,
        status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
        config: {},
      },
      {
        name: "Monobank Gateway 2",
        merchant_id: bolt.id,
        payment_gateway_id: monobankGateway.id,
        status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
        config: {},
      },
    ]);

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("merchant_payment_gateways").del();
    await Database("payment_gateways").del();
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { updateMerchantPaymentGateway }", () => {
    it("Should update merchantPaymentGateway with valid id, name, merchant_id, status and config provided ", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = mpg.id;
      variables.name = "TopUp";
      variables.merchant_id = mpg.merchant_id;
      variables.config = {
        token: "Token",
      };
      variables.default = true;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { updateMerchantPaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property(
            "updateMerchantPaymentGateway"
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "id",
            variables.id
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "merchant_id",
            variables.merchant_id
          );
          expect(Object.keys(updateMerchantPaymentGateway)).to.eql([
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
          expect(Object.values(updateMerchantPaymentGateway)).to.eql([
            mpg.id,
            variables.name,
            mpg.merchant_id,
            mpg.payment_gateway_id,
            variables.default,
            variables.config,
            variables.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should update merchantPaymentGateway with valid name, merchant_id, status and empty config provided ", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = mpg.id;
      variables.name = "TopUp";
      variables.merchant_id = mpg.merchant_id;
      variables.config = {};
      variables.default = true;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { updateMerchantPaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property(
            "updateMerchantPaymentGateway"
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "merchant_id",
            variables.merchant_id
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "id",
            variables.id
          );
          expect(Object.keys(updateMerchantPaymentGateway)).to.eql([
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
          expect(Object.values(updateMerchantPaymentGateway)).to.eql([
            mpg.id,
            variables.name,
            mpg.merchant_id,
            mpg.payment_gateway_id,
            variables.default,
            variables.config,
            variables.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should return error when config has wrong type", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = "test";
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "JSONObject cannot represent non-object value"
          );
        }
      );
    });

    it("Should update merchantPaymentGateway with valid new config provided", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = { token: "Test token " };
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { updateMerchantPaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property(
            "updateMerchantPaymentGateway"
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "merchant_id",
            variables.merchant_id
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "id",
            variables.id
          );
          expect(Object.keys(updateMerchantPaymentGateway)).to.eql([
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
          expect(Object.values(updateMerchantPaymentGateway)).to.eql([
            mpg.id,
            mpg.name,
            mpg.merchant_id,
            mpg.payment_gateway_id,
            mpg.default,
            variables.config,
            mpg.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should return error when default has wrong type", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.default = "test";
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "Boolean cannot represent a non boolean value"
          );
        }
      );
    });

    it("Should update merchantPaymentGateway with valid default provided", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.default = true;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { updateMerchantPaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property(
            "updateMerchantPaymentGateway"
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "merchant_id",
            variables.merchant_id
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "id",
            variables.id
          );
          expect(Object.keys(updateMerchantPaymentGateway)).to.eql([
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
          expect(Object.values(updateMerchantPaymentGateway)).to.eql([
            mpg.id,
            mpg.name,
            mpg.merchant_id,
            mpg.payment_gateway_id,
            variables.default,
            mpg.config,
            mpg.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should return error when no id provided", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$id" of required type "ID!" was not provided`
          );
        }
      );
    });

    it("Should return error when id is null", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = null;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when id has wrong type", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = true;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "ID cannot represent value"
          );
        }
      );
    });

    it("Should return error when id doesn't exist", () => {
      variables.id = "fe727d0d-92ac-4557-a716-4442cf93edbb";
      variables.name = "Name";
      variables.merchant_id = bolt.id;
      variables.config = {};
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "merchant_payment_gateway_not_found"
          );
        }
      );
    });

    it("Should return error when no name provided", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = mpg.id;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$name" of required type "String!" was not provided`
          );
        }
      );
    });

    it("Should return error when name is null", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = mpg.id;
      variables.name = null;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when name has wrong type", async () => {
      const mpg = await Database("merchant_payment_gateways").first();

      variables.id = mpg.id;
      variables.name = true;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        }
      );
    });

    it("Should return error when name already exist", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id, name: "Monobank Gateway" })
        .first();

      variables.id = mpg.id;
      variables.name = "Monobank Gateway 2";
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("already_exist");
        }
      );
    });

    it("Should update merchantPaymentGateway with valid new name provided", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id })
        .first();

      variables.id = mpg.id;
      variables.name = "Monobank topup";
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { updateMerchantPaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property(
            "updateMerchantPaymentGateway"
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "merchant_id",
            variables.merchant_id
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "id",
            variables.id
          );
          expect(Object.keys(updateMerchantPaymentGateway)).to.eql([
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
          expect(Object.values(updateMerchantPaymentGateway)).to.eql([
            mpg.id,
            variables.name,
            mpg.merchant_id,
            mpg.payment_gateway_id,
            mpg.default,
            mpg.config,
            mpg.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should return error when no merchant_id provided", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id })
        .first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$merchant_id" of required type "ID!" was not provided`
          );
        }
      );
    });

    it("Should return error when merchant_id is null", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id })
        .first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = null;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when merchant_id has wrong type", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id })
        .first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = true;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "ID cannot represent value"
          );
        }
      );
    });

    it("Should return error when no status provided", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id })
        .first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$status" of required type "String!" was not provided`
          );
        }
      );
    });

    it("Should return error when status is null", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id })
        .first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = null;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when status has wrong type", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id })
        .first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = true;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        }
      );
    });

    it("Should return error when status doesn't exist", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id })
        .first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = "default";

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("unknown_status");
        }
      );
    });

    it("Should update merchantPaymentGateway with valid new status provided", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id, name: "Monobank Gateway" })
        .first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.merchant_id = mpg.merchant_id;
      variables.config = mpg.config;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { updateMerchantPaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property(
            "updateMerchantPaymentGateway"
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "merchant_id",
            variables.merchant_id
          );
          expect(updateMerchantPaymentGateway).to.have.property(
            "id",
            variables.id
          );
          expect(Object.keys(updateMerchantPaymentGateway)).to.eql([
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
          expect(Object.values(updateMerchantPaymentGateway)).to.eql([
            mpg.id,
            mpg.name,
            mpg.merchant_id,
            mpg.payment_gateway_id,
            mpg.default,
            mpg.config,
            variables.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });
  });
});

import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_CREATE_MERCHANT_PAYMENT_GATEWAY_MUTATION as CREATE_MERCHANT_PAYMENT_GATEWAY } from "@local/test/api/mutations.js";
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
let linqPayGateway;
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/merchant/auth/login")
    .send(payload)
    .then(callback);

const encrypted_password = await encryptPassword("123123");

const accountGraphQLRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/merchant/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Merchant GraphQL", () => {
  beforeEach(async () => {
    [uklon] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
        plugins: {
          merchantPaymentGateways: true,
        },
      })
      .returning("*");

    [bolt] = await Database("merchants")
      .insert({
        login: "bolt",
        name: "bolt",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
        plugins: {
          merchantPaymentGateways: true,
        },
      })
      .returning("*");

    [pumbGateway] = await Database("payment_gateways")
      .insert({
        name: "Pumb",
        status: PAYMENT_GATEWAY_STATUSES.active.name,
      })
      .returning("*");

    [linqPayGateway] = await Database("payment_gateways")
      .insert({
        name: "LinqPay",
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
        merchant_id: bolt.id,
        payment_gateway_id: pumbGateway.id,
        status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
        config: {},
      },
      {
        name: "Pumb Gateway",
        merchant_id: uklon.id,
        payment_gateway_id: pumbGateway.id,
        status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
        config: {},
      },
    ]);

    ({
      body: { token },
    } = await accountLoginRequest({
      login: bolt.login,
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("merchant_payment_gateways").del();
    await Database("payment_gateways").del();
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { createMerchantPaymentGateway }", () => {
    it("Should not create merchantPaymentGateway with valid name, payment_gateway_id(payment_gateway status is not active), status and config provided ", () => {
      variables.name = "Monobank Gateway";
      variables.payment_gateway_id = monobankGateway.id;
      variables.config = {
        token: "Token",
      };
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("is_not_avilable");
        }
      );
    });

    it("Should create merchantPaymentGateway with valid name, payment_gateway_id, status and config provided ", () => {
      variables.name = "LinqPay Gateway";
      variables.payment_gateway_id = linqPayGateway.id;
      variables.config = {
        token: "Token",
      };
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { createMerchantPaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property(
            "createMerchantPaymentGateway"
          );
          expect(createMerchantPaymentGateway).to.have.property(
            "payment_gateway_id",
            variables.payment_gateway_id
          );
          expect(Object.keys(createMerchantPaymentGateway)).to.eql([
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

    it("Should create merchantPaymentGateway with valid name,  payment_gateway_id, status and empty config provided ", () => {
      variables.name = "LinqPay Gateway";
      variables.payment_gateway_id = linqPayGateway.id;
      variables.config = {};
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { createMerchantPaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property(
            "createMerchantPaymentGateway"
          );
          expect(createMerchantPaymentGateway).to.have.property(
            "payment_gateway_id",
            variables.payment_gateway_id
          );
          expect(Object.keys(createMerchantPaymentGateway)).to.eql([
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

    it("Should return error when config has wrong type", () => {
      variables.name = "Monobank Gateway";
      variables.payment_gateway_id = monobankGateway.id;
      variables.config = "test";
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
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

    it("Should return error when no name provided", () => {
      variables.payment_gateway_id = monobankGateway.id;
      variables.config = "test";
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
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

    it("Should return error when name is null", () => {
      variables.name = null;
      variables.payment_gateway_id = monobankGateway.id;
      variables.config = {};
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when name has wrong type", () => {
      variables.name = true;
      variables.payment_gateway_id = monobankGateway.id;
      variables.config = {};
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
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

    it("Should return error when name already exist", () => {
      variables.name = "Pumb Gateway";
      variables.payment_gateway_id = pumbGateway.id;
      variables.config = {};
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("already_exist");
        }
      );
    });

    it("Should return error when no payment_gateway_id provided", () => {
      variables.name = "Monobank Gateway";
      variables.config = {};
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$payment_gateway_id" of required type "ID!" was not provided`
          );
        }
      );
    });

    it("Should return error when payment_gateway_id is null", () => {
      variables.name = "Monobank Gateway";
      variables.payment_gateway_id = null;
      variables.config = {};
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when status has wrong type", () => {
      variables.name = "Monobank Gateway";
      variables.payment_gateway_id = true;
      variables.config = {};
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
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

    it("Should return error when no status provided", () => {
      variables.name = "Monobank Gateway";
      variables.payment_gateway_id = monobankGateway.id;
      variables.config = {};

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
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

    it("Should return error when status is null", () => {
      variables.name = "Monobank Gateway";
      variables.payment_gateway_id = monobankGateway.id;
      variables.config = {};
      variables.status = null;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when status has wrong type", () => {
      variables.name = "Monobank Gateway";
      variables.payment_gateway_id = monobankGateway.id;
      variables.config = {};
      variables.status = true;

      return accountGraphQLRequest(
        requestBody(CREATE_MERCHANT_PAYMENT_GATEWAY),
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
  });
});

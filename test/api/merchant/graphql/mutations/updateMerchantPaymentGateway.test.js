import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_UPDATE_MERCHANT_PAYMENT_GATEWAY_MUTATION as UPDATE_MERCHANT_PAYMENT_GATEWAY } from "@local/test/api/mutations.js";
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
let merchantLinqPay;
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

    [monobankGateway] = await Database("payment_gateways")
      .insert({
        name: "Monobank",
        status: PAYMENT_GATEWAY_STATUSES.disabled.name,
      })
      .returning("*");

    [merchantLinqPay] = await Database("merchant_payment_gateways")
      .insert({
        name: "LinqPay Gateway",
        merchant_id: bolt.id,
        payment_gateway_id: pumbGateway.id,
        status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
        config: {},
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
        status: MERCHANT_PAYMENT_GATEWAY_STATUSES.blocked.name,
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

  describe("mutation { updateMerchantPaymentGateway }", () => {
    it("Should not update merchantPaymentGateway with valid id, name, status and config provided but parent PaymentGateway is not active", async () => {
      const merchantLinqPay = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id, name: "Monobank Gateway" })
        .first();

      variables.id = merchantLinqPay.id;
      variables.name = "TopUp";
      variables.config = {
        token: "Token",
      };
      variables.default = true;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("can_not_edit_parent");
        }
      );
    });

    it("Should not update merchantPaymentGateway with valid id, name, status and config provided but parent PaymentGateway is not active", async () => {
      const merchantLinqPay = await Database("merchant_payment_gateways")
        .where({ merchant_id: bolt.id, name: "Monobank Gateway 2" })
        .first();

      variables.id = merchantLinqPay.id;
      variables.name = "TopUp";
      variables.config = {
        token: "Token",
      };
      variables.default = true;
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("can_not_edit");
        }
      );
    });

    it("Should not update merchantPaymentGateway with valid id, name, status and config provided", async () => {
      variables.id = merchantLinqPay.id;
      variables.name = "TopUp";
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
            merchantLinqPay.id,
            variables.name,
            merchantLinqPay.merchant_id,
            merchantLinqPay.payment_gateway_id,
            variables.default,
            variables.config,
            variables.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should update merchantPaymentGateway with valid name, status and empty config provided ", async () => {
      variables.id = merchantLinqPay.id;
      variables.name = "TopUp";

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
            merchantLinqPay.id,
            variables.name,
            merchantLinqPay.merchant_id,
            merchantLinqPay.payment_gateway_id,
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
      variables.id = merchantLinqPay.id;
      variables.name = merchantLinqPay.name;
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
      variables.id = merchantLinqPay.id;
      variables.name = merchantLinqPay.name;
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
            merchantLinqPay.id,
            merchantLinqPay.name,
            merchantLinqPay.merchant_id,
            merchantLinqPay.payment_gateway_id,
            merchantLinqPay.default,
            variables.config,
            merchantLinqPay.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should return error when default has wrong type", async () => {
      variables.id = merchantLinqPay.id;
      variables.name = merchantLinqPay.name;
      variables.config = merchantLinqPay.config;
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
      variables.id = merchantLinqPay.id;
      variables.name = merchantLinqPay.name;
      variables.config = merchantLinqPay.config;
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
            merchantLinqPay.id,
            merchantLinqPay.name,
            merchantLinqPay.merchant_id,
            merchantLinqPay.payment_gateway_id,
            variables.default,
            merchantLinqPay.config,
            merchantLinqPay.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should return error when no id provided", async () => {
      variables.name = merchantLinqPay.name;
      variables.config = merchantLinqPay.config;
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
      variables.id = null;
      variables.name = merchantLinqPay.name;
      variables.config = merchantLinqPay.config;
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
      variables.id = true;
      variables.name = merchantLinqPay.name;
      variables.config = merchantLinqPay.config;
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
      variables.config = {};
      variables.status = MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_MERCHANT_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0]?.message).to.include(
            "merchant_payment_gateway_not_found"
          );
        }
      );
    });

    it("Should return error when other merchant merchantLinqPay id was provided", async () => {
      const mpg = await Database("merchant_payment_gateways")
        .where({
          name: "Pumb Gateway",
        })
        .first();

      variables.id = mpg.id;
      variables.name = mpg.name;
      variables.config = mpg.config;
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
      variables.id = merchantLinqPay.id;
      variables.config = merchantLinqPay.config;
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
      variables.id = merchantLinqPay.id;
      variables.name = null;
      variables.config = merchantLinqPay.config;
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
      variables.id = merchantLinqPay.id;
      variables.name = true;
      variables.config = merchantLinqPay.config;
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
      variables.id = merchantLinqPay.id;
      variables.name = "Monobank Gateway 2";
      variables.config = merchantLinqPay.config;
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
      variables.id = merchantLinqPay.id;
      variables.name = "Monobank topup";
      variables.config = merchantLinqPay.config;
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
            merchantLinqPay.id,
            variables.name,
            merchantLinqPay.merchant_id,
            merchantLinqPay.payment_gateway_id,
            merchantLinqPay.default,
            merchantLinqPay.config,
            merchantLinqPay.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should return error when no status provided", async () => {
      variables.id = merchantLinqPay.id;
      variables.name = merchantLinqPay.name;
      variables.config = merchantLinqPay.config;

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
      variables.id = merchantLinqPay.id;
      variables.name = merchantLinqPay.name;
      variables.config = merchantLinqPay.config;
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
      variables.id = merchantLinqPay.id;
      variables.name = merchantLinqPay.name;
      variables.config = merchantLinqPay.config;
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
      variables.id = merchantLinqPay.id;
      variables.name = merchantLinqPay.name;
      variables.config = merchantLinqPay.config;
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
      variables.id = merchantLinqPay.id;
      variables.name = merchantLinqPay.name;
      variables.config = merchantLinqPay.config;
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
            merchantLinqPay.id,
            merchantLinqPay.name,
            merchantLinqPay.merchant_id,
            merchantLinqPay.payment_gateway_id,
            merchantLinqPay.default,
            merchantLinqPay.config,
            variables.status,
            updateMerchantPaymentGateway.created_at,
            updateMerchantPaymentGateway.updated_at,
          ]);
        }
      );
    });
  });
});

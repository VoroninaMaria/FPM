import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_UPDATE_BRAND_MERCHANT_MUTATION as UPDATE_BRAND_MERCHANT } from "@local/test/api/mutations.js";
import {
  MERCHANT_STATUSES,
  BRAND_MERCHANT_STATUSES,
} from "@local/constants/index.js";

let token;
let brandKotikiId;
let brandMinionsId;
let current_merchant_id;
let other_merchant_id;
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });
const encrypted_password = await encryptPassword("123123");

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/merchant/auth/login")
    .send(payload)
    .then(callback);

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
    [{ id: current_merchant_id }] = await Database("merchants")
      .insert({
        login: "bolt",
        name: "bolt",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
        plugins: {
          brandMerchants: true,
        },
      })
      .returning("*");

    [{ id: other_merchant_id }] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
        plugins: {
          brandMerchants: true,
        },
      })
      .returning("*");

    [{ id: brandKotikiId }] = await Database("brands")
      .insert({
        name: "Kotiki",
        default_config: {
          Apikey: "123123123123",
          partnerId: "businki",
        },
      })
      .returning("id");

    [{ id: brandMinionsId }] = await Database("brands")
      .insert({
        name: "Minions",
        default_config: {
          Apikey: "456456456456",
          partnerId: "bubochki",
        },
      })
      .returning("id");

    await Database("brand_merchants").insert([
      {
        merchant_id: current_merchant_id,
        brand_id: brandKotikiId,
        config: {
          Apikey: "456456456456",
          partnerId: "kotiki",
        },
      },
      {
        merchant_id: other_merchant_id,
        brand_id: brandMinionsId,
        config: {},
      },
    ]);

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "bolt",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("brand_merchants").del();
    await Database("brands").del();
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { updateBrandMerchant }", () => {
    it("Should update brandMerchant config with valid id, brand_id, config and status provided", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = {};
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          const {
            body: {
              data: { updateBrandMerchant },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBrandMerchant");
          expect(Object.keys(updateBrandMerchant)).to.eql([
            "id",
            "merchant_id",
            "brand_id",
            "config",
            "status",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should update brandMerchant status with valid id, brand_id, config and status provided", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = brandMerchant.config;
      variables.status = BRAND_MERCHANT_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          const {
            body: {
              data: { updateBrandMerchant },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBrandMerchant");
          expect(Object.keys(updateBrandMerchant)).to.eql([
            "id",
            "merchant_id",
            "brand_id",
            "config",
            "status",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should return error when no id provided", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.brand_id = brandMerchant.brand_id;
      variables.config = brandMerchant.config;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$id" of required type "ID!" was not provided'
          );
        }
      );
    });

    it("Should return error when id is null", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = null;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = brandMerchant.config;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when id is not numeral", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = "aaaa";
      variables.brand_id = brandMerchant.brand_id;
      variables.config = brandMerchant.config;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        }
      );
    });
    it("Should return error when id has wrong type", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = true;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = brandMerchant.config;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
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

    it("Should return error when brandMerchant not found by id", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = "-1";
      variables.brand_id = brandMerchant.brand_id;
      variables.config = brandMerchant.config;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        }
      );
    });

    it("Should return error when no brand_id provided", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.config = brandMerchant.config;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$brand_id" of required type "ID!" was not provided'
          );
        }
      );
    });

    it("Should return error when brand_id is null", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = null;
      variables.config = brandMerchant.config;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when brand_id is not numeral", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = "aaaa";
      variables.config = brandMerchant.config;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        }
      );
    });
    it("Should return error when brand_id has wrong type", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = true;
      variables.config = brandMerchant.config;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
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

    it("Should return error when brandMerchant not found by brand_id", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = "-1";
      variables.config = brandMerchant.config;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        }
      );
    });

    it("Should return error when no config provided", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = brandMerchant.brand_id;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$config" of required type "JSONObject!" was not provided.'
          );
        }
      );
    });

    it("Should return error when config is null", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = null;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when config is not numeral", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = "aaaaa";
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
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
    it("Should return error when config has wrong type", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = true;
      variables.status = brandMerchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
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

    it("Should return error when no status provided", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = brandMerchant.config;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$status" of required type "String!" was not provided.'
          );
        }
      );
    });

    it("Should return error when status is null", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = brandMerchant.config;
      variables.status = null;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when status is numeral", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = brandMerchant.config;
      variables.status = 2;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
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
    it("Should return error when status has wrong type", async () => {
      const brandMerchant = await Database("brand_merchants")
        .where({ merchant_id: current_merchant_id })
        .first();

      variables.id = brandMerchant.id;
      variables.brand_id = brandMerchant.brand_id;
      variables.config = brandMerchant.config;
      variables.status = true;

      return accountGraphQLRequest(
        requestBody(UPDATE_BRAND_MERCHANT),
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

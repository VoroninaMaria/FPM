import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_CREATE_BRAND_MERCHANT_MUTATION as CREATE_BRAND_MERCHANT } from "@local/test/api/mutations.js";
import {
  MERCHANT_STATUSES,
  BRAND_STATUSES,
  BRAND_MERCHANT_STATUSES,
} from "@local/constants/index.js";

let token;
let brandKotikiId;
let brandMinionsId;
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
    const [{ id: current_merchant_id }] = await Database("merchants")
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
        status: BRAND_STATUSES.active.name,
      })
      .returning("id");

    await Database("brand_merchants").insert({
      merchant_id: current_merchant_id,
      brand_id: brandKotikiId,
      config: {
        Apikey: "456456456456",
        partnerId: "kotiki",
      },
      status: BRAND_MERCHANT_STATUSES.active.name,
    });

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

  describe("mutation { createBrandMerchant }", () => {
    it("Should create brandMerchant with valid merchant_id, brand_id, status and config provided ", () => {
      variables.brand_id = brandMinionsId;
      variables.config = {
        Apikey: "789789789789789",
        partnerId: "minions",
      };
      variables.status = BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_BRAND_MERCHANT),
        (res) => {
          const {
            body: {
              data: { createBrandMerchant },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createBrandMerchant");
          expect(Object.keys(createBrandMerchant)).to.eql([
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

    it("Should create brandMerchant with valid merchant_id, brand_id, status and empty config provided ", () => {
      variables.brand_id = brandMinionsId;
      variables.config = {};
      variables.status = BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_BRAND_MERCHANT),
        (res) => {
          const {
            body: {
              data: { createBrandMerchant },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createBrandMerchant");
          expect(Object.keys(createBrandMerchant)).to.eql([
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

    it("Should return error when config has wrong type", () => {
      variables.brand_id = brandMinionsId;
      variables.config = "test";
      variables.status = BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_BRAND_MERCHANT),
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

    it("Should return error when no brand_id provided", () => {
      variables.status = BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$brand_id" of required type "ID!" was not provided`
          );
        }
      );
    });

    it("Should return error when brand_id is null", () => {
      variables.brand_id = null;
      variables.status = BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when brand_id has wrong type", () => {
      variables.brand_id = true;
      variables.status = BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_BRAND_MERCHANT),
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
      variables.brand_id = brandMinionsId;

      return accountGraphQLRequest(
        requestBody(CREATE_BRAND_MERCHANT),
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
      variables.brand_id = brandMinionsId;
      variables.status = null;

      return accountGraphQLRequest(
        requestBody(CREATE_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when status has wrong type", () => {
      variables.brand_id = brandMinionsId;
      variables.status = true;

      return accountGraphQLRequest(
        requestBody(CREATE_BRAND_MERCHANT),
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

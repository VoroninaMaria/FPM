import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_CREATE_BRAND_MERCHANT_MUTATION as CREATE_BRAND_MERCHANT } from "@local/test/api/mutations.js";
import {
  MERCHANT_STATUSES,
  BRAND_STATUSES,
  BRAND_MERCHANT_STATUSES,
} from "@local/constants/index.js";

let token;
let uklonId;
let boltId;
let brandKotikiId;
let brandMinionsId;
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

    [{ id: uklonId }] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("id");

    [{ id: boltId }] = await Database("merchants")
      .insert({
        login: "bolt",
        name: "bolt",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("id");

    [{ id: brandKotikiId }] = await Database("brands")
      .insert({
        name: "Kotiki",
        default_config: {
          Apikey: "123123123123",
          partnerId: "businki",
        },
        status: BRAND_STATUSES.active.name,
      })
      .returning("id");

    [{ id: brandMinionsId }] = await Database("brands")
      .insert({
        name: "Minions",
        default_config: {
          Apikey: "456456456456",
          partnerId: "bubochki",
        },
        status: BRAND_STATUSES.disabled.name,
      })
      .returning("id");

    await Database("brand_merchants").insert({
      merchant_id: uklonId,
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
      login: "offtop",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("brand_merchants").del();
    await Database("brands").del();
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { createBrandMerchant }", () => {
    it("Should create brandMerchant with valid merchant_id, brand_id, status and config provided ", () => {
      variables.merchant_id = boltId;
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
          expect(createBrandMerchant).to.have.property(
            "merchant_id",
            variables.merchant_id
          );
          expect(createBrandMerchant).to.have.property(
            "brand_id",
            variables.brand_id
          );
        }
      );
    });

    it("Should create brandMerchant with valid merchant_id, brand_id, status and empty config provided ", () => {
      variables.merchant_id = boltId;
      variables.brand_id = brandMinionsId;
      variables.config = {};
      variables.status = BRAND_MERCHANT_STATUSES.disabled.name;

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
          expect(createBrandMerchant).to.have.property(
            "merchant_id",
            variables.merchant_id
          );
          expect(createBrandMerchant).to.have.property(
            "brand_id",
            variables.brand_id
          );
        }
      );
    });

    it("Should return error when config has wrong type", () => {
      variables.merchant_id = boltId;
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

    it("Should return error when no merchant_id provided", () => {
      variables.brand_id = brandMinionsId;
      variables.status = BRAND_MERCHANT_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(CREATE_BRAND_MERCHANT),
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

    it("Should return error when merchant_id is null", () => {
      variables.merchant_id = null;
      variables.brand_id = brandMinionsId;
      variables.status = BRAND_MERCHANT_STATUSES.disabled.name;

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

    it("Should return error when merchant_id has wrong type", () => {
      variables.merchant_id = true;
      variables.brand_id = brandMinionsId;
      variables.status = BRAND_MERCHANT_STATUSES.disabled.name;

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

    it("Should return error when no brand_id provided", () => {
      variables.merchant_id = boltId;
      variables.status = BRAND_MERCHANT_STATUSES.disabled.name;

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
      variables.merchant_id = boltId;
      variables.brand_id = null;
      variables.status = BRAND_MERCHANT_STATUSES.disabled.name;

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
      variables.merchant_id = boltId;
      variables.brand_id = true;
      variables.status = BRAND_MERCHANT_STATUSES.disabled.name;

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
      variables.merchant_id = boltId;
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
      variables.merchant_id = boltId;
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
      variables.merchant_id = boltId;
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

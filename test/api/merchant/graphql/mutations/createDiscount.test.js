import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_CREATE_DISCOUNT_MUTATION as CREATE_DISCOUNT } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let merchant_id;
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
    await Database("admins").insert({
      login: "offtop",
      encrypted_password,
    });

    [{ id: merchant_id }] = await Database("merchants")
      .insert([
        {
          login: "uklon",
          name: "uklon",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
        },
      ])
      .returning("id");

    await Database("discounts").insert({
      name: "disc1",
      percent: 1,
      merchant_id,
    });

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "uklon",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("discounts").del();
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { createDiscount }", () => {
    it("Should create discount with valid name, percent and provided", () => {
      variables.name = "disc2";
      variables.percent = 2;

      return accountGraphQLRequest(requestBody(CREATE_DISCOUNT), (res) => {
        const {
          body: {
            data: { createDiscount },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createDiscount");
        expect(createDiscount).to.have.property("name", variables.name);
        expect(createDiscount).to.have.property("percent", variables.percent);
      });
    });

    it("Should return error when no name provided", () => {
      variables.percent = 1;

      return accountGraphQLRequest(requestBody(CREATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$name" of required type "String!" was not provided`
        );
      });
    });

    it("Should return error when name is null", () => {
      variables.name = null;
      variables.percent = 1;

      return accountGraphQLRequest(requestBody(CREATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name has wrong type", () => {
      variables.name = true;
      variables.percent = 1;

      return accountGraphQLRequest(requestBody(CREATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no percent provided", () => {
      variables.name = "disc3";

      return accountGraphQLRequest(requestBody(CREATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$percent" of required type`
        );
      });
    });

    it("Should return error when percent is null", () => {
      variables.name = "disc2";
      variables.percent = null;

      return accountGraphQLRequest(requestBody(CREATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when percent has wrong type", () => {
      variables.name = "disc2";
      variables.percent = "dddddddddddd";

      return accountGraphQLRequest(requestBody(CREATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$percent" got invalid value'
        );
      });
    });

    it("Should return error when discount with passed name already exists", () => {
      variables.name = "disc1";
      variables.percent = 1;

      return accountGraphQLRequest(requestBody(CREATE_DISCOUNT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_CREATE_BRAND_MUTATION as CREATE_BRAND } from "@local/test/api/mutations.js";
import { BRAND_STATUSES } from "@local/constants/index.js";

let token;
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

    await Database("brands").insert({
      name: "Kotiki",
      default_config: {
        Apikey: "123123123123",
        partnerId: "businki",
      },
      status: BRAND_STATUSES.active.name,
    });

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("brands").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { createBrand }", () => {
    it("Should create brand with valid name, status and default_config provided ", () => {
      variables.name = "Minions";
      variables.default_config = {
        Apikey: "456456456456",
        partnerId: "bubochki",
      };
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_BRAND), (res) => {
        const {
          body: {
            data: { createBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createBrand");
        expect(createBrand).to.have.property("name", variables.name);
      });
    });

    it("Should create brand with valid name, status and empty default_config provided ", () => {
      variables.name = "Minions";
      variables.default_config = {};
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_BRAND), (res) => {
        const {
          body: {
            data: { createBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createBrand");
        expect(createBrand).to.have.property("name", variables.name);
      });
    });

    it("Should return error when default_config has wrong type", () => {
      variables.name = "Businki";
      variables.default_config = "test";
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "JSONObject cannot represent non-object value"
        );
      });
    });

    it("Should return error when no status provided", () => {
      variables.name = "Businki";
      variables.default_config = {};

      return accountGraphQLRequest(requestBody(CREATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$status" of required type "String!" was not provided`
        );
      });
    });

    it("Should return error when status is null", () => {
      variables.name = "Businki";
      variables.default_config = {};
      variables.status = null;

      return accountGraphQLRequest(requestBody(CREATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when status has wrong type", () => {
      variables.name = "Businki";
      variables.default_config = {};
      variables.status = true;

      return accountGraphQLRequest(requestBody(CREATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no name provided", () => {
      return accountGraphQLRequest(requestBody(CREATE_BRAND), (res) => {
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
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name has wrong type", () => {
      variables.name = true;
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when brand with passed name already exists", () => {
      variables.name = "Kotiki";
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_BRAND), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

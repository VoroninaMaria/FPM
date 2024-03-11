import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_CREATE_CATEGORY_MUTATION as CREATE_CATEGORY } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let merchant_id;
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

    await Database("client_categories").insert({
      name: "nice guy",
      merchant_id,
    });

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("client_categories").del();
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { createCategory }", () => {
    it("Should create category with valid name and merchant_id provided", () => {
      variables.name = "cool guy";
      variables.merchant_id = merchant_id;

      return accountGraphQLRequest(requestBody(CREATE_CATEGORY), (res) => {
        const {
          body: {
            data: { createCategory },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createCategory");
        expect(createCategory).to.have.property("name", variables.name);
        expect(createCategory).to.have.property(
          "merchant_id",
          variables.merchant_id
        );
      });
    });

    it("Should return error when no name provided", () => {
      variables.merchant_id = merchant_id;

      return accountGraphQLRequest(requestBody(CREATE_CATEGORY), (res) => {
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
      variables.merchant_id = merchant_id;

      return accountGraphQLRequest(requestBody(CREATE_CATEGORY), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name has wrong type", () => {
      variables.name = true;
      variables.merchant_id = merchant_id;

      return accountGraphQLRequest(requestBody(CREATE_CATEGORY), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no merchant_id provided", () => {
      variables.name = "cool guy";

      return accountGraphQLRequest(requestBody(CREATE_CATEGORY), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$merchant_id" of required type "ID!" was not provided`
        );
      });
    });

    it("Should return error when merchant_id is null", () => {
      variables.name = "cool guy";
      variables.merchant_id = null;

      return accountGraphQLRequest(requestBody(CREATE_CATEGORY), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when merchant_id has wrong type", () => {
      variables.name = "cool guy";
      variables.merchant_id = true;

      return accountGraphQLRequest(requestBody(CREATE_CATEGORY), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when merchant_id has wrong format", () => {
      variables.name = "cool guy";
      variables.merchant_id = "aaaaaaa";

      return accountGraphQLRequest(requestBody(CREATE_CATEGORY), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when category with passed name already exists", () => {
      variables.name = "nice guy";
      variables.merchant_id = merchant_id;

      return accountGraphQLRequest(requestBody(CREATE_CATEGORY), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

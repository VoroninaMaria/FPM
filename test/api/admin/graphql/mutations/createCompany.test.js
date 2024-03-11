import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_CREATE_COMPANY_MUTATION } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let variables = {};
let merchant_id;
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
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("id");

    await Database("companies").insert({
      name: "test2",
      merchant_id: merchant_id,
    });

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("companies").del();
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { createCompany }", () => {
    it("Should create file with valid name provided", () => {
      variables.merchant_id = merchant_id;
      variables.name = "test1";

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_COMPANY_MUTATION),
        (res) => {
          const {
            body: {
              data: { createCompany },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createCompany");
          expect(createCompany).to.have.property("name", variables.name);
        }
      );
    });

    it("Should return error when no params provided", () =>
      accountGraphQLRequest(
        requestBody(ADMIN_CREATE_COMPANY_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body).not.to.have.property("data");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(" was not provided");
        }
      ));

    it("Should return error when name is not provided", () => {
      variables.merchant_id = merchant_id;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_COMPANY_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$name" of required type'
          );
        }
      );
    });

    it("Should return error when merchant_id is not provided", () => {
      variables.name = "null1";

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_COMPANY_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$merchant_id" of required type "ID!" was not provided'
          );
        }
      );
    });

    it("Should return error when name is null", () => {
      variables.merchant_id = merchant_id;
      variables.name = null;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_COMPANY_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when merchant_id is null", () => {
      variables.merchant_id = null;
      variables.name = "null1";

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_COMPANY_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when name has wrong type", () => {
      variables.merchant_id = merchant_id;
      variables.name = true;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_COMPANY_MUTATION),
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

    it("Should return error when merchant_id has wrong type", () => {
      variables.merchant_id = true;
      variables.name = "testt";

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_COMPANY_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("got invalid value");
        }
      );
    });

    it("Should return error when file with passed name already exists", async () => {
      const company = await Database("companies")
        .where({ name: "test2" })
        .first();

      variables.name = company.name;
      variables.merchant_id = company.merchant_id;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_COMPANY_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("already_exist");
        }
      );
    });
  });
});

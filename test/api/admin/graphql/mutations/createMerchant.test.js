import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_CREATE_MERCHANT_MUTATION as CREATE_MERCHANT } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

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

    await Database("merchants").insert({
      name: "Kotiki",
      login: "Kotiki",
      encrypted_password,
      status: MERCHANT_STATUSES.active.name,
    });

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { createMerchant }", () => {
    it("Should create merchant with valid name,  login, password and status provided ", () => {
      variables.name = "Minions";
      variables.login = "Minions";
      variables.password = encrypted_password;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        const {
          body: {
            data: { createMerchant },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createMerchant");
        expect(createMerchant).to.have.property("name", variables.name);
        expect(Object.keys(createMerchant)).to.eql([
          "id",
          "name",
          "login",
          "status",
          "created_at",
          "updated_at",
        ]);
      });
    });

    it("Should return error when no name provided", () => {
      variables.login = "Businki";
      variables.password = encrypted_password;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
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
      variables.login = "Businki";
      variables.password = encrypted_password;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name has wrong type", () => {
      variables.name = true;
      variables.login = "Businki";
      variables.password = encrypted_password;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no login provided", () => {
      variables.name = "Businki";
      variables.password = encrypted_password;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$login" of required type "String!" was not provided`
        );
      });
    });

    it("Should return error when login is null", () => {
      variables.name = "Businki";
      variables.login = null;
      variables.password = encrypted_password;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when login has wrong type", () => {
      variables.name = "Businki";
      variables.login = true;
      variables.password = encrypted_password;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no password provided", () => {
      variables.name = "Businki";
      variables.login = "Businki";
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$password" of required type "String!" was not provided`
        );
      });
    });

    it("Should return error when password is null", () => {
      variables.name = "Businki";
      variables.login = "Businki";
      variables.password = null;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when password has wrong type", () => {
      variables.name = "Businki";
      variables.login = "Businki";
      variables.password = true;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no status provided", () => {
      variables.name = "Businki";
      variables.login = "Businki";
      variables.password = encrypted_password;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
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
      variables.login = "Businki";
      variables.password = encrypted_password;
      variables.status = null;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when status has wrong type", () => {
      variables.name = "Businki";
      variables.login = "Businki";
      variables.password = encrypted_password;
      variables.status = true;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when merchant when passed name already exists", () => {
      variables.name = "Kotiki";
      variables.login = "Minions";
      variables.password = encrypted_password;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });

    it("Should return error when merchant when passed login already exists", () => {
      variables.name = "Minions";
      variables.login = "Kotiki";
      variables.password = encrypted_password;
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });

    it("Should return error when merchant when passed password less than 4 characters", () => {
      variables.name = "Minions";
      variables.login = "Kotiki";
      variables.password = "123";
      variables.status = MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("min_length");
      });
    });

    it("Should return error when merchant when passed status not include in MERCHANT_STATUSES list", () => {
      variables.name = "Minions";
      variables.login = "Minions";
      variables.password = encrypted_password;
      variables.status = "error";

      return accountGraphQLRequest(requestBody(CREATE_MERCHANT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("unknown_status");
      });
    });
  });
});

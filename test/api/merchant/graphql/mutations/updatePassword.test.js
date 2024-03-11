import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_UPDATE_PASSWORD_MUTATION as UPDATE_PASSWORD } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

const current_merchant = {};
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
    .set("Authorization", `Bearer ${current_merchant.token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Merchant GraphQL", () => {
  beforeEach(async () => {
    await Database("merchants").insert([
      {
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      },
    ]);

    ({
      body: { token: current_merchant.token },
    } = await accountLoginRequest({
      login: "uklon",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { updateMerchant(update password) }", () => {
    it("Should update password with right current_password and new_password provided", () => {
      variables.current_password = "123123";
      variables.new_password = "password";

      return accountGraphQLRequest(requestBody(UPDATE_PASSWORD), (res) => {
        const {
          body: {
            data: { updateMerchant },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateMerchant");
        expect(updateMerchant).to.have.property("id");
      });
    });

    it("Should return error when new_password provided but no current_password provided", () => {
      variables.new_password = "password";

      return accountGraphQLRequest(requestBody(UPDATE_PASSWORD), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("password_is_required");
      });
    });

    it("Should return error when current_password provided but no new_password provided", () => {
      variables.current_password = "123123";

      return accountGraphQLRequest(requestBody(UPDATE_PASSWORD), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("password_is_required");
      });
    });

    it("Should return error when current_password is null", () => {
      variables.current_password = null;
      variables.new_password = "password";

      return accountGraphQLRequest(requestBody(UPDATE_PASSWORD), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("password_is_required");
      });
    });

    it("Should return error when new_password is null", () => {
      variables.current_password = "123123";
      variables.new_password = null;

      return accountGraphQLRequest(requestBody(UPDATE_PASSWORD), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("password_is_required");
      });
    });

    it("Should return error when current_password has wrong type", () => {
      variables.current_password = true;
      variables.new_password = "password";

      return accountGraphQLRequest(requestBody(UPDATE_PASSWORD), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when new_password has wrong type", () => {
      variables.current_password = "123123";
      variables.new_password = true;

      return accountGraphQLRequest(requestBody(UPDATE_PASSWORD), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when current_password is too short", () => {
      variables.current_password = "11";
      variables.new_password = "password";

      return accountGraphQLRequest(requestBody(UPDATE_PASSWORD), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("min_length");
      });
    });

    it("Should return error when new_password is too short", () => {
      variables.current_password = "123123";
      variables.new_password = "11";

      return accountGraphQLRequest(requestBody(UPDATE_PASSWORD), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("min_length");
      });
    });

    it("Should return error when current_password doesn't match", () => {
      variables.current_password = "password";
      variables.new_password = "password";

      return accountGraphQLRequest(requestBody(UPDATE_PASSWORD), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("not_match");
      });
    });
  });
});

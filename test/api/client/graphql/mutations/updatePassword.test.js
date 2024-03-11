import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { CLIENT_STATUSES, MERCHANT_STATUSES } from "@local/constants/index.js";
import { CLIENT_UPDATE_PASSWORD_MUTATION } from "@local/test/api/mutations.js";

let token;
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });
const encrypted_password = await encryptPassword("123123");

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/client/auth/login").send(payload).then(callback);

const accountGraphQLRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/client/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Client GraphQL", () => {
  beforeEach(async () => {
    const [merchant] = await Database("merchants")
      .insert({
        login: "bolt",
        name: "bolt",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("*");

    await Database("clients").insert({
      merchant_id: merchant.id,
      phone: "380110000000",
      encrypted_password,
      session_identifier: "session",
      status: CLIENT_STATUSES.confirmed.name,
    });

    ({
      body: { token: token },
    } = await accountLoginRequest({
      phone: "380110000000",
      password: "123123",
      merchant: "bolt",
    }));
  });

  afterEach(async () => {
    await Database("clients").del();
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { updatePassword }", () => {
    it("Should update password with right old_password and new_password provided", () => {
      variables.old_password = "123123";
      variables.new_password = "12345678";

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
        (res) => {
          const {
            body: {
              data: { updatePassword },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updatePassword");
          expect(updatePassword).to.have.property("id");
        }
      );
    });

    it("Should return error when no old_password provided", () => {
      variables.new_password = "1234567";

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$old_password" of required type "String!" was not provided'
          );
        }
      );
    });

    it("Should return error when no new_password provided", () => {
      variables.old_password = "123123";

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$new_password" of required type "String!" was not provided'
          );
        }
      );
    });

    it("Should return error when old_password is null", () => {
      variables.old_password = null;
      variables.new_password = "1234567";

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when new_password is null", () => {
      variables.old_password = "123123";
      variables.new_password = null;

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when old_password has wrong type", () => {
      variables.old_password = true;
      variables.new_password = "1234567";

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
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

    it("Should return error when new_password has wrong type", () => {
      variables.old_password = "123123";
      variables.new_password = true;

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
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

    it("Should return error when old_password is too short", () => {
      variables.old_password = "11";
      variables.new_password = "password";

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "must be at least 4 characters"
          );
        }
      );
    });

    it("Should return error when new_password is too short", () => {
      variables.old_password = "123123";
      variables.new_password = "11";

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "must be at least 4 characters"
          );
        }
      );
    });

    it("Should return error when old_password is too long", () => {
      variables.old_password = "123456789";
      variables.new_password = "password";

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "must be at most 8 characters"
          );
        }
      );
    });

    it("Should return error when new_password is too long", () => {
      variables.old_password = "123123";
      variables.new_password = "123456789";

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "must be at most 8 characters"
          );
        }
      );
    });

    it("Should return error when old_password doesn't match", () => {
      variables.old_password = "123456";
      variables.new_password = "1234567";

      return accountGraphQLRequest(
        requestBody(CLIENT_UPDATE_PASSWORD_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("old_password_invalid");
        }
      );
    });
  });
});

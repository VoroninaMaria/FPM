import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_UPDATE_MUTATION } from "@local/test/api/mutations.js";

const current_admin = {};
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });
const encrypted_password = await encryptPassword("123123");

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/admin/auth/login").send(payload).then(callback);

const accountGraphQLRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/admin/graphql")
    .set("Authorization", `Bearer ${current_admin.token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Admin GraphQL", () => {
  beforeEach(async () => {
    await Database("admins").insert([
      {
        login: "offtop",
        encrypted_password,
      },
    ]);

    ({
      body: { token: current_admin.token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { updateAdmin }", () => {
    it("Should update password with right current_password and new_password provided", () => {
      variables.current_password = "123123";
      variables.new_password = "password";

      return accountGraphQLRequest(
        requestBody(ADMIN_UPDATE_MUTATION),
        (res) => {
          const {
            body: {
              data: { updateAdmin },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateAdmin");
          expect(updateAdmin).to.have.property("id");
        }
      );
    });

    it("Should return error when no current_password provided", () => {
      variables.new_password = "password";

      return accountGraphQLRequest(
        requestBody(ADMIN_UPDATE_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$current_password" of required type "String!" was not provided'
          );
        }
      );
    });

    it("Should return error when no new_password provided", () => {
      variables.current_password = "123123";

      return accountGraphQLRequest(
        requestBody(ADMIN_UPDATE_MUTATION),
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

    it("Should return error when current_password is null", () => {
      variables.current_password = null;
      variables.new_password = "password";

      return accountGraphQLRequest(
        requestBody(ADMIN_UPDATE_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when new_password is null", () => {
      variables.current_password = "123123";
      variables.new_password = null;

      return accountGraphQLRequest(
        requestBody(ADMIN_UPDATE_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when current_password has wrong type", () => {
      variables.current_password = true;
      variables.new_password = "password";

      return accountGraphQLRequest(
        requestBody(ADMIN_UPDATE_MUTATION),
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
      variables.current_password = "123123";
      variables.new_password = true;

      return accountGraphQLRequest(
        requestBody(ADMIN_UPDATE_MUTATION),
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

    it("Should return error when current_password is too short", () => {
      variables.current_password = "11";
      variables.new_password = "password";

      return accountGraphQLRequest(
        requestBody(ADMIN_UPDATE_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("min_length");
        }
      );
    });

    it("Should return error when new_password is too short", () => {
      variables.current_password = "123123";
      variables.new_password = "11";

      return accountGraphQLRequest(
        requestBody(ADMIN_UPDATE_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("min_length");
        }
      );
    });

    it("Should return error when current_password doesn't match", () => {
      variables.current_password = "password";
      variables.new_password = "password";

      return accountGraphQLRequest(
        requestBody(ADMIN_UPDATE_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("not_match");
        }
      );
    });
  });
});

import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_CREATE_PAYMENT_GATEWAY_MUTATION as CREATE_PAYMENT_GATEWAY } from "@local/test/api/mutations.js";
import { PAYMENT_GATEWAY_STATUSES } from "@local/constants/index.js";

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

    await Database("payment_gateways").insert({
      name: "Kotiki",
      status: PAYMENT_GATEWAY_STATUSES.active.name,
    });

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("payment_gateways").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { createPaymentGateway }", () => {
    it("Should create payment_gateway with valid name and status provided ", () => {
      variables.name = "Minions";
      variables.status = PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { createPaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createPaymentGateway");
          expect(createPaymentGateway).to.have.property("name", variables.name);
          expect(Object.keys(createPaymentGateway)).to.eql([
            "id",
            "name",
            "status",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should return error when no status provided", () => {
      variables.name = "Businki";

      return accountGraphQLRequest(
        requestBody(CREATE_PAYMENT_GATEWAY),
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
      variables.name = "Businki";
      variables.status = null;

      return accountGraphQLRequest(
        requestBody(CREATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when status has wrong type", () => {
      variables.name = "Businki";
      variables.status = true;

      return accountGraphQLRequest(
        requestBody(CREATE_PAYMENT_GATEWAY),
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

    it("Should return error when status doesn't exist", () => {
      variables.name = "Businki";
      variables.status = "perfect";

      return accountGraphQLRequest(
        requestBody(CREATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("unknown_status");
        }
      );
    });

    it("Should return error when no name provided", () => {
      variables.status = PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$name" of required type "String!" was not provided`
          );
        }
      );
    });

    it("Should return error when name is null", () => {
      variables.name = null;
      variables.status = PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when name has wrong type", () => {
      variables.name = true;
      variables.status = PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_PAYMENT_GATEWAY),
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

    it("Should return error when name already exist", () => {
      variables.name = "Kotiki";
      variables.status = PAYMENT_GATEWAY_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_PAYMENT_GATEWAY),
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

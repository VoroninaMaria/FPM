import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_UPDATE_PAYMENT_GATEWAY_MUTATION as UPDATE_PAYMENT_GATEWAY } from "@local/test/api/mutations.js";
import { PAYMENT_GATEWAY_STATUSES } from "@local/constants/index.js";

let token;
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

    await Database("payment_gateways").insert([
      {
        name: "Pumb",
        status: PAYMENT_GATEWAY_STATUSES.active.name,
      },
      {
        name: "Monobank",
        status: PAYMENT_GATEWAY_STATUSES.active.name,
      },
    ]);

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

  describe("mutation { updatePaymentGateway }", () => {
    it("Should update payment_gateway with valid id, name and status provided", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.name = "Businki";
      variables.status = PAYMENT_GATEWAY_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { updatePaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updatePaymentGateway");
          expect(Object.keys(updatePaymentGateway)).to.eql([
            "id",
            "name",
            "status",
            "created_at",
            "updated_at",
          ]);
          expect(Object.values(updatePaymentGateway)).to.eql([
            paymentGateway.id,
            variables.name,
            variables.status,
            updatePaymentGateway.created_at,
            updatePaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should return error when no id provided", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.name = paymentGateway.name;
      variables.status = paymentGateway.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$id" of required type "ID!" was not provided'
          );
        }
      );
    });

    it("Should return error when id is null", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = null;
      variables.name = paymentGateway.name;
      variables.status = paymentGateway.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when id has wrong type", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = true;
      variables.name = paymentGateway.name;
      variables.status = paymentGateway.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
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

    it("Should return error when payment_gateway doesn't exist", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = "-1";
      variables.name = paymentGateway.name;
      variables.status = paymentGateway.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        }
      );
    });

    it("Should return error when no name provided", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.status = paymentGateway.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body).not.to.have.property("data");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$name" of required type "String!" was not provided'
          );
        }
      );
    });

    it("Should return error when name is null", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.name = null;
      variables.status = paymentGateway.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when name has wrong type", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.name = true;
      variables.status = paymentGateway.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
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

    it("Should return error when name already exist", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.name = "Monobank";
      variables.status = paymentGateway.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("already_exist");
        }
      );
    });

    it("Should update name with valid new name provided", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.name = "Businki";
      variables.status = paymentGateway.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { updatePaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updatePaymentGateway");
          expect(Object.keys(updatePaymentGateway)).to.eql([
            "id",
            "name",
            "status",
            "created_at",
            "updated_at",
          ]);
          expect(Object.values(updatePaymentGateway)).to.eql([
            paymentGateway.id,
            variables.name,
            paymentGateway.status,
            updatePaymentGateway.created_at,
            updatePaymentGateway.updated_at,
          ]);
        }
      );
    });

    it("Should return error when no status provided", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.name = paymentGateway.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$status" of required type "String!" was not provided.'
          );
        }
      );
    });

    it("Should return error when status is null", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.name = paymentGateway.name;
      variables.status = null;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$status" of non-null type "String!" must not be null.'
          );
        }
      );
    });

    it("Should return error when status has wrong type", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.name = paymentGateway.name;
      variables.status = true;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
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

    it("Should return error when status doesn't exist", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.name = paymentGateway.name;
      variables.status = "perfect";

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("unknown_status");
        }
      );
    });

    it("Should update status with valid new status provided", async () => {
      const paymentGateway = await Database("payment_gateways")
        .where({ name: "Pumb" })
        .first();

      variables.id = paymentGateway.id;
      variables.name = paymentGateway.name;
      variables.status = PAYMENT_GATEWAY_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_PAYMENT_GATEWAY),
        (res) => {
          const {
            body: {
              data: { updatePaymentGateway },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updatePaymentGateway");
          expect(Object.keys(updatePaymentGateway)).to.eql([
            "id",
            "name",
            "status",
            "created_at",
            "updated_at",
          ]);
          expect(Object.values(updatePaymentGateway)).to.eql([
            paymentGateway.id,
            paymentGateway.name,
            variables.status,
            updatePaymentGateway.created_at,
            updatePaymentGateway.updated_at,
          ]);
        }
      );
    });
  });
});

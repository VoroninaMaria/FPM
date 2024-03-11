import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_UPDATE_SMS_SERVICE_MUTATION as UPDATE_SMS_SERVICE } from "@local/test/api/mutations.js";
import {
  SMS_SERVICE_STATUSES,
  MERCHANT_STATUSES,
} from "@local/constants/index.js";

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
    const [{ id: current_merchant_id }, { id: other_merchant_id }] =
      await Database("merchants")
        .insert([
          {
            login: "uklon",
            name: "uklon",
            encrypted_password,
            status: MERCHANT_STATUSES.active.name,
            plugins: {
              smsServices: true,
            },
          },
          {
            login: "uber",
            name: "uber",
            encrypted_password,
            status: MERCHANT_STATUSES.active.name,
            plugins: {
              smsServices: true,
            },
          },
        ])
        .returning("id");

    await Database("sms_services").insert([
      {
        service_name: "flySms",
        config: {
          key: "UwEA4v6sxP1ZMYCbKqKaMw2e1NmY4oGr",
          sender: "InfoCenter",
        },
        status: SMS_SERVICE_STATUSES.active.name,
        merchant_id: current_merchant_id,
      },
      {
        service_name: "flySms",
        config: {
          key: "UwEA4v6sxP1ZMYCbKqKaMw2e1NmY4oGr",
          sender: "InfoCenter",
        },
        status: SMS_SERVICE_STATUSES.active.name,
        merchant_id: other_merchant_id,
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
    await Database("sms_services").del();
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { updateSmsService }", () => {
    it("Should update sms_service with valid id and status provided", async () => {
      const { id } = await Database("sms_services").first();

      variables.id = id;
      variables.status = SMS_SERVICE_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        const {
          body: {
            data: { updateSmsService },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateSmsService");
        expect(updateSmsService).to.have.property("id", id);
        expect(updateSmsService).to.have.property(
          "status",
          SMS_SERVICE_STATUSES.disabled.name
        );
      });
    });

    it("Should return error when no id provided", () => {
      variables.status = SMS_SERVICE_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      });
    });

    it("Should return error when no status provided", async () => {
      const { id } = await Database("sms_services").first();

      variables.id = id;

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$status" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when id is null", () => {
      variables.id = null;
      variables.status = SMS_SERVICE_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when status is null", async () => {
      const { id } = await Database("sms_services").first();

      variables.id = id;
      variables.status = null;

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when id has wrong format", () => {
      variables.id = "aaaa";
      variables.status = SMS_SERVICE_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });
    it("Should return error when id is not string", () => {
      variables.id = 1;
      variables.status = SMS_SERVICE_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when sms_service not found by id", () => {
      variables.id = "11111111-1111-1111-1111-111111111111";
      variables.status = SMS_SERVICE_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("sms_service_not_found");
      });
    });

    it("Should return error when status doesn't exist", async () => {
      const { id } = await Database("sms_services").first();

      variables.id = id;
      variables.status = "idk";

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("unknown_status");
      });
    });

    it("Should return error when status is not string", async () => {
      const { id } = await Database("sms_services").first();

      variables.id = id;
      variables.status = true;

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when accessing other merchant's sms_service", async () => {
      const { id } = await Database("sms_services")
        .where({
          merchant_id: Database("merchants")
            .select("id")
            .where({ name: "uber" }),
        })
        .first();

      variables.id = id;
      variables.status = SMS_SERVICE_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("sms_service_not_found");
      });
    });
  });
});

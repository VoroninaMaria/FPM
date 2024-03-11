import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_CREATE_SMS_SERVICE_MUTATION as CREATE_SMS_SERVICE } from "@local/test/api/mutations.js";
import {
  MERCHANT_STATUSES,
  SMS_SERVICE_STATUSES,
} from "@local/constants/index.js";

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

    await Database("merchants").insert({
      login: "uklon",
      name: "uklon",
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
    await Database("sms_services").del();
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { createSmsService }", () => {
    it("Should create sms_service with valid name and config provided", () => {
      variables.service_name = "alphaSms";
      variables.status = SMS_SERVICE_STATUSES.error.name;
      variables.config = {
        key: "key",
        sender: "sender",
      };

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        const {
          body: {
            data: { createSmsService },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createSmsService");
        expect(createSmsService).to.have.property(
          "service_name",
          variables.service_name
        );
        expect(createSmsService).to.have.property("config");
      });
    });

    it("Should create sms_service with valid name, config and merhant_id provided", async () => {
      const { id: merchant_id } = await Database("merchants").first();

      variables.service_name = "alphaSms";
      variables.config = {
        key: "key",
        sender: "sender",
      };
      variables.status = SMS_SERVICE_STATUSES.error.name;
      variables.merchant_id = merchant_id;

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        const {
          body: {
            data: { createSmsService },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createSmsService");
        expect(createSmsService).to.have.property(
          "service_name",
          variables.service_name
        );
        expect(createSmsService).to.have.property("config");
        expect(createSmsService).to.have.property("merchant_id", merchant_id);
      });
    });

    it("Should return error when no name provided", () => {
      variables.config = {
        key: "key",
        sender: "sender",
      };
      variables.status = SMS_SERVICE_STATUSES.error.name;

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$service_name" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when no config provided", () => {
      variables.service_name = "alphaSms";
      variables.status = SMS_SERVICE_STATUSES.error.name;

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$config" of required type "JSONObject!" was not provided'
        );
      });
    });

    it("Should return error when no status provided", () => {
      variables.service_name = "alphaSms";
      variables.config = {
        key: "key",
        sender: "sender",
      };

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$status" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when name is null", () => {
      variables.service_name = null;
      variables.config = {
        key: "key",
        sender: "sender",
      };
      variables.status = SMS_SERVICE_STATUSES.error.name;

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when config is null", () => {
      variables.service_name = "alphaSms";
      variables.config = null;
      variables.status = SMS_SERVICE_STATUSES.error.name;

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when status is null", () => {
      variables.service_name = "alphaSms";
      variables.config = {
        key: "key",
        sender: "sender",
      };
      variables.status = null;

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name has wrong type", () => {
      variables.service_name = true;
      variables.config = {
        key: "key",
        sender: "sender",
      };
      variables.status = SMS_SERVICE_STATUSES.error.name;

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when config is not object", () => {
      variables.service_name = "alphaSms";
      variables.status = SMS_SERVICE_STATUSES.error.name;
      variables.config = true;

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "JSONObject cannot represent non-object value"
        );
      });
    });

    it("Should return error when name has wrong type", () => {
      variables.service_name = "alphaSms";
      variables.config = {
        key: "key",
        sender: "sender",
      };
      variables.status = true;

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when merchant_id has wrong format", () => {
      variables.service_name = "alphaSms";
      variables.config = {
        key: "key",
        sender: "sender",
      };
      variables.status = SMS_SERVICE_STATUSES.error.name;
      variables.merchant_id = "id";

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when id is not string", () => {
      variables.service_name = "alphaSms";
      variables.config = {
        key: "key",
        sender: "sender",
      };
      variables.status = SMS_SERVICE_STATUSES.error.name;
      variables.merchant_id = 1;

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when sms_service not found by id", () => {
      variables.service_name = "alphaSms";
      variables.config = {
        key: "key",
        sender: "sender",
      };
      variables.status = SMS_SERVICE_STATUSES.error.name;
      variables.merchant_id = "11111111-1111-1111-1111-111111111111";

      return accountGraphQLRequest(requestBody(CREATE_SMS_SERVICE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("merchant_not_found");
      });
    });
  });
});

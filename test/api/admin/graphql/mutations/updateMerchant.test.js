import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_UPDATE_MERCHANT_MUTATION as UPDATE_MERCHANT } from "@local/test/api/mutations.js";
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

  describe("mutation { updateMerchant }", () => {
    it("Should update merchant with valid values provided", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        const {
          body: {
            data: { updateMerchant },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateMerchant");
        expect(updateMerchant).to.have.property("id", id);
        expect(updateMerchant).to.have.property(
          "status",
          MERCHANT_STATUSES.disabled.name
        );
      });
    });

    it("Should return error when no id provided", () => {
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      });
    });

    it("Should return error when no status provided", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$status" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when no storage_capacity provided", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$storage_capacity" of required type "Int!" was not provided'
        );
      });
    });

    it("Should return error when no plugins provided", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = 100;

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$plugins" of required type "JSONObject!" was not provided'
        );
      });
    });

    it("Should return error when id is null", () => {
      variables.id = null;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when status is null", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.status = null;
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when storage_capacity is null", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = null;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when plugins is null", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = 100;
      variables.plugins = null;

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when id has wrong format", () => {
      variables.id = "aaaa";
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when id is not string", () => {
      variables.id = 1;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when plugins is not an object", () => {
      variables.id = 1;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = 100;
      variables.plugins = true;

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "JSONObject cannot represent non-object value"
        );
      });
    });

    it("Should return error when plugins.designEditor is not a boolean", () => {
      variables.id = 1;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: 13,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "plugins.designEditor must be a `boolean`"
        );
      });
    });

    it("Should return error when merchant not found by id", () => {
      variables.id = "11111111-1111-1111-1111-111111111111";
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("merchant_not_found");
      });
    });

    it("Should return error when status doesn't exist", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.status = "idk";
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("unknown_status");
      });
    });

    it("Should return error when status is not string", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.status = true;
      variables.storage_capacity = 100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when storage_capacity is not number", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = "three hundred";
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "Int cannot represent non-integer value"
        );
      });
    });

    it("Should return error when storage_capacity is negative", async () => {
      const { id } = await Database("merchants").first();

      variables.id = id;
      variables.status = MERCHANT_STATUSES.disabled.name;
      variables.storage_capacity = -100;
      variables.plugins = {
        designEditor: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_MERCHANT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "storage_capacity must be greater than or equal to 0"
        );
      });
    });
  });
});

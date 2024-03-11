import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_UPDATE_BRAND_MUTATION as UPDATE_BRAND } from "@local/test/api/mutations.js";
import { BRAND_STATUSES } from "@local/constants/index.js";

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

    await Database("brands").insert({
      name: "Kotiki",
      default_config: {
        Apikey: "456456456456",
        partnerId: "bubochki",
      },
    });
    await Database("brands").insert({
      name: "Bubochki",
      default_config: {},
    });

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("brands").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { updateBrand }", () => {
    it("Should update brand name with valid id, name, default_config and status provided", async () => {
      const brand = await Database("brands").where({ name: "Kotiki" }).first();

      variables.id = brand.id;
      variables.name = "Businki";
      variables.default_config = brand.default_config;
      variables.status = brand.status;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        const {
          body: {
            data: { updateBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateBrand");
        expect(Object.keys(updateBrand)).to.eql([
          "id",
          "name",
          "default_config",
          "status",
          "created_at",
          "updated_at",
        ]);
      });
    });

    it("Should update brand default_config with valid id, name, default_config and status provided", async () => {
      const brand = await Database("brands").where({ name: "Kotiki" }).first();

      variables.id = brand.id;
      variables.name = brand.name;
      variables.default_config = {
        Apikey: "123123123123",
        partnerId: "bubochki",
      };
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        const {
          body: {
            data: { updateBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateBrand");
        expect(Object.keys(updateBrand)).to.eql([
          "id",
          "name",
          "default_config",
          "status",
          "created_at",
          "updated_at",
        ]);
      });
    });

    it("Should update brand status with valid id, name, default_config and status provided", async () => {
      const brand = await Database("brands").where({ name: "Kotiki" }).first();

      variables.id = brand.id;
      variables.name = brand.name;
      variables.default_config = brand.default_config;
      variables.status = BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        const {
          body: {
            data: { updateBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateBrand");
        expect(Object.keys(updateBrand)).to.eql([
          "id",
          "name",
          "default_config",
          "status",
          "created_at",
          "updated_at",
        ]);
      });
    });

    it("Should return error when no id provided", () => {
      variables.name = "Businki";
      variables.default_config = {};
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      });
    });

    it("Should return error when no name provided", async () => {
      const { id } = await Database("brands").first();

      variables.id = id;
      variables.default_config = {};
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$name" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when no default_config provided", async () => {
      const { id } = await Database("brands").first();

      variables.id = id;
      variables.name = "Businki";
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        const {
          body: {
            data: { updateBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body).to.have.property("data");
        expect(res.body.data).to.have.property(
          "updateBrand",
          updateBrand,
          null
        );
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "default_config is a required field"
        );
      });
    });

    it("Should return error when no status provided", async () => {
      const { id } = await Database("brands").first();

      variables.id = id;
      variables.name = "Businki";
      variables.default_config = {};

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$status" of required type "String!" was not provided.'
        );
      });
    });

    it("Should return error when id is null", () => {
      variables.id = null;
      variables.name = "Businki";
      variables.default_config = {};
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name is null", async () => {
      const { id } = await Database("brands").first();

      variables.id = id;
      variables.name = null;
      variables.default_config = {};
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when default_config is null", async () => {
      const { id } = await Database("brands").first();

      variables.id = id;
      variables.name = "Businki";
      variables.default_config = null;
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        const {
          body: {
            data: { updateBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body).to.have.property("data");
        expect(res.body.data).to.have.property(
          "updateBrand",
          updateBrand,
          null
        );
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "default_config is a required field"
        );
      });
    });

    it("Should return error when status is null", async () => {
      const { id } = await Database("brands").first();

      variables.id = id;
      variables.name = "Businki";
      variables.default_config = {};
      variables.status = null;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$status" of non-null type "String!" must not be null.'
        );
      });
    });

    it("Should return error when id is not numeral", () => {
      variables.id = "aaaa";
      variables.name = "Businki";
      variables.default_config = {};
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });
    it("Should return error when id has wrong type", () => {
      variables.id = true;
      variables.name = "Businki";
      variables.default_config = {};
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when brand not found by id", () => {
      variables.id = "-1";
      variables.name = "Businki";
      variables.default_config = {};
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when name is not string", async () => {
      const { id } = await Database("brands").first();

      variables.id = id;
      variables.name = true;
      variables.default_config = {};
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when default_config is not JSON", async () => {
      const { id } = await Database("brands").first();

      variables.id = id;
      variables.name = "Businki";
      variables.default_config = "test";
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "JSONObject cannot represent non-object value"
        );
      });
    });

    it("Should return error when status is not a string", async () => {
      const { id } = await Database("brands").first();

      variables.id = id;
      variables.name = "Businki";
      variables.default_config = {};
      variables.status = true;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when new name is already used", async () => {
      const { id } = await Database("brands").where({ name: "Kotiki" }).first();

      variables.id = id;
      variables.name = "Bubochki";
      variables.default_config = {};
      variables.status = BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_BRAND), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_UPDATE_GAS_BRAND_MUTATION as UPDATE_GAS_BRAND } from "@local/test/api/mutations.js";
import {
  GAS_BRAND_STATUSES,
  MERCHANT_STATUSES,
} from "@local/constants/index.js";

let token;
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });
const encrypted_password = await encryptPassword("123123");
let merchant_id;
const testImage2 =
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAQAAAAD+Fb1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnBwYNHjXa9Gr5AAAALUlEQVQI12Ng6GV4x3CMwZmZwZ3hA8MLBhEmBkYGcQY5BlYWhn8Mggy/Gf4CAI7jCAM0uK/FAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA3LTA2VDEzOjMwOjQxKzAwOjAwt1HH6gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wNy0wNlQxMzozMDo0MSswMDowMMYMf1YAAAAASUVORK5CYII=";

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

    [{ id: merchant_id }] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("id");

    const [file] = await Database("files")
      .insert({
        name: "test2",
        account_id: merchant_id,
        account_type: "merchants",
        mimetype: "image/jpeg",
        size: "1024",
        data: Buffer.from(testImage2, "base64"),
      })
      .returning("*");

    await Database("files")
      .insert({
        name: "test1",
        account_id: merchant_id,
        account_type: "merchants",
        mimetype: "image/jpeg",
        size: "1024",
        data: Buffer.from(testImage2, "base64"),
      })
      .returning("*");

    await Database("gas_brands").insert([
      {
        name: "Kotiki",
        logo_file_id: file.id,
        status: GAS_BRAND_STATUSES.active.name,
      },
      {
        name: "Kotiki1",
        logo_file_id: file.id,
        status: GAS_BRAND_STATUSES.active.name,
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
    await Database("gas_brands").del();
    await Database("files").del();
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { updateGasBrand }", () => {
    it("Should update gas_brand name with valid id, name, logo_file_id and status provided", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = "Businki";
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = gas_brand.status;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        const {
          body: {
            data: { updateGasBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateGasBrand");
        expect(Object.keys(updateGasBrand)).to.eql([
          "id",
          "name",
          "logo_file_id",
          "status",
          "created_at",
          "updated_at",
        ]);
      });
    });

    it("Should update gas_brand logo_file_id with valid id, name, default_config and status provided", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      const fileNew = await Database("files").where({ name: "test1" }).first();

      variables.id = gas_brand.id;
      variables.name = gas_brand.name;
      variables.logo_file_id = fileNew.id;
      variables.status = GAS_BRAND_STATUSES.active.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        const {
          body: {
            data: { updateGasBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateGasBrand");
        expect(res.body.data.updateGasBrand.logo_file_id).to.eql(fileNew.id);
        expect(Object.keys(updateGasBrand)).to.eql([
          "id",
          "name",
          "logo_file_id",
          "status",
          "created_at",
          "updated_at",
        ]);
      });
    });

    it("Should update gas_brand status with valid id, name, logo_file_id and status provided", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = gas_brand.name;
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        const {
          body: {
            data: { updateGasBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateGasBrand");
        expect(res.body.data.updateGasBrand.status).to.eql("disabled");
        expect(Object.keys(updateGasBrand)).to.eql([
          "id",
          "name",
          "logo_file_id",
          "status",
          "created_at",
          "updated_at",
        ]);
      });
    });

    it("Should update gas_brand name with valid id, name, logo_file_id and status provided", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = "NAME1";
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        const {
          body: {
            data: { updateGasBrand },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateGasBrand");
        expect(res.body.data.updateGasBrand.name).to.eql("NAME1");
        expect(Object.keys(updateGasBrand)).to.eql([
          "id",
          "name",
          "logo_file_id",
          "status",
          "created_at",
          "updated_at",
        ]);
      });
    });

    it("Should return error when no id provided", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.name = gas_brand.name;
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      });
    });

    it("Should return error when no name provided", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$name" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when no logo_file_id provided", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = gas_brand.name;

      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$logo_file_id" of required type "ID!" was not provided'
        );
      });
    });

    it("Should return error when no status provided", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = gas_brand.name;
      variables.logo_file_id = gas_brand.logo_file_id;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$status" of required type "String!" was not provided.'
        );
      });
    });

    it("Should return error when id is null", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = null;
      variables.name = gas_brand.name;
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name is null", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = null;
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when logo_file_id is null", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = gas_brand.name;
      variables.logo_file_id = null;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$logo_file_id" of non-null type "ID!" must not be null.'
        );
      });
    });

    it("Should return error when status is null", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = gas_brand.name;
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = null;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$status" of non-null type "String!" must not be null.'
        );
      });
    });

    it("Should return error when id is not numeral", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = "aaaaa";
      variables.name = gas_brand.name;
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("invalid_id_format");
      });
    });

    it("Should return error when id has wrong type", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = true;
      variables.name = gas_brand.name;
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when name is in wrong type", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = true;
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when logo_file_id is in wrong type", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = gas_brand.name;
      variables.logo_file_id = true;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$logo_file_id" got invalid value true; ID cannot represent value: true'
        );
      });
    });

    it("Should return error when status is in wrong type", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = gas_brand.name;
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = true;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when new name is already used", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first();

      variables.id = gas_brand.id;
      variables.name = "Kotiki1";
      variables.logo_file_id = gas_brand.logo_file_id;
      variables.status = GAS_BRAND_STATUSES.disabled.name;

      return accountGraphQLRequest(requestBody(UPDATE_GAS_BRAND), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

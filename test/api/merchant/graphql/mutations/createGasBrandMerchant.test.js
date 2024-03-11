import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_CREATE_GAS_BRAND_MERCHANT_MUTATION as CREATE_GAS_BRAND_MERCHANT } from "@local/test/api/mutations.js";
import {
  GAS_BRAND_STATUSES,
  MERCHANT_STATUSES,
  GAS_BRAND_MERCHANT_STATUSES,
} from "@local/constants/index.js";

let token;
let variables = {};
let merchant1;
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });
const testImage2 =
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAQAAAAD+Fb1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnBwYNHjXa9Gr5AAAALUlEQVQI12Ng6GV4x3CMwZmZwZ3hA8MLBhEmBkYGcQY5BlYWhn8Mggy/Gf4CAI7jCAM0uK/FAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA3LTA2VDEzOjMwOjQxKzAwOjAwt1HH6gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wNy0wNlQxMzozMDo0MSswMDowMMYMf1YAAAAASUVORK5CYII=";

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/merchant/auth/login")
    .send(payload)
    .then(callback);

const encrypted_password = await encryptPassword("123123");

const accountGraphQLRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/merchant/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Merchant GraphQL", () => {
  beforeEach(async () => {
    [merchant1] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
        plugins: {
          gasBrandMerchants: true,
        },
      })
      .returning("*");

    const [file] = await Database("files")
      .insert({
        name: "test2",
        account_id: merchant1.id,
        account_type: "merchants",
        mimetype: "image/jpeg",
        size: "1024",
        data: Buffer.from(testImage2, "base64"),
      })
      .returning("*");

    const [gas_brand] = await Database("gas_brands")
      .insert({
        name: "Kotiki",
        logo_file_id: file.id,
        status: GAS_BRAND_STATUSES.active.name,
      })
      .returning("*");

    await Database("gas_brands").insert({
      name: "Kotiki1",
      logo_file_id: file.id,
      status: GAS_BRAND_STATUSES.active.name,
    });

    await Database("gas_brand_merchants").insert({
      merchant_id: merchant1.id,
      gas_brand_id: gas_brand.id,
      status: GAS_BRAND_MERCHANT_STATUSES.active.name,
    });

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "uklon",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("gas_brand_merchants").del();
    await Database("gas_brands").del();
    await Database("files").del();
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { createGasBrand }", () => {
    it("Should create gas_brand_merchant with valid merchant_id, gas_brand_id, status", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki1" })
        .first()
        .returning("*");

      variables.gas_brand_id = gas_brand.id;
      variables.status = GAS_BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_GAS_BRAND_MERCHANT),
        (res) => {
          const {
            body: {
              data: { createGasBrandMerchant },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createGasBrandMerchant");
          expect(createGasBrandMerchant).to.have.property(
            "gas_brand_id",
            variables.gas_brand_id
          );
        }
      );
    });

    it("Should return error when no status provided", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki1" })
        .first()
        .returning("*");

      variables.gas_brand_id = gas_brand.id;

      return accountGraphQLRequest(
        requestBody(CREATE_GAS_BRAND_MERCHANT),
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

    it("Should return error when status is null", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki1" })
        .first()
        .returning("*");

      variables.gas_brand_id = gas_brand.id;
      variables.status = null;

      return accountGraphQLRequest(
        requestBody(CREATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when status has wrong type", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki1" })
        .first()
        .returning("*");

      variables.gas_brand_id = gas_brand.id;
      variables.status = true;

      return accountGraphQLRequest(
        requestBody(CREATE_GAS_BRAND_MERCHANT),
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

    it("Should return error when no gas_brand_id provided", async () => {
      variables.status = GAS_BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$gas_brand_id" of required type "ID!" was not provided`
          );
        }
      );
    });

    it("Should return error when gas_brand_id is null", async () => {
      variables.gas_brand_id = null;
      variables.status = GAS_BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when gas_brand_id has wrong type", async () => {
      variables.gas_brand_id = true;
      variables.status = GAS_BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$gas_brand_id" got invalid value true; ID cannot represent value: true'
          );
        }
      );
    });

    it("Should return error when gas_brand with passed name already exists", async () => {
      const gas_brand = await Database("gas_brands")
        .where({ name: "Kotiki" })
        .first()
        .returning("*");

      variables.gas_brand_id = gas_brand.id;
      variables.status = GAS_BRAND_MERCHANT_STATUSES.active.name;

      return accountGraphQLRequest(
        requestBody(CREATE_GAS_BRAND_MERCHANT),
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

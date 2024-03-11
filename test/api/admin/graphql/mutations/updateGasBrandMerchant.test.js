import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_UPDATE_GAS_BRAND_MERCHANT_MUTATION as UPDATE_GAS_BRAND_MERCHANT } from "@local/test/api/mutations.js";
import {
  GAS_BRAND_STATUSES,
  MERCHANT_STATUSES,
  GAS_BRAND_MERCHANT_STATUSES,
} from "@local/constants/index.js";

let token;
let variables = {};
let merchant1;
let gas_brand1;
let gbm;
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });
const testImage2 =
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAQAAAAD+Fb1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnBwYNHjXa9Gr5AAAALUlEQVQI12Ng6GV4x3CMwZmZwZ3hA8MLBhEmBkYGcQY5BlYWhn8Mggy/Gf4CAI7jCAM0uK/FAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA3LTA2VDEzOjMwOjQxKzAwOjAwt1HH6gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wNy0wNlQxMzozMDo0MSswMDowMMYMf1YAAAAASUVORK5CYII=";

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

    [merchant1] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
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

    [gas_brand1] = await Database("gas_brands")
      .insert({
        name: "Kotiki2",
        logo_file_id: file.id,
        status: GAS_BRAND_STATUSES.active.name,
      })
      .returning("*");

    await Database("gas_brands").insert({
      name: "Kotiki1",
      logo_file_id: file.id,
      status: GAS_BRAND_STATUSES.active.name,
    });

    [gbm] = await Database("gas_brand_merchants")
      .insert({
        merchant_id: merchant1.id,
        gas_brand_id: gas_brand.id,
        status: GAS_BRAND_MERCHANT_STATUSES.active.name,
      })
      .returning("*");

    await Database("gas_brand_merchants").insert({
      merchant_id: merchant1.id,
      gas_brand_id: gas_brand1.id,
      status: GAS_BRAND_MERCHANT_STATUSES.active.name,
    });

    await Database("gbm_fuels").insert([
      {
        gas_brand_merchant_id: gbm.id,
        name: "g1",
        regular_price: 1,
        discount_price: 1,
        status: GAS_BRAND_MERCHANT_STATUSES.active.name,
      },
      {
        gas_brand_merchant_id: gbm.id,
        name: "g2",
        regular_price: 1,
        discount_price: 1,
        status: GAS_BRAND_MERCHANT_STATUSES.active.name,
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
    await Database("gbm_fuels").del();
    await Database("gas_brand_merchants").del();
    await Database("gas_brands").del();
    await Database("files").del();
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { updateGasBrandMerchant }", () => {
    it("Should update status with valid id, merchant_id, gas_brand_id, fuels and status provided", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];
      variables.status = GAS_BRAND_MERCHANT_STATUSES.disabled.name;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          const {
            body: {
              data: { updateGasBrandMerchant },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateGasBrandMerchant");
          expect(res.body.data.updateGasBrandMerchant.status).to.eql(
            "disabled"
          );
          expect(Object.keys(updateGasBrandMerchant)).to.eql([
            "id",
            "merchant_id",
            "gas_brand_id",
            "fuels",
            "status",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should return error when no id provided", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
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

    it("Should return error when no merchant_id provided", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body).not.to.have.property("data");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$merchant_id" of required type "ID!" was not provided'
          );
        }
      );
    });

    it("Should return error when no gas_brand_id provided", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.fuels = [];
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$gas_brand_id" of required type "ID!" was not provided'
          );
        }
      );
    });

    it("Should not return error when no fuels provided", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          const {
            body: {
              data: { updateGasBrandMerchant },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateGasBrandMerchant");
          expect(Object.keys(updateGasBrandMerchant)).to.eql([
            "id",
            "merchant_id",
            "gas_brand_id",
            "fuels",
            "status",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should not return error when fuels provided with id(update name)", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      const fuel = await Database("gbm_fuels").first().returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.status = gas_brand_merchant.status;
      variables.fuels = [
        {
          id: fuel.id,
          name: "f2",
          regular_price: fuel.regular_price,
          discount_price: fuel.discount_price,
          status: fuel.status,
        },
      ];

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          const {
            body: {
              data: { updateGasBrandMerchant },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateGasBrandMerchant");
          expect(Object.keys(updateGasBrandMerchant)).to.eql([
            "id",
            "merchant_id",
            "gas_brand_id",
            "fuels",
            "status",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should return error when fuels provided with id(update name which already exist)", async () => {
      const fuel = await Database("gbm_fuels").first().returning("*");

      variables.id = gbm.id;
      variables.merchant_id = gbm.merchant_id;
      variables.gas_brand_id = gbm.gas_brand_id;
      variables.status = gbm.status;
      variables.fuels = [
        {
          id: fuel.id,
          name: "g2",
          regular_price: fuel.regular_price,
          discount_price: fuel.discount_price,
          status: fuel.status,
        },
      ];

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("already_exist");
        }
      );
    });

    it("Should return error when fuels provided with id(without name)", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      const fuel = await Database("gbm_fuels").first().returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.status = gas_brand_merchant.status;
      variables.fuels = [
        {
          id: fuel.id,
          regular_price: fuel.regular_price,
          discount_price: fuel.discount_price,
          status: fuel.status,
        },
      ];

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "name is a required field"
          );
        }
      );
    });

    it("Should return error when fuels provided with id(update name but without regular price)", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      const fuel = await Database("gbm_fuels").first().returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.status = gas_brand_merchant.status;
      variables.fuels = [
        {
          id: fuel.id,
          name: "g2",
          discount_price: fuel.discount_price,
          status: fuel.status,
        },
      ];

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "regular_price is a required"
          );
        }
      );
    });

    it("Should return error when fuels provided with id(update name but without discount price)", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      const fuel = await Database("gbm_fuels").first().returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.status = gas_brand_merchant.status;
      variables.fuels = [
        {
          id: fuel.id,
          name: "g2",
          regular_price: fuel.regular_price,
          status: fuel.status,
        },
      ];

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "discount_price is a required"
          );
        }
      );
    });

    it("Should return error when fuels provided with id(update name but without status)", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      const fuel = await Database("gbm_fuels").first().returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.status = gas_brand_merchant.status;
      variables.fuels = [
        {
          id: fuel.id,
          name: "g2",
          regular_price: fuel.regular_price,
          discount_price: fuel.discount_price,
        },
      ];

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "status is a required field"
          );
        }
      );
    });

    it("Should not return error when fuels provided without id(create new)", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.status = gas_brand_merchant.status;
      variables.fuels = [
        {
          name: "f2",
          regular_price: 3,
          discount_price: 4,
          status: GAS_BRAND_MERCHANT_STATUSES.active.name,
        },
      ];

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          const {
            body: {
              data: { updateGasBrandMerchant },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateGasBrandMerchant");
          expect(Object.keys(updateGasBrandMerchant)).to.eql([
            "id",
            "merchant_id",
            "gas_brand_id",
            "fuels",
            "status",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should return error when fuels provided without id(create new but name exist)", async () => {
      variables.id = gbm.id;
      variables.merchant_id = gbm.merchant_id;
      variables.gas_brand_id = gbm.gas_brand_id;
      variables.status = gbm.status;
      variables.fuels = [
        {
          name: "g1",
          regular_price: 3,
          discount_price: 4,
          status: GAS_BRAND_MERCHANT_STATUSES.active.name,
        },
      ];

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "name_of_fuel_already_exist"
          );
        }
      );
    });

    it("Should return error when no status provided", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
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

    it("Should return error when id is null", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = null;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when merchant_id is null", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = null;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when gas_brand_id is null", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = null;
      variables.fuels = [];
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$gas_brand_id" of non-null type "ID!" must not be null.'
          );
        }
      );
    });

    it("Should return error when status is null", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];
      variables.status = null;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
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

    it("Should return error when fuels is null", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = null;
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("fuels cannot be null");
        }
      );
    });

    it("Should return error when id is not numeral", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = "aaaa";
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        }
      );
    });

    it("Should return error when id has wrong type", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = true;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$id" got invalid value true; ID cannot represent value: true'
          );
        }
      );
    });

    it("Should return error when merchant_id is in wrong type", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = true;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$merchant_id" got invalid value true; ID cannot represent value: true'
          );
        }
      );
    });

    it("Should return error when gas_brand_id is in wrong type", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = true;
      variables.fuels = [];
      variables.status = gas_brand_merchant.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
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

    it("Should return error when status is in wrong type", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.fuels = [];
      variables.status = true;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
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

    it("Should return error when fuels have a wrong type", async () => {
      const [gas_brand_merchant] = await Database("gas_brand_merchants")
        .where({ merchant_id: merchant1.id, gas_brand_id: gas_brand1.id })
        .returning("*");

      variables.id = gas_brand_merchant.id;
      variables.merchant_id = gas_brand_merchant.merchant_id;
      variables.gas_brand_id = gas_brand_merchant.gas_brand_id;
      variables.status = gas_brand_merchant.status;
      variables.fuels = true;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$fuels" got invalid value true'
          );
        }
      );
    });

    it("Should return error when gas_brand_id is already used", async () => {
      variables.id = gbm.id;
      variables.merchant_id = gbm.merchant_id;
      variables.gas_brand_id = gas_brand1.id;
      variables.fuels = [];
      variables.status = gbm.status;

      return accountGraphQLRequest(
        requestBody(UPDATE_GAS_BRAND_MERCHANT),
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

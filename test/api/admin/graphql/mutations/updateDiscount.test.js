import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_UPDATE_DISCOUNT_MUTATION as UPDATE_DISCOUNT } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let variables = {};
let other_merchant_id;
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

    const [{ id: current_merchant_id }] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("id");

    other_merchant_id = await Database("merchants")
      .insert({
        login: "opti",
        name: "opti",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("id");

    await Database("discounts").insert([
      {
        name: "disc1",
        percent: 1,
        merchant_id: current_merchant_id,
      },
      {
        name: "disc3",
        percent: 2,
        merchant_id: current_merchant_id,
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
    await Database("discounts").del();
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { updateDiscount }", () => {
    it("Should update discount with valid id and name provided", async () => {
      const disc = await Database("discounts").first();

      variables.id = disc.id;
      variables.name = "disc2";
      variables.percent = 2;
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        const {
          body: {
            data: { updateDiscount },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateDiscount");
        expect(updateDiscount).to.have.property("id", disc.id);
        expect(updateDiscount).to.have.property("name", "disc2");
        expect(updateDiscount).to.have.property(
          "merchant_id",
          other_merchant_id[0].id
        );
        expect(updateDiscount).to.have.property("percent", 2);
      });
    });

    it("Should return error when no id provided", () => {
      variables.name = "disc2";
      variables.percent = 2;
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      });
    });

    it("Should return error when no name provided", async () => {
      const { id } = await Database("discounts").first();

      variables.id = id;
      variables.percent = 2;
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$name" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when no percent provided", async () => {
      const { id } = await Database("discounts").first();

      variables.id = id;
      variables.name = "disc2";
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$percent" of required type'
        );
      });
    });

    it("Should return error when no merchant_id provided", async () => {
      const { id } = await Database("discounts").first();

      variables.id = id;
      variables.percent = 2;
      variables.name = "disc2";

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$merchant_id" of required'
        );
      });
    });

    it("Should return error when id is null", () => {
      variables.id = null;
      variables.name = "disc2";
      variables.percent = 2;
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name is null", async () => {
      const { id } = await Database("discounts").first();

      variables.id = id;
      variables.name = null;
      variables.percent = 2;
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when percent is null", async () => {
      const { id } = await Database("discounts").first();

      variables.id = id;
      variables.name = "disc2";
      variables.percent = null;
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when merchant_id is null", async () => {
      const { id } = await Database("discounts").first();

      variables.id = id;
      variables.name = "disc2";
      variables.percent = 2;
      variables.merchant_id = null;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when id is not numeral", () => {
      variables.id = "aaaa";
      variables.name = "disc2";
      variables.percent = 2;
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when id has wrong type", () => {
      variables.id = true;
      variables.name = "disc2";
      variables.percent = 2;
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when discount not found by id", () => {
      variables.id = "-1";
      variables.name = "disc2";
      variables.percent = 2;
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when name is not string", async () => {
      const { id } = await Database("discounts").first();

      variables.id = id;
      variables.name = true;
      variables.percent = 2;
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when percent is not float", async () => {
      const { id } = await Database("discounts").first();

      variables.id = id;
      variables.name = true;
      variables.percent = "2";
      variables.merchant_id = other_merchant_id[0].id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when merchant_id is not string", async () => {
      const { id } = await Database("discounts").first();

      variables.id = id;
      variables.name = true;
      variables.percent = 2;
      variables.merchant_id = 1;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when merchant_id is not numeral", async () => {
      const { id } = await Database("discounts").first();

      variables.id = id;
      variables.name = "disc2";
      variables.percent = 2;
      variables.merchant_id = "other_merchant_id[0].id";

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when new name is already used", async () => {
      const disc = await Database("discounts")
        .where({ name: "disc1" })
        .returning("*");

      variables.id = disc[0].id;
      variables.name = "disc3";
      variables.percent = 2;
      variables.merchant_id = disc[0].merchant_id;

      return accountGraphQLRequest(requestBody(UPDATE_DISCOUNT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

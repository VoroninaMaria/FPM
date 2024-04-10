import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { DELETE_DISCOUNT_MUTATION as DELETE_DISCOUNT } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

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

    const [{ id: current_merchant_id }] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("id");

    await Database("discounts").insert({
      name: "disc1",
      percent: 1,
      merchant_id: current_merchant_id,
    });

    ({
      body: { token: token },
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

  describe("mutation { deleteCategory }", () => {
    it("Should delete discount with valid id provided", async () => {
      const disc = await Database("discounts").first();

      variables.id = disc.id;

      await accountGraphQLRequest(requestBody(DELETE_DISCOUNT), (res) => {
        const {
          body: {
            data: { deleteDiscount },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("deleteDiscount");
        expect(deleteDiscount).to.have.property("id", disc.id);
        expect(deleteDiscount).to.have.property(
          "merchant_id",
          disc.merchant_id
        );
        expect(deleteDiscount).to.have.property("percent", disc.percent);
        expect(deleteDiscount).to.have.property("name", disc.name);
      });

      return accountGraphQLRequest(requestBody(DELETE_DISCOUNT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("discount_not_found");
      });
    });

    it("Should return error when no id provided", () =>
      accountGraphQLRequest(requestBody(DELETE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      }));

    it("Should return error when id is null", () => {
      variables.id = null;
      variables.name = "disc1";

      return accountGraphQLRequest(requestBody(DELETE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when id is not numeral", () => {
      variables.id = "aaaa";

      return accountGraphQLRequest(requestBody(DELETE_DISCOUNT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when id has wrong type", () => {
      variables.id = true;

      return accountGraphQLRequest(requestBody(DELETE_DISCOUNT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when category not found by id", () => {
      variables.id = "-1";

      return accountGraphQLRequest(requestBody(DELETE_DISCOUNT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });
  });
});

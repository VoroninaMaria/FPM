import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { DELETE_DESIGN_MUTATION as DELETE_DESIGN } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let merchant_id;
let design_id;
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
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Merchant GraphQL", () => {
  before(async () => {
    [{ id: merchant_id }] = await Database("merchants")
      .insert([
        {
          login: "uklon",
          name: "uklon",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
          plugins: {
            designEditor: true,
          },
        },
      ])
      .returning("id");

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "uklon",
      password: "123123",
    }));
  });

  after(async () => {
    await Database("merchants").del();
  });

  beforeEach(async () => {
    [{ id: design_id }] = await Database("designs")
      .insert([
        {
          name: "my design",
          merchant_id,
          styles: {},
        },
      ])
      .returning("id");
  });

  afterEach(async () => {
    await Database("designs").del();
    variables = {};
  });

  describe("mutation { deleteDesign }", () => {
    it("Should delete design with valid id provided", async () => {
      variables.id = design_id;

      await accountGraphQLRequest(requestBody(DELETE_DESIGN), (res) => {
        const {
          body: {
            data: { deleteDesign },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("deleteDesign");
        expect(deleteDesign).to.have.property("id", variables.id);
      });

      return accountGraphQLRequest(requestBody(DELETE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("design_not_found");
      });
    });

    it("Should return error when no id provided", () =>
      accountGraphQLRequest(requestBody(DELETE_DESIGN), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      }));

    it("Should return error when id is null", () => {
      variables.id = null;

      return accountGraphQLRequest(requestBody(DELETE_DESIGN), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when id is not numeral", () => {
      variables.id = "aaaa";

      return accountGraphQLRequest(requestBody(DELETE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when id has wrong type", () => {
      variables.id = true;

      return accountGraphQLRequest(requestBody(DELETE_DESIGN), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when design not found by id", () => {
      variables.id = "-1";

      return accountGraphQLRequest(requestBody(DELETE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });
  });
});

import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_CREATE_TAG_MUTATION as CREATE_TAG } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const encrypted_password = await encryptPassword("123123");
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
  beforeEach(async () => {
    const [{ id: merchant_id }] = await Database("merchants")
      .insert([
        {
          login: "uklon",
          name: "uklon",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
        },
      ])
      .returning("id");

    await Database("tags").insert({
      name: "nice guy",
      merchant_id,
    });

    ({
      body: { token: token },
    } = await accountLoginRequest({
      login: "uklon",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("tags").del();
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { createTag }", () => {
    it("Should create tag with valid name provided", () => {
      variables.name = "cool guy";

      return accountGraphQLRequest(requestBody(CREATE_TAG), (res) => {
        const {
          body: {
            data: { createTag },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createTag");
        expect(createTag).to.have.property("name", variables.name);
      });
    });

    it("Should return error when no name provided", () =>
      accountGraphQLRequest(requestBody(CREATE_TAG), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$name" of required type "String!" was not provided'
        );
      }));

    it("Should return error when name is null", () => {
      variables.name = null;

      return accountGraphQLRequest(requestBody(CREATE_TAG), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name has wrong type", () => {
      variables.name = true;

      return accountGraphQLRequest(requestBody(CREATE_TAG), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when tag with passed name already exists", () => {
      variables.name = "nice guy";

      return accountGraphQLRequest(requestBody(CREATE_TAG), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

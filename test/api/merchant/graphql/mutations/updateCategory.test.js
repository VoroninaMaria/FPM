import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { UPDATE_CATEGORY_MUTATION as UPDATE_CATEGORY } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
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
  beforeEach(async () => {
    const [{ id: current_merchant_id }, { id: other_merchant_id }] =
      await Database("merchants")
        .insert([
          {
            login: "uklon",
            name: "uklon",
            encrypted_password,
            status: MERCHANT_STATUSES.active.name,
            plugins: {
              categoriesEditor: true,
            },
          },
          {
            login: "uber",
            name: "uber",
            encrypted_password,
            status: MERCHANT_STATUSES.active.name,
            plugins: {
              categoriesEditor: true,
            },
          },
        ])
        .returning("id");

    await Database("client_categories").insert([
      {
        name: "nice guy",
        merchant_id: current_merchant_id,
      },
      {
        name: "nice guy",
        merchant_id: other_merchant_id,
      },
    ]);

    ({
      body: { token: token },
    } = await accountLoginRequest({
      login: "uklon",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("client_categories").del();
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { updateCategory }", () => {
    it("Should update category with valid id and name provided", async () => {
      const { id } = await Database("client_categories").first();

      variables.id = id;
      variables.name = "fucker";

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
        const {
          body: {
            data: { updateCategory },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateCategory");
        expect(updateCategory).to.have.property("id", id);
        expect(updateCategory).to.have.property("name", variables.name);
      });
    });

    it("Should return error when no id provided", () => {
      variables.name = "fucker";

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      });
    });

    it("Should return error when no name provided", async () => {
      const { id } = await Database("client_categories").first();

      variables.id = id;

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$name" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when id is null", () => {
      variables.id = null;
      variables.name = "fucker";

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name is null", async () => {
      const { id } = await Database("client_categories").first();

      variables.id = id;
      variables.name = null;

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when id is not numeral", () => {
      variables.id = "aaaa";
      variables.name = "fucker";

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });
    it("Should return error when id has wrong type", () => {
      variables.id = true;
      variables.name = "fucker";

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
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
      variables.name = "fucker";

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when name is not string", async () => {
      const { id } = await Database("client_categories").first();

      variables.id = id;
      variables.name = true;

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when accessing other merchant's category", async () => {
      const { id } = await Database("client_categories")
        .where({
          merchant_id: Database("merchants")
            .select("id")
            .where({ name: "uber" }),
        })
        .first();

      variables.id = id;
      variables.name = "fucker";

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("category_not_found");
      });
    });

    it("Should return error when new name is already used", async () => {
      const { id } = await Database("client_categories").first();

      variables.id = id;
      variables.name = "nice guy";

      return accountGraphQLRequest(requestBody(UPDATE_CATEGORY), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

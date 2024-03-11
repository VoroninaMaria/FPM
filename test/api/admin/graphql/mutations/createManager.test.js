import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_CREATE_MANAGER_MUTATION } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES, CLIENT_STATUSES } from "@local/constants/index.js";

let token;
let variables = {};
let merchant;
let client;
let company;
let merchant1;
let client1;
let company1;
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

    [merchant] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("*");

    [company] = await Database("companies")
      .insert({
        name: "test2",
        merchant_id: merchant.id,
      })
      .returning("*");

    [client] = await Database("clients")
      .insert([
        {
          merchant_id: merchant.id,
          phone: "380630000000",
          email: "ggg@gmail.com",
          encrypted_password,
          status: CLIENT_STATUSES.confirmed.name,
        },
      ])
      .returning("*");

    [merchant1] = await Database("merchants")
      .insert({
        login: "opti",
        name: "opti",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("*");

    [company1] = await Database("companies")
      .insert({
        name: "test1",
        merchant_id: merchant1.id,
      })
      .returning("*");

    [client1] = await Database("clients")
      .insert([
        {
          merchant_id: merchant1.id,
          phone: "380630000001",
          email: "ggg1@gmail.com",
          encrypted_password,
          status: CLIENT_STATUSES.confirmed.name,
        },
      ])
      .returning("*");

    await Database("managers").insert([
      {
        client_id: client.id,
        company_id: company.id,
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
    await Database("managers").del();
    await Database("clients").del();
    await Database("companies").del();
    await Database("merchants").del();
    await Database("admins").del();
    variables = {};
  });

  describe("mutation { createManager }", () => {
    it("Should create file with valid name provided", () => {
      variables.client_id = client1.id;
      variables.company_id = company1.id;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_MANAGER_MUTATION),
        (res) => {
          const {
            body: {
              data: { createManager },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createManager");
          expect(createManager).to.have.property(
            "client_id",
            variables.client_id
          );
          expect(createManager).to.have.property(
            "company_id",
            variables.company_id
          );
        }
      );
    });

    it("Should return error when no params provided", () =>
      accountGraphQLRequest(
        requestBody(ADMIN_CREATE_MANAGER_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body).not.to.have.property("data");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(" was not provided");
        }
      ));

    it("Should return error when client_id is not provided", () => {
      variables.client_id = client1.id;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_MANAGER_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$company_id" of required'
          );
        }
      );
    });

    it("Should return error when client_id is not provided", () => {
      variables.company_id = company1.id;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_MANAGER_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$client_id" of required type "ID!" was not provided'
          );
        }
      );
    });

    it("Should return error when company_id is null", () => {
      variables.client_id = client1.id;
      variables.company_id = null;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_MANAGER_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when client_id is null", () => {
      variables.client_id = null;
      variables.company_id = company1.id;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_MANAGER_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when client_id has wrong type", () => {
      variables.client_id = 1;
      variables.company_id = company1.id;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_MANAGER_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        }
      );
    });

    it("Should return error when company_id has wrong type", () => {
      variables.client_id = client1.id;
      variables.company_id = 1;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_MANAGER_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        }
      );
    });

    it("Should return error when file with passed manager already exists", async () => {
      const manger = await Database("managers").first();

      variables.client_id = manger.client_id;
      variables.company_id = manger.company_id;

      return accountGraphQLRequest(
        requestBody(ADMIN_CREATE_MANAGER_MUTATION),
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

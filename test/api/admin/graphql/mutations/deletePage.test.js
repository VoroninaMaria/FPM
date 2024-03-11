import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { DELETE_PAGE_MUTATION as DELETE_PAGE } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let design_id;
const page_ids = [];
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
  before(async () => {
    await Database("admins").insert({
      login: "offtop",
      encrypted_password,
    });

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  after(async () => {
    await Database("admins").del();
  });

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

    [{ id: design_id }] = await Database("designs")
      .insert([
        {
          name: "my design",
          merchant_id,
          styles: {},
        },
      ])
      .returning("id");

    [{ id: page_ids[0] }, { id: page_ids[1] }] = await Database("pages")
      .insert([
        {
          name: "page",
          design_id: design_id,
          styles: {},
        },
        {
          name: "default page",
          design_id: design_id,
          styles: {},
        },
      ])
      .returning("id");

    await Database("designs")
      .where({ id: design_id })
      .update({ default_page_id: page_ids[1] });
  });

  afterEach(async () => {
    await Database("designs").update({
      default_page_id: null,
      authenticated_page_id: null,
      loader_page_id: null,
      error_page_id: null,
    });
    await Database("pages").del();
    await Database("designs").del();
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { deletePage }", () => {
    it("Should delete page with valid id provided that's not default", async () => {
      variables.id = page_ids[0];

      await accountGraphQLRequest(requestBody(DELETE_PAGE), (res) => {
        const {
          body: {
            data: { deletePage },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("deletePage");
        expect(deletePage).to.have.property("id", variables.id);
      });

      return accountGraphQLRequest(requestBody(DELETE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("page_not_found");
      });
    });

    it("Should return error when page is set as default", () => {
      variables.id = page_ids[1];

      return accountGraphQLRequest(requestBody(DELETE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("page_set_as_default");
      });
    });

    it("Should return error when no id provided", () =>
      accountGraphQLRequest(requestBody(DELETE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      }));

    it("Should return error when id is null", () => {
      variables.id = null;

      return accountGraphQLRequest(requestBody(DELETE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when id is not numeral", () => {
      variables.id = "aaaa";

      return accountGraphQLRequest(requestBody(DELETE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when id has wrong type", () => {
      variables.id = true;

      return accountGraphQLRequest(requestBody(DELETE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when page not found by id", () => {
      variables.id = "-1";

      return accountGraphQLRequest(requestBody(DELETE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });
  });
});

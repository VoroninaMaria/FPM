import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { DELETE_PROMOTION_MUTATION as DELETE_PROMOTION } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
const merchantIds = [];
const promotionIds = [];
const file_ids = [];
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

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
  before(async () => {
    [{ id: merchantIds[0] }, { id: merchantIds[1] }] = await Database(
      "merchants"
    )
      .insert([
        {
          login: "uklon",
          name: "uklon",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
          plugins: {
            notifications: true,
          },
        },
        {
          login: "bolt",
          name: "bolt",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
          plugins: {
            notifications: true,
          },
        },
      ])
      .returning("id");

    [{ id: file_ids[0] }, { id: file_ids[1] }] = await Database("files")
      .insert([
        {
          name: "file",
          account_id: merchantIds[0],
          account_type: "merchants",
          mimetype: "image/jpeg",
          data: Buffer.from("file", "base64"),
        },
        {
          name: "file",
          account_id: merchantIds[1],
          account_type: "merchants",
          mimetype: "image/jpeg",
          data: Buffer.from("file", "base64"),
        },
      ])
      .returning("id");

    [{ id: promotionIds[0] }, { id: promotionIds[1] }] = await Database(
      "promotions"
    )
      .insert([
        {
          title: "title",
          text: "text",
          merchant_id: merchantIds[0],
          file_id: file_ids[0],
          start_date: "2022-10-26",
          end_date: "2022-10-26",
        },
        {
          title: "title",
          text: "text",
          merchant_id: merchantIds[1],
          file_id: file_ids[1],
          start_date: "2022-10-26",
          end_date: "2022-10-26",
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
    await Database("files").del();
    await Database("merchants").del();
    await Database("admins").del();
  });

  afterEach(async () => {
    await Database("promotions").del();
    variables = {};
  });

  describe("mutation { deletePromotion }", () => {
    it("Should delete promotion with valid id provided", () => {
      variables.id = promotionIds[0];

      return accountGraphQLRequest(requestBody(DELETE_PROMOTION), (res) => {
        const {
          body: {
            data: { deletePromotion },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("deletePromotion");
        expect(deletePromotion).to.have.property("id", variables.id);
      });
    });

    it("Should return error when no id provided", () => {
      return accountGraphQLRequest(requestBody(DELETE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$id" of required type "ID!" was not provided`
        );
      });
    });

    it("Should return error when id is null", () => {
      variables.id = null;

      return accountGraphQLRequest(requestBody(DELETE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when id has wrong type", () => {
      variables.id = true;

      return accountGraphQLRequest(requestBody(DELETE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when id has wrong format", () => {
      variables.id = "aaaaaaaaa";

      return accountGraphQLRequest(requestBody(DELETE_PROMOTION), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when deleting other merchant's promotion", () => {
      variables.id = promotionIds[1];

      return accountGraphQLRequest(requestBody(DELETE_PROMOTION), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("promotion_not_found");
      });
    });
  });
});

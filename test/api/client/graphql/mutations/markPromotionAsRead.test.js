import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { CLIENT_MARK_PROMOTION_AS_READ_MUTATION as MARK_PROMOTION_AS_READ } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES, CLIENT_STATUSES } from "@local/constants/index.js";

let token;
const merchantIds = [];
const promotionIds = [];
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const encrypted_password = await encryptPassword("123123");
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/client/auth/login").send(payload).then(callback);

const accountGraphQLRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/client/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Client GraphQL", () => {
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
        },
        {
          login: "uber",
          name: "uber",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
        },
      ])
      .returning("id");

    const file_ids = [];

    [{ id: file_ids[0] }, { id: file_ids[1] }] = await Database("files")
      .insert([
        {
          name: "test",
          account_id: merchantIds[0],
          account_type: "merchants",
          mimetype: "image/jpeg",
          data: Buffer.from("file", "base64"),
        },
        {
          name: "test",
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
          title: "title1",
          text: "text1",
          merchant_id: merchantIds[0],
          file_id: file_ids[0],
          start_date: "2022-10-26",
          end_date: "2022-10-26",
        },
        {
          title: "title2",
          text: "text2",
          merchant_id: merchantIds[1],
          file_id: file_ids[1],
          start_date: "2022-10-26",
          end_date: "2022-10-26",
        },
      ])
      .returning("id");

    await Database("clients").insert({
      merchant_id: merchantIds[0],
      phone: "380630000000",
      encrypted_password: await encryptPassword("123123"),
      session_identifier: "session",
      status: CLIENT_STATUSES.confirmed.name,
    });

    ({
      body: { token: token },
    } = await accountLoginRequest({
      phone: "380630000000",
      password: "123123",
      merchant: "uklon",
    }));
  });

  after(async () => {
    await Database("promotions").del();
    await Database("files").del();
    await Database("clients").del();
    await Database("merchants").del();
  });

  beforeEach(async () => {});

  afterEach(async () => {
    await Database("client_promotions").del();

    variables = {};
  });

  describe("mutation { markPromotionAsRead }", () => {
    it("Should mark promotion as read with valid id provided", async () => {
      variables.id = promotionIds[0];

      await accountGraphQLRequest(
        requestBody(MARK_PROMOTION_AS_READ),
        (res) => {
          const {
            body: {
              data: { markPromotionAsRead },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("markPromotionAsRead");
          expect(markPromotionAsRead).to.have.property("id", variables.id);
        }
      );

      // When sending request for already read promotion
      return accountGraphQLRequest(
        requestBody(MARK_PROMOTION_AS_READ),
        (res) => {
          const {
            body: {
              data: { markPromotionAsRead },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("markPromotionAsRead");
          expect(markPromotionAsRead).to.have.property("id", variables.id);
        }
      );
    });

    it("Should return error when no id provided", () =>
      accountGraphQLRequest(requestBody(MARK_PROMOTION_AS_READ), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      }));

    it("Should return error when id is null", () => {
      variables.id = null;
      variables.name = "fucker";

      return accountGraphQLRequest(
        requestBody(MARK_PROMOTION_AS_READ),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        }
      );
    });

    it("Should return error when id is not valid uuid", () => {
      variables.id = "aaaa";

      return accountGraphQLRequest(
        requestBody(MARK_PROMOTION_AS_READ),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid id");
        }
      );
    });

    it("Should return error when id has wrong type", () => {
      variables.id = true;

      return accountGraphQLRequest(
        requestBody(MARK_PROMOTION_AS_READ),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "ID cannot represent value"
          );
        }
      );
    });

    it("Should return error when promotion not found by id", () => {
      variables.id = "-1";

      return accountGraphQLRequest(
        requestBody(MARK_PROMOTION_AS_READ),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid id");
        }
      );
    });

    it("Should return error when accessing other merchant's promotion", () => {
      variables.id = promotionIds[1];

      return accountGraphQLRequest(
        requestBody(MARK_PROMOTION_AS_READ),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("promotion not found");
        }
      );
    });
  });
});

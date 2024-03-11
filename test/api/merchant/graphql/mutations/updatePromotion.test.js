import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { UPDATE_PROMOTION_MUTATION as UPDATE_PROMOTION } from "@local/test/api/mutations.js";
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
    [{ id: merchantIds[0] }] = await Database("merchants")
      .insert({
        login: "uklon",
        name: "uklon",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
        plugins: {
          notifications: true,
        },
      })
      .returning("id");

    [{ id: merchantIds[1] }] = await Database("merchants")
      .insert({
        login: "bolt",
        name: "bolt",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
        plugins: {
          notifications: true,
        },
      })
      .returning("id");

    [{ id: file_ids[0] }] = await Database("files")
      .insert({
        name: "file",
        account_id: merchantIds[0],
        account_type: "merchants",
        mimetype: "image/jpeg",
        data: Buffer.from("file", "base64"),
      })
      .returning("id");

    [{ id: file_ids[1] }] = await Database("files")
      .insert({
        name: "file",
        account_id: merchantIds[1],
        account_type: "merchants",
        mimetype: "image/jpeg",
        data: Buffer.from("file", "base64"),
      })
      .returning("id");

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "uklon",
      password: "123123",
    }));
  });

  beforeEach(async () => {
    [{ id: promotionIds[0] }] = await Database("promotions")
      .insert({
        title: "title",
        text: "text",
        merchant_id: merchantIds[0],
        file_id: file_ids[0],
        start_date: "2022-10-26",
        end_date: "2022-10-26",
      })
      .returning("id");

    [{ id: promotionIds[1] }] = await Database("promotions")
      .insert({
        title: "title",
        text: "text",
        merchant_id: merchantIds[1],
        file_id: file_ids[1],
        start_date: "2022-10-26",
        end_date: "2022-10-26",
      })
      .returning("id");
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

  describe("mutation { updatePromotion }", () => {
    it("Should update promotion with valid params provided", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.id = promotionIds[0];
      variables.file_id = file_ids[0];
      variables.start_date = "2023-11-26";
      variables.end_date = "2023-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        const {
          body: {
            data: { updatePromotion },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updatePromotion");
        expect(updatePromotion).to.have.property("id", variables.id);
      });
    });

    it("Should return error when no title provided", () => {
      variables.text = "text";
      variables.id = promotionIds[0];
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$title" of required type "String!" was not provided`
        );
      });
    });

    it("Should return error when title is null", () => {
      variables.title = null;
      variables.text = "text";
      variables.id = promotionIds[0];
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when title has wrong type", () => {
      variables.title = 15;
      variables.text = "text";
      variables.id = promotionIds[0];
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no text provided", () => {
      variables.title = "Title";
      variables.id = promotionIds[0];
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$text" of required type "String!" was not provided`
        );
      });
    });

    it("Should return error when text is null", () => {
      variables.title = "Title";
      variables.text = null;
      variables.id = promotionIds[0];
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when text has wrong type", () => {
      variables.title = "Title";
      variables.text = 15;
      variables.id = promotionIds[0];
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no id provided", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$id" of required type "ID!" was not provided`
        );
      });
    });

    it("Should return error when id is null", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.id = null;
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when id has wrong type", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.id = true;
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when id has wrong format", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.id = "aaaaaaaaa";
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when no file_id provided", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.id = promotionIds[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$file_id" of required type "ID!" was not provided`
        );
      });
    });

    it("Should return error when file_id is null", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.id = promotionIds[0];
      variables.file_id = null;
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when file_id has wrong type", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.id = promotionIds[0];
      variables.file_id = true;
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when file_id has wrong format", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.id = promotionIds[0];
      variables.file_id = "aaaaaaa";
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when using file_id of other merchant", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.id = promotionIds[0];
      variables.file_id = file_ids[1];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("file_not_found");
      });
    });

    it("Should return error when updating promotion of other merchant", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.id = promotionIds[1];
      variables.file_id = file_ids[0];
      variables.start_date = "2023-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(UPDATE_PROMOTION), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("promotion_not_found");
      });
    });
  });
});

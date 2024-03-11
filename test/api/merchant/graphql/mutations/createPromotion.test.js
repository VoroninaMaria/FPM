import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_CREATE_PROMOTION_MUTATION as CREATE_PROMOTION } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
const merchantIds = [];
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

  describe("mutation { createPromotion }", () => {
    it("Should create promotion with valid params provided", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.file_id = file_ids[0];
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        const {
          body: {
            data: { createPromotion },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createPromotion");
        expect(createPromotion).to.have.property("merchant_id", merchantIds[0]);
      });
    });

    it("Should create promotion with valid params provided and without start_date and end_date", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.file_id = file_ids[0];
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        const {
          body: {
            data: { createPromotion },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createPromotion");
        expect(createPromotion).to.have.property("merchant_id", merchantIds[0]);
      });
    });

    it("Should return error when no title provided", () => {
      variables.text = "text";
      variables.file_id = file_ids[0];
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
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
      variables.file_id = file_ids[0];
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when title has wrong type", () => {
      variables.title = 15;
      variables.text = "text";
      variables.file_id = file_ids[0];
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
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
      variables.file_id = file_ids[0];
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
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
      variables.file_id = file_ids[0];
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when text has wrong type", () => {
      variables.title = "Title";
      variables.text = 15;
      variables.file_id = file_ids[0];
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no file_id provided", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
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
      variables.file_id = null;
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when file_id has wrong type", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.file_id = true;
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
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
      variables.file_id = "aaaaaaa";
      variables.start_date = "2022-10-26";
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should create promotion with valid params provided without start_date ", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.file_id = file_ids[0];
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$start_date" of required type "DateTime!" was not provided.`
        );
      });
    });

    it("Should return error when start_date is null", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.file_id = file_ids[0];
      variables.start_date = null;
      variables.end_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$start_date" of non-null type "DateTime!" must not be null.'
        );
      });
    });

    it("Should create promotion with valid params provided without end_date ", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.file_id = file_ids[0];
      variables.start_date = "2022-10-26";

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$end_date" of required type "DateTime!" was not provided.`
        );
      });
    });

    it("Should return error when end_date is null", () => {
      variables.title = "Best offer";
      variables.text = "text";
      variables.file_id = file_ids[0];
      variables.start_date = "2022-10-26";
      variables.end_date = null;

      return accountGraphQLRequest(requestBody(CREATE_PROMOTION), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$end_date" of non-null type "DateTime!" must not be null.'
        );
      });
    });
  });
});

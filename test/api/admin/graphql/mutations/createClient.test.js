import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { ADMIN_CREATE_CLIENT_MUTATION as CREATE_CLIENT } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
const merchant_ids = [];
const category_ids = [];
const tag_ids = [];
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const encrypted_password = await encryptPassword("123123");
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

    [{ id: merchant_ids[0] }, { id: merchant_ids[1] }] = await Database(
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
          login: "opti",
          name: "opti",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
        },
      ])
      .returning("id");

    [{ id: category_ids[0] }, { id: category_ids[1] }] = await Database(
      "client_categories"
    )
      .insert([
        {
          name: "nice guy",
          merchant_id: merchant_ids[0],
        },
        {
          name: "nice guy",
          merchant_id: merchant_ids[1],
        },
      ])
      .returning("id");

    [{ id: tag_ids[0] }, { id: tag_ids[1] }] = await Database("tags")
      .insert([
        {
          name: "nice guy",
          merchant_id: merchant_ids[0],
        },
        {
          name: "nice guy",
          merchant_id: merchant_ids[1],
        },
      ])
      .returning("id");

    ({
      body: { token: token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  after(async () => {
    await Database("admins").del();
    await Database("client_categories").del();
    await Database("tags").del();
    await Database("merchants").del();
  });

  beforeEach(async () => {
    await Database("clients").insert({
      encrypted_password: await encryptPassword("123123"),
      phone: "380000000000",
      merchant_id: merchant_ids[0],
    });
  });

  afterEach(async () => {
    await Database("client_tags").del();
    await Database("clients").del();
    variables = {};
  });

  describe("mutation { createClient }", () => {
    it("Should create client with phone and password provided", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        const {
          body: {
            data: { createClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createClient");
        expect(Object.keys(createClient)).to.eql([
          "id",
          "merchant_id",
          "status",
          "phone",
          "email",
          "first_name",
          "last_name",
          "category_id",
          "tag_ids",
          "created_at",
          "updated_at",
        ]);
      });
    });

    it("Should create client with additional fields provided", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.email = "example@example.com";
      variables.category_id = category_ids[0];
      variables.tag_ids = [tag_ids[0]];

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        const {
          body: {
            data: { createClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createClient");
        expect(Object.keys(createClient)).to.eql([
          "id",
          "merchant_id",
          "status",
          "phone",
          "email",
          "first_name",
          "last_name",
          "category_id",
          "tag_ids",
          "created_at",
          "updated_at",
        ]);
      });
    });

    it("Should return error when no phone provided", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.password = "password";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$phone" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when phone is null", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = null;
      variables.password = "password";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when phone is not string", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = 380000000000;
      variables.password = "password";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when phone format is wrong", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "+380000000001";
      variables.password = "password";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("invalid_phone_format");
      });
    });

    it("Should return error when no merchant_id provided", () => {
      variables.phone = "380000000001";
      variables.password = "password";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$merchant_id" of required type "ID!" was not provided'
        );
      });
    });

    it("Should return error when merchant_id is null", () => {
      variables.merchant_id = null;
      variables.phone = "380000000000";
      variables.password = "password";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when merchant_id is not string", () => {
      variables.merchant_id = 1;
      variables.phone = "380000000000";
      variables.password = "password";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when merchant_id format is wrong", () => {
      variables.merchant_id = true;
      variables.phone = "380000000001";
      variables.password = "password";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          '"$merchant_id" got invalid value'
        );
      });
    });

    it("Should return error when no password provided", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$password" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when password is null", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = null;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when password is not string", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = 123456;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when password is too short", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "+380000000001";
      variables.password = "123";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("min_length");
      });
    });

    it("Should return error when first name is not string", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = 1488;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when last name is not string", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.last_name = 1488;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when email is not string", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.email = 1488;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when category_id is not a string", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.category_id = 1488;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when category_id is not a valid uuid", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.category_id = "1488";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when using category created by another merchant", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.category_id = category_ids[1];

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("category_not_found");
      });
    });

    it("Should return error when tag_ids is not a string", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.tag_ids = 1488;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "specified_tag_doesnt_exist"
        );
      });
    });

    it("Should return error when tag_ids includes invalid uuid", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.tag_ids = ["1488"];

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "specified_tag_doesnt_exist"
        );
      });
    });

    it("Should return error when using tag_ids created by another merchant", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.tag_ids = [tag_ids[1]];

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "specified_tag_doesnt_exist"
        );
      });
    });

    it("Should return error when email format is wrong", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.email = "email";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("invalid_email_format");
      });
    });

    it("Should return error when client with passed phone already exists", async () => {
      const merchant = await Database("merchants").first();

      variables.merchant_id = merchant.id;
      variables.phone = "380000000000";
      variables.password = "password";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

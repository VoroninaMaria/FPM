import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_CREATE_CLIENT_MUTATION as CREATE_CLIENT } from "@local/test/api/mutations.js";
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
    [{ id: merchant_ids[0] }, { id: merchant_ids[1] }] = await Database(
      "merchants"
    )
      .insert([
        {
          login: "uklon",
          name: "uklon",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
          plugins: {
            clients: true,
          },
        },
        {
          login: "opti",
          name: "opti",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
          plugins: {
            clients: true,
          },
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
      login: "uklon",
      password: "123123",
    }));
  });

  after(async () => {
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
    it("Should create client with phone and password provided", () => {
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

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
        expect(createClient).to.have.property("phone", variables.phone);
      });
    });

    it("Should create client with additional fields provided", () => {
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.email = "example@example.com";
      variables.entity = 1;
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
        expect(createClient).to.have.property("phone", variables.phone);
      });
    });

    it("Should return error when no phone provided", () => {
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

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

    it("Should return error when phone is null", () => {
      variables.phone = null;
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when phone is not string", () => {
      variables.phone = 380000000000;
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

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

    it("Should return error when phone format is wrong", () => {
      variables.phone = "+380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("invalid_phone_format");
      });
    });

    it("Should return error when no first_name provided", () => {
      variables.phone = "380000000001";
      variables.password = "password";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$first_name" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when first_name is null", () => {
      variables.first_name = null;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when first_name is not string", () => {
      variables.first_name = 380000000000;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.last_name = "Smith";
      variables.entity = 1;

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

    it("Should return error when first_name format is wrong", () => {
      variables.first_name = true;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no last_name provided", () => {
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$last_name" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when last_name is null", () => {
      variables.last_name = null;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when last_name is not string", () => {
      variables.last_name = 380000000000;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.entity = 1;

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

    it("Should return error when last_name format is wrong", () => {
      variables.last_name = true;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no entity provided", () => {
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$entity" of required type "Int!" was not provided'
        );
      });
    });

    it("Should return error when entity is null", () => {
      variables.entity = null;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when entity is not integer", () => {
      variables.entity = "380000000000";
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "Int cannot represent non-integer value"
        );
      });
    });

    it("Should return error when entity format is wrong", () => {
      variables.entity = true;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "nt cannot represent non-integer value"
        );
      });
    });

    it("Should return error when no password provided", () => {
      variables.phone = "380000000001";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

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

    it("Should return error when password is null", () => {
      variables.password = null;
      variables.phone = "380000000001";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when password is not string", () => {
      variables.password = 123456;
      variables.phone = "380000000001";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

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

    it("Should return error when password is too short", () => {
      variables.password = "123";
      variables.phone = "380000000001";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("min_length");
      });
    });

    it("Should return error when email is not string", () => {
      variables.email = 1488;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

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

    it("Should return error when category_id is not a string", () => {
      variables.category_id = 1488;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when category_id is not a valid uuid", () => {
      variables.category_id = "1488";
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when using category created by another merchant", () => {
      variables.category_id = category_ids[1];
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("category_not_found");
      });
    });

    it("Should return error when tag_ids is not a string", () => {
      variables.tag_ids = 1488;
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when tag_ids includes invalid uuid", () => {
      variables.tag_ids = ["1488"];
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when using tag_ids created by another merchant", () => {
      variables.tag_ids = [tag_ids[1]];
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when email format is wrong", () => {
      variables.email = "email";
      variables.phone = "380000000001";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("invalid_email_format");
      });
    });

    it("Should return error when client with passed phone already exists", () => {
      variables.phone = "380000000000";
      variables.password = "password";
      variables.first_name = "John";
      variables.last_name = "Smith";
      variables.entity = 1;

      return accountGraphQLRequest(requestBody(CREATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { CREATE_PAGE_MUTATION as CREATE_PAGE } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let design_id;
let variables = {};
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
          name: "design",
          merchant_id,
          styles: {},
        },
      ])
      .returning("id");

    await Database("pages")
      .insert([
        {
          name: "unique page",
          design_id,
          styles: {},
        },
      ])
      .returning("id");
  });

  afterEach(async () => {
    await Database("pages").del();
    await Database("designs").del();
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { createPage }", () => {
    it("Should create page with valid name, design_id and styles provided", () => {
      variables.name = "my page";
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        const {
          body: {
            data: { createPage },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createPage");
        expect(createPage).to.have.property("name", variables.name);
        expect(createPage).to.have.property("design_id", variables.design_id);
      });
    });

    it("Should return error when no name provided", () => {
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$name" of required type "String!" was not provided`
        );
      });
    });

    it("Should return error when name is null", () => {
      variables.name = null;
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name has wrong type", () => {
      variables.name = true;
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when no design_id provided", () => {
      variables.name = "my page";
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          `Variable "$design_id" of required type "ID!" was not provided`
        );
      });
    });

    it("Should return error when design_id is null", () => {
      variables.name = "my page";
      variables.design_id = null;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when design_id has wrong type", () => {
      variables.name = "my page";
      variables.design_id = true;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "ID cannot represent value"
        );
      });
    });

    it("Should return error when design_id has wrong format", () => {
      variables.name = "my page";
      variables.design_id = "aaaaa";
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error without styles", () => {
      variables.name = "my page";
      variables.design_id = design_id;

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$styles" of required type "JSONObject!" was not provided'
        );
      });
    });

    it("Should return error when design_id is null", () => {
      variables.name = "my page";
      variables.design_id = design_id;
      variables.styles = null;

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when backgroundColor not provided", () => {
      variables.name = "my page";
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "styles.backgroundColor is a required"
        );
      });
    });

    it("Should return error when backgroundColor format is wrong", () => {
      variables.name = "my page";
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "white",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("invalid_syntax");
      });
    });

    it("Should return error when color not provided", () => {
      variables.name = "my page";
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "styles.color is a required field"
        );
      });
    });

    it("Should return error when color format is wrong", () => {
      variables.name = "my page";
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "black",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("invalid_syntax");
      });
    });

    it("Should return error when alignItems not provided", () => {
      variables.name = "my page";
      variables.design_id = design_id;
      variables.styles = {
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "styles.alignItems is a required field"
        );
      });
    });

    it("Should return error when alignItems format is wrong", () => {
      variables.name = "my page";
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "somewhere",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "unknown_alignItems_value"
        );
      });
    });

    it("Should return error when justifyContent not provided", () => {
      variables.name = "my page";
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "styles.justifyContent is a required field"
        );
      });
    });

    it("Should return error when justifyContent format is wrong", () => {
      variables.name = "my page";
      variables.design_id = design_id;
      variables.styles = {
        justifyContent: "somewhere",
        alignItems: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "unknown_justifyContent_value"
        );
      });
    });

    it("Should return error when page with passed name already exists", () => {
      variables.name = "unique page";
      variables.design_id = design_id;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_PAGE), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_CREATE_DESIGN_MUTATION as CREATE_DESIGN } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let merchant_id;
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
    [{ id: merchant_id }] = await Database("merchants")
      .insert([
        {
          login: "uklon",
          name: "uklon",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
          plugins: {
            designEditor: true,
          },
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
    await Database("merchants").del();
  });

  beforeEach(async () => {
    await Database("designs").insert([
      {
        name: "unique design",
        merchant_id,
        styles: {},
      },
    ]);
  });

  afterEach(async () => {
    await Database("designs").del();
    variables = {};
  });

  describe("mutation { createDesign }", () => {
    it("Should create design with valid name and styles provided", () => {
      variables.name = "my design";
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        const {
          body: {
            data: { createDesign },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("createDesign");
        expect(createDesign).to.have.property("name", variables.name);
        expect(createDesign).to.have.property("merchant_id", merchant_id);
      });
    });

    it("Should return error when no name provided", () => {
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
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
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when name has wrong type", () => {
      variables.name = true;
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error without styles", () => {
      variables.name = "my design";

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$styles" of required type "JSONObject!" was not provided'
        );
      });
    });

    it("Should return error when merchant_id is null", () => {
      variables.name = "my design";
      variables.styles = null;

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when backgroundColor not provided", () => {
      variables.name = "my design";
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "styles.backgroundColor is a required field"
        );
      });
    });

    it("Should return error when backgroundColor format is wrong", () => {
      variables.name = "my design";
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "white",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("invalid_syntax");
      });
    });

    it("Should return error when color not provided", () => {
      variables.name = "my design";
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "styles.color is a required field"
        );
      });
    });

    it("Should return error when color format is wrong", () => {
      variables.name = "my design";
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "black",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("invalid_syntax");
      });
    });

    it("Should return error when alignItems not provided", () => {
      variables.name = "my design";
      variables.styles = {
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "styles.alignItems is a required field"
        );
      });
    });

    it("Should return error when alignItems format is wrong", () => {
      variables.name = "my design";
      variables.styles = {
        alignItems: "somewhere",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "unknown_alignItems_value"
        );
      });
    });

    it("Should return error when justifyContent not provided", () => {
      variables.name = "my design";
      variables.styles = {
        alignItems: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "styles.justifyContent is a required field"
        );
      });
    });

    it("Should return error when justifyContent format is wrong", () => {
      variables.name = "my design";
      variables.styles = {
        justifyContent: "somewhere",
        alignItems: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "unknown_justifyContent_value"
        );
      });
    });

    it("Should return error when design with passed name already exists", () => {
      variables.name = "unique design";
      variables.styles = {
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        backgroundColor: "#ffffff",
      };

      return accountGraphQLRequest(requestBody(CREATE_DESIGN), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });
  });
});

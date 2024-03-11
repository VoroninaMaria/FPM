import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { UPDATE_BLOCK_MUTATION as UPDATE_BLOCK } from "@local/test/api/mutations.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let merchant_id;
let file_id;
let block_id;
let page_id;
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

const testImage =
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAQAAAAD+Fb1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnBwYNHjXa9Gr5AAAALUlEQVQI12Ng6GV4x3CMwZmZwZ3hA8MLBhEmBkYGcQY5BlYWhn8Mggy/Gf4CAI7jCAM0uK/FAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA3LTA2VDEzOjMwOjQxKzAwOjAwt1HH6gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wNy0wNlQxMzozMDo0MSswMDowMMYMf1YAAAAASUVORK5CYII=";

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

    [{ id: merchant_id }] = await Database("merchants")
      .insert([
        {
          login: "uklon",
          name: "uklon",
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
        },
      ])
      .returning("id");

    [{ id: file_id }] = await Database("files")
      .insert({
        name: "test2",
        account_id: merchant_id,
        account_type: "merchants",
        mimetype: "image/jpeg",
        data: Buffer.from(testImage, "base64"),
      })
      .returning("id");

    ({
      body: { token },
    } = await accountLoginRequest({
      login: "offtop",
      password: "123123",
    }));
  });

  after(async () => {
    await Database("files").del();
    await Database("admins").del();
    await Database("merchants").del();
  });

  beforeEach(async () => {
    const [{ id: design_id }] = await Database("designs")
      .insert([
        {
          name: "my design",
          merchant_id,
          styles: {},
        },
      ])
      .returning("id");

    [{ id: page_id }] = await Database("pages")
      .insert([
        {
          name: "my page",
          design_id,
          styles: {},
        },
      ])
      .returning("id");

    [{ id: block_id }] = await Database("blocks")
      .insert([
        {
          name: "a block",
          page_id,
          blocks: 1,
          position: 1,
          type: "Text",
        },
        {
          name: "unique block",
          page_id,
          blocks: 1,
          position: 1,
          type: "Text",
        },
      ])
      .returning("id");
  });

  afterEach(async () => {
    await Database("blocks").del();
    await Database("pages").del();
    await Database("designs").del();
    variables = {};
  });

  describe("mutation { updateBlock }", () => {
    context("Shared cases", () => {
      it("Should return error when no name provided", () => {
        variables.blocks = 1;
        variables.page_id = page_id;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
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
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        });
      });

      it("Should return error when name has wrong type", () => {
        variables.name = true;
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.id = block_id;
        variables.type = "EmptyBlock";
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Should return error when no id provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$id" of required type "ID!" was not provided`
          );
        });
      });

      it("Should return error when id is null", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = null;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        });
      });

      it("Should return error when id has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = true;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "ID cannot represent value"
          );
        });
      });

      it("Should return error when id has wrong format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = "aaaaa";
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        });
      });

      it("Should return error when no page_id provided", () => {
        variables.name = "my block";
        variables.id = block_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$page_id" of required type "ID!" was not provided`
          );
        });
      });

      it("Should return error when page_id is null", () => {
        variables.name = "my block";
        variables.page_id = null;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        });
      });

      it("Should return error when page_id has wrong type", () => {
        variables.name = "my block";
        variables.page_id = true;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "ID cannot represent value"
          );
        });
      });

      it("Should return error when id has wrong format", () => {
        variables.name = "my block";
        variables.page_id = "aaaaa";
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        });
      });

      it("Should return error when no blocks provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$blocks" of required type "Int!" was not provided`
          );
        });
      });

      it("Should return error when blocks is null", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = null;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        });
      });

      it("Should return error when blocks has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = true;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Should return error when blocks is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = -1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "Blocks should be greater than 0"
          );
        });
      });

      it("Should return error when blocks is zero", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 0;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "Blocks should be greater than 0"
          );
        });
      });

      it("Should return error when no position provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$position" of required type "Int!" was not provided`
          );
        });
      });

      it("Should return error when position is null", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.position = null;
        variables.blocks = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        });
      });

      it("Should return error when position has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.position = true;
        variables.blocks = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Should return error when position is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.position = -1;
        variables.blocks = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "Position should be greater than 0"
          );
        });
      });

      it("Should return error when position is zero", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.position = 0;
        variables.blocks = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "Position should be greater than 0"
          );
        });
      });

      it("Should return error when no type provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            `Variable "$type" of required type "String!" was not provided`
          );
        });
      });

      it("Should return error when type is null", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = null;
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("must not be null.");
        });
      });

      it("Should return error when type has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = 1;
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Should return error when type doesn't exist", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "UltraBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("unknown_block_type");
        });
      });

      it("Should return error when block with passed name already exists", () => {
        variables.name = "unique block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("already_exist");
        });
      });
    });

    context("EmptyBlock", () => {
      it("Should update EmptyBlock with valid params provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "EmptyBlock";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });
    });

    context("Text", () => {
      it("Should update Text with valid params and styles provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          fontWeight: 600,
          fontSize: 48,
          fontStyle: "normal",
          color: "#000000",
          textAlign: "start",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should update Text with valid params without styles provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should return error when no text provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.text is a required field"
          );
        });
      });

      it("Should return error when text is null", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: null,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.text is a required field"
          );
        });
      });

      it("Should return error when text has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: true,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.text must be a `string` type"
          );
        });
      });

      it("Should return error when fontWeight has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          fontWeight: "600",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontWeight must be a `number` type"
          );
        });
      });

      it("Should return error when fontWeight is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          fontWeight: -500,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontWeight must be a positive number"
          );
        });
      });

      it("Should return error when fontWeight is zero", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          fontWeight: 0,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontWeight must be a positive number"
          );
        });
      });

      it("Should return error when fontStyle has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          fontStyle: 15,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontStyle must be a `string` type"
          );
        });
      });

      it("Should return error when fontStyle is not normal or cursive", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          fontStyle: "bold",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_font_style");
        });
      });

      it("Should return error when fontSize has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          fontSize: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontSize must be a `number` type"
          );
        });
      });

      it("Should return error when fontSize is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          fontSize: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontSize must be a positive number"
          );
        });
      });

      it("Should return error when fontSize is zero", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          fontSize: 0,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontSize must be a positive number"
          );
        });
      });

      it("Should return error when color has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          color: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.color must be a `string` type"
          );
        });
      });

      it("Should return error when color doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          color: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });

      it("Should return error when textAlign has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          textAlign: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.textAlign must be a `string` type"
          );
        });
      });

      it("Should return error when textAlign doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Text";
        variables.id = block_id;
        variables.styles = {
          textAlign: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "unknown_textAlign_value"
          );
        });
      });
    });

    context("TextInput", () => {
      it("Should update TextInput with valid params and styles provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          fontWeight: 600,
          fontSize: 48,
          color: "#000000",
          textAlign: "start",
          height: 50,
          width: 50,
          borderRadius: 2,
          borderColor: "#000000",
          borderWidth: 2,
          backgroundColor: "#000000",
          placeholderTextColor: "#000000",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should update TextInput with valid params without styles provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should return error when no text provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.text is a required field"
          );
        });
      });

      it("Should return error when text is null", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: null,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.text is a required field"
          );
        });
      });

      it("Should return error when text has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: true,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.text must be a `string` type"
          );
        });
      });

      it("Should return error when fontWeight has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          fontWeight: "600",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontWeight must be a `number` type"
          );
        });
      });

      it("Should return error when fontWeight is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          fontWeight: -500,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontWeight must be a positive number"
          );
        });
      });

      it("Should return error when fontWeight is zero", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          fontWeight: 0,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontWeight must be a positive number"
          );
        });
      });

      it("Should return error when fontSize has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          fontSize: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontSize must be a `number` type"
          );
        });
      });

      it("Should return error when fontSize is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          fontSize: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontSize must be a positive number"
          );
        });
      });

      it("Should return error when fontSize is zero", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          fontSize: 0,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontSize must be a positive number"
          );
        });
      });

      it("Should return error when color has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          color: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.color must be a `string` type"
          );
        });
      });

      it("Should return error when color doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          color: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });

      it("Should return error when textAlign has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          textAlign: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.textAlign must be a `string` type"
          );
        });
      });

      it("Should return error when textAlign doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          textAlign: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "unknown_textAlign_value"
          );
        });
      });

      it("Should return error when fontStyle has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          fontStyle: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontStyle must be a `string` type"
          );
        });
      });

      it("Should return error when fontStyle doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          fontStyle: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_font_style");
        });
      });

      it("Should return error when height has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          height: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.height must be a `number` type"
          );
        });
      });

      it("Should return error when height is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          height: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.height must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when width has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          width: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.width must be a `number` type"
          );
        });
      });

      it("Should return error when width is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          width: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.width must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when borderRadius has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          borderRadius: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderRadius must be a `number` type"
          );
        });
      });

      it("Should return error when borderRadius is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          borderRadius: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderRadius must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when borderWidth has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          borderWidth: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderWidth must be a `number` type"
          );
        });
      });

      it("Should return error when borderWidth is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          borderWidth: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderWidth must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when borderColor has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          borderColor: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderColor must be a `string` type"
          );
        });
      });

      it("Should return error when borderColor doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          borderColor: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });

      it("Should return error when backgroundColor has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          backgroundColor: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.backgroundColor must be a `string` type"
          );
        });
      });

      it("Should return error when backgroundColor doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          backgroundColor: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });

      it("Should return error when placeholderTextColor has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          placeholderTextColor: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.placeholderTextColor must be a `string` type"
          );
        });
      });

      it("Should return error when placeholderTextColor doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "TextInput";
        variables.id = block_id;
        variables.styles = {
          placeholderTextColor: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });
    });

    context("PhoneInput", () => {
      it("Should update PhoneInput with valid params and styles provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          color: "#000000",
          height: 50,
          width: 50,
          borderRadius: 2,
          borderColor: "#000000",
          borderWidth: 2,
          backgroundColor: "#000000",
          placeholderTextColor: "#000000",
        };
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should update PhoneInput with valid params without styles provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should return error when color has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          color: 48,
        };
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.color must be a `string` type"
          );
        });
      });

      it("Should return error when color doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          color: "black",
        };
        variables.container_styles = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });

      it("Should return error when height has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          height: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.height must be a `number` type"
          );
        });
      });

      it("Should return error when height is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          height: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.height must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when width has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          width: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.width must be a `number` type"
          );
        });
      });

      it("Should return error when width is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          width: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.width must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when borderRadius has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          borderRadius: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderRadius must be a `number` type"
          );
        });
      });

      it("Should return error when borderRadius is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          borderRadius: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderRadius must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when borderWidth has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          borderWidth: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderWidth must be a `number` type"
          );
        });
      });

      it("Should return error when borderWidth is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          borderWidth: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderWidth must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when borderColor has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          borderColor: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderColor must be a `string` type"
          );
        });
      });

      it("Should return error when borderColor doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          borderColor: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });

      it("Should return error when backgroundColor has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          backgroundColor: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.backgroundColor must be a `string` type"
          );
        });
      });

      it("Should return error when backgroundColor doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          backgroundColor: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });

      it("Should return error when placeholderTextColor has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          placeholderTextColor: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.placeholderTextColor must be a `string` type"
          );
        });
      });

      it("Should return error when placeholderTextColor doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "PhoneInput";
        variables.id = block_id;
        variables.styles = {
          placeholderTextColor: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });
    });

    context("Button", () => {
      it("Should update Button with valid params and styles provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          fontWeight: 600,
          fontSize: 48,
          color: "#000000",
          backgroundColor: "#000000",
          textAlign: "center",
          borderWidth: 3,
          width: 100,
          height: 60,
          borderColor: "#000000",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should update Button with valid params without styles provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should return error when no text provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {};

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.text is a required field"
          );
        });
      });

      it("Should return error when text is null", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: null,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.text is a required field"
          );
        });
      });

      it("Should return error when text has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: true,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.text must be a `string` type"
          );
        });
      });

      it("Should return error when action has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: "text",
          action: true,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.action must be a `string` type"
          );
        });
      });

      it("Should return error when href has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          text: "text",
          redirect_page_id: true,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.redirect_page_id must be a `string` type"
          );
        });
      });

      it("Should return error when fontWeight has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          fontWeight: "600",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontWeight must be a `number` type"
          );
        });
      });

      it("Should return error when fontWeight is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          fontWeight: -500,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontWeight must be a positive number"
          );
        });
      });

      it("Should return error when width is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          width: -500,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.width must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when height is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          height: -500,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.height must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when fontWeight is zero", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          fontWeight: 0,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontWeight must be a positive number"
          );
        });
      });

      it("Should return error when fontSize has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          fontSize: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontSize must be a `number` type"
          );
        });
      });

      it("Should return error when fontSize is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          fontSize: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontSize must be a positive number"
          );
        });
      });

      it("Should return error when fontSize is zero", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          fontSize: 0,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.fontSize must be a positive number"
          );
        });
      });

      it("Should return error when borderWidth has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          borderWidth: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderWidth must be a `number` type"
          );
        });
      });

      it("Should return error when borderWidth is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          borderWidth: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderWidth must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when borderRadius has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          borderRadius: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderRadius must be a `number` type"
          );
        });
      });

      it("Should return error when borderRadius is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          borderRadius: -12,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderRadius must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when color has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          color: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.color must be a `string` type"
          );
        });
      });

      it("Should return error when color doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          color: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });

      it("Should return error when backgroundColor has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          backgroundColor: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.backgroundColor must be a `string` type"
          );
        });
      });

      it("Should return error when borderColor has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          borderColor: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderColor must be a `string` type"
          );
        });
      });

      it("Should return error when width has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          width: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.width must be a `number` type"
          );
        });
      });

      it("Should return error when height has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          height: "48",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.height must be a `number` type"
          );
        });
      });

      it("Should return error when backgroundColor doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          backgroundColor: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });

      it("Should return error when borderColor doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          borderColor: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });

      it("Should return error when textAlign has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          textAlign: 48,
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.textAlign must be a `string` type"
          );
        });
      });

      it("Should return error when textAlign doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Button";
        variables.id = block_id;
        variables.styles = {
          textAlign: "black",
        };
        variables.container_styles = {};
        variables.props = {
          text: "text",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "unknown_textAlign_value"
          );
        });
      });
    });

    context("Image", () => {
      it("Should update ImageBlock with valid params and styles provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.file_id = variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          resizeMode: "cover",
          borderRadius: 2,
          borderColor: "#000000",
          objactFit: "fill",
          borderWidth: 3,
          width: 100,
          height: 60,
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should update ImageBlock with valid params without styles provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should return error when no file_id provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          redirect_page_id: page_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.file_id is a required field"
          );
        });
      });

      it("Should return error when file_id is null", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          redirect_page_id: page_id,
          file_id: null,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.file_id is a required field"
          );
        });
      });

      it("Should return error when file_id has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          redirect_page_id: page_id,
          file_id: true,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.file_id must be a `string` type"
          );
        });
      });

      it("Should return error when file_id has wrong format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          redirect_page_id: page_id,
          file_id: "aaaaa",
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        });
      });

      it("Should return error when href has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          file_id,
          redirect_page_id: true,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "props.redirect_page_id must be a `string` type"
          );
        });
      });

      it("Should update Image with valid params without href provided", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {};
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          const {
            body: {
              data: { updateBlock },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("updateBlock");
          expect(updateBlock).to.have.property("name", variables.name);
          expect(updateBlock).to.have.property("id", variables.id);
        });
      });

      it("Should return error when resizeMode has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          resizeMode: 600,
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.resizeMode must be a `string` type"
          );
        });
      });

      it("Should return error when resizeMode is not one of the select", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          resizeMode: "aaaaa",
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "unknown_resizeMode_value"
          );
        });
      });

      it("Should return error when borderWidth has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          borderWidth: "48",
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderWidth must be a `number` type"
          );
        });
      });

      it("Should return error when borderWidth is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          borderWidth: -12,
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderWidth must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when borderRadius has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          borderRadius: "48",
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderRadius must be a `number` type"
          );
        });
      });

      it("Should return error when borderRadius is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          borderRadius: -12,
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderRadius must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when width has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          width: "48",
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.width must be a `number` type"
          );
        });
      });

      it("Should return error when width is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          width: -100,
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.width must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when height has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          height: "48",
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.height must be a `number` type"
          );
        });
      });
      it("Should return error when height is negative", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          height: -100,
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.height must be greater than or equal to 0"
          );
        });
      });

      it("Should return error when borderColor has wrong type", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          borderColor: 48,
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "styles.borderColor must be a `string` type"
          );
        });
      });

      it("Should return error when borderColor doens't follow format", () => {
        variables.name = "my block";
        variables.page_id = page_id;
        variables.blocks = 1;
        variables.position = 1;
        variables.type = "Image";
        variables.id = block_id;
        variables.styles = {
          borderColor: "black",
        };
        variables.container_styles = {};
        variables.props = {
          file_id,
        };

        return accountGraphQLRequest(requestBody(UPDATE_BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_syntax");
        });
      });
    });
  });
});

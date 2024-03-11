import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { TAG, ALL_TAGS, ALL_TAGS_META } from "@local/test/api/queries.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let variables = {};
let token;
let merchant;
const encrypted_password = await encryptPassword("123123");
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/merchant/auth/login")
    .send(payload)
    .then(callback);

const accountGraphQLRequest = (payload, authHeader, callback) =>
  chai
    .request(App)
    .post("/api/merchant/graphql")
    .set("Authorization", authHeader)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

const defaultMerchant = {
  login: "uklon",
  name: "uklon",
};

describe("Merchant GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      [merchant] = await Database("merchants")
        .insert({
          ...defaultMerchant,
          encrypted_password,
          status: MERCHANT_STATUSES.active.name,
        })
        .returning("*");

      await Database("tags").insert([
        {
          name: "businki",
          merchant_id: merchant.id,
        },
        {
          name: "bubochki",
          merchant_id: merchant.id,
        },

        {
          name: "pidori",
          merchant_id: merchant.id,
        },
      ]);
      ({
        body: { token },
      } = await accountLoginRequest({
        login: "uklon",
        password: "123123",
      }));
    });

    after(async () => {
      await Database("tags").del();
      await Database("merchants").del();
    });
    afterEach(() => (variables = {}));

    context("Tag", () => {
      it("Get tag without id", () =>
        accountGraphQLRequest(requestBody(TAG), `Bearer ${token}`, (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            'type "ID!" was not provided'
          );
        }));

      it("Get tag with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(TAG),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get tag with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(TAG),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Tag },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("Tag", Tag, null);
          }
        );
      });

      it("Get tag with valid id", async () => {
        const { id } = await Database("tags").first();

        variables.id = id;

        return accountGraphQLRequest(
          requestBody(TAG),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Tag },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("Tag", Tag);
            expect(Object.keys(Tag)).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All tags", () => {
      it("Get allTags without pagination and filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with valid filter(id) and without pagination", async () => {
        const tag = await Database("tags")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = {
          id: tag.id,
          merchant_id: tag.merchant_id,
          status: tag.status,
        };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(1);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with valid filter(ids) and without pagination", async () => {
        const tags = await Database("tags").where({ merchant_id: merchant.id });

        variables.filter = {
          ids: tags.map((tag) => tag.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with valid pagination and filter(id)", async () => {
        const client = await Database("tags")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = {
          id: client.id,
          merchant_id: client.merchant_id,
          status: client.status,
          phone: client.phone,
          email: client.email,
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(1);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with valid pagination and filter(ids)", async () => {
        const tags = await Database("tags").where({ merchant_id: merchant.id });

        variables.filter = {
          ids: tags.map((tag) => tag.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allTags with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allTags with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allTags with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allTags with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allTags with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with valid sortOrder", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allTags with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(0);
          }
        );
      });

      it("Get allTags with valid filter id", async () => {
        const { id } = await Database("tags")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(1);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "sadrftgoi"] };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allTags with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(0);
          }
        );
      });

      it("Get allTags with valid filter ids", async () => {
        const tags = await Database("tags").where({ merchant_id: merchant.id });

        variables.filter = { ids: tags.map((tag) => tag.id) };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allTags with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(0);
          }
        );
      });

      it("Get allTags with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("tags").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(3);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allTags with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allTags with filter name which does not exist", () => {
        variables.filter = { name: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(0);
          }
        );
      });

      it("Get allTags with valid filter name", async () => {
        const { name } = await Database("tags")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allTags },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allTags", allTags);
            expect(allTags.length).to.be.eq(1);
            expect(Object.keys(allTags[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Tags Meta", () => {
      it("Get allTagsMeta without pagination and empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with valid filter(id) and empty pagination", async () => {
        const tag = await Database("tags")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = {
          id: tag.id,
          merchant_id: tag.merchant_id,
          name: tag.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allTagsMeta with valid filter(ids) and empty pagination", async () => {
        const tags = await Database("tags").where({ merchant_id: merchant.id });

        variables.filter = {
          ids: tags.map((tag) => tag.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with valid pagination and filter(id)", async () => {
        const tag = await Database("tags")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = {
          id: tag.id,
          merchant_id: tag.merchant_id,
          name: tag.name,
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allTagsMeta with valid pagination and filter(ids)", async () => {
        const tags = await Database("tags").where({ merchant_id: merchant.id });

        variables.filter = {
          ids: tags.map((tag) => tag.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allTagsMeta with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allTagsMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allTagsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allTagsMeta with sortOrder which does not exist", () => {
        variables.sortOrder = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allTagsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allTagsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allTagsMeta with valid filter id", async () => {
        const { id } = await Database("tags")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta).to.have.property("count");
            expect(_allTagsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allTagsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "sadrftgjk"] };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allTagsMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allTagsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allTagsMeta with valid filter ids", async () => {
        const tags = await Database("tags").where({ merchant_id: merchant.id });

        variables.filter = { ids: tags.map((tag) => tag.id) };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allTagsMeta with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allTagsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allTagsMeta with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("tags")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allTagsMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allTagsMeta with filter name which does not exist", () => {
        variables.filter = { name: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allTagsMeta).to.have.property("count");
            expect(_allTagsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allTagsMeta with valid filter name", async () => {
        const { name } = await Database("tags")
          .where({ merchant_id: merchant.id })
          .first();

        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_TAGS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allTagsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allTagsMeta",
              _allTagsMeta
            );
            expect(_allTagsMeta).to.have.property("count");
            expect(_allTagsMeta.count).to.be.eq(1);
          }
        );
      });
    });
  });
});

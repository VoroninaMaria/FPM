import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { BLOCK, ALL_BLOCKS, ALL_BLOCKS_META } from "@local/test/api/queries.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let variables = {};
let token;
const encrypted_password = await encryptPassword("123123");

const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
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

const defaultMerchant = {
  status: MERCHANT_STATUSES.active.name,
  encrypted_password,
};

describe("Admin GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      const [{ id: merchant_id }] = await Database("merchants")
        .insert([
          {
            ...defaultMerchant,
            name: "uklon",
            login: "uklon",
          },
        ])
        .returning("id");

      const [{ id: design_id }] = await Database("designs")
        .insert([
          {
            name: "design",
            merchant_id,
            styles: {},
          },
        ])
        .returning("id");

      const pages = await Database("pages")
        .insert([
          {
            name: "page1",
            design_id,
            styles: {},
          },
          {
            name: "page2",
            design_id,
            styles: {},
          },
          {
            name: "page3",
            design_id,
            styles: {},
          },
          {
            name: "page4",
            design_id,
            styles: {},
          },
        ])
        .returning("id");

      await Promise.all(
        pages.map(async (page) => {
          await Database("blocks").insert([
            {
              name: "block1",
              page_id: page.id,
              blocks: 1,
              position: 1,
              type: "EmptyBlock",
            },
            {
              name: "block2",
              page_id: page.id,
              blocks: 1,
              position: 2,
              type: "EmptyBlock",
            },
            {
              name: "block3",
              page_id: page.id,
              blocks: 1,
              position: 3,
              type: "EmptyBlock",
            },
          ]);
        })
      );

      await Database("admins")
        .insert({
          login: "offtop",
          encrypted_password,
        })
        .returning("*");

      ({
        body: { token },
      } = await accountLoginRequest({
        login: "offtop",
        password: "123123",
      }));
    });

    after(async () => {
      await Database("blocks").del();
      await Database("pages").del();
      await Database("designs").del();
      await Database("merchants").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("Block", () => {
      it("Get block without id", () =>
        accountGraphQLRequest(requestBody(BLOCK), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            'type "ID!" was not provided'
          );
        }));

      it("Get block with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(requestBody(BLOCK), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get block with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(requestBody(BLOCK), (res) => {
          const {
            body: {
              data: { Block },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("Block", Block, null);
        });
      });

      it("Get block with valid id", async () => {
        const { id } = await Database("blocks").first();

        variables.id = id;

        return accountGraphQLRequest(requestBody(BLOCK), (res) => {
          const {
            body: {
              data: { Block },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("Block", Block);
        });
      });
    });

    context("All blocks", () => {
      it("Get allBlocks without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(12);
        });
      });

      it("Get allBlocks with valid filter(id) and without pagination", async () => {
        const block = await Database("blocks").first();

        variables.filter = {
          id: block.id,
          page_id: block.page_id,
          name: block.name,
        };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(1);
        });
      });

      it("Get allBlocks with valid filter(ids) and without pagination", async () => {
        const blocks = await Database("blocks");

        variables.filter = {
          ids: blocks.map((block) => block.id),
        };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(12);
        });
      });

      it("Get allBlocks with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(12);
        });
      });

      it("Get allBlocks with valid pagination and filter(id)", async () => {
        const block = await Database("blocks").first();

        variables.filter = {
          id: block.id,
          page_id: block.page_id,
          name: block.name,
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(1);
        });
      });

      it("Get allBlocks with valid pagination and filter(ids)", async () => {
        const blocks = await Database("blocks");

        variables.filter = {
          ids: blocks.map((block) => block.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(12);
        });
      });

      it("Get allBlocks with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allBlocks with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(12);
        });
      });

      it("Get allBlocks with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allBlocks with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(12);
        });
      });

      it("Get allBlocks with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allBlocks with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allBlocks with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(12);
        });
      });

      it("Get allBlocks with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allBlocks with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(12);
        });
      });

      it("Get allBlocks with valid sortOrder", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(12);
        });
      });

      it("Get allBlocks with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allBlocks with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(0);
        });
      });

      it("Get allBlocks with valid filter id", async () => {
        const { id } = await Database("blocks").first();

        variables.filter = { id };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(1);
        });
      });

      it("Get allBlocks with invalid filter ids", () => {
        variables.filter = { ids: [1345, 4567] };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allBlocks with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "5f4467b6-3a87-47e5-b7b8-cbd5162cd709",
            "5f4467b6-3a87-47e5-b7b8-cbd5162cd098",
          ],
        };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(0);
        });
      });

      it("Get allBlocks with valid filter ids", async () => {
        const blocks = await Database("blocks");

        variables.filter = { ids: blocks.map((block) => block.id) };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(12);
        });
      });

      it("Get allBlocks with invalid filter page_id", () => {
        variables.filter = { page_id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allBlocks with filter page_id which does not exist", () => {
        variables.filter = {
          page_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(0);
        });
      });

      it("Get allBlocks with valid filter page_id", async () => {
        const { page_id } = await Database("blocks").first();

        variables.filter = { page_id };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(3);
        });
      });

      it("Get allBlocks with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allBlocks with filter name which does not exist", () => {
        variables.filter = { name: "show" };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(0);
        });
      });

      it("Get allBlocks with valid filter name", async () => {
        const { name } = await Database("blocks").first();

        variables.filter = { name };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS), (res) => {
          const {
            body: {
              data: { allBlocks },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allBlocks", allBlocks);
          expect(allBlocks.length).to.be.eq(4);
        });
      });
    });

    context("All Blocks Meta", () => {
      it("Get allBlocksMeta without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with valid filter(id) and without pagination", async () => {
        const block = await Database("blocks").first();

        variables.filter = {
          id: block.id,
          page_id: block.page_id,
          name: block.name,
        };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(1);
        });
      });

      it("Get allBlocksMeta with valid filter(ids) and without pagination", async () => {
        const blocks = await Database("blocks");

        variables.filter = {
          ids: blocks.map((block) => block.id),
        };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with valid pagination and filter(id)", async () => {
        const block = await Database("blocks").first();

        variables.filter = {
          id: block.id,
          page_id: block.page_id,
          name: block.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(1);
        });
      });

      it("Get allBlocksMeta with valid pagination and filter(ids)", async () => {
        const blocks = await Database("blocks");

        variables.filter = {
          ids: blocks.map((block) => block.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allBlocksMeta with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allBlocksMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allBlocksMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allBlocksMeta with sortOrder which does not exist", () => {
        variables.sortOrder = "test";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allBlocksMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allBlocksMeta.count).to.be.eq(0);
        });
      });

      it("Get allBlocksMeta with valid filter id", async () => {
        const { id } = await Database("blocks").first();

        variables.filter = { id };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta).to.have.property("count");
          expect(_allBlocksMeta.count).to.be.eq(1);
        });
      });

      it("Get allBlocksMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "sadrftgyfsd"] };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allBlocksMeta with filter ids which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allBlocksMeta.count).to.be.eq(0);
        });
      });

      it("Get allBlocksMeta with valid filter ids", async () => {
        const blocks = await Database("blocks");

        variables.filter = { ids: blocks.map((block) => block.id) };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta).to.have.property("count");
          expect(_allBlocksMeta.count).to.be.eq(12);
        });
      });

      it("Get allBlocksMeta with invalid filter page_id", () => {
        variables.filter = { page_id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allBlocksMeta with filter page_id which does not exist", () => {
        variables.filter = {
          page_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allBlocksMeta.count).to.be.eq(0);
        });
      });

      it("Get allBlocksMeta with valid filter page_id", async () => {
        const { page_id } = await Database("blocks").first();

        variables.filter = { page_id };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta).to.have.property("count");
          expect(_allBlocksMeta.count).to.be.eq(3);
        });
      });

      it("Get allBlocksMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allBlocksMeta with filter name which does not exist", () => {
        variables.filter = { name: "test" };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allBlocksMeta).to.have.property("count");
          expect(_allBlocksMeta.count).to.be.eq(0);
        });
      });

      it("Get allBlocksMeta with valid filter name", async () => {
        const { name } = await Database("blocks").first();

        variables.filter = { name };

        return accountGraphQLRequest(requestBody(ALL_BLOCKS_META), (res) => {
          const {
            body: {
              data: { _allBlocksMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allBlocksMeta",
            _allBlocksMeta
          );
          expect(_allBlocksMeta).to.have.property("count");
          expect(_allBlocksMeta.count).to.be.eq(4);
        });
      });
    });
  });
});

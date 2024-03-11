import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { PAGE, ALL_PAGES, ALL_PAGES_META } from "@local/test/api/queries.js";
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

      const designs = await Database("designs")
        .insert([
          {
            name: "design1",
            merchant_id,
            styles: {},
          },
          {
            name: "design2",
            merchant_id,
            styles: {},
          },
          {
            name: "design3",
            merchant_id,
            styles: {},
          },
          {
            name: "design4",
            merchant_id,
            styles: {},
          },
        ])
        .returning("id");

      await Promise.all(
        designs.map(async (design) => {
          await Database("pages").insert([
            {
              name: "page1",
              design_id: design.id,
              styles: {},
            },
            {
              name: "page2",
              design_id: design.id,
              styles: {},
            },
            {
              name: "page3",
              design_id: design.id,
              styles: {},
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
      await Database("pages").del();
      await Database("designs").del();
      await Database("merchants").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("Page", () => {
      it("Get page without id", () =>
        accountGraphQLRequest(requestBody(PAGE), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            'type "ID!" was not provided'
          );
        }));

      it("Get page with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(requestBody(PAGE), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get page with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(requestBody(PAGE), (res) => {
          const {
            body: {
              data: { Page },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("Page", Page, null);
        });
      });

      it("Get page with valid id", async () => {
        const { id } = await Database("pages").first();

        variables.id = id;

        return accountGraphQLRequest(requestBody(PAGE), (res) => {
          const {
            body: {
              data: { Page },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("Page", Page);
        });
      });
    });

    context("All pages", () => {
      it("Get allPages without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(12);
        });
      });

      it("Get allPages with valid filter(id) and without pagination", async () => {
        const page = await Database("pages").first();

        variables.filter = {
          id: page.id,
          design_id: page.design_id,
          name: page.name,
        };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(1);
        });
      });

      it("Get allPages with valid filter(ids) and without pagination", async () => {
        const blocks = await Database("pages");

        variables.filter = {
          ids: blocks.map((page) => page.id),
        };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(12);
        });
      });

      it("Get allPages with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(12);
        });
      });

      it("Get allPages with valid pagination and filter(id)", async () => {
        const page = await Database("pages").first();

        variables.filter = {
          id: page.id,
          design_id: page.design_id,
          name: page.name,
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(1);
        });
      });

      it("Get allPages with valid pagination and filter(ids)", async () => {
        const blocks = await Database("pages");

        variables.filter = {
          ids: blocks.map((page) => page.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(12);
        });
      });

      it("Get allPages with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allPages with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(12);
        });
      });

      it("Get allPages with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allPages with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(12);
        });
      });

      it("Get allPages with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allPages with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPages with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(12);
        });
      });

      it("Get allPages with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allPages with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(12);
        });
      });

      it("Get allPages with valid sortOrder", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(12);
        });
      });

      it("Get allPages with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPages with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(0);
        });
      });

      it("Get allPages with valid filter id", async () => {
        const { id } = await Database("pages").first();

        variables.filter = { id };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(1);
        });
      });

      it("Get allPages with invalid filter ids", () => {
        variables.filter = { ids: [1345, 4567] };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPages with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "5f4467b6-3a87-47e5-b7b8-cbd5162cd709",
            "5f4467b6-3a87-47e5-b7b8-cbd5162cd098",
          ],
        };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(0);
        });
      });

      it("Get allPages with valid filter ids", async () => {
        const blocks = await Database("pages");

        variables.filter = { ids: blocks.map((page) => page.id) };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(12);
        });
      });

      it("Get allPages with invalid filter design_id", () => {
        variables.filter = { design_id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPages with filter design_id which does not exist", () => {
        variables.filter = {
          design_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(0);
        });
      });

      it("Get allPages with valid filter design_id", async () => {
        const { design_id } = await Database("pages").first();

        variables.filter = { design_id };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(3);
        });
      });

      it("Get allPages with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allPages with filter name which does not exist", () => {
        variables.filter = { name: "show" };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(0);
        });
      });

      it("Get allPages with valid filter name", async () => {
        const { name } = await Database("pages").first();

        variables.filter = { name };

        return accountGraphQLRequest(requestBody(ALL_PAGES), (res) => {
          const {
            body: {
              data: { allPages },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPages", allPages);
          expect(allPages.length).to.be.eq(4);
        });
      });
    });

    context("All Pages Meta", () => {
      it("Get allPagesMeta without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with valid filter(id) and without pagination", async () => {
        const page = await Database("pages").first();

        variables.filter = {
          id: page.id,
          design_id: page.design_id,
          name: page.name,
        };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(1);
        });
      });

      it("Get allPagesMeta with valid filter(ids) and without pagination", async () => {
        const blocks = await Database("pages");

        variables.filter = {
          ids: blocks.map((page) => page.id),
        };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with valid pagination and filter(id)", async () => {
        const page = await Database("pages").first();

        variables.filter = {
          id: page.id,
          design_id: page.design_id,
          name: page.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(1);
        });
      });

      it("Get allPagesMeta with valid pagination and filter(ids)", async () => {
        const blocks = await Database("pages");

        variables.filter = {
          ids: blocks.map((page) => page.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allPagesMeta with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allPagesMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allPagesMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allPagesMeta with sortOrder which does not exist", () => {
        variables.sortOrder = "test";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPagesMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allPagesMeta.count).to.be.eq(0);
        });
      });

      it("Get allPagesMeta with valid filter id", async () => {
        const { id } = await Database("pages").first();

        variables.filter = { id };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta).to.have.property("count");
          expect(_allPagesMeta.count).to.be.eq(1);
        });
      });

      it("Get allPagesMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "sadrftgyfsd"] };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPagesMeta with filter ids which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allPagesMeta.count).to.be.eq(0);
        });
      });

      it("Get allPagesMeta with valid filter ids", async () => {
        const blocks = await Database("pages");

        variables.filter = { ids: blocks.map((page) => page.id) };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta).to.have.property("count");
          expect(_allPagesMeta.count).to.be.eq(12);
        });
      });

      it("Get allPagesMeta with invalid filter design_id", () => {
        variables.filter = { design_id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPagesMeta with filter design_id which does not exist", () => {
        variables.filter = {
          design_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allPagesMeta.count).to.be.eq(0);
        });
      });

      it("Get allPagesMeta with valid filter design_id", async () => {
        const { design_id } = await Database("pages").first();

        variables.filter = { design_id };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta).to.have.property("count");
          expect(_allPagesMeta.count).to.be.eq(3);
        });
      });

      it("Get allPagesMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allPagesMeta with filter name which does not exist", () => {
        variables.filter = { name: "test" };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allPagesMeta).to.have.property("count");
          expect(_allPagesMeta.count).to.be.eq(0);
        });
      });

      it("Get allPagesMeta with valid filter name", async () => {
        const { name } = await Database("pages").first();

        variables.filter = { name };

        return accountGraphQLRequest(requestBody(ALL_PAGES_META), (res) => {
          const {
            body: {
              data: { _allPagesMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allPagesMeta",
            _allPagesMeta
          );
          expect(_allPagesMeta).to.have.property("count");
          expect(_allPagesMeta.count).to.be.eq(4);
        });
      });
    });
  });
});

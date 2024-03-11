import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  CATEGORY,
  ALL_CATEGORIES,
  ALL_CATEGORIES_META,
} from "@local/test/api/queries.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let variables = {};
let token;
const encrypted_password = await encryptPassword("123123");

const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/admin/auth/login").send(payload).then(callback);

const accountGraphQLRequest = (payload, authHeader, callback) =>
  chai
    .request(App)
    .post("/api/admin/graphql")
    .set("Authorization", authHeader)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

const defaultMerchant = {
  status: MERCHANT_STATUSES.active.name,
};

describe("Admin GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      await Database("merchants")
        .insert([
          {
            ...defaultMerchant,
            name: "uklon",
            encrypted_password,
            login: "uklon",
          },
          {
            ...defaultMerchant,
            name: "uber",
            encrypted_password,
            login: "uber",
          },
          {
            ...defaultMerchant,
            name: "bolt",
            encrypted_password,
            login: "bolt",
          },
          {
            ...defaultMerchant,
            name: "opti",
            encrypted_password,
            login: "opti",
          },
        ])
        .onConflict("name")
        .merge();

      const merchants = await Database("merchants").where({
        status: MERCHANT_STATUSES.active.name,
      });

      await Promise.all(
        merchants.map(async (merchant) => {
          await Database("client_categories")
            .insert([
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
            ])
            .onConflict(["merchant_id", "name"])
            .merge();
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
      await Database("client_categories").del();
      await Database("merchants").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("Category", () => {
      it("Get category without id", () =>
        accountGraphQLRequest(
          requestBody(CATEGORY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get category with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(CATEGORY),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get category with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(CATEGORY),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Category },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("Category", Category, null);
          }
        );
      });

      it("Get category with valid id", async () => {
        const { id } = await Database("client_categories").first();

        variables.id = id;

        return accountGraphQLRequest(
          requestBody(CATEGORY),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Category },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("Category", Category);
            expect(Object.keys(Category)).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All categories", () => {
      it("Get allCategories without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(12);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with valid filter(id) and without pagination", async () => {
        const category = await Database("client_categories").first();

        variables.filter = {
          id: category.id,
          merchant_id: category.merchant_id,
          category_id: category.category_id,
          name: category.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(1);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with valid filter(ids) and without pagination", async () => {
        const categories = await Database("client_categories");

        variables.filter = {
          ids: categories.map((category) => category.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(12);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(12);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with valid pagination and filter(id)", async () => {
        const category = await Database("client_categories").first();

        variables.filter = {
          id: category.id,
          merchant_id: category.merchant_id,
          category_id: category.category_id,
          name: category.name,
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(1);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with valid pagination and filter(ids)", async () => {
        const categories = await Database("client_categories");

        variables.filter = {
          ids: categories.map((category) => category.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(12);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allCategories with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(12);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allCategories with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(12);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCategories with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCategories with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(12);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCategories with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(12);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with valid sortOrder", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(12);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCategories with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(0);
          }
        );
      });

      it("Get allCategories with valid filter id", async () => {
        const { id } = await Database("client_categories").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(1);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with invalid filter ids", () => {
        variables.filter = { ids: [1345, 4567] };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCategories with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "5f4467b6-3a87-47e5-b7b8-cbd5162cd709",
            "5f4467b6-3a87-47e5-b7b8-cbd5162cd098",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(0);
          }
        );
      });

      it("Get allCategories with valid filter ids", async () => {
        const categories = await Database("client_categories");

        variables.filter = { ids: categories.map((category) => category.id) };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(12);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCategories with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(0);
          }
        );
      });

      it("Get allCategories with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("client_categories").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(3);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allCategories with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCategories with filter name which does not exist", () => {
        variables.filter = { name: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(0);
          }
        );
      });

      it("Get allCategories with valid filter name", async () => {
        const { name } = await Database("client_categories").first();

        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allCategories },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allCategories",
              allCategories
            );
            expect(allCategories.length).to.be.eq(4);
            expect(Object.keys(allCategories[0])).to.eql([
              "id",
              "merchant_id",
              "category_id",
              "name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Categories Meta", () => {
      it("Get allCategoriesMeta without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with valid filter(id) and without pagination", async () => {
        const category = await Database("client_categories").first();

        variables.filter = {
          id: category.id,
          merchant_id: category.merchant_id,
          category_id: category.category_id,
          name: category.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allCategoriesMeta with valid filter(ids) and without pagination", async () => {
        const categories = await Database("client_categories");

        variables.filter = {
          ids: categories.map((category) => category.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with valid pagination and filter(id)", async () => {
        const category = await Database("client_categories").first();

        variables.filter = {
          id: category.id,
          merchant_id: category.merchant_id,
          category_id: category.category_id,
          name: category.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allCategoriesMeta with valid pagination and filter(ids)", async () => {
        const categories = await Database("client_categories");

        variables.filter = {
          ids: categories.map((category) => category.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allCategoriesMeta with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allCategoriesMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCategoriesMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCategoriesMeta with sortOrder which does not exist", () => {
        variables.sortOrder = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCategoriesMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allCategoriesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allCategoriesMeta with valid filter id", async () => {
        const { id } = await Database("client_categories").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta).to.have.property("count");
            expect(_allCategoriesMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allCategoriesMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "sadrftgyfsd"] };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCategoriesMeta with filter ids which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allCategoriesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allCategoriesMeta with valid filter ids", async () => {
        const categories = await Database("client_categories");

        variables.filter = { ids: categories.map((category) => category.id) };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta).to.have.property("count");
            expect(_allCategoriesMeta.count).to.be.eq(12);
          }
        );
      });

      it("Get allCategoriesMeta with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allCategoriesMeta with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allCategoriesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allCategoriesMeta with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("client_categories").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta).to.have.property("count");
            expect(_allCategoriesMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allCategoriesMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allCategoriesMeta with filter name which does not exist", () => {
        variables.filter = { name: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allCategoriesMeta).to.have.property("count");
            expect(_allCategoriesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allCategoriesMeta with valid filter name", async () => {
        const { name } = await Database("client_categories").first();

        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_CATEGORIES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allCategoriesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allCategoriesMeta",
              _allCategoriesMeta
            );
            expect(_allCategoriesMeta).to.have.property("count");
            expect(_allCategoriesMeta.count).to.be.eq(4);
          }
        );
      });
    });
  });
});

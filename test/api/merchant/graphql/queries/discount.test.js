import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  DISCOUNT,
  ALL_DISCOUNTS,
  ALL_DISCOUNTS_META,
} from "@local/test/api/queries.js";
import { MERCHANT_STATUSES } from "@local/constants/index.js";

let variables = {};
let token;
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
  status: MERCHANT_STATUSES.active.name,
};

describe("Merchant GraphQL", () => {
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
          await Database("discounts")
            .insert([
              {
                name: "disc1",
                percent: 1,
                merchant_id: merchant.id,
              },
              {
                name: "disc2",
                percent: 2,
                merchant_id: merchant.id,
              },
              {
                name: "disc3",
                percent: 3,
                merchant_id: merchant.id,
              },
            ])
            .onConflict(["merchant_id", "name"])
            .merge();
        })
      );

      ({
        body: { token },
      } = await accountLoginRequest({
        login: "uklon",
        password: "123123",
      }));
    });

    after(async () => {
      await Database("discounts").del();
      await Database("merchants").del();
    });
    afterEach(() => (variables = {}));

    context("Discount", () => {
      it("Get Discount without id", () =>
        accountGraphQLRequest(
          requestBody(DISCOUNT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get Discount with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(DISCOUNT),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get Discount with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(DISCOUNT),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Discount },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("Discount", Discount, null);
          }
        );
      });

      it("Get Discount with valid id", async () => {
        const { id } = await Database("discounts").first();

        variables.id = id;

        return accountGraphQLRequest(
          requestBody(DISCOUNT),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { Discount },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("Discount", Discount);
            expect(Object.keys(Discount)).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Discounts", () => {
      it("Get allDiscounts without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with valid filter(id) and without pagination", async () => {
        const disc = await Database("discounts").first();

        variables.filter = {
          id: disc.id,
          merchant_id: disc.merchant_id,
          percent: disc.percent,
          name: disc.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(1);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with valid filter(ids) and without pagination", async () => {
        const discounts = await Database("discounts");

        variables.filter = {
          ids: discounts.map((discount) => discount.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with valid pagination and filter(id)", async () => {
        const disc = await Database("discounts").first();

        variables.filter = {
          id: disc.id,
          merchant_id: disc.merchant_id,
          category_id: disc.category_id,
          name: disc.name,
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(1);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with valid pagination and filter(ids)", async () => {
        const discounts = await Database("discounts");

        variables.filter = {
          ids: discounts.map((disc) => disc.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allDiscounts with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allDiscounts with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allDiscounts with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allDiscounts with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allDiscounts with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with valid sortOrder", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allDiscounts with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(0);
          }
        );
      });

      it("Get allDiscounts with valid filter id", async () => {
        const { id } = await Database("discounts").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(1);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with invalid filter ids", () => {
        variables.filter = { ids: [1345, 4567] };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allDiscounts with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "5f4467b6-3a87-47e5-b7b8-cbd5162cd709",
            "5f4467b6-3a87-47e5-b7b8-cbd5162cd098",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(0);
          }
        );
      });

      it("Get allDiscounts with valid filter ids", async () => {
        const discounts = await Database("discounts");

        variables.filter = { ids: discounts.map((disc) => disc.id) };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allDiscounts with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(0);
          }
        );
      });

      it("Get allDiscounts with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("discounts").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(3);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allDiscounts with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allDiscounts with filter name which does not exist", () => {
        variables.filter = { name: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(0);
          }
        );
      });

      it("Get allDiscounts with valid filter name", async () => {
        const { name } = await Database("discounts").first();

        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allDiscounts },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allDiscounts",
              allDiscounts
            );
            expect(allDiscounts.length).to.be.eq(1);
            expect(Object.keys(allDiscounts[0])).to.eql([
              "id",
              "merchant_id",
              "name",
              "percent",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All Discounts Meta", () => {
      it("Get allDiscountsMeta without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allDiscountsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allDiscountsMeta with valid filter(id) and without pagination", async () => {
        const disc = await Database("discounts").first();

        variables.filter = {
          id: disc.id,
          merchant_id: disc.merchant_id,
          category_id: disc.category_id,
          name: disc.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allDiscountsMeta with valid filter(ids) and without pagination", async () => {
        const discounts = await Database("discounts");

        variables.filter = {
          ids: discounts.map((disc) => disc.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allDiscountsMeta with valid pagination and filter(id)", async () => {
        const disc = await Database("discounts").first();

        variables.filter = {
          id: disc.id,
          merchant_id: disc.merchant_id,
          category_id: disc.category_id,
          name: disc.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allDiscountsMeta with valid pagination and filter(ids)", async () => {
        const discounts = await Database("discounts");

        variables.filter = {
          ids: discounts.map((disc) => disc.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allDiscountsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allDiscountsMeta with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get _allDiscountsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allDiscountsMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allDiscountsMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allDiscountsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allDiscountsMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allDiscountsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allDiscountsMeta with sortOrder which does not exist", () => {
        variables.sortOrder = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allDiscountsMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allDiscountsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allDiscountsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allDiscountsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allDiscountsMeta with valid filter id", async () => {
        const { id } = await Database("discounts").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta).to.have.property("count");
            expect(_allDiscountsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allDiscountsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "sadrftgyfsd"] };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allDiscountsMeta with filter ids which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allDiscountsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allDiscountsMeta with valid filter ids", async () => {
        const discounts = await Database("discounts");

        variables.filter = { ids: discounts.map((disc) => disc.id) };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta).to.have.property("count");
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allDiscountsMeta with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allDiscountsMeta with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allDiscountsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get _allDiscountsMeta with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("discounts").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta).to.have.property("count");
            expect(_allDiscountsMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get _allDiscountsMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get _allDiscountsMeta with filter name which does not exist", () => {
        variables.filter = { name: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allDiscountsMeta).to.have.property("count");
            expect(_allDiscountsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get _allDiscountsMeta with valid filter name", async () => {
        const { name } = await Database("discounts").first();

        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_DISCOUNTS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allDiscountsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allDiscountsMeta",
              _allDiscountsMeta
            );
            expect(_allDiscountsMeta).to.have.property("count");
            expect(_allDiscountsMeta.count).to.be.eq(1);
          }
        );
      });
    });
  });
});

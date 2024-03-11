import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  DESIGN,
  ALL_DESIGNS,
  ALL_DESIGNS_META,
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

const accountGraphQLRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/merchant/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

const defaultMerchant = {
  status: MERCHANT_STATUSES.active.name,
  encrypted_password,
};

describe("Merchant GraphQL", () => {
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

      await Database("designs").insert([
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
      ]);

      ({
        body: { token },
      } = await accountLoginRequest({
        login: "uklon",
        password: "123123",
      }));
    });

    after(async () => {
      await Database("designs").del();
      await Database("merchants").del();
    });
    afterEach(() => (variables = {}));

    context("Design", () => {
      it("Get design without id", () =>
        accountGraphQLRequest(requestBody(DESIGN), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            'type "ID!" was not provided'
          );
        }));

      it("Get design with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(requestBody(DESIGN), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get design with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(requestBody(DESIGN), (res) => {
          const {
            body: {
              data: { Design },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("Design", Design, null);
        });
      });

      it("Get design with valid id", async () => {
        const { id } = await Database("designs").first();

        variables.id = id;

        return accountGraphQLRequest(requestBody(DESIGN), (res) => {
          const {
            body: {
              data: { Design },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("Design", Design);
        });
      });
    });

    context("All categories", () => {
      it("Get allDesigns without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with valid filter(id) and without pagination", async () => {
        const design = await Database("designs").first();

        variables.filter = {
          id: design.id,
          merchant_id: design.merchant_id,
          name: design.name,
        };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(1);
        });
      });

      it("Get allDesigns with valid filter(ids) and without pagination", async () => {
        const categories = await Database("designs");

        variables.filter = {
          ids: categories.map((design) => design.id),
        };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with valid pagination and filter(id)", async () => {
        const design = await Database("designs").first();

        variables.filter = {
          id: design.id,
          merchant_id: design.merchant_id,
          name: design.name,
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(1);
        });
      });

      it("Get allDesigns with valid pagination and filter(ids)", async () => {
        const categories = await Database("designs");

        variables.filter = {
          ids: categories.map((design) => design.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allDesigns with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allDesigns with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allDesigns with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allDesigns with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allDesigns with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with valid sortOrder", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allDesigns with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(0);
        });
      });

      it("Get allDesigns with valid filter id", async () => {
        const { id } = await Database("designs").first();

        variables.filter = { id };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(1);
        });
      });

      it("Get allDesigns with invalid filter ids", () => {
        variables.filter = { ids: [1345, 4567] };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allDesigns with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "5f4467b6-3a87-47e5-b7b8-cbd5162cd709",
            "5f4467b6-3a87-47e5-b7b8-cbd5162cd098",
          ],
        };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(0);
        });
      });

      it("Get allDesigns with valid filter ids", async () => {
        const categories = await Database("designs");

        variables.filter = { ids: categories.map((design) => design.id) };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allDesigns with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(0);
        });
      });

      it("Get allDesigns with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("designs").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(3);
        });
      });

      it("Get allDesigns with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allDesigns with filter name which does not exist", () => {
        variables.filter = { name: "show" };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(0);
        });
      });

      it("Get allDesigns with valid filter name", async () => {
        const { name } = await Database("designs").first();

        variables.filter = { name };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS), (res) => {
          const {
            body: {
              data: { allDesigns },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allDesigns", allDesigns);
          expect(allDesigns.length).to.be.eq(1);
        });
      });
    });

    context("All Designs Meta", () => {
      it("Get allDesignsMeta without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with valid filter(id) and without pagination", async () => {
        const design = await Database("designs").first();

        variables.filter = {
          id: design.id,
          merchant_id: design.merchant_id,
          name: design.name,
        };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(1);
        });
      });

      it("Get allDesignsMeta with valid filter(ids) and without pagination", async () => {
        const categories = await Database("designs");

        variables.filter = {
          ids: categories.map((design) => design.id),
        };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with valid pagination and filter(id)", async () => {
        const design = await Database("designs").first();

        variables.filter = {
          id: design.id,
          merchant_id: design.merchant_id,
          name: design.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(1);
        });
      });

      it("Get allDesignsMeta with valid pagination and filter(ids)", async () => {
        const categories = await Database("designs");

        variables.filter = {
          ids: categories.map((design) => design.id),
        };

        variables.perPage = 20;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allDesignsMeta with valid perPage", () => {
        variables.perPage = 20;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allDesignsMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allDesignsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allDesignsMeta with sortOrder which does not exist", () => {
        variables.sortOrder = "test";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allDesignsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allDesignsMeta.count).to.be.eq(0);
        });
      });

      it("Get allDesignsMeta with valid filter id", async () => {
        const { id } = await Database("designs").first();

        variables.filter = { id };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta).to.have.property("count");
          expect(_allDesignsMeta.count).to.be.eq(1);
        });
      });

      it("Get allDesignsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "sadrftgyfsd"] };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allDesignsMeta with filter ids which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allDesignsMeta.count).to.be.eq(0);
        });
      });

      it("Get allDesignsMeta with valid filter ids", async () => {
        const categories = await Database("designs");

        variables.filter = { ids: categories.map((design) => design.id) };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta).to.have.property("count");
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allDesignsMeta with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allDesignsMeta.count).to.be.eq(0);
        });
      });

      it("Get allDesignsMeta with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("designs").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta).to.have.property("count");
          expect(_allDesignsMeta.count).to.be.eq(3);
        });
      });

      it("Get allDesignsMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allDesignsMeta with filter name which does not exist", () => {
        variables.filter = { name: "test" };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(_allDesignsMeta).to.have.property("count");
          expect(_allDesignsMeta.count).to.be.eq(0);
        });
      });

      it("Get allDesignsMeta with valid filter name", async () => {
        const { name } = await Database("designs").first();

        variables.filter = { name };

        return accountGraphQLRequest(requestBody(ALL_DESIGNS_META), (res) => {
          const {
            body: {
              data: { _allDesignsMeta },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property(
            "_allDesignsMeta",
            _allDesignsMeta
          );
          expect(_allDesignsMeta).to.have.property("count");
          expect(_allDesignsMeta.count).to.be.eq(1);
        });
      });
    });
  });
});

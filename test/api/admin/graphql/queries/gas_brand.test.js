import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  ADMIN_GAS_BRAND as GAS_BRAND,
  ADMIN_ALL_GAS_BRANDS as ALL_GAS_BRANDS,
  ADMIN_ALL_GAS_BRANDS_META as ALL_GAS_BRANDS_META,
} from "@local/test/api/queries.js";
import {
  GAS_BRAND_STATUSES,
  MERCHANT_STATUSES,
} from "@local/constants/index.js";

let variables = {};
let token;
let merchant1;

const testImage2 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAEAAQDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9TLS3ktomSS5lu2MjuJJggYBnLBPlVRhQQo4zhRksckpaAf/Z";

const encrypted_password = await encryptPassword("123123");
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

const defaultMerchant = {
  status: MERCHANT_STATUSES.active.name,
};

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

describe("Admin GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      [merchant1] = await Database("merchants")
        .insert({
          ...defaultMerchant,
          name: "uklon",
          encrypted_password,
          login: "uklon",
        })
        .returning("*");
      const [file] = await Database("files")
        .insert({
          name: "test2",
          account_id: merchant1.id,
          account_type: "merchants",
          mimetype: "image/jpeg",
          size: "1024",
          data: Buffer.from(testImage2, "base64"),
        })
        .returning("*");

      await Database("gas_brands")
        .insert([
          {
            name: "Kotiki",
            logo_file_id: file.id,
            status: GAS_BRAND_STATUSES.active.name,
          },
          {
            name: "Minions",
            logo_file_id: file.id,
            status: GAS_BRAND_STATUSES.active.name,
          },
        ])
        .onConflict("name")
        .merge();

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
      await Database("gas_brands").del();
      await Database("files").del();
      await Database("merchants").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("AdminGasBrand", () => {
      it("Get admin gas brand without id", () =>
        accountGraphQLRequest(
          requestBody(GAS_BRAND),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get admin gas brand with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(GAS_BRAND),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get admin gas brand with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(GAS_BRAND),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("GasBrand", null);
          }
        );
      });

      it("Get admin brand with valid id", async () => {
        const { id } = await Database("gas_brands").first();

        variables.id = id;

        return accountGraphQLRequest(
          requestBody(GAS_BRAND),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { GasBrand },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("GasBrand", GasBrand);
            expect(Object.keys(GasBrand)).to.eql([
              "id",
              "name",
              "logo_file_id",
              "status",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All GasBrands", () => {
      it("Get allGasBrands without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with valid pagination and empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with valid filter(id) and without pagination", async () => {
        const gas_brand = await Database("gas_brands").first();

        variables.filter = {
          id: gas_brand.id,
          name: gas_brand.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(1);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with valid filter(ids) and without pagination", async () => {
        const gas_brands = await Database("gas_brands");

        variables.filter = {
          ids: gas_brands.map((gas_brand) => gas_brand.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with valid filter(id) and pagination", async () => {
        const gas_brand = await Database("gas_brands").first();

        variables.filter = {
          id: gas_brand.id,
          name: gas_brand.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(1);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with valid filter(ids) and pagination", async () => {
        const gas_brands = await Database("gas_brands");

        variables.filter = {
          ids: gas_brands.map((gas_brand) => gas_brand.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allGasBrands with valid perPage", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allGasBrands with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with invalid sortField", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrands with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrands with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrands with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrands with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allGasBrands.length).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrands with valid filter id", async () => {
        const { id } = await Database("gas_brands").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(1);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrands with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allGasBrands.length).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrands with valid filter ids", async () => {
        const brands = await Database("brands");

        variables.filter = { ids: brands.map((brand) => brand.id) };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrands with filter name which does not exist", () => {
        variables.filter = { name: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allGasBrands",
              allGasBrands
            );
            expect(allGasBrands.length).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrands with valid filter name", async () => {
        const { name } = await Database("gas_brands").first();

        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(1);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allGasBrands with invalid filter status", () => {
        variables.filter = { status: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrands with filter status which does not exist", () => {
        variables.filter = { status: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allGasBrands",
              allGasBrands
            );
            expect(allGasBrands.length).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrands with valid filter status", async () => {
        const { status } = await Database("gas_brands").first();

        variables.filter = { status };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allGasBrands },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allGasBrands");
            expect(allGasBrands.length).to.be.eq(2);
            expect(Object.keys(allGasBrands[0])).to.eql([
              "id",
              "name",
              "logo_file_id",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All GasBrands Meta", () => {
      it("Get allGasBrandsMeta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandsMeta with valid filter(id) and without pagination", async () => {
        const gas_brand = await Database("gas_brands").first();

        variables.filter = {
          id: gas_brand.id,
          name: gas_brand.name,
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allGasBrandsMeta with valid filter(ids) and without pagination", async () => {
        const brands = await Database("brands");

        variables.filter = {
          ids: brands.map((brand) => brand.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandsMeta with valid filter(id) and pagination", async () => {
        const gas_brand = await Database("gas_brands").first();

        variables.filter = {
          id: gas_brand.id,
          name: gas_brand.name,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allGasBrandsMeta with valid filter(ids) and pagination", async () => {
        const brands = await Database("brands");

        variables.filter = {
          ids: brands.map((brand) => brand.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allGasBrandsMeta with valid perPage", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allGasBrandsMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandsMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrandsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta).to.have.property("count");
            expect(_allGasBrandsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allGasBrandsMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta).to.have.property("count");
            expect(_allGasBrandsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allGasBrandsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrandsMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allGasBrandsMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allGasBrandsMeta",
              _allGasBrandsMeta
            );
            expect(_allGasBrandsMeta).to.have.property("count");
            expect(_allGasBrandsMeta.count).to.eq(2);
          }
        );
      });

      it("Get allGasBrandsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allGasBrandsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrandsMeta with valid filter id", async () => {
        const { id } = await Database("gas_brands").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allGasBrandsMeta");
            expect(_allGasBrandsMeta).to.have.property("count");
            expect(_allGasBrandsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allGasBrandsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allGasBrandsMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allGasBrandsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrandsMeta with valid filter ids", async () => {
        const gas_brands = await Database("gas_brands");

        variables.filter = { ids: gas_brands.map((gas_brand) => gas_brand.id) };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allGasBrandsMeta");
            expect(_allGasBrandsMeta).to.have.property("count");
            expect(_allGasBrandsMeta.count).to.be.eq(2);
          }
        );
      });

      it("Get allGasBrandsMeta with invalid filter name", () => {
        variables.filter = { name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrandsMeta with filter name which does not exist", () => {
        variables.filter = { name: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allGasBrandsMeta).to.have.property("count");
            expect(_allGasBrandsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrandsMeta with valid pagination and filter name", async () => {
        const { name } = await Database("gas_brands").first();

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allGasBrandsMeta");
            expect(_allGasBrandsMeta.count).to.be.eq(1);
            expect(_allGasBrandsMeta).to.have.property("count");
          }
        );
      });

      it("Get allGasBrandsMeta with invalid filter status", () => {
        variables.filter = { status: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allGasBrandsMeta with filter status which does not exist", () => {
        variables.filter = { status: "test" };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allGasBrandsMeta).to.have.property("count");
            expect(_allGasBrandsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allGasBrandsMeta with valid pagination and filter status", async () => {
        const { status } = await Database("gas_brands").first();

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { status };

        return accountGraphQLRequest(
          requestBody(ALL_GAS_BRANDS_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allGasBrandsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allGasBrandsMeta");
            expect(_allGasBrandsMeta.count).to.be.eq(2);
            expect(_allGasBrandsMeta).to.have.property("count");
          }
        );
      });
    });
  });
});

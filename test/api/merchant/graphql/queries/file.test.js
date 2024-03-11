import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import { Database, Config } from "@local/lib/index.js";
import { encryptPassword } from "@local/helpers/index.js";
import { FILE, ALL_FILES, ALL_FILES_META } from "@local/test/api/queries.js";
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

const testImage1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAQAAAAD+Fb1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnBwYNHjXa9Gr5AAAALUlEQVQI12Ng6GV4x3CMwZmZwZ3hA8MLBhEmBkYGcQY5BlYWhn8Mggy/Gf4CAI7jCAM0uK/FAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA3LTA2VDEzOjMwOjQxKzAwOjAwt1HH6gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wNy0wNlQxMzozMDo0MSswMDowMMYMf1YAAAAASUVORK5CYII=";

const testImage2 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAEAAQDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9TLS3ktomSS5lu2MjuJJggYBnLBPlVRhQQo4zhRksckpaAf/Z";

chai.use(chaiHttp);

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

      await Database("files").insert({
        name: "test1",
        account_id: merchant.id,
        account_type: "merchants",
        size: "1024",
        mimetype: "image/png",
        data: Buffer.from(testImage1, "base64"),
      });

      await Database("files").insert({
        name: "test2",
        account_id: merchant.id,
        account_type: "merchants",
        size: "1024",
        mimetype: "image/jpeg",
        data: Buffer.from(testImage2, "base64"),
      });

      ({
        body: { token },
      } = await accountLoginRequest({
        login: "uklon",
        password: "123123",
      }));
    });

    after(async () => {
      await Database("files").del();
      await Database("merchants").del();
    });
    afterEach(() => (variables = {}));

    context("File", () => {
      it("Get file without id", () =>
        accountGraphQLRequest(requestBody(FILE), `Bearer ${token}`, (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            'type "ID!" was not provided'
          );
        }));

      it("Get file with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(FILE),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get file with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(FILE),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { File },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("File", File, null);
          }
        );
      });

      it("Get file with valid id", async () => {
        const { id } = await Database("files")
          .where({ account_id: merchant.id })
          .first();

        variables.id = id;

        return accountGraphQLRequest(
          requestBody(FILE),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { File },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("File", File);
            expect(Object.keys(File)).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("AllFiles", () => {
      it("Get all files without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.be.eq(2);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files without pagination and with filter(id)", async () => {
        const file = await Database("files").first();

        variables.filter = {
          id: file.id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.eq(1);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files without pagination and with filter(ids)", async () => {
        const files = await Database("files");

        variables.filter = {
          ids: files.map((mt) => mt.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.eq(2);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files with pagination with empty filter", () => {
        variables.perPage = 4;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);

            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
            expect(allFiles.length).to.eq(2);
          }
        );
      });

      it("Get all files with pagination and with filter(id)", async () => {
        const file = await Database("files").first();

        variables.perPage = 4;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        variables.filter = {
          id: file.id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.eq(1);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files with pagination and with filter(ids)", async () => {
        const files = await Database("files");

        variables.perPage = 4;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        variables.filter = {
          ids: files.map((mt) => mt.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.eq(2);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all file with invalid perPage with empty filter", () => {
        variables.perPage = "zsdfgtyhujio";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get all file with valid perPage with empty filter", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.eq(2);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files with invalid page with empty filter", () => {
        variables.page = "zsdfgtyhujio";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get all files with valid page with empty filter", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.eq(2);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files with  invalid sortField with empty filter", () => {
        variables.sortField = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get all files with sortField which does not exist with empty filter", () => {
        variables.sortField = "xcvbhnj";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);

            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get all files with valid sortField with empty filter", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.eq(2);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files with invalid sortOrder with empty filter", () => {
        variables.sortOrder = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get all files with sortOrder which does not exist with empty filter", () => {
        variables.sortOrder = "xcvbhnj";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.be.eq(2);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files with valid sortOrder with empty filter", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.eq(2);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);

            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get all files with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.be.eq(0);
          }
        );
      });

      it("Get all files with valid pagination and filter id", async () => {
        const { id } = await Database("files").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.be.eq(1);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files with invalid filter ids", () => {
        variables.filter = { ids: [1235, "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);

            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get all files with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(allFiles.length).to.be.eq(0);
          }
        );
      });

      it("Get all files with valid filter ids", async () => {
        const files = await Database("files");

        variables.filter = {
          ids: files.map((file) => file.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),

          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles");
            expect(allFiles.length).to.be.eq(2);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files with invalid filter name", () => {
        variables.filter = { name: 1 };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get all files with filter name which does not exist", () => {
        variables.filter = { name: "fghjkl" };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allFiles", allFiles, null);
          }
        );
      });

      it("Get all files with valid pagination and filter name", async () => {
        const { name } = await Database("files").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.be.eq(1);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });

      it("Get all files with invalid filter mimetype", () => {
        variables.filter = { mimetype: 1 };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get all files with filter mimetype which does not exist", () => {
        variables.filter = {
          mimetype: "pdf",
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property("allFiles", allFiles, null);
          }
        );
      });

      it("Get all files with valid pagination and filter mimetype", async () => {
        const { mimetype } = await Database("files").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { mimetype };

        return accountGraphQLRequest(
          requestBody(ALL_FILES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allFiles },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("allFiles", allFiles);
            expect(allFiles.length).to.be.eq(1);
            expect(Object.keys(allFiles[0])).to.eql([
              "id",
              "name",
              "account_id",
              "mimetype",
              "url",
              "created_at",
              "updated_at",
            ]);

            expect(allFiles[0].url).to.be.eq(
              `${Config.assetsUrl}/${allFiles[0].id}`
            );
          }
        );
      });
    });

    context("AllFilesMeta", () => {
      it("Get all files meta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.be.eq(2);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta without pagination and with filter(id)", async () => {
        const file = await Database("files").first();

        variables.filter = {
          id: file.id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.eq(1);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta without pagination and with filter(ids)", async () => {
        const files = await Database("files");

        variables.filter = {
          ids: files.map((mt) => mt.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.eq(2);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with pagination with empty filter", () => {
        variables.perPage = 4;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );

            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
            expect(_allFilesMeta.count).to.eq(2);
          }
        );
      });

      it("Get all files meta with pagination and with filter(id)", async () => {
        const file = await Database("files").first();

        variables.perPage = 4;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        variables.filter = {
          id: file.id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.eq(1);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with pagination and with filter(ids)", async () => {
        const files = await Database("files");

        variables.perPage = 4;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        variables.filter = {
          ids: files.map((mt) => mt.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.eq(2);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all file with invalid perPage with empty filter", () => {
        variables.perPage = "zsdfgtyhujio";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get all file with valid perPage with empty filter", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.eq(2);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with invalid page with empty filter", () => {
        variables.page = "zsdfgtyhujio";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get all files meta with valid page with empty filter", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.eq(2);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with  invalid sortField with empty filter", () => {
        variables.sortField = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get all files meta with sortField which does not exist with empty filter", () => {
        variables.sortField = "xcvbhnj";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.eq(2);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with valid sortField with empty filter", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.eq(2);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with invalid sortOrder with empty filter", () => {
        variables.sortOrder = 5;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get all files meta with sortOrder which does not exist with empty filter", () => {
        variables.sortOrder = "xcvbhnj";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.be.eq(2);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with valid sortOrder with empty filter", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.eq(2);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);

            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get all files meta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get all files meta with valid pagination and filter id", async () => {
        const { id } = await Database("files").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.be.eq(1);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with invalid filter ids", () => {
        variables.filter = { ids: [1235, "fjgdfls"] };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);

            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get all files meta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allFilesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get all files meta with valid filter ids", async () => {
        const files = await Database("files");

        variables.filter = {
          ids: files.map((file) => file.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),

          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allFilesMeta");
            expect(_allFilesMeta.count).to.be.eq(2);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with invalid filter name", () => {
        variables.filter = { name: 1 };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get all files meta with filter name which does not exist", () => {
        variables.filter = { name: "fghjkl" };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta,
              null
            );
          }
        );
      });

      it("Get all files meta with valid pagination and filter name", async () => {
        const { name } = await Database("files").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { name };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.be.eq(1);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });

      it("Get all files meta with invalid filter mimetype", () => {
        variables.filter = { mimetype: 1 };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get all files meta with filter mimetype which does not exist", () => {
        variables.filter = {
          mimetype: "pdf",
        };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta,
              null
            );
          }
        );
      });

      it("Get all files meta with valid pagination and filter mimetype", async () => {
        const { mimetype } = await Database("files").first();

        variables.perPage = 2;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = { mimetype };

        return accountGraphQLRequest(
          requestBody(ALL_FILES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allFilesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allFilesMeta",
              _allFilesMeta
            );
            expect(_allFilesMeta.count).to.be.eq(1);
            expect(Object.keys(_allFilesMeta)).to.eql(["count"]);
          }
        );
      });
    });
  });
});

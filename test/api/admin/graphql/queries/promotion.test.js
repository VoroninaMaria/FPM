import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  PROMOTION,
  ALL_PROMOTIONS,
  ALL_PROMOTIONS_META,
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
      const merchants = await Database("merchants")
        .insert([
          {
            ...defaultMerchant,
            name: "uklon",
            login: "uklon",
          },
          {
            ...defaultMerchant,
            name: "uber",
            login: "uber",
          },
          {
            ...defaultMerchant,
            name: "bolt",
            login: "bolt",
          },
        ])
        .returning("id");

      await Promise.all(
        merchants.map(async (merchant) => {
          const [{ id: file_id }] = await Database("files")
            .insert({
              name: "test2",
              account_id: merchant.id,
              account_type: "merchants",
              mimetype: "image/jpeg",
              data: Buffer.from("file", "base64"),
            })
            .returning("id");

          await Database("promotions")
            .insert([
              {
                title: "title1",
                text: "text1",
                merchant_id: merchant.id,
                file_id: file_id,
                start_date: "2022-10-26",
                end_date: "2022-10-26",
              },
              {
                title: "title2",
                text: "text2",
                merchant_id: merchant.id,
                file_id: file_id,
                start_date: "2022-10-26",
                end_date: "2022-10-26",
              },
            ])
            .returning("id");
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
      await Database("promotions").del();
      await Database("files").del();
      await Database("merchants").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("AdminPromotion", () => {
      it("Get admin promotion without id", () =>
        accountGraphQLRequest(requestBody(PROMOTION), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            'type "ID!" was not provided'
          );
        }));

      it("Get admin promotion with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(requestBody(PROMOTION), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get admin promotion with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(requestBody(PROMOTION), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property("Promotion", null);
        });
      });

      it("Get admin promotion with valid id", async () => {
        const { id } = await Database("promotions").first();

        variables.id = id;

        return accountGraphQLRequest(requestBody(PROMOTION), (res) => {
          const {
            body: {
              data: { Promotion },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("Promotion", Promotion);
        });
      });
    });

    context("All Promotions", () => {
      it("Get allPromotions without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(6);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid pagination and empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(6);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid filter(id) and without pagination", async () => {
        const promotion = await Database("promotions").first();

        variables.filter = {
          id: promotion.id,
        };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(1);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid filter(ids) and without pagination", async () => {
        const promotions = await Database("promotions");

        variables.filter = {
          ids: promotions.map((promotion) => promotion.id),
        };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(6);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid filter(id) and pagination", async () => {
        const promotion = await Database("promotions").first();

        variables.filter = {
          id: promotion.id,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(1);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid filter(ids) and pagination", async () => {
        const promotions = await Database("promotions");

        variables.filter = {
          ids: promotions.map((promotion) => promotion.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(6);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allPromotions with valid perPage", () => {
        variables.perPage = 5;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(5);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "Int cannot represent non-integer value"
          );
        });
      });

      it("Get allPromotions with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(6);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with invalid sortField", () => {
        variables.sortField = 1;
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allPromotions with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPromotions with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(6);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(500);
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        });
      });

      it("Get allPromotions with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(6);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(6);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPromotions with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(allPromotions.length).to.be.eq(0);
        });
      });

      it("Get allPromotions with valid filter id", async () => {
        const { id } = await Database("promotions").first();

        variables.filter = { id };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(1);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });

      it("Get allPromotions with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "fjgdfls"] };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          expect(res).to.have.status(200);
          expect(res.body.errors[0]).to.have.property("message", "Forbidden");
        });
      });

      it("Get allPromotions with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
          ],
        };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(allPromotions.length).to.be.eq(0);
        });
      });

      it("Get allPromotions with valid filter ids", async () => {
        const promotions = await Database("promotions");

        variables.filter = { ids: promotions.map((promotion) => promotion.id) };

        return accountGraphQLRequest(requestBody(ALL_PROMOTIONS), (res) => {
          const {
            body: {
              data: { allPromotions },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("error");
          expect(res.body.data).to.have.property("allPromotions");
          expect(allPromotions.length).to.be.eq(6);
          expect(Object.keys(allPromotions[0])).to.eql([
            "id",
            "title",
            "text",
            "merchant_id",
            "file_id",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
          ]);
        });
      });
    });

    context("All Promotions Meta", () => {
      it("Get allPromotionsMeta without pagination with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(6);
          }
        );
      });

      it("Get allPromotionsMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(6);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter(id) and without pagination", async () => {
        const promotion = await Database("promotions").first();

        variables.filter = {
          id: promotion.id,
        };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter(ids) and without pagination", async () => {
        const promotions = await Database("promotions");

        variables.filter = {
          ids: promotions.map((promotion) => promotion.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(6);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter(id) and pagination", async () => {
        const promotion = await Database("promotions").first();

        variables.filter = {
          id: promotion.id,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter(ids) and pagination", async () => {
        const promotions = await Database("promotions");

        variables.filter = {
          ids: promotions.map((promotion) => promotion.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(6);
          }
        );
      });

      it("Get allPromotionsMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allPromotionsMeta with valid perPage", () => {
        variables.perPage = 4;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(6);
          }
        );
      });

      it("Get allPromotionsMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allPromotionsMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta.count).to.be.eq(6);
          }
        );
      });

      it("Get allPromotionsMeta with invalid sortField", () => {
        variables.sortField = 5;

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allPromotionsMeta with sortField which does not exist", () => {
        variables.sortField = "test";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta).to.have.property("count");
            expect(_allPromotionsMeta.count).to.eq(6);
          }
        );
      });

      it("Get allPromotionsMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta).to.have.property("count");
            expect(_allPromotionsMeta.count).to.eq(6);
          }
        );
      });

      it("Get allPromotionsMeta with invalid sortOrder", () => {
        variables.sortOrder = 5;

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allPromotionsMeta with sortOrder which does not exist !!!", () => {
        variables.sortOrder = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(200);
          }
        );
      });

      it("Get allPromotionsMeta with valid sortOrder", () => {
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allPromotionsMeta",
              _allPromotionsMeta
            );
            expect(_allPromotionsMeta).to.have.property("count");
            expect(_allPromotionsMeta.count).to.eq(6);
          }
        );
      });

      it("Get allPromotionsMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allPromotionsMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allPromotionsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter id", async () => {
        const { id } = await Database("promotions").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allPromotionsMeta");
            expect(_allPromotionsMeta).to.have.property("count");
            expect(_allPromotionsMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allPromotionsMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "hfdalhug"] };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allPromotionsMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(_allPromotionsMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allPromotionsMeta with valid filter ids", async () => {
        const promotions = await Database("promotions");

        variables.filter = { ids: promotions.map((promotion) => promotion.id) };

        return accountGraphQLRequest(
          requestBody(ALL_PROMOTIONS_META),
          (res) => {
            const {
              body: {
                data: { _allPromotionsMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("_allPromotionsMeta");
            expect(_allPromotionsMeta).to.have.property("count");
            expect(_allPromotionsMeta.count).to.be.eq(6);
          }
        );
      });
    });
  });
});

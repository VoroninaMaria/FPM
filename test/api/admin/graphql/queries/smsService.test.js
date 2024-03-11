import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  SMS_SERVICE,
  ALL_SMS_SERVICES,
  ALL_SMS_SERVICES_META,
} from "@local/test/api/queries.js";
import {
  MERCHANT_STATUSES,
  SMS_SERVICE_STATUSES,
} from "@local/constants/index.js";

let variables = {};
let token;

const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });
const encrypted_password = await encryptPassword("123123");

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
            name: "bolt",
            encrypted_password,
            login: "bolt",
          },
        ])
        .onConflict("name")
        .merge();

      const merchants = await Database("merchants").where({
        status: MERCHANT_STATUSES.active.name,
      });

      await Promise.all(
        merchants.map(async (merchant) => {
          await Database("sms_services")
            .insert([
              {
                merchant_id: merchant.id,
                service_name: "flySms",
                status: SMS_SERVICE_STATUSES.active.name,
              },
              {
                merchant_id: merchant.id,
                service_name: "hicellSms",
                status: SMS_SERVICE_STATUSES.active.name,
              },
              {
                merchant_id: merchant.id,
                service_name: "alphaSms",
                status: SMS_SERVICE_STATUSES.active.name,
              },
              {
                merchant_id: merchant.id,
                service_name: "turboSms",
                status: SMS_SERVICE_STATUSES.active.name,
              },
              {
                merchant_id: merchant.id,
                service_name: "smsClub",
                status: SMS_SERVICE_STATUSES.active.name,
              },
            ])
            .onConflict()
            .ignore();
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
      await Database("sms_services").del();
      await Database("merchants").del();
      await Database("admins").del();
    });
    afterEach(() => (variables = {}));

    context("SmsService", () => {
      it("Get smsService without id", () =>
        accountGraphQLRequest(
          requestBody(SMS_SERVICE),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              'type "ID!" was not provided'
            );
          }
        ));

      it("Get smsService with invalid id", () => {
        variables.id = "aaaaa";

        return accountGraphQLRequest(
          requestBody(SMS_SERVICE),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get smsService with id which does not exist", () => {
        variables.id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

        return accountGraphQLRequest(
          requestBody(SMS_SERVICE),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { SmsService },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "SmsService",
              SmsService,
              null
            );
          }
        );
      });

      it("Get smsService with valid id", async () => {
        const { id } = await Database("sms_services").first();

        variables.id = id;

        return accountGraphQLRequest(
          requestBody(SMS_SERVICE),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { SmsService },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property("SmsService", SmsService);
            expect(Object.keys(SmsService)).to.eql([
              "id",
              "balance",
              "merchant_id",
              "status",
              "config",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All smsServices", () => {
      it("Get allSmsServices without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with valid filter(id) and without pagination", async () => {
        const smsService = await Database("sms_services").first();

        variables.filter = {
          id: smsService.id,
          merchant_id: smsService.merchant_id,
          status: smsService.status,
          phone: smsService.phone,
          email: smsService.email,
        };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(1);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with valid filter(ids) and without pagination", async () => {
        const smsServices = await Database("sms_services");

        variables.filter = {
          ids: smsServices.map((smsService) => smsService.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with valid filter(id) and pagination", async () => {
        const smsService = await Database("sms_services").first();

        variables.filter = {
          id: smsService.id,
          merchant_id: smsService.merchant_id,
          status: smsService.status,
          phone: smsService.phone,
          email: smsService.email,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(1);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with valid filter(ids) and pagination", async () => {
        const smsServices = await Database("sms_services");

        variables.filter = {
          ids: smsServices.map((smsService) => smsService.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allSmsServices with valid perPage", () => {
        variables.perPage = 10;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allSmsServices with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allSmsServices with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allSmsServices with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allSmsServices with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with valid sortOrder", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allSmsServices with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(0);
          }
        );
      });

      it("Get allSmsServices with valid filter id", async () => {
        const { id } = await Database("sms_services").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(1);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "sadrftggh"] };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allSmsServices with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(0);
          }
        );
      });

      it("Get allSmsServices with valid filter ids", async () => {
        const smsServices = await Database("sms_services");

        variables.filter = {
          ids: smsServices.map((smsService) => smsService.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allSmsServices with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(0);
          }
        );
      });

      it("Get allSmsServices with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("sms_services").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(5);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with invalid filter status", () => {
        variables.filter = { status: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allSmsServices with filter status which does not exist", () => {
        variables.filter = { status: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(0);
          }
        );
      });

      it("Get allSmsServices with valid filter status", () => {
        variables.filter = { status: SMS_SERVICE_STATUSES.active.name };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(10);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });

      it("Get allSmsServices with invalid filter service_name", () => {
        variables.filter = { service_name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allSmsServices with filter service_name which does not exist", () => {
        variables.filter = { service_name: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(0);
          }
        );
      });

      it("Get allSmsServices with valid filter service_name", async () => {
        const { service_name } = await Database("sms_services").first();

        variables.filter = { service_name };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { allSmsServices },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "allSmsServices",
              allSmsServices
            );
            expect(allSmsServices.length).to.be.eq(2);
            expect(Object.keys(allSmsServices[0])).to.eql([
              "id",
              "merchant_id",
              "status",
              "service_name",
              "created_at",
              "updated_at",
            ]);
          }
        );
      });
    });

    context("All smsServices", () => {
      it("Get allSmsServicesMeta without pagination and with empty filter", () => {
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with valid pagination and with empty filter", () => {
        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with valid filter(id) and without pagination", async () => {
        const smsService = await Database("sms_services").first();

        variables.filter = {
          id: smsService.id,
          merchant_id: smsService.merchant_id,
          status: smsService.status,
          phone: smsService.phone,
          email: smsService.email,
        };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allSmsServicesMeta with valid filter(ids) and without pagination", async () => {
        const smsServices = await Database("sms_services");

        variables.filter = {
          ids: smsServices.map((smsService) => smsService.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with valid filter(id) and pagination", async () => {
        const smsService = await Database("sms_services").first();

        variables.filter = {
          id: smsService.id,
          merchant_id: smsService.merchant_id,
          status: smsService.status,
          phone: smsService.phone,
          email: smsService.email,
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allSmsServicesMeta with valid filter(ids) and pagination", async () => {
        const smsServices = await Database("sms_services");

        variables.filter = {
          ids: smsServices.map((smsService) => smsService.id),
        };

        variables.perPage = 10;
        variables.page = 0;
        variables.sortField = "id";
        variables.sortOrder = "asc";

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with invalid perPage", () => {
        variables.perPage = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allSmsServicesMeta with valid perPage", () => {
        variables.perPage = 10;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with invalid page", () => {
        variables.page = "edrfgh";

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "Int cannot represent non-integer value"
            );
          }
        );
      });

      it("Get allSmsServicesMeta with valid page", () => {
        variables.page = 0;
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with invalid sortField", () => {
        variables.sortField = 1;

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allSmsServicesMeta with sortField which does not exist", () => {
        variables.sortField = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allSmsServicesMeta with valid sortField", () => {
        variables.sortField = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with invalid sortOrder", () => {
        variables.sortOrder = 1;

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allSmsServicesMeta with sortOrder which does not exist", () => {
        variables.sortOrder = "edrfgh";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with valid sortOrder", () => {
        variables.sortOrder = "id";
        variables.filter = {};

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with invalid filter id", () => {
        variables.filter = { id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allSmsServicesMeta with filter id which does not exist", () => {
        variables.filter = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allSmsServicesMeta with valid filter id", async () => {
        const { id } = await Database("sms_services").first();

        variables.filter = { id };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(1);
          }
        );
      });

      it("Get allSmsServicesMeta with invalid filter ids", () => {
        variables.filter = { ids: ["sadrftgyu", "sadrftggh"] };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allSmsServicesMeta with filter ids which does not exist", () => {
        variables.filter = {
          ids: [
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          ],
        };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allSmsServicesMeta with valid filter ids", async () => {
        const smsServices = await Database("sms_services");

        variables.filter = {
          ids: smsServices.map((smsService) => smsService.id),
        };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with invalid filter merchant_id", () => {
        variables.filter = { merchant_id: "sadrftgyu" };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body.errors[0]).to.have.property("message", "Forbidden");
          }
        );
      });

      it("Get allSmsServicesMeta with filter merchant_id which does not exist", () => {
        variables.filter = {
          merchant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allSmsServicesMeta with valid filter merchant_id", async () => {
        const { merchant_id } = await Database("sms_services").first();

        variables.filter = { merchant_id };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(5);
          }
        );
      });

      it("Get allSmsServicesMeta with invalid filter status", () => {
        variables.filter = { status: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allSmsServicesMeta with filter status which does not exist", () => {
        variables.filter = { status: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allSmsServicesMeta with valid filter status", () => {
        variables.filter = { status: SMS_SERVICE_STATUSES.active.name };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(10);
          }
        );
      });

      it("Get allSmsServicesMeta with invalid filter service_name", () => {
        variables.filter = { service_name: 2 };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            expect(res).to.have.status(500);
            expect(res.body.errors[0].message).to.include(
              "String cannot represent a non string value"
            );
          }
        );
      });

      it("Get allSmsServicesMeta with filter service_name which does not exist", () => {
        variables.filter = { service_name: "show" };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(0);
          }
        );
      });

      it("Get allSmsServicesMeta with valid filter service_name", async () => {
        const { service_name } = await Database("sms_services").first();

        variables.filter = { service_name };

        return accountGraphQLRequest(
          requestBody(ALL_SMS_SERVICES_META),
          `Bearer ${token}`,
          (res) => {
            const {
              body: {
                data: { _allSmsServicesMeta },
              },
            } = res;

            expect(res).to.have.status(200);
            expect(res.body).to.have.property("data");
            expect(res.body).not.to.have.property("error");
            expect(res.body.data).to.have.property(
              "_allSmsServicesMeta",
              _allSmsServicesMeta
            );
            expect(_allSmsServicesMeta.count).to.be.eq(2);
          }
        );
      });
    });
  });
});

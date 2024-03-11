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
let current_merchant;
let other_merchant;

const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });
const encrypted_password = await encryptPassword("123123");

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
      [current_merchant] = await Database("merchants")
        .insert({
          ...defaultMerchant,
          name: "uklon",
          encrypted_password,
          login: "uklon",
        })
        .returning("*");

      [other_merchant] = await Database("merchants")
        .insert({
          ...defaultMerchant,
          name: "uber",
          encrypted_password,
          login: "uber",
        })
        .returning("*");

      await Database("sms_services")
        .insert([
          {
            merchant_id: current_merchant.id,
            service_name: "flySms",
            status: SMS_SERVICE_STATUSES.active.name,
          },
          {
            merchant_id: other_merchant.id,
            service_name: "hicellSms",
            status: SMS_SERVICE_STATUSES.active.name,
          },
          {
            merchant_id: current_merchant.id,
            service_name: "alphaSms",
            status: SMS_SERVICE_STATUSES.active.name,
          },
          {
            merchant_id: current_merchant.id,
            service_name: "turboSms",
            status: SMS_SERVICE_STATUSES.active.name,
          },
          {
            merchant_id: other_merchant.id,
            service_name: "smsClub",
            status: SMS_SERVICE_STATUSES.active.name,
          },
        ])
        .onConflict()
        .ignore();

      return accountLoginRequest({
        login: "uklon",
        password: "123123",
      }).then(({ body }) => {
        token = body.token;
      });
    });

    after(async () => {
      await Database("sms_services").del();
      await Database("merchants").del();
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
        const smsService = await Database("sms_services")
          .where({ merchant_id: current_merchant.id, service_name: "alphaSms" })
          .first();

        variables.id = smsService.id;

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
            expect(allSmsServices.length).to.be.eq(3);
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
        variables.perPage = 5;
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
            expect(allSmsServices.length).to.be.eq(3);
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
        const smsService = await Database("sms_services")
          .where({ merchant_id: current_merchant.id })
          .first();

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

      it("Get allSmsServices with valid filter(id) and pagination", async () => {
        const smsService = await Database("sms_services")
          .where({ merchant_id: current_merchant.id })
          .first();

        variables.filter = {
          id: smsService.id,
          merchant_id: smsService.merchant_id,
          status: smsService.status,
          phone: smsService.phone,
          email: smsService.email,
        };

        variables.perPage = 2;
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
        variables.perPage = 2;
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
            expect(allSmsServices.length).to.be.eq(3);
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
            expect(allSmsServices.length).to.be.eq(3);
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
            expect(allSmsServices.length).to.be.eq(3);
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
            expect(allSmsServices.length).to.be.eq(3);
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
        const { id } = await Database("sms_services")
          .where({ merchant_id: current_merchant.id })
          .first();

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
        const { merchant_id } = await Database("sms_services")
          .where({ merchant_id: current_merchant.id })
          .first();

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
            expect(allSmsServices.length).to.be.eq(3);
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
            expect(allSmsServices.length).to.be.eq(3);
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
        const { service_name } = await Database("sms_services")
          .where({ merchant_id: current_merchant.id })
          .first();

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
            expect(_allSmsServicesMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allSmsServicesMeta with valid pagination and with empty filter", () => {
        variables.perPage = 2;
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
            expect(_allSmsServicesMeta.count).to.be.eq(3);
          }
        );
      });

      it("Get allSmsServicesMeta with valid filter(id) and without pagination", async () => {
        const smsService = await Database("sms_services")
          .where({ merchant_id: current_merchant.id })
          .first();

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

      it("Get allSmsServicesMeta with valid filter(id) and pagination", async () => {
        const smsService = await Database("sms_services")
          .where({ merchant_id: current_merchant.id })
          .first();

        variables.filter = {
          id: smsService.id,
          merchant_id: smsService.merchant_id,
          status: smsService.status,
          phone: smsService.phone,
          email: smsService.email,
        };

        variables.perPage = 2;
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
        variables.perPage = 2;
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
            expect(_allSmsServicesMeta.count).to.be.eq(3);
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
            expect(_allSmsServicesMeta.count).to.be.eq(3);
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
            expect(_allSmsServicesMeta.count).to.be.eq(3);
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
            expect(_allSmsServicesMeta.count).to.be.eq(3);
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
            expect(_allSmsServicesMeta.count).to.be.eq(3);
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
        const { id } = await Database("sms_services")
          .where({ merchant_id: current_merchant.id })
          .first();

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
        const { merchant_id } = await Database("sms_services")
          .where({ merchant_id: current_merchant.id })
          .first();

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
            expect(_allSmsServicesMeta.count).to.be.eq(3);
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
            expect(_allSmsServicesMeta.count).to.be.eq(3);
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
        const { service_name } = await Database("sms_services")
          .where({ merchant_id: current_merchant.id })
          .first();

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
            expect(_allSmsServicesMeta.count).to.be.eq(1);
          }
        );
      });
    });
  });
});

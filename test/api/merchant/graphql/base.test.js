import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  MERCHANT_SELF_QUERY,
  INTROSPECTION_QUERY,
} from "@local/test/api/queries.js";

const variables = {};
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
const defaultMerchant = {
  login: "offtop",
  name: "uklon",
};

describe("Merchant GraphQL", () => {
  describe("authentication", () => {
    beforeEach(async () =>
      Database("merchants").insert({
        ...defaultMerchant,
        encrypted_password: await encryptPassword("123123"),
      })
    );

    afterEach(() => Database("merchants").del());

    it("is expected to return status 403 if unauthenticated", () =>
      accountGraphQLRequest(requestBody(MERCHANT_SELF_QUERY), "", (res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.have.property("error", "forbidden");
      }));

    it("is expected to return status 200 if authenticated", () =>
      accountLoginRequest(
        {
          login: "offtop",
          password: "123123",
        },
        ({ body: { token } }) =>
          accountGraphQLRequest(
            requestBody(MERCHANT_SELF_QUERY),
            `Bearer ${token}`,
            (res) => {
              const {
                body: {
                  data: { self },
                },
              } = res;

              expect(res).to.have.status(200);
              expect(res.body).to.have.property("data");
              expect(res.body).not.to.have.property("error");
              expect(res.body.data).to.have.property("self");
              expect(self).to.have.property("name", defaultMerchant.name);
              expect(self).to.have.property("login", defaultMerchant.login);
              expect(self).to.have.property("id");
            }
          )
      ));

    describe("Analyze INTROSPECTION_QUERY", () => {
      let res;

      beforeEach(async () => {
        res = await accountLoginRequest(
          {
            login: "offtop",
            password: "123123",
          },
          ({ body: { token } }) =>
            accountGraphQLRequest(
              requestBody(INTROSPECTION_QUERY),
              `Bearer ${token}`
            )
        );
      });

      it("is expected to be successfull", () => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("error");
        expect(res.body.data).to.have.property("__schema");
        expect(res.body.data.__schema).to.have.property("directives");
        expect(res.body.data.__schema.mutationType).to.have.property(
          "name",
          "Mutation"
        );
        expect(res.body.data.__schema.queryType).to.have.property(
          "name",
          "Query"
        );
      });

      it("is expected to contain only required queries", () => {
        const queryType = res.body.data.__schema.types.find(
          (element) => element.name === "Query"
        );

        const knownQueryNames = queryType.fields
          .map((field) => field.name)
          .sort();

        expect(knownQueryNames).to.have.members([
          "Category",
          "Client",
          "Discount",
          "File",
          "Location",
          "Membership",
          "MembershipLog",
          "Merchant",
          "SmsService",
          "Tag",
          "_allCategoriesMeta",
          "_allClientsMeta",
          "_allDiscountsMeta",
          "_allFilesMeta",
          "_allLocationsMeta",
          "_allMembershipLogsMeta",
          "_allMembershipsMeta",
          "_allMerchantsMeta",
          "_allSmsServicesMeta",
          "_allTagsMeta",
          "allCategories",
          "allClients",
          "allDiscounts",
          "allFiles",
          "allLocations",
          "allMembershipLogs",
          "allMemberships",
          "allMerchants",
          "allSmsServices",
          "allTags",
          "self",
        ]);
      });

      it("is expected to have proper fields for Category", () => {
        // Check CategoryType
        const categoryType = res.body.data.__schema.types.find(
          (element) => element.name === "Category"
        );
        const categoryTypeFieldNames = categoryType.fields
          .map(({ name }) => name)
          .sort();

        expect(categoryTypeFieldNames).to.eql([
          "category_id",
          "created_at",
          "id",
          "merchant_id",
          "name",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for Client", () => {
        // Check ClientType
        const clientType = res.body.data.__schema.types.find(
          (element) => element.name === "Client"
        );
        const clientTypeFieldNames = clientType.fields
          .map(({ name }) => name)
          .sort();

        expect(clientTypeFieldNames).to.eql([
          "category_id",
          "created_at",
          "email",
          "first_name",
          "id",
          "last_name",
          "membership",
          "membership_id",
          "merchant_id",
          "phone",
          "status",
          "tag_ids",
          "unconfirmed_changes",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for File", () => {
        // Check FileType
        const fileType = res.body.data.__schema.types.find(
          (element) => element.name === "File"
        );
        const fileTypeFieldNames = fileType.fields
          .map(({ name }) => name)
          .sort();

        expect(fileTypeFieldNames).to.eql([
          "account_id",
          "created_at",
          "id",
          "mimetype",
          "name",
          "size",
          "updated_at",
          "url",
        ]);
      });

      it("is expected to have proper fields for Merchant", () => {
        // Check MerchantType
        const merchantType = res.body.data.__schema.types.find(
          (element) => element.name === "Merchant"
        );
        const merchantTypeFieldNames = merchantType.fields
          .map(({ name }) => name)
          .sort();

        expect(merchantTypeFieldNames).to.eql([
          "created_at",
          "default_category_id",
          "design_id",
          "id",
          "login",
          "name",
          "sms_fallback",
          "status",
          "storage_capacity",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for smsService", () => {
        // Check SmsServiceType
        const smsServiceType = res.body.data.__schema.types.find(
          (element) => element.name === "SmsService"
        );
        const smsServiceTypeFieldNames = smsServiceType.fields
          .map(({ name }) => name)
          .sort();

        expect(smsServiceTypeFieldNames).to.eql([
          "balance",
          "config",
          "created_at",
          "id",
          "merchant_id",
          "service_name",
          "status",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for Tag", () => {
        // Check TagType
        const tagType = res.body.data.__schema.types.find(
          (element) => element.name === "Tag"
        );
        const tagTypeFieldNames = tagType.fields.map(({ name }) => name).sort();

        expect(tagTypeFieldNames).to.eql([
          "created_at",
          "id",
          "merchant_id",
          "name",
          "updated_at",
        ]);
      });
    });
  });
});

import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { MERCHANT_STATUSES, CLIENT_STATUSES } from "@local/constants/index.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  CLIENT_SELF_QUERY,
  INTROSPECTION_QUERY,
} from "@local/test/api/queries.js";

const variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/client/auth/login").send(payload).then(callback);

const accountGraphQLRequest = (payload, authHeader, callback) =>
  chai
    .request(App)
    .post("/api/client/graphql")
    .set("Authorization", authHeader)
    .send(payload)
    .then(callback);

describe("Client GraphQL", () => {
  describe("authentication", () => {
    before(async () => {
      const [merchant] = await Database("merchants")
        .insert({
          name: "uklon",
          encrypted_password: "123123",
          status: MERCHANT_STATUSES.active.name,
          login: "offtop",
        })
        .returning("id");

      await Database("clients").insert({
        merchant_id: merchant.id,
        phone: "380630000000",
        encrypted_password: await encryptPassword("123123"),
        session_identifier: "session",
        status: CLIENT_STATUSES.confirmed.name,
      });
    });

    after(() => Database("clients").del());
    after(() => Database("merchants").del());
    it("is expected to return status 403 if unauthenticated", () =>
      accountGraphQLRequest(requestBody(CLIENT_SELF_QUERY), "", (res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.have.property("error", "forbidden");
      }));

    describe("Analyze INTROSPECTION_QUERY", () => {
      let res;

      beforeEach(async () => {
        res = await accountLoginRequest(
          {
            merchant: "uklon",
            phone: "380630000000",
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

      it("is expected to contain all required queries", () => {
        const queryType = res.body.data.__schema.types.find(
          (element) => element.name === "Query"
        );

        const knownQueryNames = queryType.fields
          .map((field) => field.name)
          .sort();

        expect(knownQueryNames).to.have.members([
          "Membership",
          "allMembershipLogs",
          "allMemberships",
          "self",
        ]);
      });

      it("is expected to contain all required queries", () => {
        const mutationType = res.body.data.__schema.types.find(
          (element) => element.name === "Mutation"
        );

        const knownMutationNames = mutationType.fields
          .map((field) => field.name)
          .sort();

        expect(knownMutationNames).to.have.members([
          "changeMembershipStatus",
          "createClientChangeRequest",
          "updatePassword",
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
    });
  });
});

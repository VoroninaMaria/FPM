import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { CREATE_CLIENT_CHANGE_REQUEST_MUTATION } from "@local/test/api/mutations.js";
import {
  CLIENT_STATUSES,
  MERCHANT_STATUSES,
  CLIENT_CHANGE_STATUSES,
} from "@local/constants/index.js";

let token;
let variables = {};
const operationName = null;
const requestBody = (query) => ({ query: query, variables, operationName });

chai.use(chaiHttp);
const encrypted_password = await encryptPassword("123123");
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/client/auth/login").send(payload).then(callback);

const accountGraphQLRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/client/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Client GraphQL", () => {
  beforeEach(async () => {
    const [merchant] = await Database("merchants")
      .insert({
        login: "bolt",
        name: "bolt",
        encrypted_password,
        status: MERCHANT_STATUSES.active.name,
      })
      .returning("*");

    await Database("clients").insert({
      merchant_id: merchant.id,
      first_name: "Jane",
      last_name: "Doe",
      phone: "380110000000",
      email: "janedoe@gmail.com",
      encrypted_password,
      session_identifier: "session",
      status: CLIENT_STATUSES.confirmed.name,
    });

    ({
      body: { token: token },
    } = await accountLoginRequest({
      phone: "380110000000",
      password: "123123",
      merchant: "bolt",
    }));
  });

  afterEach(async () => {
    await Database("client_changes").del();
    await Database("clients").del();
    await Database("merchants").del();
    variables = {};
  });
  describe("mutation { createClientChangeRequest }", () => {
    it("Should create client change change with phone as field_name", () => {
      variables.field_name = "phone";
      variables.value = "380630000001";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          const {
            body: {
              data: { createClientChangeRequest },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createClientChangeRequest");
          expect(Object.keys(createClientChangeRequest)).to.eql([
            "id",
            "client_id",
            "field_name",
            "value",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should create client change change with first_name as field_name", () => {
      variables.field_name = "first_name";
      variables.value = "Popo";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          const {
            body: {
              data: { createClientChangeRequest },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createClientChangeRequest");
          expect(Object.keys(createClientChangeRequest)).to.eql([
            "id",
            "client_id",
            "field_name",
            "value",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should create client change change with last_name as field_name", () => {
      variables.field_name = "last_name";
      variables.value = "Popo2";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          const {
            body: {
              data: { createClientChangeRequest },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createClientChangeRequest");
          expect(Object.keys(createClientChangeRequest)).to.eql([
            "id",
            "client_id",
            "field_name",
            "value",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should create client change change with email as field_name", () => {
      variables.field_name = "email";
      variables.value = "Popo@gmail.com";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          const {
            body: {
              data: { createClientChangeRequest },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createClientChangeRequest");
          expect(Object.keys(createClientChangeRequest)).to.eql([
            "id",
            "client_id",
            "field_name",
            "value",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });

    it("Should not create client change change with unknown field_name value", () => {
      variables.field_name = "smth";
      variables.value = "Popo";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "unknown_field_name_value"
          );
        }
      );
    });

    it("Should not create client change when field_name is not provided", () => {
      variables.value = "Popo";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$field_name" of required type "String!" was not provided'
          );
        }
      );
    });

    it("Should not create client change when field_name is null", () => {
      variables.field_name = null;
      variables.value = "Popo";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$field_name" of non-null type "String!" must not be null'
          );
        }
      );
    });

    it("Should not create client change when field_name is in wrong type", () => {
      variables.field_name = true;
      variables.value = "Popo";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        }
      );
    });

    it("Should not create client change when value is not provided", () => {
      variables.field_name = "email";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$value" of required type "String!" was not provided'
          );
        }
      );
    });

    it("Should not create client change when value is null", () => {
      variables.field_name = "email";
      variables.value = null;

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            'Variable "$value" of non-null type "String!" must not be null'
          );
        }
      );
    });

    it("Should not create client change when value is in wrong type", () => {
      variables.field_name = "email";
      variables.value = true;

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include(
            "String cannot represent a non string value"
          );
        }
      );
    });

    it("Should not create client change when value(email) is not valid", () => {
      variables.field_name = "email";
      variables.value = "true";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_value");
        }
      );
    });

    it("Should not create client change when value(phone) is not valid", () => {
      variables.field_name = "phone";
      variables.value = "0630000000";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("invalid_value");
        }
      );
    });

    it("Should not create client change when value(first_name) is the same with client first_name value", () => {
      variables.field_name = "first_name";
      variables.value = "Jane";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("value_already_exist");
        }
      );
    });

    it("Should not create client change when value(last_name) the same with client last_name value", () => {
      variables.field_name = "last_name";
      variables.value = "Doe";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("value_already_exist");
        }
      );
    });

    it("Should not create client change when value(email) is the same with client email value", () => {
      variables.field_name = "email";
      variables.value = "janedoe@gmail.com";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("value_already_exist");
        }
      );
    });

    it("Should not create client change when value(phone) the same with client phone value", () => {
      variables.field_name = "phone";
      variables.value = "380110000000";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("value_already_exist");
        }
      );
    });

    it("Should not create client change which already exists", async () => {
      const client = await Database("clients").first().returning("*");

      await Database("client_changes").insert({
        client_id: client.id,
        field_name: "first_name",
        value: "smbd",
        status: CLIENT_CHANGE_STATUSES.pending.name,
      });

      variables.field_name = "first_name";
      variables.value = "true";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),

        (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("errors");
          expect(res.body.errors[0]).to.have.property("message");
          expect(res.body.errors[0].message).to.include("Forbidden");
        }
      );
    });

    it("Should create client change which already exists but got status confirmed/rejected", async () => {
      const client = await Database("clients").first().returning("*");

      await Database("client_changes").insert({
        client_id: client.id,
        field_name: "first_name",
        value: "smbd",
        status: CLIENT_CHANGE_STATUSES.confirmed.name,
      });

      variables.field_name = "first_name";
      variables.value = "true";

      return accountGraphQLRequest(
        requestBody(CREATE_CLIENT_CHANGE_REQUEST_MUTATION),
        (res) => {
          const {
            body: {
              data: { createClientChangeRequest },
            },
          } = res;

          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body).not.to.have.property("errors");
          expect(res.body.data).to.have.property("createClientChangeRequest");
          expect(Object.keys(createClientChangeRequest)).to.eql([
            "id",
            "client_id",
            "field_name",
            "value",
            "created_at",
            "updated_at",
          ]);
        }
      );
    });
  });
});

import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_UPDATE_CLIENT_MUTATION as UPDATE_CLIENT } from "@local/test/api/mutations.js";
import { CLIENT_STATUSES, MERCHANT_STATUSES } from "@local/constants/index.js";

let token;
let variables = {};
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

const accountGraphQLRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/merchant/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .then(callback);

chai.use(chaiHttp);

describe("Merchant GraphQL", () => {
  beforeEach(async () => {
    const [{ id: current_merchant_id }, { id: other_merchant_id }] =
      await Database("merchants")
        .insert([
          {
            login: "uklon",
            name: "uklon",
            encrypted_password,
            status: MERCHANT_STATUSES.active.name,
          },
          {
            login: "uber",
            name: "uber",
            encrypted_password,
            status: MERCHANT_STATUSES.active.name,
          },
        ])
        .returning("id");

    await Database("client_categories").insert([
      {
        name: "nice guy",
        merchant_id: current_merchant_id,
      },
      {
        name: "nice guy",
        merchant_id: other_merchant_id,
      },
    ]);
    await Database("tags").insert([
      {
        name: "nice guy",
        merchant_id: current_merchant_id,
      },
      {
        name: "nice guy",
        merchant_id: other_merchant_id,
      },
    ]);

    const [{ id: current_client_id }, { id: other_client_id }] = await Database(
      "clients"
    )
      .insert([
        {
          merchant_id: current_merchant_id,
          phone: "380630000000",
          encrypted_password,
          status: CLIENT_STATUSES.confirmed.name,
        },
        {
          merchant_id: other_merchant_id,
          phone: "380630000001",
          encrypted_password,
          status: CLIENT_STATUSES.confirmed.name,
        },
      ])
      .returning("id");

    await Database("client_changes")
      .insert([
        {
          client_id: current_client_id,
          field_name: "first_name",
          value: "Lola",
        },
        {
          client_id: current_client_id,
          field_name: "last_name",
          value: "Poppp1",
        },
        {
          client_id: current_client_id,
          field_name: "phone",
          value: "380630000002",
        },
        {
          client_id: current_client_id,
          field_name: "email",
          value: "lola@gmail.com",
        },
        {
          client_id: other_client_id,
          field_name: "last_name",
          value: "Pop",
        },
        {
          client_id: other_client_id,
          field_name: "first_name",
          value: "Pop674",
        },
        {
          client_id: other_client_id,
          field_name: "phone",
          value: "380630000005",
        },
        {
          client_id: other_client_id,
          field_name: "email",
          value: "popp@gmail.com",
        },
      ])
      .returning("*");

    ({
      body: { token: token },
    } = await accountLoginRequest({
      login: "uklon",
      password: "123123",
    }));
  });

  afterEach(async () => {
    await Database("client_changes").del();
    await Database("client_tags").del();
    await Database("tags").del();
    await Database("clients").del();
    await Database("client_categories").del();
    await Database("merchants").del();
    variables = {};
  });

  describe("mutation { updateClient }", () => {
    it("Should update client with valid id and status provided", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.phone = "380630000005";
      variables.tag_ids = [];
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateClient");
        expect(updateClient).to.have.property("id", id);
        expect(updateClient).to.have.property(
          "status",
          CLIENT_STATUSES.disabled.name
        );
      });
    });

    it("Should update client with valid id, status and non-null category_id provided", async () => {
      const client = await Database("clients").first();

      variables.id = client.id;
      variables.category_id = client.category_id;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateClient");
        expect(updateClient).to.have.property("id", client.id);
        expect(updateClient).to.have.property(
          "status",
          CLIENT_STATUSES.disabled.name
        );
        expect(updateClient).to.have.property(
          "category_id",
          client.category_id
        );
      });
    });

    it("Should update client with valid id, status and list with tag_ids provided", async () => {
      const { id } = await Database("clients").first();
      const { id: tag_id } = await Database("tags").first();

      variables.id = id;
      variables.tag_ids = [tag_id];
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateClient");
        expect(updateClient).to.have.property("id", id);
        expect(updateClient).to.have.property(
          "status",
          CLIENT_STATUSES.disabled.name
        );
        expect(updateClient.tag_ids.length).to.eq(1);
        expect(updateClient.tag_ids[0]).to.eq(tag_id);
      });
    });

    it("Should update client with valid id, status and null category_id provided", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.category_id = null;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");
        expect(res.body.data).to.have.property("updateClient");
        expect(updateClient).to.have.property("id", id);
        expect(updateClient).to.have.property(
          "status",
          CLIENT_STATUSES.disabled.name
        );
        expect(updateClient).to.have.property("category_id", null);
      });
    });

    it("Should return error when no id provided", () => {
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$id" of required type "ID!" was not provided'
        );
      });
    });

    it("Should return error when no status provided", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$status" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when no phone provided", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.tag_ids = [];
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$phone" of required type "String!" was not provided'
        );
      });
    });

    it("Should return error when phone is null", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.tag_ids = [];
      variables.status = CLIENT_STATUSES.disabled.name;

      variables.phone = null;
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body).not.to.have.property("data");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          'Variable "$phone" of non-null type "String!" must not be null.'
        );
      });
    });

    it("Should return error when phone in wrong format", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.tag_ids = [];
      variables.status = CLIENT_STATUSES.disabled.name;

      variables.phone = "aaaaa";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("invalid_phone_format");
      });
    });

    it("Should return error when phone already exist", async () => {
      const client = await Database("clients")
        .where({ phone: "380630000000" })
        .first();

      await Database("clients").insert({
        merchant_id: client.merchant_id,
        phone: "380630000001",
        encrypted_password,
        status: CLIENT_STATUSES.confirmed.name,
      });

      variables.id = client.id;
      variables.tag_ids = [];
      variables.status = CLIENT_STATUSES.disabled.name;

      variables.phone = "380630000001";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("already_exist");
      });
    });

    it("Should return error when id is null", () => {
      variables.id = null;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when status is null", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.status = null;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("must not be null.");
      });
    });

    it("Should return error when id has wrong format", () => {
      variables.id = "aaaa";
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when id is not string", () => {
      variables.id = 1;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when client not found by id", () => {
      variables.id = "11111111-1111-1111-1111-111111111111";
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("client_not_found");
      });
    });

    it("Should return error when status doesn't exist", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.status = "idk";
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("unknown_status");
      });
    });

    it("Should return error when status is not string", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.status = true;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          "String cannot represent a non string value"
        );
      });
    });

    it("Should return error when accessing other merchant's client", async () => {
      const { id } = await Database("clients")
        .where({
          merchant_id: Database("merchants")
            .select("id")
            .where({ name: "uber" }),
        })
        .first();

      variables.id = id;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("client_not_found");
      });
    });

    it("Should return error when category_id has wrong format", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.category_id = "twenty one";
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when category_id is not string", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.category_id = 1;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when category not found by category_id", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.category_id = "11111111-1111-1111-1111-111111111111";
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("category_not_found");
      });
    });

    it("Should return error when accessing other merchant's category", async () => {
      const { id } = await Database("clients").first();
      const { id: category_id } = await Database("client_categories")
        .where({
          merchant_id: Database("merchants")
            .select("id")
            .where({ name: "uber" }),
        })
        .first();

      variables.id = id;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.category_id = category_id;
      variables.tag_ids = [];
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("category_not_found");
      });
    });

    it("Should return error when tag_ids has wrong format", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.tag_ids = "twenty one";
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when tag_ids is not string", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.tag_ids = 1;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when tag not found by tag_ids", async () => {
      const { id } = await Database("clients").first();

      variables.id = id;
      variables.tag_ids = ["11111111-1111-1111-1111-111111111111"];
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should return error when accessing other merchant's tag", async () => {
      const { id } = await Database("clients").first();
      const tags = await Database("tags");

      variables.id = id;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = tags.map((tag) => tag.id);
      variables.phone = "380630000005";
      variables.unconfirmed_changes = [];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("Forbidden");
      });
    });

    it("Should confirm client with valid args first_name", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "first_name",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];

      variables.unconfirmed_changes = [
        {
          id: client_change_id,
          status: "confirmed",
        },
      ];

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");

        expect(res.body.data).to.have.property("updateClient");
        expect(res.body.data).to.have.property("updateClient");
        expect(Object.keys(updateClient).sort()).to.eql([
          "category_id",
          "created_at",
          "email",
          "first_name",
          "id",
          "last_name",
          "merchant_id",
          "phone",
          "status",
          "tag_ids",
          "unconfirmed_changes",
          "updated_at",
        ]);
      });
    });
    it("Should not confirm client with valid args first_name but cofirmed: false", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "first_name",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
        status: "rejected",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");

        expect(res.body.data).to.have.property("updateClient");
        expect(res.body.data).to.have.property("updateClient");
        expect(Object.keys(updateClient).sort()).to.eql([
          "category_id",
          "created_at",
          "email",
          "first_name",
          "id",
          "last_name",
          "merchant_id",
          "phone",
          "status",
          "tag_ids",
          "unconfirmed_changes",
          "updated_at",
        ]);
      });
    });
    it("Should confirm client with valid args last_name", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "last_name",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
        status: "confirmed",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");

        expect(res.body.data).to.have.property("updateClient");
        expect(res.body.data).to.have.property("updateClient");
        expect(Object.keys(updateClient).sort()).to.eql([
          "category_id",
          "created_at",
          "email",
          "first_name",
          "id",
          "last_name",
          "merchant_id",
          "phone",
          "status",
          "tag_ids",
          "unconfirmed_changes",
          "updated_at",
        ]);
      });
    });
    it("Should not confirm client with valid args last_name but cofirmed: false", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "last_name",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
        status: "rejected",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");

        expect(res.body.data).to.have.property("updateClient");
        expect(res.body.data).to.have.property("updateClient");
        expect(Object.keys(updateClient).sort()).to.eql([
          "category_id",
          "created_at",
          "email",
          "first_name",
          "id",
          "last_name",
          "merchant_id",
          "phone",
          "status",
          "tag_ids",
          "unconfirmed_changes",
          "updated_at",
        ]);
      });
    });
    it("Should confirm client with valid args phone", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "phone",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
        status: "confirmed",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");

        expect(res.body.data).to.have.property("updateClient");
        expect(res.body.data).to.have.property("updateClient");
        expect(Object.keys(updateClient).sort()).to.eql([
          "category_id",
          "created_at",
          "email",
          "first_name",
          "id",
          "last_name",
          "merchant_id",
          "phone",
          "status",
          "tag_ids",
          "unconfirmed_changes",
          "updated_at",
        ]);
      });
    });
    it("Should not confirm client with valid args phone but cofirmed: false", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "phone",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
        status: "rejected",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");

        expect(res.body.data).to.have.property("updateClient");
        expect(res.body.data).to.have.property("updateClient");
        expect(Object.keys(updateClient).sort()).to.eql([
          "category_id",
          "created_at",
          "email",
          "first_name",
          "id",
          "last_name",
          "merchant_id",
          "phone",
          "status",
          "tag_ids",
          "unconfirmed_changes",
          "updated_at",
        ]);
      });
    });
    it("Should confirm client with valid args email", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "email",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
        status: "confirmed",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");

        expect(res.body.data).to.have.property("updateClient");
        expect(res.body.data).to.have.property("updateClient");
        expect(Object.keys(updateClient).sort()).to.eql([
          "category_id",
          "created_at",
          "email",
          "first_name",
          "id",
          "last_name",
          "merchant_id",
          "phone",
          "status",
          "tag_ids",
          "unconfirmed_changes",
          "updated_at",
        ]);
      });
    });
    it("Should not confirm client with valid args email but cofirmed: false", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "email",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
        status: "rejected",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        const {
          body: {
            data: { updateClient },
          },
        } = res;

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        expect(res.body).not.to.have.property("errors");

        expect(res.body.data).to.have.property("updateClient");
        expect(res.body.data).to.have.property("updateClient");
        expect(Object.keys(updateClient).sort()).to.eql([
          "category_id",
          "created_at",
          "email",
          "first_name",
          "id",
          "last_name",
          "merchant_id",
          "phone",
          "status",
          "tag_ids",
          "unconfirmed_changes",
          "updated_at",
        ]);
      });
    });
    it("Should return error when no id provided", async () => {
      const client = await Database("clients").first();

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        status: "confirmed",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("id is a required field");
      });
    });
    it("Should return error when id is null", async () => {
      const client = await Database("clients").first();

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: null,
        status: "confirmed",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("id is a required field");
      });
    });
    it("Should return error when id is in wrong type", async () => {
      const client = await Database("clients").first();

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: true,
        status: "confirmed",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include(
          ".id must be a `number` type"
        );
      });
    });
    it("Should return error when no status provided", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "email",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("status is a required");
      });
    });
    it("Should return error when status is null", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "email",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
        status: null,
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("status is a required");
      });
    });
    it("Should return error when status is in wrong type", async () => {
      const client = await Database("clients").first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "email",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
        status: true,
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("unknown_status");
      });
    });

    it("Should return error when merchant try to confirm other merchant's client", async () => {
      const client = await Database("clients")
        .where({ phone: "380630000001" })
        .first();
      const [{ id: client_change_id }] = await Database("client_changes")
        .where({
          client_id: client.id,
          field_name: "email",
        })
        .returning("id");

      variables.id = client.id;
      variables.phone = client.phone;
      variables.status = CLIENT_STATUSES.disabled.name;
      variables.tag_ids = [];
      variables.unconfirmed_changes = {
        id: client_change_id,
        status: "confirmed",
      };

      return accountGraphQLRequest(requestBody(UPDATE_CLIENT), (res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0]).to.have.property("message");
        expect(res.body.errors[0].message).to.include("client_not_found");
      });
    });
  });
});

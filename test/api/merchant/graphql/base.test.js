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
          "Block",
          "Brand",
          "BrandMerchant",
          "Category",
          "Client",
          "DatexTransaction",
          "Design",
          "File",
          "GasBrand",
          "GasBrandMerchant",
          "Merchant",
          "MerchantPaymentGateway",
          "Page",
          "PaymentGateway",
          "Promotion",
          "SmsService",
          "Tag",
          "Trunc",
          "_allBlocksMeta",
          "_allBrandMerchantsMeta",
          "_allBrandsMeta",
          "_allCategoriesMeta",
          "_allClientsMeta",
          "_allDatexTransactionsMeta",
          "_allDesignsMeta",
          "_allFilesMeta",
          "_allGasBrandMerchantsMeta",
          "_allGasBrandsMeta",
          "_allMerchantPaymentGatewaysMeta",
          "_allMerchantsMeta",
          "_allPagesMeta",
          "_allPaymentGatewaysMeta",
          "_allPromotionsMeta",
          "_allSmsServicesMeta",
          "_allTagsMeta",
          "_allTruncsMeta",
          "allBlocks",
          "allBrandMerchants",
          "allBrands",
          "allCategories",
          "allClients",
          "allDatexTransactions",
          "allDesigns",
          "allFiles",
          "allGasBrandMerchants",
          "allGasBrands",
          "allMerchantPaymentGateways",
          "allMerchants",
          "allPages",
          "allPaymentGateways",
          "allPromotions",
          "allSmsServices",
          "allTags",
          "allTruncs",
          "self",
        ]);
      });

      it("is expected to have proper fields for Block", () => {
        // Check BlockType
        const blockType = res.body.data.__schema.types.find(
          (element) => element.name === "Block"
        );
        const blockTypeFieldNames = blockType.fields
          .map(({ name }) => name)
          .sort();

        expect(blockTypeFieldNames).to.eql([
          "blocks",
          "container_styles",
          "created_at",
          "id",
          "name",
          "page_id",
          "position",
          "props",
          "styles",
          "type",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for Brand", () => {
        // Check BrandType
        const brandType = res.body.data.__schema.types.find(
          (element) => element.name === "Brand"
        );
        const brandTypeFieldNames = brandType.fields
          .map(({ name }) => name)
          .sort();

        expect(brandTypeFieldNames).to.eql([
          "created_at",
          "id",
          "name",
          "status",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for BrandMerchant", () => {
        // Check BrandMerchantType
        const brandMerchantType = res.body.data.__schema.types.find(
          (element) => element.name === "BrandMerchant"
        );
        const brandMerchantTypeFieldNames = brandMerchantType.fields
          .map(({ name }) => name)
          .sort();

        expect(brandMerchantTypeFieldNames).to.eql([
          "brand_id",
          "config",
          "created_at",
          "id",
          "merchant_id",
          "status",
          "updated_at",
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
          "address",
          "balance",
          "category_id",
          "city",
          "company_id",
          "created_at",
          "email",
          "entity",
          "external_id",
          "first_name",
          "id",
          "id_clients",
          "last_name",
          "merchant_id",
          "payment_transactions",
          "phone",
          "status",
          "tag_ids",
          "transactions",
          "unconfirmed_changes",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for Design", () => {
        // Check DesignType
        const designType = res.body.data.__schema.types.find(
          (element) => element.name === "Design"
        );
        const designTypeFieldNames = designType.fields
          .map(({ name }) => name)
          .sort();

        expect(designTypeFieldNames).to.eql([
          "authenticated_page_id",
          "created_at",
          "default_page_id",
          "error_page_id",
          "id",
          "loader_page_id",
          "merchant_id",
          "name",
          "styles",
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
          "newbie",
          "plugins",
          "sms_fallback",
          "status",
          "storage_capacity",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for MerchantPaymentGateway", () => {
        // Check MerchantPaymentGatewayType
        const merchantPaymentGatewayType = res.body.data.__schema.types.find(
          (element) => element.name === "MerchantPaymentGateway"
        );
        const merchantPaymentGatewayTypeFieldNames =
          merchantPaymentGatewayType.fields.map(({ name }) => name).sort();

        expect(merchantPaymentGatewayTypeFieldNames).to.eql([
          "config",
          "created_at",
          "default",
          "id",
          "merchant_id",
          "name",
          "payment_gateway_id",
          "status",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for Page", () => {
        // Check PageType
        const pageType = res.body.data.__schema.types.find(
          (element) => element.name === "Page"
        );
        const pageTypeFieldNames = pageType.fields
          .map(({ name }) => name)
          .sort();

        expect(pageTypeFieldNames).to.eql([
          "created_at",
          "design_id",
          "id",
          "name",
          "styles",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for PaymentGateway", () => {
        // Check PaymentGatewayType
        const paymentGatewayType = res.body.data.__schema.types.find(
          (element) => element.name === "PaymentGateway"
        );
        const paymentGatewayTypeFieldNames = paymentGatewayType.fields
          .map(({ name }) => name)
          .sort();

        expect(paymentGatewayTypeFieldNames).to.eql([
          "created_at",
          "id",
          "name",
          "status",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for Promotion", () => {
        // Check PromotionType
        const promotionType = res.body.data.__schema.types.find(
          (element) => element.name === "Promotion"
        );
        const promotionTypeFieldNames = promotionType.fields
          .map(({ name }) => name)
          .sort();

        expect(promotionTypeFieldNames).to.eql([
          "created_at",
          "end_date",
          "file_id",
          "id",
          "merchant_id",
          "start_date",
          "text",
          "title",
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

      it("is expected to have proper fields for DatexTransaction", () => {
        // Check DatexTransactionType
        const transactionType = res.body.data.__schema.types.find(
          (element) => element.name === "DatexTransaction"
        );
        const transactionTypeFieldNames = transactionType.fields
          .map(({ name }) => name)
          .sort();

        expect(transactionTypeFieldNames).to.eql([
          "account_struc",
          "address",
          "amount",
          "amount_b",
          "amount_ok",
          "calc_azs_fn_client",
          "calc_fn_card_owner",
          "calc_n_service_station",
          "card_name",
          "confirm_status",
          "discount_amount_v",
          "discount_sum_v",
          "discount_type",
          "discount_value",
          "fn_card_holder",
          "fn_card_owner",
          "id",
          "id_account",
          "id_vid_trans",
          "is_fuel",
          "is_fulld",
          "lots_amount",
          "n_account",
          "n_accounts_struc",
          "n_code",
          "n_confirmed",
          "n_issuers",
          "n_politics_disconts",
          "n_service_station",
          "n_vid_trans",
          "passed",
          "price",
          "price_client",
          "serial_visible",
          "session_time",
          "ss_fn_clients",
          "sum",
          "sum_azs",
          "sum_b",
          "sum_ok",
          "t_serial",
          "tr_fn_clients",
          "version_id",
        ]);
      });

      it("is expected to have proper fields for GasBrand", () => {
        // Check GasBrandType
        const gasBrandType = res.body.data.__schema.types.find(
          (element) => element.name === "GasBrand"
        );
        const gasBrandTypeFieldNames = gasBrandType.fields
          .map(({ name }) => name)
          .sort();

        expect(gasBrandTypeFieldNames).to.eql([
          "created_at",
          "id",
          "logo_file_id",
          "name",
          "status",
          "updated_at",
        ]);
      });

      it("is expected to have proper fields for GasBrandMerchant", () => {
        // Check GasBrandMerchantType
        const gasBrandMerchantType = res.body.data.__schema.types.find(
          (element) => element.name === "GasBrandMerchant"
        );
        const gasBrandMerchantTypeFieldNames = gasBrandMerchantType.fields
          .map(({ name }) => name)
          .sort();

        expect(gasBrandMerchantTypeFieldNames).to.eql([
          "created_at",
          "fuels",
          "gas_brand_id",
          "id",
          "merchant_id",
          "name",
          "status",
          "updated_at",
        ]);
      });
    });
  });
});

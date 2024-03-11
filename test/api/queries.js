import { gql } from "graphql-request";

const MERCHANT_SELF_QUERY = gql`
  query {
    self {
      name
      id
      login
    }
  }
`;

const COMPANY = gql`
  query ($id: ID!) {
    Company(id: $id) {
      id
      merchant_id
      name
      created_at
      updated_at
    }
  }
`;

const ALL_COMPANIES = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: CompanyFilter
  ) {
    allCompanies(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      id
      merchant_id
      name
      created_at
      updated_at
    }
  }
`;

const ALL_COMPANIES_META = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: CompanyFilter
  ) {
    _allCompaniesMeta(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      count
    }
  }
`;

const MANAGER = gql`
  query ($id: ID!) {
    Manager(id: $id) {
      id
      company_id
      client_id
      created_at
      updated_at
    }
  }
`;

const ALL_MANAGERS = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: ManagerFilter
  ) {
    allManagers(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      id
      company_id
      client_id
      created_at
      updated_at
    }
  }
`;

const ALL_MANAGERS_META = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: ManagerFilter
  ) {
    _allManagersMeta(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      count
    }
  }
`;

const PROMOTION = gql`
  query ($id: ID!) {
    Promotion(id: $id) {
      id
      title
      text
      merchant_id
      file_id
      start_date
      end_date
      created_at
      updated_at
    }
  }
`;

const ALL_PROMOTIONS = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: PromotionFilter
  ) {
    allPromotions(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      id
      title
      text
      merchant_id
      file_id
      start_date
      end_date
      created_at
      updated_at
    }
  }
`;

const ALL_PROMOTIONS_META = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: PromotionFilter
  ) {
    _allPromotionsMeta(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      count
    }
  }
`;

const TRANSACTION = gql`
  query ($id: ID!) {
    Transaction(id: $id) {
      id
      type
      amount
      date
      to
      fuel_qty
      saved_money
      fuel_type
      place
      brand
    }
  }
`;

const ALL_TRANSACTIONS = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: TransactionFilter
  ) {
    allTransactions(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      id
      type
      amount
      date
      to
      fuel_qty
      saved_money
      fuel_type
      place
      brand
    }
  }
`;

const ALL_TRANSACTIONS_META = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: TransactionFilter
  ) {
    _allTransactionsMeta(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      count
    }
  }
`;

const DESIGN = gql`
  query ($id: ID!) {
    Design(id: $id) {
      id
      name
      merchant_id
      styles
      default_page_id
      error_page_id
      loader_page_id
      authenticated_page_id
      updated_at
      created_at
    }
  }
`;

const ALL_DESIGNS = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: DesignFilter
  ) {
    allDesigns(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      id
      name
      merchant_id
      styles
      default_page_id
      error_page_id
      loader_page_id
      authenticated_page_id
      updated_at
      created_at
    }
  }
`;

const ALL_DESIGNS_META = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: DesignFilter
  ) {
    _allDesignsMeta(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      count
    }
  }
`;

const PAGE = gql`
  query ($id: ID!) {
    Page(id: $id) {
      id
      design_id
      name
      styles
      updated_at
      created_at
    }
  }
`;

const ALL_PAGES = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: PageFilter
  ) {
    allPages(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      id
      design_id
      name
      styles
      updated_at
      created_at
    }
  }
`;

const ALL_PAGES_META = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: PageFilter
  ) {
    _allPagesMeta(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      count
    }
  }
`;

const BLOCK = gql`
  query ($id: ID!) {
    Block(id: $id) {
      id
      name
      type
      page_id
      props
      blocks
      container_styles
      styles
      position
      updated_at
      created_at
    }
  }
`;

const ALL_BLOCKS = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: BlockFilter
  ) {
    allBlocks(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      id
      name
      type
      page_id
      props
      blocks
      container_styles
      styles
      position
      updated_at
      created_at
    }
  }
`;

const ALL_BLOCKS_META = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: BlockFilter
  ) {
    _allBlocksMeta(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      count
    }
  }
`;

const ADMIN_PAYMENT_GATEWAY = gql`
  query ($id: ID!) {
    PaymentGateway(id: $id) {
      id
      name
      status
      created_at
      updated_at
    }
  }
`;

const ADMIN_ALL_PAYMENT_GATEWAYS = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: PaymentGatewayFilter
  ) {
    allPaymentGateways(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      id
      name
      status
      created_at
      updated_at
    }
  }
`;

const ADMIN_ALL_PAYMENT_GATEWAYS_META = gql`
  query (
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: PaymentGatewayFilter
  ) {
    _allPaymentGatewaysMeta(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      count
    }
  }
`;

const MERCHANT_PAYMENT_GATEWAY = gql`
  query MerchantPaymentGateway($id: ID!) {
    MerchantPaymentGateway(id: $id) {
      id
      name
      merchant_id
      payment_gateway_id
      default
      config
      status
      created_at
      updated_at
    }
  }
`;

const ALL_MERCHANT_PAYMENT_GATEWAYS = gql`
  query allMerchantPaymentGateways(
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: MerchantPaymentGatewayFilter
  ) {
    allMerchantPaymentGateways(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      id
      name
      merchant_id
      payment_gateway_id
      default
      config
      status
      created_at
      updated_at
    }
  }
`;
const ALL_MERCHANT_PAYMENT_GATEWAYS_META = gql`
  query _allMerchantPaymentGatewaysMeta(
    $perPage: Int
    $page: Int
    $sortField: String
    $sortOrder: String
    $filter: MerchantPaymentGatewayFilter
  ) {
    _allMerchantPaymentGatewaysMeta(
      perPage: $perPage
      page: $page
      sortField: $sortField
      sortOrder: $sortOrder
      filter: $filter
    ) {
      count
    }
  }
`;

const MERCHANT =
  "query Merchant($id: ID!) {Merchant (id: $id) {id default_category_id login name status sms_fallback created_at updated_at}}";
const ALL_MERCHANTS =
  "query allMerchants($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: MerchantFilter) \
{allMerchants (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id default_category_id login name status sms_fallback created_at updated_at}}";
const ALL_MERCHANTS_META =
  "query _allMerchantsMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: MerchantFilter) \
{_allMerchantsMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";
const ADMIN_SELF_QUERY = "{self { id login }}";
const ADMIN =
  "query Admin($id: ID!) {Admin (id: $id) {id login created_at updated_at}}";
const ALL_ADMINS =
  "query allAdmins( $perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: AdminFilter) \
{allAdmins ( perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id login created_at updated_at}}";
const ALL_ADMINS_META =
  "query _allAdminsMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: AdminFilter) \
{_allAdminsMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";
const CLIENT_SELF_QUERY = "{self {id phone merchant_id email}}";
const CLIENT =
  "query Client($id: ID!) {Client (id: $id) {id merchant_id category_id tag_ids status phone email unconfirmed_changes created_at updated_at}}";
const ALL_CLIENTS =
  "query allClients($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: ClientFilter) \
{allClients (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id merchant_id category_id tag_ids status phone email unconfirmed_changes created_at updated_at}}";
const ALL_CLIENTS_META =
  "query _allClientsMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: ClientFilter) \
{_allClientsMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

const SMS_SERVICE =
  "query SmsService($id: ID!) {SmsService (id: $id) {id balance merchant_id status config service_name created_at updated_at}}";

const ALL_SMS_SERVICES =
  "query allSmsServices($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: SmsServiceFilter) \
{allSmsServices (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id merchant_id status service_name created_at updated_at}}";

const ALL_SMS_SERVICES_META =
  "query _allSmsServicesMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: SmsServiceFilter) \
{_allSmsServicesMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

const CATEGORY =
  "query Category($id: ID!) {Category (id: $id) {id merchant_id category_id name created_at updated_at}}";
const ALL_CATEGORIES =
  "query allCategories($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: CategoryFilter) \
{allCategories (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id merchant_id category_id name created_at updated_at}}";
const ALL_CATEGORIES_META =
  "query _allCategoriesMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: CategoryFilter) \
{_allCategoriesMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

const TAG =
  "query Tag($id: ID!) {Tag (id: $id) {id merchant_id name created_at updated_at}}";
const ALL_TAGS =
  "query allTags($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: TagFilter) \
{allTags (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id merchant_id name created_at updated_at}}";
const ALL_TAGS_META =
  "query _allTagsMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: TagFilter) \
{_allTagsMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

const ADMIN_BRAND =
  "query Brand($id: ID!) {Brand (id: $id) {id name default_config status created_at updated_at}}";
const ADMIN_ALL_BRANDS =
  "query allBrands($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: BrandFilter) \
{allBrands (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id name created_at updated_at}}";
const ADMIN_ALL_BRANDS_META =
  "query _allBrandsMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: BrandFilter) \
{_allBrandsMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

const ADMIN_GAS_BRAND =
  "query GasBrand($id: ID!) {GasBrand (id: $id) {id name logo_file_id status created_at updated_at}}";
const ADMIN_ALL_GAS_BRANDS =
  "query allGasBrands($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: GasBrandFilter) \
{allGasBrands (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id name logo_file_id created_at updated_at}}";
const ADMIN_ALL_GAS_BRANDS_META =
  "query _allGasBrandsMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: GasBrandFilter) \
{_allGasBrandsMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

const GAS_BRAND_MERCHANT =
  "query GasBrandMerchant($id: ID!) {GasBrandMerchant (id: $id) {id merchant_id gas_brand_id fuels status created_at updated_at}}";
const ALL_GAS_BRAND_MERCHANTS =
  "query allGasBrandMerchants($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: GasBrandMerchantFilter) \
{allGasBrandMerchants (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id merchant_id gas_brand_id fuels status created_at updated_at}}";
const ALL_GAS_BRAND_MERCHANTS_META =
  "query _allGasBrandMerchantsMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: GasBrandMerchantFilter) \
{_allGasBrandMerchantsMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

const MERCHANT_BRAND =
  "query Brand($id: ID!) {Brand (id: $id) {id name status created_at updated_at}}";
const MERCHANT_ALL_BRANDS =
  "query allBrands($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: BrandFilter) \
{allBrands (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id name created_at updated_at}}";
const MERCHANT_ALL_BRANDS_META =
  "query _allBrandsMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: BrandFilter) \
{_allBrandsMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

const BRAND_MERCHANT =
  "query BrandMerchant($id: ID!) {BrandMerchant (id: $id) {id merchant_id brand_id config status created_at updated_at}}";
const ALL_BRAND_MERCHANTS =
  "query allBrandMerchants($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: BrandMerchantFilter) \
{allBrandMerchants (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id merchant_id brand_id created_at updated_at}}";
const ALL_BRAND_MERCHANTS_META =
  "query _allBrandMerchantsMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: BrandMerchantFilter) \
{_allBrandMerchantsMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

const FILE =
  "query File($id: ID!) {File (id: $id) {id name account_id mimetype url created_at updated_at}}";
const ALL_FILES =
  "query allFiles($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: FileFilter) \
{allFiles (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id name account_id mimetype url created_at updated_at}}";
const ALL_FILES_META =
  "query _allFilesMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: FileFilter) \
{_allFilesMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

const INTROSPECTION_QUERY = gql`
  query IntrospectionQuery {
    __schema {
      queryType {
        name
      }
      mutationType {
        name
      }
      subscriptionType {
        name
      }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type {
      ...TypeRef
    }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export {
  ADMIN_SELF_QUERY,
  ADMIN,
  ALL_ADMINS,
  ALL_ADMINS_META,
  CLIENT_SELF_QUERY,
  CLIENT,
  ALL_CLIENTS,
  ALL_CLIENTS_META,
  MERCHANT_SELF_QUERY,
  MERCHANT,
  ALL_MERCHANTS,
  ALL_MERCHANTS_META,
  SMS_SERVICE,
  ALL_SMS_SERVICES,
  ALL_SMS_SERVICES_META,
  CATEGORY,
  ALL_CATEGORIES,
  ALL_CATEGORIES_META,
  TAG,
  ALL_TAGS,
  ALL_TAGS_META,
  ADMIN_BRAND,
  ADMIN_ALL_BRANDS,
  ADMIN_ALL_BRANDS_META,
  MERCHANT_BRAND,
  MERCHANT_ALL_BRANDS,
  MERCHANT_ALL_BRANDS_META,
  BRAND_MERCHANT,
  ALL_BRAND_MERCHANTS,
  ALL_BRAND_MERCHANTS_META,
  FILE,
  ALL_FILES,
  INTROSPECTION_QUERY,
  ALL_FILES_META,
  DESIGN,
  ALL_DESIGNS,
  ALL_DESIGNS_META,
  PAGE,
  ALL_PAGES,
  ALL_PAGES_META,
  BLOCK,
  ALL_BLOCKS,
  ALL_BLOCKS_META,
  PROMOTION,
  ALL_PROMOTIONS,
  ALL_PROMOTIONS_META,
  TRANSACTION,
  ALL_TRANSACTIONS,
  ALL_TRANSACTIONS_META,
  COMPANY,
  ALL_COMPANIES,
  ALL_COMPANIES_META,
  MANAGER,
  ALL_MANAGERS,
  ALL_MANAGERS_META,
  ADMIN_GAS_BRAND,
  ADMIN_ALL_GAS_BRANDS,
  ADMIN_ALL_GAS_BRANDS_META,
  GAS_BRAND_MERCHANT,
  ALL_GAS_BRAND_MERCHANTS,
  ALL_GAS_BRAND_MERCHANTS_META,
  ADMIN_PAYMENT_GATEWAY,
  ADMIN_ALL_PAYMENT_GATEWAYS,
  ADMIN_ALL_PAYMENT_GATEWAYS_META,
  MERCHANT_PAYMENT_GATEWAY,
  ALL_MERCHANT_PAYMENT_GATEWAYS,
  ALL_MERCHANT_PAYMENT_GATEWAYS_META,
};

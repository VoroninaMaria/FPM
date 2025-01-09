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

const DISCOUNT =
  "query Discount($id: ID!) {Discount (id: $id) {id merchant_id name percent created_at updated_at}}";
const ALL_DISCOUNTS =
  "query allDiscounts($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: DiscountFilter) \
{allDiscounts (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {id merchant_id name percent created_at updated_at}}";
const ALL_DISCOUNTS_META =
  "query _allDiscountsMeta($perPage: Int, $page: Int, $sortField: String, $sortOrder: String,  $filter: DiscountFilter) \
{_allDiscountsMeta (perPage: $perPage, page: $page, sortField: $sortField, sortOrder: $sortOrder,  filter: $filter) {count}}";

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
  MERCHANT_SELF_QUERY,
  MERCHANT,
  ALL_MERCHANTS,
  ALL_MERCHANTS_META,
  CATEGORY,
  ALL_CATEGORIES,
  ALL_CATEGORIES_META,
  TAG,
  ALL_TAGS,
  ALL_TAGS_META,
  DISCOUNT,
  ALL_DISCOUNTS,
  ALL_DISCOUNTS_META,
  FILE,
  ALL_FILES,
  INTROSPECTION_QUERY,
  ALL_FILES_META,
};

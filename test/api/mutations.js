import { gql } from "graphql-request";

const ADMIN_CREATE_PROMOTION_MUTATION = gql`
  mutation (
    $title: String!
    $text: String!
    $merchant_id: ID!
    $file_id: ID!
    $start_date: DateTime!
    $end_date: DateTime!
  ) {
    createPromotion(
      title: $title
      text: $text
      merchant_id: $merchant_id
      file_id: $file_id
      start_date: $start_date
      end_date: $end_date
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

const ADMIN_CREATE_COMPANY_MUTATION = gql`
  mutation ($name: String!, $merchant_id: ID!) {
    createCompany(name: $name, merchant_id: $merchant_id) {
      id
      merchant_id
      name
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_MANAGER_MUTATION = gql`
  mutation ($company_id: ID!, $client_id: ID!) {
    createManager(company_id: $company_id, client_id: $client_id) {
      id
      company_id
      client_id
      created_at
      updated_at
    }
  }
`;

const CREATE_CLIENT_CHANGE_REQUEST_MUTATION = gql`
  mutation ($field_name: String!, $value: String!) {
    createClientChangeRequest(field_name: $field_name, value: $value) {
      id
      client_id
      field_name
      value
      created_at
      updated_at
    }
  }
`;

const CLIENT_MARK_PROMOTION_AS_READ_MUTATION = gql`
  mutation ($id: ID!) {
    markPromotionAsRead(id: $id) {
      id
      title
      text
      merchant_id
      file_id
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_PROMOTION_MUTATION = gql`
  mutation (
    $title: String!
    $text: String!
    $file_id: ID!
    $start_date: DateTime!
    $end_date: DateTime!
  ) {
    createPromotion(
      title: $title
      text: $text
      file_id: $file_id
      start_date: $start_date
      end_date: $end_date
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

const UPDATE_PROMOTION_MUTATION = gql`
  mutation (
    $title: String!
    $text: String!
    $id: ID!
    $file_id: ID!
    $start_date: DateTime!
    $end_date: DateTime!
  ) {
    updatePromotion(
      title: $title
      text: $text
      id: $id
      file_id: $file_id
      start_date: $start_date
      end_date: $end_date
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

const DELETE_PROMOTION_MUTATION = gql`
  mutation ($id: ID!) {
    deletePromotion(id: $id) {
      id
      title
      text
      merchant_id
      file_id
      created_at
      updated_at
    }
  }
`;

const MERCHANT_UPDATE_PASSWORD_MUTATION = gql`
  mutation ($current_password: String, $new_password: String) {
    updateMerchant(
      current_password: $current_password
      new_password: $new_password
    ) {
      id
      login
      created_at
      updated_at
    }
  }
`;

const ADMIN_UPDATE_MUTATION = gql`
  mutation ($current_password: String!, $new_password: String!) {
    updateAdmin(
      current_password: $current_password
      new_password: $new_password
    ) {
      id
      login
      created_at
      updated_at
    }
  }
`;

const MERCHANT_UPDATE_CLIENT_MUTATION = gql`
  mutation (
    $id: ID!
    $status: String!
    $category_id: ID
    $tag_ids: [ID]
    $phone: String!
    $email: String
    $first_name: String
    $last_name: String
    $unconfirmed_changes: [JSONObject]
  ) {
    updateClient(
      id: $id
      status: $status
      category_id: $category_id
      tag_ids: $tag_ids
      phone: $phone
      email: $email
      first_name: $first_name
      last_name: $last_name
      unconfirmed_changes: $unconfirmed_changes
    ) {
      id
      merchant_id
      first_name
      last_name
      status
      phone
      email
      category_id
      tag_ids
      unconfirmed_changes
      created_at
      updated_at
    }
  }
`;

const ADMIN_UPDATE_CLIENT_MUTATION = gql`
  mutation (
    $id: ID!
    $status: String!
    $phone: String!
    $category_id: ID
    $tag_ids: [ID]
    $unconfirmed_changes: [JSONObject]
  ) {
    updateClient(
      id: $id
      phone: $phone
      status: $status
      category_id: $category_id
      tag_ids: $tag_ids
      unconfirmed_changes: $unconfirmed_changes
    ) {
      id
      merchant_id
      first_name
      last_name
      status
      phone
      email
      category_id
      tag_ids
      unconfirmed_changes
      created_at
      updated_at
    }
  }
`;

const ADMIN_UPDATE_MERCHANT_MUTATION = gql`
  mutation (
    $id: ID!
    $status: String!
    $storage_capacity: Int!
    $plugins: JSONObject!
  ) {
    updateMerchant(
      id: $id
      status: $status
      storage_capacity: $storage_capacity
      plugins: $plugins
    ) {
      id
      login
      name
      status
      sms_fallback
      storage_capacity
      plugins
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_SMS_SERVICE_MUTATION = gql`
  mutation ($service_name: String!, $config: JSONObject!, $status: String!) {
    createSmsService(
      service_name: $service_name
      config: $config
      status: $status
    ) {
      id
      merchant_id
      config
      status
      service_name
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_CLIENT_MUTATION = gql`
  mutation (
    $first_name: String!
    $last_name: String!
    $email: String
    $phone: String!
    $password: String!
    $category_id: ID
    $tag_ids: [ID]
    $entity: Int!
  ) {
    createClient(
      first_name: $first_name
      last_name: $last_name
      email: $email
      phone: $phone
      password: $password
      category_id: $category_id
      tag_ids: $tag_ids
      entity: $entity
    ) {
      id
      merchant_id
      status
      phone
      email
      first_name
      last_name
      category_id
      tag_ids
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_CLIENT_MUTATION = gql`
  mutation (
    $merchant_id: ID!
    $first_name: String
    $last_name: String
    $email: String
    $phone: String!
    $password: String!
    $category_id: ID
    $tag_ids: [ID]
  ) {
    createClient(
      merchant_id: $merchant_id
      first_name: $first_name
      last_name: $last_name
      email: $email
      phone: $phone
      password: $password
      category_id: $category_id
      tag_ids: $tag_ids
    ) {
      id
      merchant_id
      status
      phone
      email
      first_name
      last_name
      category_id
      tag_ids
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_SMS_SERVICE_MUTATION = gql`
  mutation (
    $service_name: String!
    $config: JSONObject!
    $merchant_id: ID
    $status: String!
  ) {
    createSmsService(
      service_name: $service_name
      config: $config
      merchant_id: $merchant_id
      status: $status
    ) {
      id
      merchant_id
      config
      status
      service_name
      created_at
      updated_at
    }
  }
`;

const MERCHANT_UPDATE_SMS_SERVICE_MUTATION = gql`
  mutation ($id: ID!, $status: String!) {
    updateSmsService(id: $id, status: $status) {
      id
      merchant_id
      config
      status
      service_name
      created_at
      updated_at
    }
  }
`;

const ADMIN_UPDATE_SMS_SERVICE_MUTATION = gql`
  mutation ($id: ID!, $status: String!) {
    updateSmsService(id: $id, status: $status) {
      id
      merchant_id
      config
      status
      service_name
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_CATEGORY_MUTATION = gql`
  mutation ($name: String!) {
    createCategory(name: $name) {
      id
      merchant_id
      category_id
      name
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_TAG_MUTATION = gql`
  mutation ($name: String!) {
    createTag(name: $name) {
      id
      merchant_id
      name
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_CATEGORY_MUTATION = gql`
  mutation ($name: String!, $merchant_id: ID!) {
    createCategory(name: $name, merchant_id: $merchant_id) {
      id
      merchant_id
      category_id
      name
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_DESIGN_MUTATION = gql`
  mutation ($name: String!, $styles: JSONObject!) {
    createDesign(name: $name, styles: $styles) {
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

const ADMIN_CREATE_DESIGN_MUTATION = gql`
  mutation ($name: String!, $merchant_id: ID!, $styles: JSONObject!) {
    createDesign(name: $name, merchant_id: $merchant_id, styles: $styles) {
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

const UPDATE_DESIGN_MUTATION = gql`
  mutation (
    $id: ID!
    $name: String!
    $styles: JSONObject!
    $default_page_id: ID
    $authenticated_page_id: ID
    $loader_page_id: ID
    $error_page_id: ID
  ) {
    updateDesign(
      id: $id
      name: $name
      styles: $styles
      default_page_id: $default_page_id
      authenticated_page_id: $authenticated_page_id
      loader_page_id: $loader_page_id
      error_page_id: $error_page_id
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

const DELETE_DESIGN_MUTATION = gql`
  mutation ($id: ID!) {
    deleteDesign(id: $id) {
      id
    }
  }
`;

const CREATE_PAGE_MUTATION = gql`
  mutation ($name: String!, $design_id: ID!, $styles: JSONObject!) {
    createPage(name: $name, design_id: $design_id, styles: $styles) {
      id
      design_id
      name
      styles
      updated_at
      created_at
    }
  }
`;

const UPDATE_PAGE_MUTATION = gql`
  mutation ($id: ID!, $design_id: ID!, $name: String!, $styles: JSONObject!) {
    updatePage(id: $id, design_id: $design_id, name: $name, styles: $styles) {
      id
      design_id
      name
      styles
      updated_at
      created_at
    }
  }
`;

const DELETE_PAGE_MUTATION = gql`
  mutation ($id: ID!) {
    deletePage(id: $id) {
      id
    }
  }
`;

const CREATE_BLOCK_MUTATION = gql`
  mutation (
    $name: String!
    $type: String!
    $page_id: ID!
    $position: Int!
    $blocks: Int!
    $container_styles: JSONObject
    $styles: JSONObject
    $props: JSONObject
  ) {
    createBlock(
      name: $name
      type: $type
      page_id: $page_id
      position: $position
      blocks: $blocks
      container_styles: $container_styles
      styles: $styles
      props: $props
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

const UPDATE_BLOCK_MUTATION = gql`
  mutation (
    $id: ID!
    $page_id: ID!
    $name: String!
    $type: String!
    $position: Int!
    $blocks: Int!
    $container_styles: JSONObject
    $styles: JSONObject
    $props: JSONObject
  ) {
    updateBlock(
      id: $id
      page_id: $page_id
      name: $name
      type: $type
      position: $position
      blocks: $blocks
      container_styles: $container_styles
      styles: $styles
      props: $props
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

const DELETE_BLOCK_MUTATION = gql`
  mutation ($id: ID!) {
    deleteBlock(id: $id) {
      id
    }
  }
`;

const ADMIN_CREATE_TAG_MUTATION = gql`
  mutation ($name: String!, $merchant_id: ID!) {
    createTag(name: $name, merchant_id: $merchant_id) {
      id
      merchant_id
      name
      created_at
      updated_at
    }
  }
`;

const UPDATE_CATEGORY_MUTATION = gql`
  mutation ($id: ID!, $name: String!) {
    updateCategory(id: $id, name: $name) {
      id
      merchant_id
      category_id
      name
      created_at
      updated_at
    }
  }
`;

const UPDATE_TAG_MUTATION = gql`
  mutation ($id: ID!, $name: String!) {
    updateTag(id: $id, name: $name) {
      id
      merchant_id
      name
      created_at
      updated_at
    }
  }
`;

const DELETE_CATEGORY_MUTATION = gql`
  mutation ($id: ID!) {
    deleteCategory(id: $id) {
      id
      merchant_id
      category_id
      name
      created_at
      updated_at
    }
  }
`;

const DELETE_TAG_MUTATION = gql`
  mutation ($id: ID!) {
    deleteTag(id: $id) {
      id
      merchant_id
      name
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_BRAND_MUTATION = gql`
  mutation ($name: String!, $default_config: JSONObject, $status: String!) {
    createBrand(name: $name, default_config: $default_config, status: $status) {
      id
      name
      default_config
      status
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_GAS_BRAND_MUTATION = gql`
  mutation ($name: String!, $logo_file_id: ID!, $status: String!) {
    createGasBrand(name: $name, logo_file_id: $logo_file_id, status: $status) {
      id
      name
      logo_file_id
      status
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_PAYMENT_GATEWAY_MUTATION = gql`
  mutation ($name: String!, $status: String!) {
    createPaymentGateway(name: $name, status: $status) {
      id
      name
      status
      created_at
      updated_at
    }
  }
`;
const ADMIN_UPDATE_PAYMENT_GATEWAY_MUTATION = gql`
  mutation ($id: ID!, $name: String!, $status: String!) {
    updatePaymentGateway(id: $id, name: $name, status: $status) {
      id
      name
      status
      created_at
      updated_at
    }
  }
`;

const ADMIN_UPDATE_BRAND_MUTATION = gql`
  mutation (
    $id: ID!
    $name: String!
    $default_config: JSONObject
    $status: String!
  ) {
    updateBrand(
      id: $id
      name: $name
      default_config: $default_config
      status: $status
    ) {
      id
      name
      default_config
      status
      created_at
      updated_at
    }
  }
`;

const ADMIN_UPDATE_GAS_BRAND_MUTATION = gql`
  mutation ($id: ID!, $name: String!, $logo_file_id: ID!, $status: String!) {
    updateGasBrand(
      id: $id
      name: $name
      logo_file_id: $logo_file_id
      status: $status
    ) {
      id
      name
      logo_file_id
      status
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_BRAND_MERCHANT_MUTATION = gql`
  mutation (
    $merchant_id: ID!
    $brand_id: ID!
    $config: JSONObject
    $status: String!
  ) {
    createBrandMerchant(
      merchant_id: $merchant_id
      brand_id: $brand_id
      config: $config
      status: $status
    ) {
      id
      merchant_id
      brand_id
      config
      status
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_GAS_BRAND_MERCHANT_MUTATION = gql`
  mutation ($merchant_id: ID!, $gas_brand_id: ID!, $status: String!) {
    createGasBrandMerchant(
      merchant_id: $merchant_id
      gas_brand_id: $gas_brand_id
      status: $status
    ) {
      id
      merchant_id
      gas_brand_id
      fuels
      status
      created_at
      updated_at
    }
  }
`;

const ADMIN_UPDATE_GAS_BRAND_MERCHANT_MUTATION = gql`
  mutation (
    $id: ID!
    $merchant_id: ID!
    $gas_brand_id: ID!
    $fuels: [JSONObject]
    $status: String!
  ) {
    updateGasBrandMerchant(
      id: $id
      merchant_id: $merchant_id
      gas_brand_id: $gas_brand_id
      fuels: $fuels
      status: $status
    ) {
      id
      merchant_id
      gas_brand_id
      fuels
      status
      created_at
      updated_at
    }
  }
`;

const MERCHANT_UPDATE_GAS_BRAND_MERCHANT_MUTATION = gql`
  mutation (
    $id: ID!
    $gas_brand_id: ID!
    $fuels: [JSONObject]
    $status: String!
  ) {
    updateGasBrandMerchant(
      id: $id
      gas_brand_id: $gas_brand_id
      fuels: $fuels
      status: $status
    ) {
      id
      merchant_id
      gas_brand_id
      fuels
      status
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_GAS_BRAND_MERCHANT_MUTATION = gql`
  mutation ($gas_brand_id: ID!, $status: String!) {
    createGasBrandMerchant(gas_brand_id: $gas_brand_id, status: $status) {
      id
      merchant_id
      gas_brand_id
      fuels
      status
      created_at
      updated_at
    }
  }
`;

const ADMIN_UPDATE_BRAND_MERCHANT_MUTATION = gql`
  mutation (
    $id: ID!
    $merchant_id: ID!
    $brand_id: ID!
    $config: JSONObject!
    $status: String!
  ) {
    updateBrandMerchant(
      id: $id
      merchant_id: $merchant_id
      brand_id: $brand_id
      config: $config
      status: $status
    ) {
      id
      merchant_id
      brand_id
      config
      status
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_BRAND_MERCHANT_MUTATION = gql`
  mutation ($brand_id: ID!, $config: JSONObject, $status: String!) {
    createBrandMerchant(brand_id: $brand_id, config: $config, status: $status) {
      id
      merchant_id
      brand_id
      config
      status
      created_at
      updated_at
    }
  }
`;

const MERCHANT_UPDATE_BRAND_MERCHANT_MUTATION = gql`
  mutation ($id: ID!, $brand_id: ID!, $config: JSONObject!, $status: String!) {
    updateBrandMerchant(
      id: $id
      brand_id: $brand_id
      config: $config
      status: $status
    ) {
      id
      merchant_id
      brand_id
      config
      status
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_FILE_MUTATION = gql`
  mutation ($name: String!, $data: String!) {
    createFile(name: $name, data: $data) {
      id
      name
      account_id
      mimetype
      url
      size
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_FILE_MUTATION = gql`
  mutation ($merchant_id: ID, $name: String!, $data: String!) {
    createFile(merchant_id: $merchant_id, name: $name, data: $data) {
      id
      name
      account_id
      mimetype
      url
      size
      created_at
      updated_at
    }
  }
`;

const DELETE_FILE_MUTATION = gql`
  mutation ($id: ID!) {
    deleteFile(id: $id) {
      id
      name
      account_id
      mimetype
      size
      url
      created_at
      updated_at
    }
  }
`;

const ADMIN_CREATE_MERCHANT_MUTATION = gql`
  mutation (
    $name: String!
    $login: String!
    $password: String!
    $status: String!
  ) {
    createMerchant(
      name: $name
      login: $login
      password: $password
      status: $status
    ) {
      id
      name
      login
      status
      created_at
      updated_at
    }
  }
`;

const CLIENT_UPDATE_PASSWORD_MUTATION = gql`
  mutation ($old_password: String!, $new_password: String!) {
    updatePassword(old_password: $old_password, new_password: $new_password) {
      id
      merchant_id
      status
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_MERCHANT_PAYMENT_GATEWAY_MUTATION = gql`
  mutation (
    $name: String!
    $payment_gateway_id: ID!
    $status: String!
    $config: JSONObject!
  ) {
    createMerchantPaymentGateway(
      name: $name
      payment_gateway_id: $payment_gateway_id
      status: $status
      config: $config
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

const MERCHANT_UPDATE_MERCHANT_PAYMENT_GATEWAY_MUTATION = gql`
  mutation (
    $id: ID!
    $name: String!
    $config: JSONObject
    $default: Boolean
    $status: String!
  ) {
    updateMerchantPaymentGateway(
      id: $id
      name: $name
      config: $config
      default: $default
      status: $status
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

const ADMIN_CREATE_MERCHANT_PAYMENT_GATEWAY_MUTATION = gql`
  mutation (
    $name: String!
    $merchant_id: ID!
    $payment_gateway_id: ID!
    $status: String!
    $config: JSONObject!
  ) {
    createMerchantPaymentGateway(
      name: $name
      merchant_id: $merchant_id
      payment_gateway_id: $payment_gateway_id
      status: $status
      config: $config
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

const ADMIN_UPDATE_MERCHANT_PAYMENT_GATEWAY_MUTATION = gql`
  mutation (
    $id: ID!
    $name: String!
    $merchant_id: ID!
    $config: JSONObject!
    $default: Boolean
    $status: String!
  ) {
    updateMerchantPaymentGateway(
      id: $id
      name: $name
      merchant_id: $merchant_id
      config: $config
      default: $default
      status: $status
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

export {
  MERCHANT_UPDATE_PASSWORD_MUTATION,
  MERCHANT_UPDATE_CLIENT_MUTATION,
  MERCHANT_CREATE_SMS_SERVICE_MUTATION,
  MERCHANT_UPDATE_SMS_SERVICE_MUTATION,
  ADMIN_UPDATE_MUTATION,
  ADMIN_UPDATE_CLIENT_MUTATION,
  ADMIN_UPDATE_MERCHANT_MUTATION,
  ADMIN_CREATE_SMS_SERVICE_MUTATION,
  ADMIN_UPDATE_SMS_SERVICE_MUTATION,
  MERCHANT_CREATE_CATEGORY_MUTATION,
  ADMIN_CREATE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  MERCHANT_CREATE_TAG_MUTATION,
  ADMIN_CREATE_TAG_MUTATION,
  UPDATE_TAG_MUTATION,
  DELETE_TAG_MUTATION,
  ADMIN_CREATE_BRAND_MUTATION,
  ADMIN_UPDATE_BRAND_MUTATION,
  ADMIN_CREATE_BRAND_MERCHANT_MUTATION,
  ADMIN_UPDATE_BRAND_MERCHANT_MUTATION,
  MERCHANT_CREATE_BRAND_MERCHANT_MUTATION,
  MERCHANT_UPDATE_BRAND_MERCHANT_MUTATION,
  MERCHANT_CREATE_DESIGN_MUTATION,
  ADMIN_CREATE_DESIGN_MUTATION,
  UPDATE_DESIGN_MUTATION,
  DELETE_DESIGN_MUTATION,
  CREATE_PAGE_MUTATION,
  UPDATE_PAGE_MUTATION,
  DELETE_PAGE_MUTATION,
  CREATE_BLOCK_MUTATION,
  UPDATE_BLOCK_MUTATION,
  DELETE_BLOCK_MUTATION,
  MERCHANT_CREATE_FILE_MUTATION,
  ADMIN_CREATE_FILE_MUTATION,
  DELETE_FILE_MUTATION,
  MERCHANT_CREATE_CLIENT_MUTATION,
  ADMIN_CREATE_CLIENT_MUTATION,
  ADMIN_CREATE_PROMOTION_MUTATION,
  MERCHANT_CREATE_PROMOTION_MUTATION,
  UPDATE_PROMOTION_MUTATION,
  DELETE_PROMOTION_MUTATION,
  CLIENT_MARK_PROMOTION_AS_READ_MUTATION,
  ADMIN_CREATE_MERCHANT_MUTATION,
  ADMIN_CREATE_COMPANY_MUTATION,
  ADMIN_CREATE_MANAGER_MUTATION,
  CLIENT_UPDATE_PASSWORD_MUTATION,
  CREATE_CLIENT_CHANGE_REQUEST_MUTATION,
  ADMIN_CREATE_PAYMENT_GATEWAY_MUTATION,
  ADMIN_UPDATE_PAYMENT_GATEWAY_MUTATION,
  ADMIN_CREATE_GAS_BRAND_MUTATION,
  ADMIN_UPDATE_GAS_BRAND_MUTATION,
  ADMIN_CREATE_GAS_BRAND_MERCHANT_MUTATION,
  MERCHANT_CREATE_GAS_BRAND_MERCHANT_MUTATION,
  ADMIN_UPDATE_GAS_BRAND_MERCHANT_MUTATION,
  MERCHANT_UPDATE_GAS_BRAND_MERCHANT_MUTATION,
  MERCHANT_CREATE_MERCHANT_PAYMENT_GATEWAY_MUTATION,
  MERCHANT_UPDATE_MERCHANT_PAYMENT_GATEWAY_MUTATION,
  ADMIN_CREATE_MERCHANT_PAYMENT_GATEWAY_MUTATION,
  ADMIN_UPDATE_MERCHANT_PAYMENT_GATEWAY_MUTATION,
};

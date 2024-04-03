import { gql } from "graphql-request";

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
    $merchant_id: ID!
    $membership_id: ID
    $status: String!
    $phone: String!
    $category_id: ID
    $tag_ids: [ID]
    $unconfirmed_changes: [JSONObject]
  ) {
    updateClient(
      id: $id
      merchant_id: $merchant_id
      membership_id: $membership_id
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
      membership_id
      tag_ids
      unconfirmed_changes
      created_at
      updated_at
    }
  }
`;

const ADMIN_UPDATE_MERCHANT_MUTATION = gql`
  mutation ($id: ID!, $status: String!, $storage_capacity: Int!) {
    updateMerchant(
      id: $id
      status: $status
      storage_capacity: $storage_capacity
    ) {
      id
      login
      name
      status
      sms_fallback
      storage_capacity
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
    $membership_id: ID
    $email: String
    $phone: String!
    $password: String!
    $category_id: ID
    $tag_ids: [ID]
  ) {
    createClient(
      first_name: $first_name
      last_name: $last_name
      membership_id: $membership_id
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

export {
  MERCHANT_UPDATE_PASSWORD_MUTATION,
  ADMIN_UPDATE_MERCHANT_MUTATION,
  MERCHANT_CREATE_SMS_SERVICE_MUTATION,
  MERCHANT_UPDATE_SMS_SERVICE_MUTATION,
  ADMIN_UPDATE_MUTATION,
  ADMIN_UPDATE_CLIENT_MUTATION,
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
  MERCHANT_CREATE_FILE_MUTATION,
  ADMIN_CREATE_FILE_MUTATION,
  DELETE_FILE_MUTATION,
  MERCHANT_CREATE_CLIENT_MUTATION,
  ADMIN_CREATE_CLIENT_MUTATION,
  ADMIN_CREATE_MERCHANT_MUTATION,
  CLIENT_UPDATE_PASSWORD_MUTATION,
  CREATE_CLIENT_CHANGE_REQUEST_MUTATION,
  MERCHANT_UPDATE_CLIENT_MUTATION,
};

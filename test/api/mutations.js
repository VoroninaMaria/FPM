import { gql } from "graphql-request";

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

const ADMIN_CREATE_DISCOUNT_MUTATION = gql`
  mutation ($merchant_id: ID!, $name: String!, $percent: Float!) {
    createDiscount(name: $name, merchant_id: $merchant_id, percent: $percent) {
      id
      name
      merchant_id
      percent
      created_at
      updated_at
    }
  }
`;

const MERCHANT_CREATE_DISCOUNT_MUTATION = gql`
  mutation ($name: String!, $percent: Float!) {
    createDiscount(name: $name, percent: $percent) {
      id
      name
      merchant_id
      percent
      created_at
      updated_at
    }
  }
`;

const ADMIN_UPDATE_DISCOUNT_MUTATION = gql`
  mutation ($id: ID!, $merchant_id: ID!, $name: String!, $percent: Float!) {
    updateDiscount(
      id: $id
      name: $name
      merchant_id: $merchant_id
      percent: $percent
    ) {
      id
      name
      merchant_id
      percent
      created_at
      updated_at
    }
  }
`;

const MERCHANT_UPDATE_DISCOUNT_MUTATION = gql`
  mutation ($id: ID!, $name: String!, $percent: Float!) {
    updateDiscount(id: $id, name: $name, percent: $percent) {
      id
      name
      merchant_id
      percent
      created_at
      updated_at
    }
  }
`;

const DELETE_DISCOUNT_MUTATION = gql`
  mutation ($id: ID!) {
    deleteDiscount(id: $id) {
      id
      name
      merchant_id
      percent
      created_at
      updated_at
    }
  }
`;

export {
  MERCHANT_UPDATE_PASSWORD_MUTATION,
  ADMIN_UPDATE_MERCHANT_MUTATION,
  ADMIN_UPDATE_MUTATION,
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
  ADMIN_CREATE_MERCHANT_MUTATION,
  CLIENT_UPDATE_PASSWORD_MUTATION,
  ADMIN_CREATE_DISCOUNT_MUTATION,
  ADMIN_UPDATE_DISCOUNT_MUTATION,
  MERCHANT_UPDATE_DISCOUNT_MUTATION,
  DELETE_DISCOUNT_MUTATION,
  MERCHANT_CREATE_DISCOUNT_MUTATION,
};

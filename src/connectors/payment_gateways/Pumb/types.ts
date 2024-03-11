import { UUID } from "node:crypto";

type StatusType =
  | "ACTIVE"
  | "EXPIRED"
  | "PENDING"
  | "USED"
  | "DELETED"
  | "FAILED";

export type ClientSourceType = "sirius" | "ekb" | "ph" | "ib" | "external";

type Backurl = {
  success: string;
  error: string;
  cancel: string;
};

type HoldRequestBodyOptions = {
  ttl: number;
  create_short_url: boolean;
  backurl?: Backurl;
};

type ExtraParams = {
  shop_url: string;
};

type ClientType = {
  source: ClientSourceType;
  id: string;
};

type Transaction = {
  transaction_id: string;
  status: StatusType;
  cardholder_name: string;
  rrn: string;
  approval_code: string;
  card_from_hash: string;
  amount: number;
  finalized_at: string;
  payment_system: "Visa" | "Mastercard";
};

export type RequestHeaders = {
  authorization: string;
  "Content-Type": "application/json";
};

export type HoldRequestBody = {
  external_id: string;
  client?: ClientType;
  terminal_id?: string;
  description: string;
  short_description: string;
  merchant_config_id?: UUID;
  config_id?: UUID;
  hold?: boolean;
  title?: string;
  lang?: "UK" | "RU" | "EN";
  amount: number;
  comission?: number;
  options?: HoldRequestBodyOptions;
  params?: ExtraParams;
  identification?: unknown;
};

export type HoldResponseBody = {
  id: UUID;
  url: string;
  short_url?: string;
  signature: string;
};

export type StatusRequestParams = {
  id: UUID;
};

export type StatusResponseBody = {
  frame_id: UUID;
  external_id: string;
  status: StatusType;
  transaction: Transaction;

  params: ExtraParams;
};

export type CompleteRequestBody = {
  id: UUID;
  transaction_id: UUID;
  amount: number;
};

export type CompleteResponseBody = {
  link_id: UUID;
  transaction_id: UUID;
  status: StatusType;
};

export interface RefundRequestBody {
  comment: string;
  id: UUID;
  transaction_id: UUID;
  amount: number;
}

export type RefundResponseBody = CompleteResponseBody;

export type PumbOptions = {
  baseUrl: string;
  jwt?: string;
  login: string;
  password: string;
  client: string;
  msisdn?: string;
  client_id?: string;
  client_source?: ClientSourceType;
  config_id?: string;
  merchant_config_id?: UUID;
};

export type AuthTokenRequestData = {
  msisdn?: string;
  terminal_id?: string;
  cashier_login?: string;
  client?: ClientType;
};

export type AuthTokenRequest = {
  params: {
    login: string;
    password: string;
    client: string;
  };
  data?: AuthTokenRequestData;
};

export type AuthTokenSuccessResponse = {
  data: {
    data: {
      access_token: string;
      expires_in: number;
      refresh_expires_in: number;
      refresh_token: string;
      token_type: string;
      "not-before-policy": number;
      session_state: string;
      scope: string;
    };
  };
};
export type AuthTokenErrorResponse = {
  error: {
    name: string;
    code: string;
    message: string;
  };
};

export type RefreshTokenRequest = {
  params: {
    refresh_token: string;
    client: "transacter";
  };
};

export type RefreshTokenSuccessResponse = {
  data: {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
  };
};
export type RefreshTokenErrorResponse = AuthTokenErrorResponse;

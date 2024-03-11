import type {
  CompleteRequestBody,
  CompleteResponseBody,
  HoldRequestBody,
  HoldResponseBody,
  PumbOptions,
  RefundRequestBody,
  StatusRequestParams,
  StatusResponseBody,
  ClientSourceType,
  AuthTokenRequestData,
  AuthTokenSuccessResponse,
  RefreshTokenSuccessResponse,
  RequestHeaders,
} from "./types";

class Pumb {
  private readonly baseUrl: string;
  private readonly login: string;
  private readonly password: string;
  private readonly client: string;
  private readonly merchant_config_id: string | undefined;
  private readonly config_id: string | undefined;

  private readonly msisdn: string | undefined;
  private readonly terminal_id: string | undefined;
  private readonly cashier_login: string | undefined;
  private readonly client_id: string | undefined;
  private readonly client_source: ClientSourceType | undefined;

  private accessToken: string | undefined;
  private refreshToken: string | undefined;
  private expiresIn: number | undefined;
  private refreshExpiresIn: number | undefined;
  private updatedAt: number | undefined;

  constructor({
    baseUrl,
    jwt,
    login,
    password,
    client,
    msisdn,
    client_id,
    client_source,
    config_id,
    merchant_config_id,
  }: PumbOptions) {
    this.baseUrl = baseUrl;
    this.accessToken = jwt;
    this.login = login;
    this.password = password;
    this.client = client;
    this.msisdn = msisdn;
    this.client_id = client_id;
    this.client_source = client_source;
    this.merchant_config_id = merchant_config_id;
    this.config_id = config_id;
  }

  private async fetchWrapper(url: string, options: any) {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} url: ${url} response: ${response.statusText} `
      );
    }
    return response.json();
  }

  private buildAuthRequestBodyData(): AuthTokenRequestData | undefined {
    const data: AuthTokenRequestData = {};
    if (this.msisdn) {
      data["msisdn"] = this.msisdn;
    }
    if (this.terminal_id) {
      data["terminal_id"] = this.terminal_id;
    }
    if (this.cashier_login) {
      data["cashier_login"] = this.cashier_login;
    }
    if (this.client_id && this.client_source) {
      data["client"] = {
        id: this.client_id,
        source: this.client_source,
      };
    }
    if (Object.keys(data).length > 0) {
      return data;
    } else {
      return undefined;
    }
  }

  private async authRequest(): Promise<void> {
    const url = `${this.baseUrl}/auth/token`;
    const requestBody = {
      params: {
        login: this.login,
        password: this.password,
        client: this.client,
      },
      data: this.buildAuthRequestBodyData(),
    };
    const responseData = await this.fetchWrapper(url, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });
    this.accessToken = responseData.data.access_token;
    this.expiresIn = responseData.data.expires_in;
    this.refreshExpiresIn = responseData.data.refresh_expires_in;
    this.refreshToken = responseData.data.refresh_token;
    this.updatedAt = Date.now();
  }
  private async forceRefreshToken(): Promise<void> {
    const url = `${this.baseUrl}/auth/token/refresh`;
    const requestBody = {
      params: {
        refresh_token: this.refreshToken,
        client: "transacter",
      },
    };
    const responseData = await this.fetchWrapper(url, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });
    this.accessToken = responseData.access_token;
    this.expiresIn = responseData.expires_in;
    this.refreshExpiresIn = responseData.refresh_expires_in;
    this.refreshToken = responseData.refresh_token;
    this.updatedAt = Date.now();
  }

  private isAccessTokenValid(): boolean | null {
    if (
      !this.accessToken ||
      !this.expiresIn ||
      !this.updatedAt ||
      !this.refreshExpiresIn
    )
      return null;
    const now = Date.now();
    const deltaToken = now - this.updatedAt - 10;
    const expiresIn = this.expiresIn * 1000;
    const refreshExpiresIn = this.refreshExpiresIn * 1000;
    if (deltaToken > refreshExpiresIn) {
      return null;
    }
    return deltaToken < expiresIn;
  }

  private async manageToken(): Promise<void> {
    const isValid = this.isAccessTokenValid();
    if (isValid === null) {
      await this.authRequest();
    } else if (isValid === false) {
      await this.forceRefreshToken();
    }
  }

  private async defaultHeaders(): Promise<RequestHeaders> {
    await this.manageToken();
    if (this.accessToken) {
      return {
        authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      };
    } else {
      throw new Error("Can't find access token");
    }
  }

  async trunc(opts: HoldRequestBody): Promise<HoldResponseBody> {
    const headers = await this.defaultHeaders();
    return this.fetchWrapper(`${this.baseUrl}/frames/links/pga`, {
      method: "POST",
      body: JSON.stringify({
        ...opts,
        merchant_config_id: this.merchant_config_id,
      }),
      headers,
    });
  }

  async status({ id }: StatusRequestParams): Promise<StatusResponseBody> {
    const headers = await this.defaultHeaders();
    return this.fetchWrapper(`${this.baseUrl}/frames/links/pga/${id}`, {
      method: "GET",
      headers,
    });
  }

  async complete({
    id,
    ...opts
  }: CompleteRequestBody): Promise<CompleteResponseBody> {
    const headers = await this.defaultHeaders();
    return this.fetchWrapper(
      `${this.baseUrl}/frames/links/pga/${id}/complete`,
      {
        method: "PUT",
        body: JSON.stringify(opts),
        headers,
      }
    );
  }

  async refund({
    id,
    ...opts
  }: RefundRequestBody): Promise<CompleteResponseBody> {
    const headers = await this.defaultHeaders();

    return this.fetchWrapper(`${this.baseUrl}/frames/links/pga/${id}/refund`, {
      method: "PUT",
      body: JSON.stringify(opts),
      headers: headers,
    });
  }
}

export default Pumb;

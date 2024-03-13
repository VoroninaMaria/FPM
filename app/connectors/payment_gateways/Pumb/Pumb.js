class Pumb {
    baseUrl;
    login;
    password;
    client;
    merchant_config_id;
    config_id;
    msisdn;
    terminal_id;
    cashier_login;
    client_id;
    client_source;
    accessToken;
    refreshToken;
    expiresIn;
    refreshExpiresIn;
    updatedAt;
    constructor({ baseUrl, jwt, login, password, client, msisdn, client_id, client_source, config_id, merchant_config_id, }) {
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
    async fetchWrapper(url, options) {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} url: ${url} response: ${response.statusText} `);
        }
        return response.json();
    }
    buildAuthRequestBodyData() {
        const data = {};
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
        }
        else {
            return undefined;
        }
    }
    async authRequest() {
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
    async forceRefreshToken() {
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
    isAccessTokenValid() {
        if (!this.accessToken ||
            !this.expiresIn ||
            !this.updatedAt ||
            !this.refreshExpiresIn)
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
    async manageToken() {
        const isValid = this.isAccessTokenValid();
        if (isValid === null) {
            await this.authRequest();
        }
        else if (isValid === false) {
            await this.forceRefreshToken();
        }
    }
    async defaultHeaders() {
        await this.manageToken();
        if (this.accessToken) {
            return {
                authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
            };
        }
        else {
            throw new Error("Can't find access token");
        }
    }
    async trunc(opts) {
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
    async status({ id }) {
        const headers = await this.defaultHeaders();
        return this.fetchWrapper(`${this.baseUrl}/frames/links/pga/${id}`, {
            method: "GET",
            headers,
        });
    }
    async complete({ id, ...opts }) {
        const headers = await this.defaultHeaders();
        return this.fetchWrapper(`${this.baseUrl}/frames/links/pga/${id}/complete`, {
            method: "PUT",
            body: JSON.stringify(opts),
            headers,
        });
    }
    async refund({ id, ...opts }) {
        const headers = await this.defaultHeaders();
        return this.fetchWrapper(`${this.baseUrl}/frames/links/pga/${id}/refund`, {
            method: "PUT",
            body: JSON.stringify(opts),
            headers: headers,
        });
    }
}
export default Pumb;

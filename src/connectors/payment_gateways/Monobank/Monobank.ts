import axios, { AxiosResponse } from "axios";
import { PATHS } from "./constants";
import { Config, MonoBankResponse } from "./types";

class Monobank {
  private readonly token: string;
  private readonly baseUrl: string;

  constructor(config: Config) {
    this.token = config.token;
    this.baseUrl = "https://api.monobank.ua/api/merchant/";
  }

  private buildUrl(action: keyof typeof PATHS): string {
    return `${this.baseUrl}${PATHS[action]}`;
  }

  private async skeletonGet(action: keyof typeof PATHS): MonoBankResponse {
    const response: AxiosResponse<{ data: any }> = await axios.get(
      this.buildUrl(action),
      {
        headers: {
          "Content-Type": "application/json",
          "X-Token": this.token,
        },
      }
    );
    return response.data;
  }

  private async skeletonGetWithUrlParam(url: string): MonoBankResponse {
    const response: AxiosResponse<{ data: any }> = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Token": this.token,
      },
    });
    return response.data;
  }

  private async skeletonPost(
    action: keyof typeof PATHS,
    body: any
  ): MonoBankResponse {
    const response: AxiosResponse<{ data: any }> = await axios.post(
      this.buildUrl(action),
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Token": this.token,
        },
      }
    );
    return response.data;
  }

  public async createAccount(amount: number): MonoBankResponse {
    return this.skeletonPost("createAccount", {
      amount: amount,
    });
  }

  public async getStatus(invoiceId: string): MonoBankResponse {
    const url = `${this.baseUrl}invoice/status?invoiceId=${invoiceId}`;
    return this.skeletonGetWithUrlParam(url);
  }

  public async cancelPayment(invoiceId: string): MonoBankResponse {
    return this.skeletonPost("cancelPayment", {
      invoiceId: invoiceId,
    });
  }

  public async accountInValidation(invoiceId: string): MonoBankResponse {
    return this.skeletonPost("accountInValidation", {
      invoiceId: invoiceId,
    });
  }

  public async getSuccessfulPaymentData(invoiceId: string): MonoBankResponse {
    const url = `${this.baseUrl}invoice/payment-info?invoiceId=${invoiceId}`;
    return this.skeletonGetWithUrlParam(url);
  }

  public async pbKeyForVerification(): MonoBankResponse {
    return this.skeletonGet("pbKeyForVerification");
  }

  public async finalizeHoldAmount(
    invoiceId: string,
    amount: number
  ): MonoBankResponse {
    return this.skeletonPost("finalizeHoldAmount", {
      invoiceId: invoiceId,
      amount: amount,
    });
  }

  public async cashQRRegisterInformation(qrId: string): MonoBankResponse {
    const url = `${this.baseUrl}qr/details?qrId=${qrId}`;
    return this.skeletonGetWithUrlParam(url);
  }

  public async deletePaymentAmount(qrId: string): MonoBankResponse {
    return this.skeletonPost("deletePaymentAmount", {
      qrId: qrId,
    });
  }

  public async getQRCashRegistersList(): MonoBankResponse {
    return this.skeletonGet("getQRCashRegistersList");
  }

  public async getMerchantData(): MonoBankResponse {
    return this.skeletonGet("getMerchantData");
  }

  public async statementForPeriod(from: string): MonoBankResponse {
    const url = `${this.baseUrl}statement?from=${from}`;
    return this.skeletonGetWithUrlParam(url);
  }

  public async deleteTokenizedCard(cardToken: string): MonoBankResponse {
    return axios.delete(
      `https://api.monobank.ua/api/merchant/wallet/card?cardToken=${cardToken}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Token": this.token,
        },
      }
    );
  }

  public async getWalletCardsList(walletId: string): MonoBankResponse {
    const url = `${this.baseUrl}wallet?walletId=${walletId}`;
    return this.skeletonGetWithUrlParam(url);
  }

  public async paymentByToken(
    cardToken: string,
    amount: number,
    ccy: string,
    initiationKind: string
  ): MonoBankResponse {
    return this.skeletonPost("paymentByToken", {
      cardToken: cardToken,
      amount: amount,
      ccy: ccy,
      initiationKind: initiationKind,
    });
  }

  public async requisitePayment(
    cardToken: string,
    amount: number,
    initiationKind: string
  ): MonoBankResponse {
    return this.skeletonPost("requisitePayment", {
      cardToken: cardToken,
      amount: amount,
      initiationKind: initiationKind,
    });
  }

  public async getSubmerchantsList(): MonoBankResponse {
    return this.skeletonGet("getSubmerchantsList");
  }

  public async getFiscalChecks(invoiceId: string): MonoBankResponse {
    const url = `${this.baseUrl}invoice/fiscal-checks?invoiceId=${invoiceId}`;
    return this.skeletonGetWithUrlParam(url);
  }
}

export default Monobank;

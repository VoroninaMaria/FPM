import axios, { AxiosResponse } from "axios";
import { PATHS } from "./constants";
import { Config, NovaPayResponse } from "./types";

class NovaPay {
  private readonly apiSign: string;
  private readonly baseUrl: string;

  constructor(config: Config) {
    this.apiSign = config.apiSign;
    this.baseUrl = "https://api-qecom.novapay.ua/v1/";
  }

  private buildUrl(action: keyof typeof PATHS): string {
    return `${this.baseUrl}${PATHS[action]}`;
  }

  private async skeletonPost(
    action: keyof typeof PATHS,
    body: any
  ): NovaPayResponse {
    const response: AxiosResponse<{ data: any }> = await axios.post(
      this.buildUrl(action),
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "x-sign": this.apiSign,
        },
      }
    );
    return response.data;
  }

  public async createSession(
    merchant_id: string,
    client_phone: string
  ): NovaPayResponse {
    return this.skeletonPost(
      "createSession",
      JSON.stringify({
        merchant_id: merchant_id,
        client_phone: client_phone,
      })
    );
  }

  public async addPayment(
    merchant_id: string,
    session_id: string,
    amount: number
  ): NovaPayResponse {
    return this.skeletonPost(
      "addPayment",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
        amount: amount,
      })
    );
  }

  public async addPaymentWithDeliveryParam(
    merchant_id: string,
    session_id: string,
    amount: number,
    delivery: object
  ): NovaPayResponse {
    return this.skeletonPost(
      "addPayment",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
        amount: amount,
        delivery: delivery,
      })
    );
  }

  public async addPaymentWithProductsParam(
    merchant_id: string,
    session_id: string,
    amount: number,
    products: Array<object>
  ): NovaPayResponse {
    return this.skeletonPost(
      "addPayment",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
        amount: amount,
        products: products,
      })
    );
  }

  public async addPaymentWithAllParams(
    merchant_id: string,
    session_id: string,
    amount: number,
    delivery: object,
    products: Array<object>
  ): NovaPayResponse {
    return this.skeletonPost(
      "addPayment",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
        amount: amount,
        delivery: delivery,
        products: products,
      })
    );
  }

  public async voidSession(
    merchant_id: string,
    session_id: string
  ): NovaPayResponse {
    return this.skeletonPost(
      "voidSession",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }

  public async completeHold(
    merchant_id: string,
    session_id: string
  ): NovaPayResponse {
    return this.skeletonPost(
      "completeHold",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }

  public async completeHoldWithOperationsParam(
    merchant_id: string,
    session_id: string,
    operations: Array<object>
  ): NovaPayResponse {
    return this.skeletonPost(
      "completeHold",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
        operations: operations,
      })
    );
  }

  public async expireSession(
    merchant_id: string,
    session_id: string
  ): NovaPayResponse {
    return this.skeletonPost(
      "expireSession",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }

  public async confirmDeliveryHold(
    merchant_id: string,
    session_id: string
  ): NovaPayResponse {
    return this.skeletonPost(
      "confirmDeliveryHold",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }

  public async printExpressWaybill(
    merchant_id: string,
    session_id: string
  ): NovaPayResponse {
    return this.skeletonPost(
      "printExpressWaybill",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }

  public async getStatus(
    merchant_id: string,
    session_id: string
  ): NovaPayResponse {
    return this.skeletonPost(
      "getStatus",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }

  public async deliveryInfo(merchant_id: string): NovaPayResponse {
    return this.skeletonPost(
      "deliveryInfo",
      JSON.stringify({
        merchant_id: merchant_id,
      })
    );
  }

  public async deliveryPrice(
    merchant_id: string,
    recipient_city: string,
    recipient_warehouse: string,
    volume_weight: number,
    weight: number,
    amount: number
  ): NovaPayResponse {
    return this.skeletonPost(
      "deliveryPrice",
      JSON.stringify({
        merchant_id: merchant_id,
        recipient_city: recipient_city,
        recipient_warehouse: recipient_warehouse,
        volume_weight: volume_weight,
        weight: weight,
        amount: amount,
      })
    );
  }
}

export default NovaPay;

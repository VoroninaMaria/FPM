import axios from "axios";
import { PATHS } from "./constants.js";
class NovaPay {
  apiSign;
  baseUrl;
  constructor(config) {
    this.apiSign = config.apiSign;
    this.baseUrl = "https://api-qecom.novapay.ua/v1/";
  }
  buildUrl(action) {
    return `${this.baseUrl}${PATHS[action]}`;
  }
  async skeletonPost(action, body) {
    const response = await axios.post(this.buildUrl(action), body, {
      headers: {
        "Content-Type": "application/json",
        "x-sign": this.apiSign,
      },
    });

    return response.data;
  }
  async createSession(merchant_id, client_phone) {
    return this.skeletonPost(
      "createSession",
      JSON.stringify({
        merchant_id: merchant_id,
        client_phone: client_phone,
      })
    );
  }
  async addPayment(merchant_id, session_id, amount) {
    return this.skeletonPost(
      "addPayment",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
        amount: amount,
      })
    );
  }
  async addPaymentWithDeliveryParam(merchant_id, session_id, amount, delivery) {
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
  async addPaymentWithProductsParam(merchant_id, session_id, amount, products) {
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
  async addPaymentWithAllParams(
    merchant_id,
    session_id,
    amount,
    delivery,
    products
  ) {
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
  async voidSession(merchant_id, session_id) {
    return this.skeletonPost(
      "voidSession",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }
  async completeHold(merchant_id, session_id) {
    return this.skeletonPost(
      "completeHold",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }
  async completeHoldWithOperationsParam(merchant_id, session_id, operations) {
    return this.skeletonPost(
      "completeHold",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
        operations: operations,
      })
    );
  }
  async expireSession(merchant_id, session_id) {
    return this.skeletonPost(
      "expireSession",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }
  async confirmDeliveryHold(merchant_id, session_id) {
    return this.skeletonPost(
      "confirmDeliveryHold",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }
  async printExpressWaybill(merchant_id, session_id) {
    return this.skeletonPost(
      "printExpressWaybill",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }
  async getStatus(merchant_id, session_id) {
    return this.skeletonPost(
      "getStatus",
      JSON.stringify({
        merchant_id: merchant_id,
        session_id: session_id,
      })
    );
  }
  async deliveryInfo(merchant_id) {
    return this.skeletonPost(
      "deliveryInfo",
      JSON.stringify({
        merchant_id: merchant_id,
      })
    );
  }
  async deliveryPrice(
    merchant_id,
    recipient_city,
    recipient_warehouse,
    volume_weight,
    weight,
    amount
  ) {
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

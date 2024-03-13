import axios from "axios";
import { PATHS } from "./constants.js";
class Monobank {
    token;
    baseUrl;
    constructor(config) {
        this.token = config.token;
        this.baseUrl = "https://api.monobank.ua/api/merchant/";
    }
    buildUrl(action) {
        return `${this.baseUrl}${PATHS[action]}`;
    }
    async skeletonGet(action) {
        const response = await axios.get(this.buildUrl(action), {
            headers: {
                "Content-Type": "application/json",
                "X-Token": this.token,
            },
        });
        return response.data;
    }
    async skeletonGetWithUrlParam(url) {
        const response = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "X-Token": this.token,
            },
        });
        return response.data;
    }
    async skeletonPost(action, body) {
        const response = await axios.post(this.buildUrl(action), body, {
            headers: {
                "Content-Type": "application/json",
                "X-Token": this.token,
            },
        });
        return response.data;
    }
    async createAccount(amount) {
        return this.skeletonPost("createAccount", {
            amount: amount,
        });
    }
    async getStatus(invoiceId) {
        const url = `${this.baseUrl}invoice/status?invoiceId=${invoiceId}`;
        return this.skeletonGetWithUrlParam(url);
    }
    async cancelPayment(invoiceId) {
        return this.skeletonPost("cancelPayment", {
            invoiceId: invoiceId,
        });
    }
    async accountInValidation(invoiceId) {
        return this.skeletonPost("accountInValidation", {
            invoiceId: invoiceId,
        });
    }
    async getSuccessfulPaymentData(invoiceId) {
        const url = `${this.baseUrl}invoice/payment-info?invoiceId=${invoiceId}`;
        return this.skeletonGetWithUrlParam(url);
    }
    async pbKeyForVerification() {
        return this.skeletonGet("pbKeyForVerification");
    }
    async finalizeHoldAmount(invoiceId, amount) {
        return this.skeletonPost("finalizeHoldAmount", {
            invoiceId: invoiceId,
            amount: amount,
        });
    }
    async cashQRRegisterInformation(qrId) {
        const url = `${this.baseUrl}qr/details?qrId=${qrId}`;
        return this.skeletonGetWithUrlParam(url);
    }
    async deletePaymentAmount(qrId) {
        return this.skeletonPost("deletePaymentAmount", {
            qrId: qrId,
        });
    }
    async getQRCashRegistersList() {
        return this.skeletonGet("getQRCashRegistersList");
    }
    async getMerchantData() {
        return this.skeletonGet("getMerchantData");
    }
    async statementForPeriod(from) {
        const url = `${this.baseUrl}statement?from=${from}`;
        return this.skeletonGetWithUrlParam(url);
    }
    async deleteTokenizedCard(cardToken) {
        return axios.delete(`https://api.monobank.ua/api/merchant/wallet/card?cardToken=${cardToken}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Token": this.token,
            },
        });
    }
    async getWalletCardsList(walletId) {
        const url = `${this.baseUrl}wallet?walletId=${walletId}`;
        return this.skeletonGetWithUrlParam(url);
    }
    async paymentByToken(cardToken, amount, ccy, initiationKind) {
        return this.skeletonPost("paymentByToken", {
            cardToken: cardToken,
            amount: amount,
            ccy: ccy,
            initiationKind: initiationKind,
        });
    }
    async requisitePayment(cardToken, amount, initiationKind) {
        return this.skeletonPost("requisitePayment", {
            cardToken: cardToken,
            amount: amount,
            initiationKind: initiationKind,
        });
    }
    async getSubmerchantsList() {
        return this.skeletonGet("getSubmerchantsList");
    }
    async getFiscalChecks(invoiceId) {
        const url = `${this.baseUrl}invoice/fiscal-checks?invoiceId=${invoiceId}`;
        return this.skeletonGetWithUrlParam(url);
    }
}
export default Monobank;

import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import PaymentGateways from "@local/connectors/payment_gateways/index.js";

const { Monobank } = PaymentGateways;

const config = {
  token: "uU61wTM_fp-MRO8RNZnQ8rsU-fsCWbDM5EcBSHc_AECM",
};
const failResponse = {
  response: {
    data: {
      errCode: "FORBIDDEN",
      errText: "invalid 'X-Token'",
    },
  },
};
const invoiceId = "2310097kMGKdvmcB5cwD";

describe("Monobank", () => {
  let monobankInstance;

  beforeEach(() => {
    monobankInstance = new Monobank(config);
  });

  describe("Create account: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            invoiceId: "2310097kMGKdvmcB5cwD",
            pageUrl: "https://pay.mbnk.biz/2310097kMGKdvmcB5cwD",
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to create payment success", async () => {
        const amount = 4200;
        const data = await monobankInstance.createAccount(amount);

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/invoice/create"
        );
        expect(data).to.have.property("invoiceId");
        expect(data).to.have.property("pageUrl");
      });
    });
    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not create account", async () => {
        const amount = 4200;
        const data = await monobankInstance.createAccount(amount);

        expect(axios.post.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get account status: method GET", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves({
          data: {
            invoiceId: "2310097kMGKdvmcB5cwD",
            status: "created",
            failureReason: "Неправильний CVV код",
            amount: 4200,
            ccy: 980,
            finalAmount: 4200,
            createdDate: "2019-08-24T14:15:22Z",
            modifiedDate: "2019-08-24T14:15:22Z",
            reference: "84d0070ee4e44667b31371d8f8813947",
            cancelList: [
              {
                status: "processing",
                amount: 4200,
                ccy: 980,
                createdDate: "2019-08-24T14:15:22Z",
                modifiedDate: "2019-08-24T14:15:22Z",
                approvalCode: "662476",
                rrn: "060189181768",
                extRef: "635ace02599849e981b2cd7a65f417fe",
              },
            ],
            walletData: {
              cardToken: "67XZtXdR4NpKU3",
              walletId: "c1376a611e17b059aeaf96b73258da9c",
              status: "new",
            },
          },
        });
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to get account status success", async () => {
        const data = await monobankInstance.getStatus(invoiceId);

        expect(axios.get.calledOnce).to.be.true;
        expect(axios.get.getCall(0).args[0]).to.equal(
          `https://api.monobank.ua/api/merchant/invoice/status?invoiceId=${invoiceId}`
        );
        expect(Object.keys(data)).to.eql([
          "invoiceId",
          "status",
          "failureReason",
          "amount",
          "ccy",
          "finalAmount",
          "createdDate",
          "modifiedDate",
          "reference",
          "cancelList",
          "walletData",
        ]);
        expect(Object.keys(data.cancelList[0])).to.eql([
          "status",
          "amount",
          "ccy",
          "createdDate",
          "modifiedDate",
          "approvalCode",
          "rrn",
          "extRef",
        ]);
        expect(Object.keys(data.walletData)).to.eql([
          "cardToken",
          "walletId",
          "status",
        ]);
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to not get account status", async () => {
        const data = await monobankInstance.getStatus(invoiceId);

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Create cancellation of payment: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            status: "processing",
            createdDate: "2019-08-24T14:15:22Z",
            modifiedDate: "2019-08-24T14:15:22Z",
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to create cancellation of payment success", async () => {
        const data = await monobankInstance.cancelPayment(invoiceId);

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/invoice/cancel"
        );
        expect(data).to.have.property("status");
        expect(data).to.have.property("createdDate");
        expect(data).to.have.property("modifiedDate");
      });
    });
    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not create cancellation of payment", async () => {
        const data = await monobankInstance.cancelPayment(invoiceId);

        expect(axios.post.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get account invalidation: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({ data: {} });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to invalidate account success", async () => {
        const data = await monobankInstance.accountInValidation(invoiceId);

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/invoice/remove"
        );
        expect(data).to.be.empty;
      });
    });
    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not invalidate account", async () => {
        const data = await monobankInstance.accountInValidation(invoiceId);

        expect(axios.post.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get advanced information about successful payment: method GET", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves({
          data: {
            maskedPan: "444403******1902",
            approvalCode: "662476",
            rrn: "060189181768",
            amount: 4200,
            ccy: 980,
            finalAmount: 4200,
            createdDate: "2019-08-24T14:15:22Z",
            terminal: "MI001088",
            paymentScheme: "full",
            paymentMethod: "pan",
            fee: 420,
            domesticCard: true,
            country: "804",
            cancelList: [
              {
                status: "processing",
                amount: 4200,
                ccy: 980,
                createdDate: "2019-08-24T14:15:22Z",
                modifiedDate: "2019-08-24T14:15:22Z",
                approvalCode: "662476",
                rrn: "060189181768",
                extRef: "635ace02599849e981b2cd7a65f417fe",
              },
            ],
          },
        });
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to get advanced information about successful payment success", async () => {
        const data = await monobankInstance.getSuccessfulPaymentData(invoiceId);

        expect(axios.get.calledOnce).to.be.true;
        expect(axios.get.getCall(0).args[0]).to.equal(
          `https://api.monobank.ua/api/merchant/invoice/payment-info?invoiceId=${invoiceId}`
        );
        expect(data).to.not.empty;
        expect(data.cancelList[0]).to.have.property("status", "processing");
        expect(data).to.have.property("maskedPan", "444403******1902");
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to not advanced information about successful payment", async () => {
        const data = await monobankInstance.getSuccessfulPaymentData(invoiceId);

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get public key for signature verification: method GET", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves({
          data: {
            key: "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFK0UxRnBVZzczYmhGdmp2SzlrMlhJeTZtQkU1MQpib2F0RU1qU053Z1l5ZW55blpZQWh3Z3dyTGhNY0FpT25SYzNXWGNyMGRrY2NvVnFXcVBhWVQ5T3hRPT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==",
          },
        });
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to get public key for signature verification success", async () => {
        const data = await monobankInstance.pbKeyForVerification();

        expect(axios.get.calledOnce).to.be.true;
        expect(axios.get.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/pubkey"
        );
        expect(data).to.have.property("key");
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to not get public key for signature verification", async () => {
        const data = await monobankInstance.pbKeyForVerification();

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Create finalization of the hold amount: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: { status: "success" },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to finalized hold amount success", async () => {
        const amount = 4200;

        const data = await monobankInstance.finalizeHoldAmount(
          invoiceId,
          amount
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/invoice/finalize"
        );
        expect(data).to.have.property("status", "success");
      });
    });
    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not finalized hold amount", async () => {
        const amount = 4200;

        const data = await monobankInstance.finalizeHoldAmount(
          invoiceId,
          amount
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get QR cash register information: method GET", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves({
          data: {
            shortQrId: "OBJE",
            invoiceId: "2310097kMGKdvmcB5cwD",
            amount: 4200,
            ccy: 980,
          },
        });
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to get QR cash register information success", async () => {
        const qrId = "OBJE";

        const data = await monobankInstance.cashQRRegisterInformation(qrId);

        expect(axios.get.calledOnce).to.be.true;
        expect(axios.get.getCall(0).args[0]).to.equal(
          `https://api.monobank.ua/api/merchant/qr/details?qrId=${qrId}`
        );
        expect(data).to.have.property("shortQrId");
        expect(data).to.have.property("invoiceId");
        expect(data).to.have.property("amount");
        expect(data).to.have.property("ccy");
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to not get QR cash register information", async () => {
        const qrId = "OBJE";

        const data = await monobankInstance.cashQRRegisterInformation(qrId);

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Delete payment amount: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({ data: {} });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to delete payment amount success", async () => {
        const qrId = "OBJE";

        const data = await monobankInstance.deletePaymentAmount(qrId);

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/qr/reset-amount"
        );
        expect(data).to.be.empty;
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not delete payment amount", async () => {
        const qrId = "OBJE";

        const data = await monobankInstance.deletePaymentAmount(qrId);

        expect(axios.post.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get List of QR cash registers: method GET", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves({
          data: {
            list: [
              {
                shortQrId: "OBJE",
                qrId: "XJ_DiM4rTd5V",
                amountType: "merchant",
                pageUrl: "https://pay.mbnk.biz/XJ_DiM4rTd5V",
              },
            ],
          },
        });
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to get list of QR cash registers success", async () => {
        const data = await monobankInstance.getQRCashRegistersList();

        expect(axios.get.calledOnce).to.be.true;
        expect(axios.get.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/qr/list"
        );
        expect(data).to.have.property("list");
        expect(Object.keys(data.list[0])).to.eql([
          "shortQrId",
          "qrId",
          "amountType",
          "pageUrl",
        ]);
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to not get list of QR cash registers", async () => {
        const data = await monobankInstance.getQRCashRegistersList();

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get Merchant Data: method GET", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves({
          data: {
            merchantId: "12o4Vv7EWy",
            merchantName: "Your Favourite Company",
            edrpou: "4242424242",
          },
        });
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to get merchant data success", async () => {
        const data = await monobankInstance.getMerchantData();

        expect(axios.get.calledOnce).to.be.true;
        expect(axios.get.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/details"
        );
        expect(data).to.have.property("merchantId");
        expect(data).to.have.property("merchantName");
        expect(data).to.have.property("edrpou");
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to not get merchant data", async () => {
        const data = await monobankInstance.getMerchantData();

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get Statement for the period: method GET", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves({
          data: {
            list: [
              {
                invoiceId: "2205175v4MfatvmUL2oR",
                status: "success",
                maskedPan: "444403******1902",
                date: "2019-08-24T14:15:22Z",
                paymentScheme: "bnpl_later_30",
                amount: 4200,
                profitAmount: 4100,
                ccy: 980,
                approvalCode: "662476",
                rrn: "060189181768",
                reference: "84d0070ee4e44667b31371d8f8813947",
                shortQrId: "OBJE",
                cancelList: [
                  {
                    amount: 4200,
                    ccy: 980,
                    date: "2019-08-24T14:15:22Z",
                    approvalCode: "662476",
                    rrn: "060189181768",
                    maskedPan: "444403******1902",
                  },
                ],
              },
            ],
          },
        });
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to get statement for the period success", async () => {
        const from = "1649329978";

        const data = await monobankInstance.statementForPeriod(from);

        expect(axios.get.calledOnce).to.be.true;
        expect(axios.get.getCall(0).args[0]).to.equal(
          `https://api.monobank.ua/api/merchant/statement?from=${from}`
        );
        expect(Object.keys(data.list[0])).to.eql([
          "invoiceId",
          "status",
          "maskedPan",
          "date",
          "paymentScheme",
          "amount",
          "profitAmount",
          "ccy",
          "approvalCode",
          "rrn",
          "reference",
          "shortQrId",
          "cancelList",
        ]);
        expect(Object.keys(data.list[0].cancelList[0])).to.eql([
          "amount",
          "ccy",
          "date",
          "approvalCode",
          "rrn",
          "maskedPan",
        ]);
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to not get statement for the period", async () => {
        const from = "1649329978";

        const data = await monobankInstance.statementForPeriod(from);

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Delete a tokenized card: method DELETE", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "delete").resolves({ data: {} });
      });

      afterEach(() => {
        axios.delete.restore();
      });

      it("it is expected to delete a tokenized card success", async () => {
        const cardToken = "67XZtXdR4NpKU3";

        const response = await monobankInstance.deleteTokenizedCard(cardToken);

        expect(axios.delete.calledOnce).to.be.true;
        expect(axios.delete.getCall(0).args[0]).to.equal(
          `https://api.monobank.ua/api/merchant/wallet/card?cardToken=${cardToken}`
        );
        expect(response).to.have.property("data");
        expect(response.data).to.be.empty;
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "delete").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.delete.restore();
      });

      it("it is expected to not delete a tokenized card", async () => {
        const cardToken = "67XZtXdR4NpKU3";

        const response = await monobankInstance.deleteTokenizedCard(cardToken);

        expect(axios.delete.calledOnce).to.be.true;
        expect(response.data).to.have.property("errCode", "FORBIDDEN");
        expect(response.data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get list of cards in the wallet: method GET", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves({
          data: {
            wallet: [
              {
                cardToken: "67XZtXdR4NpKU3",
                maskedPan: "424242******4242",
                country: "804",
              },
            ],
          },
        });
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to get list of cards in the wallet success", async () => {
        const walletId = "c1376a611e17b059aeaf96b73258da9c";

        const data = await monobankInstance.getWalletCardsList(walletId);

        expect(axios.get.calledOnce).to.be.true;
        expect(axios.get.getCall(0).args[0]).to.equal(
          `https://api.monobank.ua/api/merchant/wallet?walletId=${walletId}`
        );
        expect(Object.keys(data.wallet[0])).to.eql([
          "cardToken",
          "maskedPan",
          "country",
        ]);
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to not get list of cards in the wallet", async () => {
        const walletId = "c1376a611e17b059aeaf96b73258da9c";

        const data = await monobankInstance.getWalletCardsList(walletId);

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Create payment by card token: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            invoiceId: "2210012MPLYwJjVUzchj",
            tdsUrl: "https://example.com/tds/url",
            status: "success",
            failureReason: "Неправильний CVV код",
            amount: 4200,
            ccy: 980,
            createdDate: "2019-08-24T14:15:22Z",
            modifiedDate: "2019-08-24T14:15:22Z",
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to create payment by card token success", async () => {
        const cardToken = "67XZtXdR4NpKU3";
        const amount = 4200;
        const ccy = 980;
        const initiationKind = "merchant";

        const data = await monobankInstance.paymentByToken(
          cardToken,
          amount,
          ccy,
          initiationKind
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/wallet/payment"
        );
        expect(Object.keys(data)).to.eql([
          "invoiceId",
          "tdsUrl",
          "status",
          "failureReason",
          "amount",
          "ccy",
          "createdDate",
          "modifiedDate",
        ]);
      });
    });
    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not create payment by card token", async () => {
        const cardToken = "67XZtXdR4NpKU3";
        const amount = 4200;
        const ccy = 980;
        const initiationKind = "merchant";

        const data = await monobankInstance.paymentByToken(
          cardToken,
          amount,
          ccy,
          initiationKind
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Create payment by requisite: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            invoiceId: "2210012MPLYwJjVUzchj",
            tdsUrl: "https://example.com/tds/url",
            status: "success",
            failureReason: "Неправильний CVV код",
            amount: 4200,
            ccy: 980,
            createdDate: "2019-08-24T14:15:22Z",
            modifiedDate: "2019-08-24T14:15:22Z",
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to create payment by requisite success", async () => {
        const cardData = {
          pan: "4242424242424242",
          exp: "0642",
          cvv: "123",
        };
        const amount = 4200;
        const initiationKind = "merchant";

        const data = await monobankInstance.requisitePayment(
          amount,
          cardData,
          initiationKind
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/invoice/payment-direct"
        );
        expect(Object.keys(data)).to.eql([
          "invoiceId",
          "tdsUrl",
          "status",
          "failureReason",
          "amount",
          "ccy",
          "createdDate",
          "modifiedDate",
        ]);
      });
    });
    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not payment by requisite", async () => {
        const cardData = {
          pan: "4242424242424242",
          exp: "0642",
          cvv: "123",
        };
        const amount = 4200;
        const initiationKind = "merchant";

        const data = await monobankInstance.requisitePayment(
          amount,
          cardData,
          initiationKind
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get list of submerchants: method GET", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves({
          data: {
            list: [
              {
                code: "0a8637b3bccb42aa93fdeb791b8b58e9",
                edrpou: "4242424242",
                iban: "UA213996220000026007233566001",
              },
            ],
          },
        });
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to get list of submerchants success", async () => {
        const data = await monobankInstance.getSubmerchantsList();

        expect(axios.get.calledOnce).to.be.true;
        expect(axios.get.getCall(0).args[0]).to.equal(
          "https://api.monobank.ua/api/merchant/submerchant/list"
        );
        expect(Object.keys(data.list[0])).to.eql(["code", "edrpou", "iban"]);
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to not get list of submerchants", async () => {
        const data = await monobankInstance.getSubmerchantsList();

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });

  describe("Get fiscal checks: method GET", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves({
          data: {
            checks: [
              {
                id: "a2fd4aef-cdb8-4e25-9b36-b6d4672c554d",
                type: "sale",
                status: "done",
                statusDescription: "",
                taxUrl: "https://cabinet.tax.gov.ua/cashregs/check",
                file: "CJFVBERi0xLj4QKJaqrrK0KMSAw123I4G9ia3go38PAovQ43JlYXRvciAoQXBhY2hl5IEZPUCBWZXJzaW9uIfDIuMykKL...",
                fiscalizationSource: "monopay",
              },
            ],
          },
        });
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to get fiscal checks success", async () => {
        const data = await monobankInstance.getFiscalChecks(invoiceId);

        expect(axios.get.calledOnce).to.be.true;
        expect(axios.get.getCall(0).args[0]).to.equal(
          `https://api.monobank.ua/api/merchant/invoice/fiscal-checks?invoiceId=${invoiceId}`
        );
        expect(Object.keys(data.checks[0])).to.eql([
          "id",
          "type",
          "status",
          "statusDescription",
          "taxUrl",
          "file",
          "fiscalizationSource",
        ]);
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(failResponse.response);
      });

      afterEach(() => {
        axios.get.restore();
      });

      it("it is expected to not get fiscal checks", async () => {
        const data = await monobankInstance.getFiscalChecks(invoiceId);

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("errCode", "FORBIDDEN");
        expect(data).to.have.property("errText", "invalid 'X-Token'");
      });
    });
  });
});

import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import PaymentGateways from "@local/app/connectors/payment_gateways/index.js";
const { NovaPay } = PaymentGateways;

const config = {
  apiSign:
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhw1lBDT8S9xRAMfGT4Pd m4szFRUgqy93v6wqepSX0nX9J+gKdh7GQONxTw7nU2c05MfpOpH9GNn44jqYwY+7 jtYDNmqbp2sq7mB01pCzpYHQ1z0XlnpbP+KDRWlsq2aBblWvvG4Fp7/+hqnWeJSC /3bYFKj7xQhqdcOzJ7RmHDCT100ivKuPVxpEtGICq+YrAvot9UQ90I4mC+c/AejV mBv3p/bF9ZWbpdUrJyidh8f0V/vDLjsjkEI+rzcAGWtNXNNDqzFpyCimat6W4cRa hHzbOelSwulSf58eUROiNi++ZsShU6hhZawcOJnDosEwzv3RLfde2WvztHT+4tfC 2QIDAQAB",
};

const error400Processing = {
  data: {
    uuid: "88da8a51-ab3d-48e5-bf29-cb5708501fc7",
    type: "processing",
    error: "сесію не знайдено",
    code: "SessionNotFoundError",
  },
};
const error400Validation = {
  data: {
    uuid: "396f0523-0436-4626-9bdf-f14f8914d114",
    type: "validation",
    errors: [
      {
        instancePath: "",
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "{property}",
        },
        message: 'обов\'язкове поле "{property}"',
      },
    ],
  },
};

describe("NovaPay", () => {
  let novaPayInstance;

  beforeEach(() => {
    novaPayInstance = new NovaPay(config);
  });

  describe("Create session: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            id: "59cde249-5567-41f8-9619-79bbada74958", // this id is a session_id
            metadata: {},
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to create session success", async () => {
        const merchant_id = "1"; // required field
        const client_phone = "+380982850620"; // required field

        const response = await novaPayInstance.createSession(
          merchant_id,
          client_phone
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/session"
        );
        expect(response).to.have.property("id");
        expect(response).to.have.property("metadata");
      });
    });
    describe("fail status 400 - Processing", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Processing);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not create session", async () => {
        const merchant_id = "1"; // required field
        const client_phone = "+380982850620"; // required field

        const response = await novaPayInstance.createSession(
          merchant_id,
          client_phone
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "error", "code"]);
      });
    });

    describe("fail status 400 - Validation", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Validation);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not create session", async () => {
        const merchant_id = "1"; // required field
        const client_phone = "+380982850620"; // required field

        const response = await novaPayInstance.createSession(
          merchant_id,
          client_phone
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "errors"]);
        expect(Object.keys(response.errors[0])).to.eql([
          "instancePath",
          "schemaPath",
          "keyword",
          "params",
          "message",
        ]);
        expect(response.errors[0].params).to.have.property("missingProperty");
      });
    });
  });

  describe("Add payment: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            id: "1666774214694",
            url: "https://qecom.novapay.ua/pay?sid=e982ebb2-b2ee-461b-bba5-4fc1e2a947c9",
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to add payment success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "59cde249-5567-41f8-9619-79bbada74958"; // required field
        const amount = 100.25; // required field

        const response = await novaPayInstance.addPayment(
          merchant_id,
          session_id,
          amount
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/payment"
        );
        expect(response).to.have.property("id");
        expect(response).to.have.property("url");
      });
    });

    describe("success with delivery(object) param", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            url: "https://qecom.novapay.ua/pay?sid=e982ebb2-b2ee-461b-bba5-4fc1e2a947c9",
            delivery_price: 47,
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to add payment with delivery(object) param success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "81fbef94-1534-4b81-9680-b73baf8ebda6"; // required field
        const amount = 100.25; // required field
        const delivery = {
          // all fields in object required
          recipient_city: "8d5a980d-391c-11dd-90d9-001a92567626", // string
          recipient_warehouse: "a3013fb7-8460-11e4-acce-0050568002cf", // string
          volume_weight: 0.0004, // float
          weight: 0.1, // float
        };

        const response = await novaPayInstance.addPaymentWithDeliveryParam(
          merchant_id,
          session_id,
          amount,
          delivery
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/payment"
        );
        expect(response).to.have.property("url");
        expect(response).to.have.property("delivery_price");
      });
    });

    describe("success with products(array of objects)param", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            id: "1666774214694",
            url: "https://qecom.novapay.ua/pay?sid=e982ebb2-b2ee-461b-bba5-4fc1e2a947c9",
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to add payment with products(array of objects)param success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "41b0069b-a528-481f-adcf-843ee782dc86"; // required field
        const amount = 100.25; // required field
        const products = [
          // array of objects
          {
            // all fields in object required
            description: "T-shirt", // string
            count: 1, // float
            price: 100.25, // float
          },
        ];

        const response = await novaPayInstance.addPaymentWithProductsParam(
          merchant_id,
          session_id,
          amount,
          products
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/payment"
        );
        expect(response).to.have.property("id");
        expect(response).to.have.property("url");
      });
    });

    describe("success with all params", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            id: "1666774214694",
            url: "https://qecom.novapay.ua/pay?sid=e982ebb2-b2ee-461b-bba5-4fc1e2a947c9",
            delivery_price: 47,
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to add payment with all params success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "cc5e6358-dd69-4f59-bfcb-423c7fd1d4bc"; // required field
        const amount = 100.25; // required field
        const delivery = {
          recipient_city: "8d5a980d-391c-11dd-90d9-001a92567626", // required field
          recipient_warehouse: "a3013fb7-8460-11e4-acce-0050568002cf", // required field
          volume_weight: 0.0004, // required field
          weight: 0.1, // required field
        };
        const products = [{ description: "T-shirt", count: 1, price: 100.25 }]; // all fields required

        const response = await novaPayInstance.addPaymentWithAllParams(
          merchant_id,
          session_id,
          amount,
          delivery,
          products
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/payment"
        );
        expect(response).to.have.property("id");
        expect(response).to.have.property("url");
        expect(response).to.have.property("delivery_price", 47);
      });
    });

    describe("fail status 400 - Processing", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Processing);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not add payment", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field
        const amount = 100.25; // required field

        const response = await novaPayInstance.addPayment(
          merchant_id,
          session_id,
          amount
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "error", "code"]);
      });
    });

    describe("fail status 400 - Validation", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Validation);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not add payment", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field
        const amount = 100.25; // required field

        const response = await novaPayInstance.addPayment(
          merchant_id,
          session_id,
          amount
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "errors"]);
        expect(Object.keys(response.errors[0])).to.eql([
          "instancePath",
          "schemaPath",
          "keyword",
          "params",
          "message",
        ]);
        expect(response.errors[0].params).to.have.property("missingProperty");
      });
    });
  });

  describe("Void session: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({ data: {} });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to void session success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.voidSession({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/void"
        );
        expect(response).to.be.empty;
      });
    });
    describe("fail status 400 - Processing", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Processing);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not void session", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.voidSession({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "error", "code"]);
      });
    });

    describe("fail status 400 - Validation", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Validation);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not void session", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.voidSession({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "errors"]);
        expect(Object.keys(response.errors[0])).to.eql([
          "instancePath",
          "schemaPath",
          "keyword",
          "params",
          "message",
        ]);
        expect(response.errors[0].params).to.have.property("missingProperty");
      });
    });
  });

  describe("Complete hold: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({ data: {} });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to complete hold success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.completeHold({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/complete-hold"
        );
        expect(response).to.be.empty;
      });
    });

    describe("success with operations(array of objects) param", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({ data: {} });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to complete hold with operations(array of objects) param success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field
        const operations = [
          // array of objects
          {
            // all fields in object required
            id: "12000000012", // string
            amount: 90.25, // float
            recipient_identifier: "31316718", // string
          },
        ];

        const response = await novaPayInstance.completeHoldWithOperationsParam({
          merchant_id,
          session_id,
          operations,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/complete-hold"
        );
        expect(response).to.be.empty;
      });
    });

    describe("fail status 400 - Processing", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Processing);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not complete hold", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.completeHold({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "error", "code"]);
      });
    });

    describe("fail status 400 - Validation", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Validation);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not complete hold", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.completeHold({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "errors"]);
        expect(Object.keys(response.errors[0])).to.eql([
          "instancePath",
          "schemaPath",
          "keyword",
          "params",
          "message",
        ]);
        expect(response.errors[0].params).to.have.property("missingProperty");
      });
    });
  });

  describe("Expire session: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({ data: {} });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to expire session success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.expireSession({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/expire"
        );
        expect(response).to.be.empty;
      });
    });
    describe("fail status 400 - Processing", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Processing);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not expire session", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.expireSession({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "error", "code"]);
      });
    });

    describe("fail status 400 - Validation", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Validation);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not expire session", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.expireSession({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "errors"]);
        expect(Object.keys(response.errors[0])).to.eql([
          "instancePath",
          "schemaPath",
          "keyword",
          "params",
          "message",
        ]);
        expect(response.errors[0].params).to.have.property("missingProperty");
      });
    });
  });

  describe("Confirm delivery hold: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            id: "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9",
            express_waybill: "2040050043239",
            ref_id: "02c96e5a-88bc-11eb-8426-005056b2b158",
            metadata: {},
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to confirm delivery hold success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.confirmDeliveryHold({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/confirm-delivery-hold"
        );
        expect(Object.keys(response)).to.eql([
          "id",
          "express_waybill",
          "ref_id",
          "metadata",
        ]);
      });
    });
    describe("fail status 400 - Processing", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Processing);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not confirm delivery hold", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.confirmDeliveryHold({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "error", "code"]);
      });
    });

    describe("fail status 400 - Validation", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Validation);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not confirm delivery hold", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.confirmDeliveryHold({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "errors"]);
        expect(Object.keys(response.errors[0])).to.eql([
          "instancePath",
          "schemaPath",
          "keyword",
          "params",
          "message",
        ]);
        expect(response.errors[0].params).to.have.property("missingProperty");
      });
    });
  });

  describe("Print express waybill: method POST", async () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({ data: {} });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to print express waybill success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.printExpressWaybill({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/print-express-waybill"
        );
        expect(response).to.be.empty;
      });
    });
    describe("fail status 400 - Processing", async () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Processing);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not print express waybill", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.printExpressWaybill({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "error", "code"]);
      });
    });

    describe("fail status 400 - Validation", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Validation);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not print express waybill", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.printExpressWaybill({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "errors"]);
        expect(Object.keys(response.errors[0])).to.eql([
          "instancePath",
          "schemaPath",
          "keyword",
          "params",
          "message",
        ]);
        expect(response.errors[0].params).to.have.property("missingProperty");
      });
    });
  });

  describe("Get status: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: {
            id: "3c70b212-b5b8-4ce2-9ca4-8586b7a07faa",
            metadata: null,
            status: "created",
            created_at: "2023-10-11T13:52:49.208+00:00",
            client_phone: "+380982850620",
            client_first_name: "Иван",
            client_last_name: "Иванов",
            client_patronymic: "Иванович",
            pan: null,
            rrn: null,
            approval_code: null,
            card_type: null,
            transaction_status: null,
            amount: "100.25",
            processing_result: null,
            operations: [
              {
                transaction_id: "120190696257",
                external_id: "f364d3c7-af2c-4174-a336-fc5c9160671c",
                amount: 100.25,
              },
            ],
          },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to get status success", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.getStatus({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/get-status"
        );
        expect(Object.keys(response)).to.eql([
          "id",
          "metadata",
          "status",
          "created_at",
          "client_phone",
          "client_first_name",
          "client_last_name",
          "client_patronymic",
          "pan",
          "rrn",
          "approval_code",
          "card_type",
          "transaction_status",
          "amount",
          "processing_result",
          "operations",
        ]);
        expect(Object.keys(response.operations[0])).to.eql([
          "transaction_id",
          "external_id",
          "amount",
        ]);
      });
    });
    describe("fail status 400 - Processing", async () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Processing);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not get status", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.getStatus({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "error", "code"]);
      });
    });

    describe("fail status 400 - Validation", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Validation);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not get status", async () => {
        const merchant_id = "1"; // required field
        const session_id = "e982ebb2-b2ee-461b-bba5-4fc1e2a947c9"; // required field

        const response = await novaPayInstance.getStatus({
          merchant_id,
          session_id,
        });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "errors"]);
        expect(Object.keys(response.errors[0])).to.eql([
          "instancePath",
          "schemaPath",
          "keyword",
          "params",
          "message",
        ]);
        expect(response.errors[0].params).to.have.property("missingProperty");
      });
    });
  });

  describe("Delivery info: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({ data: {} });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to get delivery info success", async () => {
        const merchant_id = "1"; // required field

        const response = await novaPayInstance.deliveryInfo(merchant_id);

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/delivery-info"
        );
        expect(response).to.be.empty;
      });
    });
    describe("fail status 400 - Processing", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Processing);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not get delivery info", async () => {
        const merchant_id = "1"; // required field

        const response = await novaPayInstance.deliveryInfo({ merchant_id });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "error", "code"]);
      });
    });

    describe("fail status 400 - Validation", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Validation);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not get delivery info", async () => {
        const merchant_id = "1"; // required field

        const response = await novaPayInstance.deliveryInfo({ merchant_id });

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "errors"]);
        expect(Object.keys(response.errors[0])).to.eql([
          "instancePath",
          "schemaPath",
          "keyword",
          "params",
          "message",
        ]);
        expect(response.errors[0].params).to.have.property("missingProperty");
      });
    });
  });

  describe("Delivery price: method POST", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          data: { delivery_price: 52 },
        });
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to get delivery price success", async () => {
        const merchant_id = "1";
        const recipient_city = "8d5a980d-391c-11dd-90d9-001a92567626";
        const recipient_warehouse = "a3013fb7-8460-11e4-acce-0050568002cf";
        const volume_weight = 0.0004;
        const weight = 0.1;
        const amount = 100;

        const response = await novaPayInstance.deliveryPrice(
          merchant_id,
          recipient_city,
          recipient_warehouse,
          volume_weight,
          weight,
          amount
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(axios.post.getCall(0).args[0]).to.equal(
          "https://api-qecom.novapay.ua/v1/delivery-price"
        );
        expect(response).to.have.property("delivery_price", 52);
      });
    });
    describe("fail status 400 - Processing", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Processing);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not get delivery price", async () => {
        const merchant_id = "1";
        const recipient_city = "8d5a980d-391c-11dd-90d9-001a92567626";
        const recipient_warehouse = "a3013fb7-8460-11e4-acce-0050568002cf";
        const volume_weight = 0.0004;
        const weight = 0.1;
        const amount = 100;

        const response = await novaPayInstance.deliveryPrice(
          merchant_id,
          recipient_city,
          recipient_warehouse,
          volume_weight,
          weight,
          amount
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "error", "code"]);
      });
    });

    describe("fail status 400 - Validation", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(error400Validation);
      });

      afterEach(() => {
        axios.post.restore();
      });

      it("it is expected to not get delivery price", async () => {
        const merchant_id = "1";
        const recipient_city = "8d5a980d-391c-11dd-90d9-001a92567626";
        const recipient_warehouse = "a3013fb7-8460-11e4-acce-0050568002cf";
        const volume_weight = 0.0004;
        const weight = 0.1;
        const amount = 100;

        const response = await novaPayInstance.deliveryPrice(
          merchant_id,
          recipient_city,
          recipient_warehouse,
          volume_weight,
          weight,
          amount
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(Object.keys(response)).to.eql(["uuid", "type", "errors"]);
        expect(Object.keys(response.errors[0])).to.eql([
          "instancePath",
          "schemaPath",
          "keyword",
          "params",
          "message",
        ]);
        expect(response.errors[0].params).to.have.property("missingProperty");
      });
    });
  });
});

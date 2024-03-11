import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import crypto from "crypto";
import PaymentGateways from "@local/connectors/payment_gateways/index.js";

const { LiqPay } = PaymentGateways;

const config = {
  public_key: "sandbox_i70579610124",
  private_key: "sandbox_sQLHqlsUZcgiOBdxhUB7F8llVWVznDMHC5IaNQIi",
};

describe("LiqPay", () => {
  let liqPayInstance;

  beforeEach(() => {
    liqPayInstance = new LiqPay(config);
  });

  describe("checkoutForm method", () => {
    beforeEach(() => {
      sinon.stub(axios, "post");
    });

    afterEach(() => {
      axios.post.restore();
    });

    it("should return a form with correct data and signature", () => {
      const params = {
        action: "pay",
        amount: "1",
        currency: "UAH",
        description: "Test payment",
        order_id: "order12345", // should be unique
        version: "3",
        language: "en",
      };

      const form = liqPayInstance.checkoutForm(params);

      expect(form).to.contain('name="data"');
      expect(form).to.contain('name="signature"');
      expect(form).to.contain('<sdk-button label="Pay"');
    });

    it("should default to Ukrainian language if no language is provided", () => {
      const params = {
        action: "pay",
        amount: "100",
        currency: "USD",
        description: "Test payment",
        order_id: "order12345", // should be unique
        version: "3",
      };

      const form = liqPayInstance.checkoutForm(params);

      expect(form).to.contain('<sdk-button label="Сплатити"');
    });
  });

  describe("cnb_params method", () => {
    beforeEach(() => {
      sinon.stub(axios, "post");
    });

    afterEach(() => {
      axios.post.restore();
    });
    context("success", () => {
      it("should convert version and amount to numbers if they are valid strings", () => {
        const params = {
          version: "3",
          action: "pay",
          amount: "100.5",
          currency: "USD",
          description: "Test payment",
          order_id: "order12345", // should be unique
        };

        const result = liqPayInstance.cnb_params(params);

        expect(result.version).to.be.a("number").to.be.equal(params.version);
        expect(result.amount).to.be.a("number").to.be.equal(params.amount);
      });
    });

    context("fail cases", () => {
      it("should throw an error if version or amount are invalid strings", () => {
        const params = {
          version: "invalid",
          action: "pay",
          amount: "100.5",
          currency: "USD",
          description: "Test payment",
          order_id: "order12345", // should be unique
        };

        expect(() => liqPayInstance.cnb_params(params)).to.throw(
          "version must be a number or a string that can be converted to a number"
        );
      });

      it("should convert other parameters to strings if they are not already strings", () => {
        const params = {
          version: 3,
          action: "pay",
          amount: 100.5,
          currency: 123,
          description: true,
          order_id: "order12345", // should be unique
        };

        const result = liqPayInstance.cnb_params(params);

        expect(result.currency)
          .to.be.a("string")
          .to.be.equal(params.currency)
          .toString();
        expect(result.description)
          .to.be.a("string")
          .to.be.equal(params.description)
          .toString();
      });

      it("should throw an error if a required parameter(description) is missing", () => {
        const params = {
          version: 3,
          action: "pay",
          amount: 100.5,
          currency: "USD",
          order_id: "order12345", // should be unique
        };

        expect(() => liqPayInstance.cnb_params(params)).to.throw(
          "description is null or not provided"
        );
      });

      it("should throw an error if an invalid language is provided", () => {
        const params = {
          version: 3,
          action: "pay",
          amount: 100.5,
          currency: "USD",
          description: "Test payment",
          order_id: "order12345", // should be unique
          language: "es", // Spanish is not in the availableLanguages list
        };

        expect(() => liqPayInstance.cnb_params(params)).to.throw(
          "Invalid language: es. Supported languages are: uk, en"
        );
      });

      it("should throw an error if version is missing", () => {
        const paramsWithoutVersion = {
          action: "pay",
          amount: "100.5",
          currency: "USD",
          description: "Test payment",
          order_id: "order12345", // should be unique
        };

        expect(() => liqPayInstance.cnb_params(paramsWithoutVersion)).to.throw(
          "version is null"
        );
      });

      it("should throw an error if amount is an invalid string", () => {
        const paramsWithInvalidAmount = {
          version: 3,
          action: "pay",
          amount: "invalidAmount",
          currency: "USD",
          description: "Test payment",
          order_id: "order12345", // should be unique
        };

        expect(() =>
          liqPayInstance.cnb_params(paramsWithInvalidAmount)
        ).to.throw(
          "amount must be a number or a string that can be converted to a number"
        );
      });

      it("should throw an error if amount is missing", () => {
        const paramsWithoutAmount = {
          version: 3,
          action: "pay",
          currency: "USD",
          description: "Test payment",
          order_id: "order12345", // should be unique
        };

        expect(() => liqPayInstance.cnb_params(paramsWithoutAmount)).to.throw(
          "amount is null"
        );
      });
    });
  });

  describe("str_to_sign function", () => {
    beforeEach(() => {
      sinon.stub(axios, "post");
    });

    afterEach(() => {
      axios.post.restore();
    });

    context("success", () => {
      it("should return a base64 encoded SHA-1 hash of the input string", () => {
        const input = "test";
        const output = liqPayInstance.str_to_sign(input);
        const expectedOutput = crypto
          .createHash("sha1")
          .update(input)
          .digest("base64");

        expect(output).to.equal(expectedOutput);
      });
    });

    context("fail cases", () => {
      it("should throw an error if the input is not a string", () => {
        const input = 12345; // a number, not a string

        expect(() => liqPayInstance.str_to_sign(input)).to.throw(
          "Input must be a string"
        );
      });

      it("should throw an error if the input is null", () => {
        const input = null;

        expect(() => liqPayInstance.str_to_sign(input)).to.throw(
          "Input must be a string"
        );
      });

      it("should throw an error if the input is undefined", () => {
        const input = undefined;

        expect(() => liqPayInstance.str_to_sign(input)).to.throw(
          "Input must be a string"
        );
      });
    });
  });

  describe("cnb_object function", () => {
    beforeEach(() => {
      sinon.stub(axios, "post");
    });

    afterEach(() => {
      axios.post.restore();
    });
    it("should return an object with data and signature properties", () => {
      const params = {
        version: 3,
        action: "pay",
        amount: 100.5,
        currency: "USD",
        description: "Test payment",
        order_id: "order12345", // should be unique
        language: "en",
      };
      const result = liqPayInstance.cnb_object(params);

      expect(result).to.have.property("data");
      expect(result).to.have.property("signature");
    });
  });

  describe("cnb_signature function", () => {
    beforeEach(() => {
      sinon.stub(axios, "post");
    });

    afterEach(() => {
      axios.post.restore();
    });
    context("success", () => {
      it("should return a valid signature for given params", () => {
        const params = {
          version: 3,
          action: "pay",
          amount: 100.5,
          currency: "USD",
          description: "Test payment",
          order_id: "order12345", // should be unique
        };

        const signature = liqPayInstance.cnb_signature(params);

        const data = Buffer.from(
          JSON.stringify(liqPayInstance.cnb_params(params))
        ).toString("base64");
        const expectedSignature = liqPayInstance.str_to_sign(
          config.private_key + data + config.private_key
        );

        expect(signature).to.equal(expectedSignature);
      });
    });

    context("fail case", () => {
      it("should throw an error if a required parameter is missing", () => {
        const params = {
          version: 3,
          action: "pay",
          amount: 100.5,
          currency: "USD",
          order_id: "order12345", // should be unique
        };

        expect(() => liqPayInstance.cnb_signature(params)).to.throw(
          "description is null or not provided"
        );
      });
    });
  });

  describe("cardPayment function", () => {
    context("success", () => {
      beforeEach(() => {
        sinon
          .stub(axios, "post")
          .resolves({ status: 200, data: { success: true } });
      });

      afterEach(() => {
        axios.post.restore();
      });
      it("should return data when the request is successful", async () => {
        const params = {
          action: "pay",
          amount: 1,
          currency: "UAH",
          description: "Test payment",
          order_id: "order12341",
          version: 3,
          language: "uk",
          card: "4242424242424242",
          card_cvv: "123",
          card_exp_month: "03",
          card_exp_year: "24",
        };

        const result = await liqPayInstance.cardPayment(params);

        expect(result).to.have.property("success", true);
      });
    });

    context("fail case", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves({
          status: 400,
        });
      });

      afterEach(() => {
        axios.post.restore();
      });
      it("should throw an error when the request fails", async () => {
        const params = {
          action: "pay",
          amount: 1,
          currency: "UAH",
          description: "Test payment",
          order_id: "order12341",
          version: 3,
          language: "uk",
          card: "4242424242424242",
          card_cvv: "123",
          card_exp_month: "03",
        };

        try {
          await liqPayInstance.cardPayment(params);
        } catch (error) {
          expect(error).to.be.an.instanceOf(Error);
          expect(error.message).to.contain("Request failed with status code");
        }
      });
    });

    context("fail case with missing version param", () => {
      beforeEach(() => {
        sinon.stub(axios, "post");
      });

      afterEach(() => {
        axios.post.restore();
      });
      it("should throw an error if version is missing", async () => {
        const paramsWithoutVersion = {
          action: "pay",
          amount: 1,
          currency: "UAH",
          description: "Test payment",
          order_id: "order12345", // should be unique
          card: "4242424242424242",
          card_cvv: "123",
          card_exp_month: "03",
        };

        try {
          await liqPayInstance.cardPayment(paramsWithoutVersion);
        } catch (error) {
          expect(error).to.be.an.instanceOf(Error);
          expect(error.message).to.contain("Required param 'version' is null");
        }
      });
    });
  });
});

import { expect } from "chai";
import axios from "axios";
import sinon from "sinon";
import flySms from "@local/connectors/sms/flySms.js";

describe("FlySms request processes data properly", () => {
  describe(".sendSms", () => {
    before(() => {
      sinon.stub(axios, "post");
    });

    after(() => {
      axios.post.restore();
    });

    it("it is expected to sendSms", () => {
      const testNumber = "380800300466";
      const testMessage = "Never gonna give you up";
      const key = "key";
      const sender = "Sender";

      flySms.sendSms(testNumber, testMessage, { key, sender });

      expect(axios.post.calledOnce).to.be.true;
      expect(axios.post.getCall(0).args[0]).to.equal(
        "https://sms-fly.ua/api/v2/api.php"
      );

      const query = JSON.parse(axios.post.getCall(0).args[1]);

      expect(query.data.recipient).to.be.a("string").to.be.equal(testNumber);
      expect(query.data.sms.text).to.be.a("string").to.be.equal(testMessage);
      expect(query.auth).to.be.a("string").to.be.equal(key);
      expect(query.data.sms.source).to.be.a("string").to.be.equal(sender);
    });
  });

  describe(".getBalance", () => {
    beforeEach(() => {
      sinon.stub(axios, "post").returns(
        Promise.resolve({
          data: {
            data: {
              balance: 0.5,
            },
          },
        })
      );
    });

    afterEach(() => {
      axios.post.restore();
    });
    it("it is expected to getBalance", async () => {
      const key = "key";

      const balance = await flySms.getBalance({ config: { key } });

      expect(axios.post.calledOnce).to.be.true;
      expect(axios.post.getCall(0).args[0]).to.equal(
        "https://sms-fly.ua/api/v2/api.php"
      );
      const query = JSON.parse(axios.post.getCall(0).args[1]);

      expect(query.auth.key).to.be.a("string").to.be.equal(key);
      expect(query.action).to.be.a("string").to.be.equal("GETBALANCE");
      expect(balance).to.eq(0.5);
    });
  });
});

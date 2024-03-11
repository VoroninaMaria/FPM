import { expect } from "chai";
import axios from "axios";
import sinon from "sinon";
import turboSms from "@local/connectors/sms/turboSms.js";

describe("with Stub: getSomeShit", () => {
  describe(".sendSms", () => {
    before(() => {
      sinon.stub(axios, "post");
    });

    after(() => {
      axios.post.restore();
    });
    it("it is expected to sendSms", () => {
      const recipient = "380800300466";
      const message = "text";
      const key = "key";
      const sender = "Sender";

      turboSms.sendSms(recipient, message, { key, sender });

      expect(axios.post.calledOnce).to.be.true;
      expect(axios.post.getCall(0).args[0]).to.equal(
        "https://api.turbosms.ua/message/send.json"
      );

      const query = JSON.parse(axios.post.getCall(0).args[1]);
      const { headers } = axios.post.getCall(0).args[2];

      expect(query.recipients[0]).to.be.a("string").to.be.equal(recipient);
      expect(query.sms.text).to.be.a("string").to.be.equal(message);
      expect(headers.Authorization)
        .to.be.a("string")
        .to.deep.equal(`Bearer ${key}`);
      expect(query.sms.sender).to.be.a("string").to.be.equal(sender);
    });
  });

  describe(".getBalance", () => {
    beforeEach(() => {
      sinon.stub(axios, "post").returns(
        Promise.resolve({
          data: {
            response_result: {
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

      const balance = await turboSms.getBalance({ config: { key } });

      expect(axios.post.calledOnce).to.be.true;
      expect(axios.post.getCall(0).args[0]).to.equal(
        "https://api.turbosms.ua/user/balance.json"
      );
      const { headers } = axios.post.getCall(0).args[2];

      expect(headers.Authorization)
        .to.be.a("string")
        .to.deep.equal(`Bearer ${key}`);
      expect(balance).to.eq(0.5);
    });
  });
});

import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import smsClub from "@local/connectors/sms/smsClub.js";

describe("smsClub", () => {
  describe(".sendSms", () => {
    beforeEach(() => {
      sinon.stub(axios, "post");
    });

    afterEach(() => {
      axios.post.restore();
    });
    it("it is expected to sendSms", () => {
      const phone = "380800300466";
      const message = "Test sms";
      const key = "key";
      const sender = "Sender";

      smsClub.sendSms(phone, message, { key, sender });

      expect(axios.post.calledOnce).to.be.true;
      expect(axios.post.getCall(0).args[0]).to.equal(
        "https://im.smsclub.mobi/sms/send"
      );
      const query = JSON.parse(axios.post.getCall(0).args[1]);
      const { headers } = axios.post.getCall(0).args[2];

      expect(query.message).to.be.a("string").to.be.equal(message);
      expect(query.phone).to.be.an("array").to.deep.equal([phone]);
      expect(headers.Authorization)
        .to.be.a("string")
        .to.deep.equal(`Bearer ${key}`);
      expect(query.src_addr).to.be.a("string").to.be.equal(sender);
    });
  });

  describe(".getBalance", () => {
    beforeEach(() => {
      sinon.stub(axios, "post").returns(
        Promise.resolve({
          data: {
            success_request: {
              info: {
                money: 0.5,
              },
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

      const balance = await smsClub.getBalance({ config: { key } });

      expect(axios.post.calledOnce).to.be.true;
      expect(axios.post.getCall(0).args[0]).to.equal(
        "https://im.smsclub.mobi/sms/balance"
      );
      const { headers } = axios.post.getCall(0).args[2];

      expect(headers.Authorization)
        .to.be.a("string")
        .to.deep.equal(`Bearer ${key}`);
      expect(balance).to.eq(0.5);
    });
  });
});

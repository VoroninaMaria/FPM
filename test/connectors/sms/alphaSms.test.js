import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import alphaSms from "@local/connectors/sms/alphaSms.js";

describe("alphaSms", () => {
  describe(".sendSms", () => {
    beforeEach(() => {
      sinon.stub(axios, "post");
    });

    afterEach(() => {
      axios.post.restore();
    });
    it("it is expected to sendSms", () => {
      const phone = "380800300466";
      const smsMessage = "Test sms";
      const key = "key";
      const sender = "Sender";

      alphaSms.sendSms(phone, smsMessage, { key, sender });

      expect(axios.post.calledOnce).to.be.true;
      expect(axios.post.getCall(0).args[0]).to.equal(
        "https://alphasms.ua/api/json.php"
      );
      const query = JSON.parse(axios.post.getCall(0).args[1]);

      expect(query.data[0].sms_message)
        .to.be.a("string")
        .to.be.equal(smsMessage);
      expect(query.data[0].phone)
        .to.be.a("number")
        .to.be.equal(parseInt(phone));
      expect(query.auth).to.be.a("string").to.be.equal(key);
      expect(query.data[0].sms_signature).to.be.a("string").to.be.equal(sender);
    });
  });

  describe(".getBalance", () => {
    beforeEach(() => {
      sinon.stub(axios, "post").returns(
        Promise.resolve({
          data: {
            data: [
              {
                data: {
                  amount: 0.5,
                },
              },
            ],
          },
        })
      );
    });

    afterEach(() => {
      axios.post.restore();
    });
    it("it is expected to getBalance", async () => {
      const key = "key";

      const balance = await alphaSms.getBalance({ config: { key } });

      expect(axios.post.calledOnce).to.be.true;
      expect(axios.post.getCall(0).args[0]).to.equal(
        "https://alphasms.ua/api/json.php"
      );
      const query = JSON.parse(axios.post.getCall(0).args[1]);

      expect(query.auth).to.be.a("string").to.be.equal(key);
      expect(query.data[0].type).to.be.a("string").to.be.equal("balance");
      expect(balance).to.eq(0.5);
    });
  });
});

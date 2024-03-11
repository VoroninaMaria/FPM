import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import hicellSms from "@local/connectors/sms/hicellSms.js";

describe("hicellSms", () => {
  beforeEach(() => {
    sinon.stub(axios, "post");
  });

  afterEach(() => {
    axios.post.restore();
  });
  describe(".sendSms", () => {
    it("it is expected to sendSms", () => {
      const phone_number = "380800300466";
      const text = "Test sms";
      const key = "key";
      const sender = "Sender";

      hicellSms.sendSms(phone_number, text, { key, sender });

      expect(axios.post.calledOnce).to.be.true;
      expect(axios.post.getCall(0).args[0]).to.equal(
        "https://hicell.com/api/client/messages/sms/"
      );
      const query = JSON.parse(axios.post.getCall(0).args[1]);
      const { headers } = axios.post.getCall(0).args[2];

      expect(query.text).to.be.a("string").to.be.equal(text);
      expect(query.destinations)
        .to.be.an("array")
        .to.deep.equal([phone_number]);
      expect(headers.Authorization)
        .to.be.a("string")
        .to.deep.equal(`Token ${key}`);
      expect(query.sender).to.be.a("string").to.be.equal(sender);
    });
  });
});

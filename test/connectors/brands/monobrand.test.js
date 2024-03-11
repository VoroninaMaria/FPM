import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";

import { Monobrand } from "@local/connectors/brands/index.js";
import {
  createUserSuccessResponse,
  createUserFailResponse,
  userBalanceSuccessResponse,
  topupSuccessResponse,
  getQrSuccessResponse,
  topupHistorySuccessResponse,
  pricesSuccessResponse,
  historySuccessResponse,
  userBalanceFailResponse,
  topupFailResponse,
  getQrFailResponse,
  topupHistoryFailResponse,
  pricesFailResponse,
  historyFailResponse,
} from "@local/test/fixtures/brands/monobrand/index.js";

const config = {
  Apikey: "someApiKey",
  partnerId: "SomePartnerId",
  monobrandId: "blah_44312", // Assume this is the monobrandId for all the tests
};

describe("Monobrand", () => {
  let monobrandInstance;

  beforeEach(() => {
    monobrandInstance = new Monobrand(config);
  });

  describe("createUser", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(createUserSuccessResponse);
      });
      afterEach(() => {
        axios.post.restore();
      });

      it("check createUser success", async () => {
        const data = await monobrandInstance.createUser(config.monobrandId);

        expect(axios.post.calledOnce).to.be.true;
        expect(data.user).to.have.property(
          "uuid",
          "3e3f29c7-6f7e-48aa-bb45-375247110ba9"
        );
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").rejects({ response: createUserFailResponse });
      });
      afterEach(() => {
        axios.post.restore();
      });

      it("check createUser fail", async () => {
        try {
          await monobrandInstance.createUser(config.monobrandId);
          throw new Error("Expected method to reject.");
        } catch (error) {
          expect(axios.post.calledOnce).to.be.true;
          expect(error).to.exist;
        }
      });
    });
  });

  describe("userBalance", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(userBalanceSuccessResponse);
      });
      afterEach(() => {
        axios.get.restore();
      });

      it("check userBalance success", async () => {
        const data = await monobrandInstance.userBalance();

        expect(axios.get.calledOnce).to.be.true;
        expect(data.user).to.have.property("balance", 10000);
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").rejects({ response: userBalanceFailResponse });
      });
      afterEach(() => {
        axios.get.restore();
      });

      it("check userBalance fail", async () => {
        try {
          await monobrandInstance.userBalance();
          throw new Error("Expected method to reject.");
        } catch (error) {
          expect(axios.get.calledOnce).to.be.true;
          expect(error).to.exist;
        }
      });
    });
  });

  describe("topup", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(topupSuccessResponse);
      });
      afterEach(() => {
        axios.post.restore();
      });

      it("check topup success", async () => {
        const data = await monobrandInstance.topup(10000);

        expect(axios.post.calledOnce).to.be.true;
        expect(data).to.have.property("balance");
        expect(data.balance).to.have.property(
          "refill_link",
          "https://pay.mbnk.biz/230628E5wNkie5os3zPv"
        );
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").rejects({ response: topupFailResponse });
      });
      afterEach(() => {
        axios.post.restore();
      });

      it("check topup fail", async () => {
        try {
          await monobrandInstance.topup(10000);
          throw new Error("Expected method to reject.");
        } catch (error) {
          expect(axios.post.calledOnce).to.be.true;
          expect(error).to.exist;
        }
      });
    });
  });

  describe("getQr", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").resolves(getQrSuccessResponse);
      });
      afterEach(() => {
        axios.post.restore();
      });

      it("check getQr success", async () => {
        const data = await monobrandInstance.getQr(
          "station_example",
          "fuel_type_example"
        );

        expect(axios.post.calledOnce).to.be.true;
        expect(data).to.eql({
          card: {
            qr: {
              code: "10377+0047581D49A92",
              title: "10377+0047581",
              expire: 1687974681,
              lifetime: 60,
              pin: "0000",
            },
          },
        });
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "post").rejects({ response: getQrFailResponse });
      });
      afterEach(() => {
        axios.post.restore();
      });

      it("check getQr fail", async () => {
        try {
          await monobrandInstance.getQr("station_example", "fuel_type_example");
          throw new Error("Expected method to reject.");
        } catch (error) {
          expect(axios.post.calledOnce).to.be.true;
          expect(error).to.exist;
        }
      });
    });
  });

  describe("topupHistory", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(topupHistorySuccessResponse);
      });
      afterEach(() => {
        axios.get.restore();
      });

      it("check topupHistory success", async () => {
        const data = await monobrandInstance.topupHistory();

        expect(axios.get.calledOnce).to.be.true;
        expect(data.balance).to.eql({
          transactions: [
            {
              id: 97800,
              user_uuid: "3e3f29c7-6f7e-48aa-bb45-375247110ba9",
              date: 1687966489,
              amount: 10000,
            },
          ],
        });
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon
          .stub(axios, "get")
          .rejects({ response: topupHistoryFailResponse });
      });
      afterEach(() => {
        axios.get.restore();
      });

      it("check topupHistory fail", async () => {
        try {
          await monobrandInstance.topupHistory();
          throw new Error("Expected method to reject.");
        } catch (error) {
          expect(axios.get.calledOnce).to.be.true;
          expect(error).to.exist;
        }
      });
    });
  });

  describe("prices", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(pricesSuccessResponse);
      });
      afterEach(() => {
        axios.get.restore();
      });

      it("check prices success", async () => {
        await monobrandInstance.prices();

        expect(axios.get.calledOnce).to.be.true;
        // Add further assertions if necessary
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").rejects({ response: pricesFailResponse });
      });
      afterEach(() => {
        axios.get.restore();
      });

      it("check prices fail", async () => {
        try {
          await monobrandInstance.prices();
          throw new Error("Expected method to reject.");
        } catch (error) {
          expect(axios.get.calledOnce).to.be.true;
          expect(error).to.exist;
        }
      });
    });
  });

  describe("history", () => {
    describe("success", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").resolves(historySuccessResponse);
      });
      afterEach(() => {
        axios.get.restore();
      });

      it("check history success", async () => {
        const data = await monobrandInstance.history();

        expect(axios.get.calledOnce).to.be.true;
        expect(data).to.have.property("card");
        expect(data.card.transactions).to.eql([]);
      });
    });

    describe("fail", () => {
      beforeEach(() => {
        sinon.stub(axios, "get").rejects({ response: historyFailResponse });
      });
      afterEach(() => {
        axios.get.restore();
      });

      it("check history fail", async () => {
        try {
          await monobrandInstance.history();
          throw new Error("Expected method to reject.");
        } catch (error) {
          expect(axios.get.calledOnce).to.be.true;
          expect(error).to.exist;
        }
      });
    });
  });
});

import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import axios from "axios";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { encryptPassword } from "@local/helpers/index.js";
import {
  MERCHANT_STATUSES,
  CLIENT_STATUSES,
  SMS_SERVICE_STATUSES,
} from "@local/constants/index.js";

const encrypted_password = await encryptPassword("123123");

chai.use(chaiHttp);
const resetPasswordRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/client/auth/reset_password")
    .send(payload)
    .then(callback);

describe("Client", () => {
  describe("POST /api/client/auth/reset_password", () => {
    context("fail cases", () => {
      it("is expected to return 406 when no params passed", () =>
        resetPasswordRequest({}, (res) => {
          expect(res.status).to.eq(406);
          expect(res.body).to.have.property(
            "error",
            "missing_merchant_or_phone"
          );
        }));

      it("is expected to return 406 when merchant name is empty", () =>
        resetPasswordRequest(
          {
            merchant: "",
            phone: "380800300466",
          },
          (res) => {
            expect(res.status).to.eq(406);
            expect(res.body).to.have.property(
              "error",
              "missing_merchant_or_phone"
            );
          }
        ));

      it("is expected to return 406 when phone is empty", () =>
        resetPasswordRequest(
          {
            merchant: "uklon",
            phone: "",
          },
          (res) => {
            expect(res.status).to.eq(406);
            expect(res.body).to.have.property(
              "error",
              "missing_merchant_or_phone"
            );
          }
        ));

      it("is expected to return 406 when phone in invalid format", () =>
        resetPasswordRequest(
          {
            merchant: "uklon",
            phone: "0800300466",
          },
          (res) => {
            expect(res.status).to.eq(406);
            expect(res.body).to.have.property("error", "invalid_phone");
          }
        ));

      it("is expected to return 406 when merchant null", () =>
        resetPasswordRequest(
          {
            merchant: null,
            phone: "380800300466",
          },
          (res) => {
            expect(res.status).to.eq(406);
            expect(res.body).to.have.property(
              "error",
              "missing_merchant_or_phone"
            );
          }
        ));

      it("is expected to return 406 when phone null", () =>
        resetPasswordRequest(
          {
            merchant: "uklon",
            phone: null,
          },
          (res) => {
            expect(res.status).to.eq(406);
            expect(res.body).to.have.property(
              "error",
              "missing_merchant_or_phone"
            );
          }
        ));
    });
    context("complex cases", () => {
      beforeEach(async () => {
        sinon.stub(axios, "post").returns({
          status: 200,
          statusText: "OK",
          headers: "fake header",
          data: "{}",
        });

        const [merchant] = await Database("merchants")
          .insert([
            {
              name: "uklon",
              encrypted_password: "123123",
              status: MERCHANT_STATUSES.active.name,
              login: "offtop",
            },
          ])
          .returning("id");

        await Database("clients").insert({
          merchant_id: merchant.id,
          phone: "380800300466",
          encrypted_password,
          session_identifier: "session",
          status: CLIENT_STATUSES.confirmed.name,
        });

        await Database("sms_services").insert({
          service_name: "flySms",
          config: {
            key: "UwEA4v6sxP1ZMYCbKqKaMw2e1NmY4oGr",
            sender: "InfoCenter",
          },
          status: SMS_SERVICE_STATUSES.active.name,
          merchant_id: merchant.id,
        });
      });

      afterEach(async () => {
        axios.post.restore();
        await Database("clients").del();
        await Database("notification_logs").del();
        await Database("sms_services").del();
        await Database("merchants").del();
      });

      it("request return secret when query with valid data", () =>
        resetPasswordRequest(
          {
            phone: "380800300466",
            merchant: "uklon",
          },
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("secret");
          }
        ));

      it("should not be allowed to reset password when confirmation sms sent less than 5 min ago on reset password", () => {
        const resetPasswordPayLoad = {
          phone: "380800300466",
          merchant: "uklon",
        };

        return resetPasswordRequest(resetPasswordPayLoad, (firstRes) => {
          expect(firstRes).to.have.status(200);
          expect(firstRes.body).to.have.property("secret");

          return resetPasswordRequest(resetPasswordPayLoad, (secondRes) => {
            expect(secondRes).to.have.status(406);
            expect(secondRes.body.error).to.eq("registering_too_often");
          });
        });
      });

      it("expected to send sms for second time if previous one's been sent more than 5 min ago", () => {
        const resetPasswordPayLoad = {
          phone: "380800300466",
          merchant: "uklon",
        };

        return resetPasswordRequest(resetPasswordPayLoad, async (firstRes) => {
          expect(firstRes).to.have.status(200);
          expect(firstRes.body).to.have.property("secret");

          await Database("notification_logs").update({
            created_at: Database.raw("now() - interval '10 minutes'"),
          });

          return resetPasswordRequest(resetPasswordPayLoad, (secondRes) => {
            expect(secondRes).to.have.status(200);
            expect(secondRes.body).to.have.property("secret");
          });
        });
      });

      it("when merchant is inactive user should not be allowed to reset password", async () => {
        const payload = {
          merchant: "uklon",
          phone: "380800300466",
        };

        await Database("merchants").update({
          status: MERCHANT_STATUSES.inactive.name,
        });

        return resetPasswordRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("error", "invalid_merchant");
        });
      });

      it("when there is not merchant user should not be allowed to reset password", () => {
        const payload = {
          merchant: "uklong",
          phone: "380800300466",
        };

        return resetPasswordRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("error", "invalid_merchant");
        });
      });

      it("when there is not client, user should not be allowed to reset password, merchant name does not exist", () => {
        const payload = {
          merchant: "uber",
          phone: "380800300466",
        };

        return resetPasswordRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("error", "invalid_merchant");
        });
      });

      it("when there is not client, user should not be allowed to reset password, phone does not exist", () => {
        const payload = {
          merchant: "uklon",
          phone: "380800300467",
        };

        return resetPasswordRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("error", "forbidden");
        });
      });
    });
  });
});

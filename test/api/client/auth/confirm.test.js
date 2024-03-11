import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import {
  MERCHANT_STATUSES,
  CLIENT_STATUSES,
  SMS_SERVICE_STATUSES,
} from "@local/constants/index.js";
import { encryptPassword } from "@local/helpers/index.js";

chai.use(chaiHttp);
const encrypted_password = await encryptPassword("123123");
const accountConfirmRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/client/auth/confirm")
    .send(payload)
    .then(callback);

describe("Client", () => {
  describe("POST /api/client/auth/confirm", () => {
    context("fail cases", () => {
      it("expected to return 403 when secret empty", () =>
        accountConfirmRequest(
          {
            code: "something",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));
      it("expected to return 403 when code empty", () =>
        accountConfirmRequest(
          {
            secret: "something",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));
      it("expected to return 403 when secret null", () =>
        accountConfirmRequest(
          {
            code: "something",
            secret: null,
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));
      it("expected to return 403 when code null", () =>
        accountConfirmRequest(
          {
            code: null,
            secret: "something",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));
    });
    context("complex cases", () => {
      before(async () => {
        const [merchant] = await Database("merchants")
          .insert([
            {
              name: "uklon",
              encrypted_password,
              status: MERCHANT_STATUSES.active.name,
              login: "uklon",
            },
          ])
          .returning("id");

        const [sms_service] = await Database("sms_services")
          .insert({
            service_name: "flySms",
            config: {
              key: "UwEA4v6sxP1ZMYCbKqKaMw2e1NmY4oGr",
              sender: "InfoCenter",
            },
            status: SMS_SERVICE_STATUSES.active.name,
          })
          .returning("id");

        const [client] = await Database("clients")
          .insert({
            merchant_id: merchant.id,
            phone: "380800300466",
            status: CLIENT_STATUSES.initial.name,
          })
          .returning("id");

        await Database("notification_logs").insert({
          sms_service_id: sms_service.id,
          message: "message",
          code: "12345",
          response: {},
          account_type: "clients",
          account_id: client.id,
        });
      });

      after(async () => {
        await Database("clients").del();
        await Database("notification_logs").del();
        await Database("sms_services").del();
        await Database("merchants").del();
      });

      it("check preconditions", async () => {
        await Database("merchants")
          .where({ name: "uklon" })
          .then((merchants) => {
            expect(merchants.length).to.eq(1);
          });

        await Database("clients").then((clients) => {
          expect(clients.length).to.eq(1);
        });

        await Database("sms_services").then((sms_services) => {
          expect(sms_services.length).to.eq(1);
        });

        await Database("notification_logs").then((notification_logs) => {
          expect(notification_logs.length).to.eq(1);
        });
      });

      it("expected to confirm account", async () => {
        const [notification] = await Database("notification_logs");

        return accountConfirmRequest(
          {
            code: notification.code,
            secret: notification.id,
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("token");
          }
        );
      });

      it("when code is invalid user is not allowed to confirm account", async () => {
        const [notification] = await Database("notification_logs");

        return accountConfirmRequest(
          {
            code: "something",
            secret: notification.id,
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        );
      });

      it("when secret is invalid user is not allowed to confirm account", async () => {
        const [notification] = await Database("notification_logs");

        return accountConfirmRequest(
          {
            code: notification.code,
            secret: "09f7f679-4990-4e91-af55-f1a1abfc1c38",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        );
      });

      it("when sms is more than 5 minutes long user should not be allowed to validate account", async () => {
        await Database("notification_logs").update({
          created_at: Database.raw("now() - interval '10 minutes'"),
        });

        const [notification] = await Database("notification_logs");

        return accountConfirmRequest(
          {
            code: notification.code,
            secret: notification.id,
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        );
      });

      it("when merchant is inactive user should not be allowed to confirm account", async () => {
        await Database("merchants").update({
          status: MERCHANT_STATUSES.inactive.name,
        });

        const [notification] = await Database("notification_logs");

        return accountConfirmRequest(
          {
            code: notification.code,
            secret: notification.id,
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        );
      });

      it("when client is inactive user should not be allowed to confirm account", async () => {
        await Database("clients").update({
          status: CLIENT_STATUSES.disabled.name,
        });

        const [notification] = await Database("notification_logs");

        return accountConfirmRequest(
          {
            code: notification.code,
            secret: notification.id,
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        );
      });
    });
  });
});

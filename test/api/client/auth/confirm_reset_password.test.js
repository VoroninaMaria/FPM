import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import { Database } from "@local/lib/index.js";
import {
  MERCHANT_STATUSES,
  SMS_SERVICE_STATUSES,
} from "@local/constants/index.js";
import { encryptPassword } from "@local/helpers/index.js";

chai.use(chaiHttp);

const encrypted_password = await encryptPassword("123123");
const confirmResetPasswordRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/client/auth/confirm_reset_password")
    .send(payload)
    .then(callback);

describe("Client", () => {
  describe("POST /api/client/auth/confirm_reset_password", () => {
    context("fail cases", () => {
      it("expected to return 403 when no params passed", () =>
        confirmResetPasswordRequest({}, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("error", "forbidden");
        }));

      it("expected to return 403 when no secret passed", () =>
        confirmResetPasswordRequest(
          {
            code: "something",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("expected to return 403 when no code passed", () =>
        confirmResetPasswordRequest(
          {
            secret: "something",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("expected to return 403 when params empty", () =>
        confirmResetPasswordRequest(
          {
            code: "",
            secret: "",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));
      it("expected to return 403 when secret empty", () =>
        confirmResetPasswordRequest(
          {
            code: "something",
            secret: "",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));
      it("expected to return 403 when code empty", () =>
        confirmResetPasswordRequest(
          {
            code: "",
            secret: "something",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));
      it("expected to return 403 when params null", () =>
        confirmResetPasswordRequest(
          {
            code: null,
            secret: null,
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));
      it("expected to return 403 when secret null", () =>
        confirmResetPasswordRequest(
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
        confirmResetPasswordRequest(
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
      beforeEach(async () => {
        const [merchant] = await Database("merchants")
          .insert([
            {
              name: "uklon",
              encrypted_password,
              status: MERCHANT_STATUSES.active.name,
              login: "offtop",
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

      afterEach(async () => {
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

      it("expected to confirm reset password", async () => {
        const [notification] = await Database("notification_logs");

        return confirmResetPasswordRequest(
          {
            code: notification.code,
            secret: notification.id,
          },
          await Database("clients")
            .where({ phone: "380800300466" })
            .then(([client]) => {
              expect(client.id).to.eq(notification.account_id);
            }),
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("token");
          }
        );
      });

      it("when code is invalid user is not allowed to confirm reset password", async () => {
        const [notification] = await Database("notification_logs");

        return confirmResetPasswordRequest(
          {
            code: "54948",
            secret: notification.id,
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "forbidden");
          }
        );
      });

      it("when secret is invalid user is not allowed to confirm reset password", async () => {
        const [notification] = await Database("notification_logs");

        return confirmResetPasswordRequest(
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

      it("when sms is more than 5 minutes long user should not be allowed to reset password", async () => {
        await Database("notification_logs").update({
          created_at: Database.raw("now() - interval '10 minutes'"),
        });

        const [notification] = await Database("notification_logs");

        return confirmResetPasswordRequest(
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

      it("when there is not client, user should not be allowed to reset password", async () => {
        await Database("notification_logs").update({
          account_id: "eb790d47-2ad6-4bce-aa12-3b7456da6679",
        });

        const [notification] = await Database("notification_logs");

        return confirmResetPasswordRequest(
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

      it("when there is not merchant, user should not be allowed to reset password", async () => {
        await Database("merchants").update({
          status: MERCHANT_STATUSES.disabled.name,
        });

        const [notification] = await Database("notification_logs");

        return confirmResetPasswordRequest(
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

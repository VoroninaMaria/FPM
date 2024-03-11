import chai from "chai";
import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import chaiHttp from "chai-http";

import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import {
  MERCHANT_STATUSES,
  CLIENT_STATUSES,
  SMS_SERVICE_STATUSES,
} from "@local/constants/index.js";

chai.use(chaiHttp);

const registerRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/client/auth/register")
    .send(payload)
    .then(callback);

describe("Client", () => {
  describe("POST /api/client/auth/register", () => {
    context("fail cases", () => {
      it("should not be allowed to register when missing phone", () =>
        registerRequest(
          {
            merchant: "uklon",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property(
              "error",
              "missing_merchant_or_phone"
            );
          }
        ));

      it("should not be allowed to register when missing merchant", () =>
        registerRequest(
          {
            phone: "380800300466",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property(
              "error",
              "missing_merchant_or_phone"
            );
          }
        ));

      it("should not be allowed to register when firstName is missing", () =>
        registerRequest(
          {
            phone: "380800300466",
            merchant: "uklon",
            lastName: "Last",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property(
              "error",
              "missing_first_name_or_last_name"
            );
          }
        ));

      it("should not be allowed to register when lastName is missing", () =>
        registerRequest(
          {
            phone: "380800300466",
            merchant: "uklon",
            firstName: "First",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property(
              "error",
              "missing_first_name_or_last_name"
            );
          }
        ));

      it("should not be allowed to register when invalid phone format", () =>
        registerRequest(
          {
            phone: "+380800300466",
            merchant: "uklon",
            firstName: "First",
            lastName: "Last",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "invalid_phone");
          }
        ));

      it("should not be allowed to register when invalid merchant", () =>
        registerRequest(
          {
            phone: "380800300466",
            merchant: "unexisting_merchant",
            firstName: "First",
            lastName: "Last",
          },
          (res) => {
            expect(res).to.be.ok;
            expect(res.body).to.have.property("error", "invalid_merchant");
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

      it("expected to create account and return secret when registering with valid data", () =>
        registerRequest(
          {
            phone: "380800300466",
            merchant: "uklon",
            firstName: "First",
            lastName: "Last",
          },
          (res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("secret");
          }
        ));

      it("should not be allowed to register when confirmation sms sent less than 5 min ago on register", () => {
        const registerPayload = {
          phone: "380800300466",
          merchant: "uklon",
          firstName: "First",
          lastName: "Last",
        };

        return registerRequest(registerPayload, (firstRes) => {
          expect(firstRes).to.have.status(200);
          expect(firstRes.body).to.have.property("secret");

          return registerRequest(registerPayload, (secondRes) => {
            expect(secondRes).to.have.status(406);
            expect(secondRes.body.error).to.eq("registering_too_often");
          });
        });
      });

      it("expected to send sms for second time if previous one's been sent more than 5 min ago", () => {
        const registerPayload = {
          phone: "380800300466",
          merchant: "uklon",
          firstName: "First",
          lastName: "Last",
        };

        return registerRequest(registerPayload, async (firstRes) => {
          expect(firstRes).to.have.status(200);
          expect(firstRes.body).to.have.property("secret");

          await Database("notification_logs").update({
            created_at: Database.raw("now() - interval '10 minutes'"),
          });

          return registerRequest(registerPayload, (secondRes) => {
            expect(secondRes).to.have.status(200);
            expect(secondRes.body).to.have.property("secret");
          });
        });
      });

      it("expected to not allow for a contact to register to same merchant twice", () => {
        const registerPayload = {
          phone: "380800300466",
          merchant: "uklon",
          firstName: "First",
          lastName: "Last",
        };

        return registerRequest(registerPayload, async (firstRes) => {
          expect(firstRes).to.have.status(200);
          expect(firstRes.body).to.have.property("secret");

          await Database("clients").update({
            status: CLIENT_STATUSES.confirmed.name,
          });

          return registerRequest(registerPayload, (secondRes) => {
            expect(secondRes).to.have.status(406);
            expect(secondRes.body.error).to.eq("already_confirmed");
          });
        });
      });
    });
  });
});

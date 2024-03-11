import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";

import { smsSender } from "@local/services/index.js";
import Database from "@local/lib/Database.js";
import {
  MERCHANT_STATUSES,
  CLIENT_STATUSES,
  SMS_SERVICE_STATUSES,
} from "@local/constants/index.js";

describe("SmsSender", () => {
  context("fail cases", () => {
    it("expected to throw error when no phone", async () => {
      try {
        await smsSender({
          phone: "",
          code: "123123",
          merchant_id: "some_merchant",
        });
      } catch (error) {
        expect(error.message).to.contain("Phone is required");
      }
    });

    it("expected to throw error when no code", async () => {
      try {
        await smsSender({
          phone: "380800300466",
          code: "",
          merchant_id: "some_merchant",
        });
      } catch (error) {
        expect(error.message).to.contain("Code is required");
      }
    });

    it("expected to throw error when no merchant id", async () => {
      try {
        await smsSender({
          phone: "380800300466",
          code: "123123",
          merchant_id: "",
        });
      } catch (error) {
        expect(error.message).to.contain("Merchant id is required");
      }
    });

    it("expected to throw error when phone is null", async () => {
      try {
        await smsSender({
          phone: null,
          code: "123123",
          merchant_id: "some_merchant",
        });
      } catch (error) {
        expect(error.message).to.contain("Phone is required");
      }
    });

    it("expected to throw error when code is null", async () => {
      try {
        await smsSender({
          phone: "380800300466",
          code: null,
          merchant_id: "some_merchant",
        });
      } catch (error) {
        expect(error.message).to.contain("Code is required");
      }
    });

    it("expected to throw error when merchant id is null", async () => {
      try {
        await smsSender({
          phone: "380800300466",
          code: "123123",
          merchant_id: null,
        });
      } catch (error) {
        expect(error.message).to.contain("Merchant id is required");
      }
    });

    it("expected throw error when client not found by phone + merchant_id", async () => {
      try {
        await smsSender({
          phone: "merchant_id",
          code: "123123",
          merchant_id: "09f7f679-4990-4e91-af55-f1a1abfc1c38",
        });
      } catch (error) {
        expect(error.message).to.contain("Client not found in database");
      }
    });
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
        .insert({
          name: "uklon",
          login: "uklon",
          encrypted_password: "123123",
          status: MERCHANT_STATUSES.active.name,
          sms_fallback: true,
        })
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

      await Database("clients").insert({
        phone: "380800300466",
        merchant_id: merchant.id,
        status: CLIENT_STATUSES.initial.name,
      });
    });

    afterEach(async () => {
      axios.post.restore();
      await Database("clients").del();
      await Database("notification_logs").del();
      await Database("sms_services").del();
      await Database("merchants").del();
    });

    it("expected to send notif when found sms service with connected merchant", async () => {
      const [{ id: merchant_id }] = await Database("merchants");

      const [notification] = await smsSender({
        phone: "380800300466",
        code: "123123",
        merchant_id,
      });

      expect(notification).to.have.property("code", "123123");
    });

    it("expected to send notif when no service connected and sms_fallback=true and found available one", async () => {
      await Database("sms_services").update({ merchant_id: null });
      const [{ id: merchant_id }] = await Database("merchants");

      const [notification] = await smsSender({
        phone: "380800300466",
        code: "123123",
        merchant_id,
      });

      expect(notification).to.have.property("code", "123123");
    });

    it("expected to throw error when no service connected and sms_fallback=false", async () => {
      await Database("sms_services").update({ merchant_id: null });
      await Database("merchants").update({ sms_fallback: false });
      const [{ id: merchant_id }] = await Database("merchants");

      try {
        await smsSender({
          phone: "380800300466",
          code: "123123",
          merchant_id,
        });
      } catch (error) {
        expect(error.message).to.contain("doesn't have any active smsServices");
      }
    });

    it("expected to throw error when no service connected and sms_fallback=true but no available one found", async () => {
      await Database("sms_services").update({
        merchant_id: null,
        status: SMS_SERVICE_STATUSES.disabled.name,
      });
      const [{ id: merchant_id }] = await Database("merchants");

      try {
        await smsSender({
          phone: "380800300466",
          code: "123123",
          merchant_id,
        });
      } catch (error) {
        expect(error.message).to.contain("No available smsServices found");
      }
    });

    it("expected to throw error when service connected and sms_fallback=true but client is not active", async () => {
      await Database("clients").update({
        status: CLIENT_STATUSES.disabled.name,
      });
      const [{ id: merchant_id }] = await Database("merchants");

      try {
        await smsSender({
          phone: "380800300466",
          code: "123123",
          merchant_id,
        });
      } catch (error) {
        expect(error.message).to.contain(
          `Client is in status ${CLIENT_STATUSES.disabled.name}`
        );
      }
    });
  });
});

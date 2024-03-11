import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { decodeJwt, encryptPassword } from "@local/helpers/index.js";

chai.use(chaiHttp);

const encrypted_password = await encryptPassword("123123");
const accountLoginRequest = (payload, callback) =>
  chai
    .request(App)
    .post("/api/merchant/auth/login")
    .send(payload)
    .then(callback);

describe("Merchant", () => {
  describe("POST /api/merchant/auth/login", () => {
    context("fail cases", () => {
      it("is expected to return 403 when no params passed", () =>
        accountLoginRequest({}, (res) => {
          expect(res.status).to.eq(403);
          expect(res.body).to.have.property("error", "invalid_login_data");
        }));

      it("is expected to return 403 when login empty", () =>
        accountLoginRequest(
          {
            login: "",
            password: "123123",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "invalid_login_data");
          }
        ));

      it("is expected to return 403 when password empty", () =>
        accountLoginRequest(
          {
            login: "offtop",
            password: "",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "invalid_login_data");
          }
        ));

      it("is expected to return 403 when login null", () =>
        accountLoginRequest(
          {
            login: null,
            password: "123123",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "invalid_login_data");
          }
        ));

      it("is expected to return 403 when password null", () =>
        accountLoginRequest(
          {
            login: "offtop",
            password: null,
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "invalid_login_data");
          }
        ));
      it("is expected to return 403 when login undefined", () =>
        accountLoginRequest(
          {
            password: "123123",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "invalid_login_data");
          }
        ));

      it("is expected to return 403 when password undefined", () =>
        accountLoginRequest(
          {
            login: "offtop",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "invalid_login_data");
          }
        ));
    });
    context("complex cases", () => {
      before(async () => {
        await Database("merchants").insert([
          {
            login: "offtop",
            encrypted_password,
            session_identifier: "session",
            name: "uklon",
            status: "active",
          },
          {
            login: "inaccessible_merchant",
            encrypted_password,
            session_identifier: "session",
            name: "inaccessible_merchant",
            status: "blocked",
          },
        ]);
      });

      after(async () => {
        await Database("merchants").del();
      });

      it("check preconditions", async () => {
        await Database("merchants").then((merchants) => {
          expect(merchants.length).to.eq(2);
        });
      });

      it("success case", () => {
        const payload = {
          login: "offtop",
          password: "123123",
        };

        return accountLoginRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("token");

          const decodedJwt = decodeJwt(res.body.token);

          return Database("merchants")
            .where({ login: payload.login })
            .first()
            .then((merchant) => {
              expect(merchant.session_identifier).not.to.eq("session");

              expect(merchant.session_identifier).to.eq(
                decodedJwt.session_identifier
              );
              expect(merchant.id).to.eq(decodedJwt.id);
            });
        });
      });

      it("when merchant is not active he shouldn't be able to login", () => {
        const payload = {
          login: "inaccessible_merchant",
          password: "123123",
        };

        return accountLoginRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("error", "blocked");
        });
      });

      it("when password is invalid user should not be allowed to login", () => {
        const payload = {
          login: "offtop",
          password: "12312",
        };

        return accountLoginRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("error", "invalid_login_data");
        });
      });
      it("when login is invalid user should not be allowed to login", () => {
        const payload = {
          login: "oftop",
          password: "123123",
        };

        return accountLoginRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("error", "invalid_login_data");
        });
      });
    });
  });
});

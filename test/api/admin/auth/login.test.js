import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { decodeJwt, encryptPassword } from "@local/helpers/index.js";

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/admin/auth/login").send(payload).then(callback);

const encrypted_password = await encryptPassword("123123");

describe("Admin", () => {
  describe("POST /api/admin/auth/login", () => {
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
      before(() =>
        Database("admins")
          .insert({
            login: "offtop",
            encrypted_password,
            session_identifier: "session",
          })
          .returning("*")
      );

      after(() => Database("admins").del());

      it("check preconditions", () =>
        Database("admins")
          .where({ login: "offtop" })
          .then((admins) => expect(admins.length).to.eq(1)));

      it("success case", () => {
        const payload = {
          login: "offtop",
          password: "123123",
        };

        return accountLoginRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("token");

          const decodedJwt = decodeJwt(res.body.token);

          return Database("admins")
            .first()
            .then((admin) => {
              expect(admin.session_identifier).not.to.eq("session");

              expect(admin.session_identifier).to.eq(
                decodedJwt.session_identifier
              );
              expect(admin.id).to.eq(decodedJwt.id);
            });
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

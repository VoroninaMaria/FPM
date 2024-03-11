import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";
import Database from "@local/lib/Database.js";
import { decodeJwt, encryptPassword } from "@local/helpers/index.js";
import { MERCHANT_STATUSES, CLIENT_STATUSES } from "@local/constants/index.js";

chai.use(chaiHttp);
const accountLoginRequest = (payload, callback) =>
  chai.request(App).post("/api/client/auth/login").send(payload).then(callback);

const encrypted_password = await encryptPassword("123123");

describe("Client", () => {
  describe("POST /api/client/auth/login", () => {
    context("fail cases", () => {
      it("is expected to return 403 when no params passed", () =>
        accountLoginRequest({}, (res) => {
          expect(res.status).to.eq(403);
          expect(res.body).to.have.property("error", "forbidden");
        }));

      it("is expected to return 403 when merchant empty", () =>
        accountLoginRequest(
          {
            merchant: "",
            phone: "380800300466",
            password: "123123",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("is expected to return 403 when phone empty", () =>
        accountLoginRequest(
          {
            merchant: "uklon",
            phone: "",
            password: "123123",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("is expected to return 403 when phone in invalid format", () =>
        accountLoginRequest(
          {
            merchant: "uklon",
            phone: "38080030046",
            password: "123123",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("is expected to return 403 when password empty", () =>
        accountLoginRequest(
          {
            merchant: "uklon",
            phone: "380800300466",
            password: "",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("is expected to return 403 when merchant null", () =>
        accountLoginRequest(
          {
            merchant: null,
            phone: "380800300466",
            password: "123123",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("is expected to return 403 when phone null", () =>
        accountLoginRequest(
          {
            merchant: "uklon",
            phone: null,
            password: "123123",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("is expected to return 403 when password null", () =>
        accountLoginRequest(
          {
            merchant: "uklon",
            phone: "380800300466",
            password: null,
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("is expected to return 403 when no password passed", () =>
        accountLoginRequest(
          {
            merchant: "uklon",
            phone: "380800300466",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("is expected to return 403 when no phone passed", () =>
        accountLoginRequest(
          {
            merchant: "uklon",
            password: "123123",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));

      it("is expected to return 403 when no merchant passed", () =>
        accountLoginRequest(
          {
            phone: "380800300466",
            password: "123123",
          },
          (res) => {
            expect(res.status).to.eq(403);
            expect(res.body).to.have.property("error", "forbidden");
          }
        ));
    });
    context("complex cases", () => {
      before(async () => {
        const [merchant] = await Database("merchants")
          .insert({
            name: "uklon",
            encrypted_password: "123123",
            status: MERCHANT_STATUSES.active.name,
            login: "offtop",
          })
          .returning("id");

        await Database("clients").insert({
          merchant_id: merchant.id,
          phone: "380800300466",
          encrypted_password,
          session_identifier: "session",
          status: CLIENT_STATUSES.confirmed.name,
        });
        await Database("clients").insert({
          merchant_id: merchant.id,
          phone: "380800300467",
          encrypted_password,
          session_identifier: "session",
          status: CLIENT_STATUSES.confirmed.name,
        });
      });

      after(async () => {
        await Database("clients").del();
        await Database("merchants").del();
      });

      it("check preconditions", async () => {
        await Database("merchants")
          .where({ name: "uklon" })
          .then((merchants) => {
            expect(merchants.length).to.eq(1);
          });

        await Database("clients").then((clients) => {
          expect(clients.length).to.eq(2);
        });
      });

      it("success case and not affectint other clients", () => {
        const payload = {
          merchant: "uklon",
          phone: "380800300466",
          password: "123123",
        };

        return accountLoginRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("token");

          const decodedJwt = decodeJwt(res.body.token);

          return Database("clients")
            .where({ phone: "380800300466" })
            .first()
            .then((client) => {
              expect(client.session_identifier).not.to.eq("session");
              expect(client.session_identifier).to.eq(
                decodedJwt.session_identifier
              );
              expect(client.id).to.eq(decodedJwt.id);

              return Database("clients")
                .where({ phone: "380800300467" })
                .first()
                .then((client1) => {
                  expect(client1.session_identifier).to.eq("session");
                });
            });
        });
      });

      // it("when merchant is inactive user should not be allowed to login", async () => {
      //   const payload = {
      //     merchant: "uklon",
      //     phone: "380800300466",
      //     password: "123123",
      //   };

      //   await Database("merchants").update({
      //     status: MERCHANT_STATUSES.inactive.name,
      //   });

      //   return accountLoginRequest(payload, (res) => {
      //     expect(res).to.be.ok;
      //     expect(res.body).to.have.property("error", "forbidden");
      //   });
      // });

      // it("when client is inactive user should not be allowed to login", async () => {
      //   const payload = {
      //     merchant: "uklon",
      //     phone: "380800300466",
      //     password: "123123",
      //   };

      //   await Database("clients").update({
      //     status: CLIENT_STATUSES.disabled.name,
      //   });

      //   return accountLoginRequest(payload, (res) => {
      //     expect(res).to.be.ok;
      //     expect(res.body).to.have.property("error", "forbidden");
      //   });
      // });

      // it("when password is invalid user should not be allowed to login", () => {
      //   const payload = {
      //     merchant: "uklon",
      //     phone: "380800300466",
      //     password: "12312",
      //   };

      //   return accountLoginRequest(payload, (res) => {
      //     expect(res).to.be.ok;
      //     expect(res.body).to.have.property("error", "forbidden");
      //   });
      // });

      it("when number is invalid user should not be allowed to login", () => {
        const payload = {
          merchant: "uklon",
          phone: "0800300466",
          password: "123123",
        };

        return accountLoginRequest(payload, (res) => {
          expect(res).to.be.ok;
          expect(res.body).to.have.property("error", "forbidden");
        });
      });
    });
  });
});

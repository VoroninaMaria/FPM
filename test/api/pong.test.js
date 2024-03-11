import chai from "chai";
import chaiHttp from "chai-http";
import App from "@local/app/app.js";

chai.use(chaiHttp);
chai.should();
describe("Ping", () => {
  ["admin", "merchant", "client"].forEach((route) =>
    context(`GET /api/${route}/ping`, () => {
      it("should return pong", (done) => {
        chai
          .request(App)
          .get(`/api/${route}/ping`)
          .end((err, res) => {
            res.should.have.status(200);
            res.text.should.eq("pong!");
            done();
          });
      });
    })
  );
  context("GET /api/other/ping", () => {
    it("should return 404 Error", (done) => {
      chai
        .request(App)
        .get("/api/other/ping")
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

import webClient from "./webClient.js";
import moment from "moment";

const authProvider = {
  login: ({ username, password }) =>
    webClient()
      .post("/api/admin/auth/login", { login: username, password })
      .then(({ data: { token } }) => localStorage.setItem("token", token))
      .catch(({ code }) => {
        localStorage.removeItem("token");

        if (code === "ERR_NETWORK") {
          localStorage.removeItem("token");

          return Promise.reject({
            redirectTo: "/credentials-required",
          });
        }
        if (code.includes("BAD_REQUEST") || code.includes("Unauthorized")) {
          return Promise.reject({
            message:
              moment.locale() === "en"
                ? "Login or password incorrect"
                : "Ім'я або пароль введено невірно",
          });
        }
      }),

  logout: () => {
    localStorage.removeItem("token");

    return Promise.resolve();
  },

  checkError: ({ status }) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");

      return Promise.reject({ redirectTo: "/credentials-required" });
    }

    return Promise.resolve();
  },

  checkAuth: () => {
    if (!localStorage.getItem("token"))
      return Promise.reject({ message: "login.required" });

    return webClient()
      .post("/api/admin/auth/checkAuth")
      .then(() => Promise.resolve(true))
      .catch(() => {
        localStorage.removeItem("token");

        return Promise.reject({ message: "login.required" });
      });
  },

  getPermissions: () => Promise.resolve(),
};

export default authProvider;

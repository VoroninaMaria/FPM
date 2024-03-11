import webClient from "./webClient.js";
import moment from "moment";

const sessionItems = ["token", "id"];

const loginEvent = new Event("login");

const authProvider = {
  login: ({ username, password }) =>
    webClient()
      .post("/api/merchant/auth/login", { login: username, password })
      .then(({ data: { token, id, plugins } }) => {
        localStorage.setItem("token", token);
        localStorage.setItem("id", id);
        localStorage.setItem("plugins", plugins);
        window.dispatchEvent(loginEvent);
      })
      .catch((error) => {
        const message = error.response?.data.error;

        localStorage.removeItem("token");

        if (error.code.includes("ERR_NETWORK")) {
          localStorage.removeItem("token");

          return Promise.reject({
            redirectTo: "/credentials-required",
          });
        }

        if (message === "invalid_login_data") {
          return Promise.reject({
            message:
              moment.locale() === "en"
                ? "Login or password is incorrect"
                : "Ім'я або пароль введено невірно",
          });
        }

        if (message === "blocked") {
          return Promise.reject({
            message:
              moment.locale() === "en"
                ? "Your account has been blocked"
                : "Ваш акаунт було заблоковано",
          });
        }
      }),

  logout: () => {
    sessionItems.forEach((key) => localStorage.removeItem(key));

    return Promise.resolve();
  },

  checkError: ({ status }) => {
    if (status === 401 || status === 403) {
      sessionItems.forEach((key) => localStorage.removeItem(key));

      return Promise.reject({ redirectTo: "/credentials-required" });
    }

    return Promise.resolve();
  },

  checkAuth: () => {
    if (!localStorage.getItem("token"))
      return Promise.reject({ message: "login.required" });

    return webClient()
      .post("/api/merchant/auth/checkAuth")
      .then(() => Promise.resolve(true))
      .catch(() => {
        sessionItems.forEach((key) => localStorage.removeItem(key));

        return Promise.reject({ message: "login.required" });
      });
  },

  getPermissions: () => Promise.resolve(),
};

export default authProvider;

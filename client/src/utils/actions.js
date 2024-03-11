export const login = (storage) => {
  storage.callbacks.redirect({ page: "Loader" });
};
export const OtpConfirm = (storage) => {
  storage.callbacks.setToken("123");
  storage.callbacks.redirect({ page: "Loader" });
};
export const Register = (storage) => {
  storage.callbacks.setPhone("");
  storage.callbacks.redirect({ page: "OtpConfirm" });
};

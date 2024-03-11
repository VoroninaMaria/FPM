import axios from "axios";
import config from "../config.js";

const webClient = () =>
  axios.create({
    baseURL: config.serverUrl,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });

export default webClient;

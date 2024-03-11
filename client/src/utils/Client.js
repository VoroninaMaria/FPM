import axios from "axios";
import Config from "../config";

axios.defaults.baseURL = Config.baseUrl;
axios.defaults.headers.common["Content-Type"] = "application/json";

const Client = {
  getConfig: () =>
    axios.get(`${Config.baseUrl}/design?merchant=${Config.merchant}`),
  getConfigMD5: () =>
    axios.get(`${Config.baseUrl}/design/md5?merchant=${Config.merchant}`),
};

export default Client;

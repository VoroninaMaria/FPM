import axios from "axios";
import { PATHS } from "./constants.js";
class Monobrand {
  Apikey;
  baseUrl;
  monobrandId;
  constructor(config) {
    this.Apikey = config.Apikey;
    this.baseUrl = `https://${config.partnerId}.api.partners.mnbrnd.com/`;
    this.monobrandId = config.monobrandId;
  }
  buildUrl(action) {
    return `${this.baseUrl}${PATHS[action]}`;
  }
  async skeletonGet(action) {
    const response = await axios.get(this.buildUrl(action), {
      headers: {
        Apikey: this.Apikey,
        "User-Uuid": this.monobrandId,
      },
    });

    return response.data.data;
  }
  async skeletonPost(action, body) {
    const response = await axios.post(this.buildUrl(action), body, {
      headers: {
        Apikey: this.Apikey,
        "User-Uuid": this.monobrandId,
      },
    });

    return response.data.data;
  }
  async createUser(userId) {
    return this.skeletonPost("createUser", {
      user: { id: userId },
    });
  }
  async topup(amount) {
    return this.skeletonPost("topup", {
      refill: { amount },
    });
  }
  async getQr(station, fuel_type) {
    return this.skeletonPost("getQr", {
      qr: { station, fuel_type },
    });
  }
  async userBalance() {
    return this.skeletonGet("userBalance");
  }
  async topupHistory() {
    return this.skeletonGet("topupHistory");
  }
  async prices() {
    return this.skeletonGet("prices");
  }
  async history() {
    return this.skeletonGet("history");
  }
}
export default Monobrand;

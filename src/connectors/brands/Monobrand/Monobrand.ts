import axios, { AxiosResponse } from "axios";
import { PATHS } from "./constants";
import type { Config, MonoBrandResponse } from "./types";

class Monobrand {
  private readonly Apikey: string;
  private readonly baseUrl: string;
  private readonly monobrandId: string;

  constructor(config: Config) {
    this.Apikey = config.Apikey;
    this.baseUrl = `https://${config.partnerId}.api.partners.mnbrnd.com/`;
    this.monobrandId = config.monobrandId;
  }

  private buildUrl(action: keyof typeof PATHS): string {
    return `${this.baseUrl}${PATHS[action]}`;
  }

  private async skeletonGet(action: keyof typeof PATHS): MonoBrandResponse {
    const response: AxiosResponse<{ data: any }> = await axios.get(
      this.buildUrl(action),
      {
        headers: {
          Apikey: this.Apikey,
          "User-Uuid": this.monobrandId,
        },
      }
    );
    return response.data.data;
  }

  private async skeletonPost(
    action: keyof typeof PATHS,
    body: any
  ): MonoBrandResponse {
    const response: AxiosResponse<{ data: any }> = await axios.post(
      this.buildUrl(action),
      body,
      {
        headers: {
          Apikey: this.Apikey,
          "User-Uuid": this.monobrandId,
        },
      }
    );
    return response.data.data;
  }

  public async createUser(userId: string): MonoBrandResponse {
    return this.skeletonPost("createUser", {
      user: { id: userId },
    });
  }

  public async topup(amount: number): MonoBrandResponse {
    return this.skeletonPost("topup", {
      refill: { amount },
    });
  }

  public async getQr(station: string, fuel_type: string): MonoBrandResponse {
    return this.skeletonPost("getQr", {
      qr: { station, fuel_type },
    });
  }

  public async userBalance(): MonoBrandResponse {
    return this.skeletonGet("userBalance");
  }

  public async topupHistory(): MonoBrandResponse {
    return this.skeletonGet("topupHistory");
  }

  public async prices(): MonoBrandResponse {
    return this.skeletonGet("prices");
  }

  public async history(): MonoBrandResponse {
    return this.skeletonGet("history");
  }
}

export default Monobrand;

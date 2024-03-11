import axios, { AxiosResponse } from "axios";
import crypto from "crypto";
import { Config, LiqPayResponse } from "./types";

class LiqPay {
  private readonly public_key: string;
  private readonly private_key: string;
  private readonly host: string;
  private availableLanguages: string[];
  private buttonTranslations: { [key: string]: string };

  constructor(config: Config) {
    this.public_key = config.public_key;
    this.private_key = config.private_key;
    this.host = "https://www.liqpay.ua/api/";
    this.availableLanguages = ["uk", "en"];
    this.buttonTranslations = { uk: "Сплатити", en: "Pay" };
  }

  public async cardPayment(params: any): LiqPayResponse {
    //type server-server
    // Receiving payment from the customer on your site without the customer go to the payment page
    if (!params.version) {
      throw new Error("Required param 'version' is null");
    }

    params.public_key = this.public_key;
    const data = Buffer.from(JSON.stringify(params)).toString("base64");
    const signature = this.str_to_sign(
      this.private_key + data + this.private_key
    );

    const response: AxiosResponse<{ data: any }> = await axios.post(
      this.host + "request",
      {
        data: data,
        signature: signature,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Request failed with status code: ${response.status}`);
    }
  }

  public checkoutForm(params: any): string {
    // type client-server
    // Personalized payment page - 10 payment methods
    let buttonText = this.buttonTranslations.uk;
    if (params.language) {
      buttonText =
        this.buttonTranslations[params.language] || this.buttonTranslations.uk;
    }

    params = this.cnb_params(params);
    const data = Buffer.from(JSON.stringify(params)).toString("base64");
    const signature = this.str_to_sign(
      this.private_key + data + this.private_key
    );

    return `<form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
              <input type="hidden" name="data" value="${data}" />
              <input type="hidden" name="signature" value="${signature}" />
              <div style="text-align: center">
                  <script type="text/javascript" src="https://static.liqpay.ua/libjs/sdk_button.js"></script>
                  <sdk-button label="${buttonText}" background="#77CC5D" onClick="submit()"></sdk-button>
              </div>
            </form>
    `;
  }

  public cnb_signature(params: any): string {
    params = this.cnb_params(params);
    const data = Buffer.from(JSON.stringify(params)).toString("base64");
    return this.str_to_sign(this.private_key + data + this.private_key);
  }

  private cnb_params(params: any): any {
    params.public_key = this.public_key;

    if (params.version) {
      if (
        typeof params.version === "string" &&
        !isNaN(Number(params.version))
      ) {
        params.version = Number(params.version);
      } else if (typeof params.version !== "number") {
        throw new Error(
          "version must be a number or a string that can be converted to a number"
        );
      }
    } else {
      throw new Error("version is null");
    }

    if (params.amount) {
      if (typeof params.amount === "string" && !isNaN(Number(params.amount))) {
        params.amount = Number(params.amount);
      } else if (typeof params.amount !== "number") {
        throw new Error(
          "amount must be a number or a string that can be converted to a number"
        );
      }
    } else {
      throw new Error("amount is null");
    }

    const stringParams = [
      "action",
      "currency",
      "description",
      "order_id",
      "language",
    ];
    for (const param of stringParams) {
      if (params[param] && typeof params[param] !== "string") {
        params[param] = String(params[param]);
      } else if (!params[param] && param !== "language") {
        throw new Error(`${param} is null or not provided`);
      }
    }

    if (params.language && !this.availableLanguages.includes(params.language)) {
      throw new Error(
        `Invalid language: ${
          params.language
        }. Supported languages are: ${this.availableLanguages.join(", ")}`
      );
    }

    return params;
  }

  private str_to_sign(str: string): string {
    if (typeof str !== "string") {
      throw new Error("Input must be a string");
    }

    const sha1 = crypto.createHash("sha1");
    sha1.update(str);
    return sha1.digest("base64");
  }

  public cnb_object(params: any): { data: string; signature: string } {
    params.language = params.language || "uk";
    params = this.cnb_params(params);
    const data = Buffer.from(JSON.stringify(params)).toString("base64");
    const signature = this.str_to_sign(
      this.private_key + data + this.private_key
    );
    return { data, signature };
  }
}

export default LiqPay;

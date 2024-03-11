import { Database } from "@local/app/lib/index.js";
import {
  PAYMENT_GATEWAY_STATUSES,
  MERCHANT_PAYMENT_GATEWAY_STATUSES,
} from "@local/app/constants/index.js";
import PaymentGateways from "@local/app/connectors/payment_gateways/index.js";
class Merchant {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.sms_fallback = data.sms_fallback;
    this.status = data.status;
    this.encrypted_password = data.encrypted_password;
    this.session_identifier = data.session_identifier;
    this.login = data.login;
    this.default_category_id = data.default_category_id;
    this.newbie = data.newbie;
    this.storage_capacity = data.storage_capacity;
    this.design_id = data.design_id;
    this.plugins = data.plugins;
    return this;
  }

  static find = async (id) => {
    const data = await Database("merchants").select("*").where({ id }).first();

    return new Merchant(data);
  };

  defaultMpg = () =>
    Database("merchant_payment_gateways")
      .select("*")
      .where({
        merchant_id: this.id,
        default: true,
        status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
      })
      .first();

  paymentGatewayService = () =>
    this.defaultMpg().then((mpg) =>
      Database("payment_gateways")
        .select("*")
        .where({
          id: mpg.payment_gateway_id,
          status: PAYMENT_GATEWAY_STATUSES.active.name,
        })
        .first()
    );

  paymentGateway = () =>
    this.defaultMpg().then(
      (mpg) =>
        new PaymentGateways[this.paymentGatewayService().name](mpg.config)
    );

  checkPaymentTrunc = async ({ id }) => {
    const trunc = await Database("payment_truncs")
      .where({ id })
      .select("*")
      .first();

    if (!trunc) return;
    const mpg = await this.defaultMpg();

    if (!mpg) return;

    const paymentGatewayService = await this.paymentGatewayService();

    if (!paymentGatewayService) return;

    const PaymentGateway = await this.paymentGateway();

    const payment = await PaymentGateway.status({
      id: trunc.transactions[0].id,
      config_id: mpg.config_id,
    });

    return Database("payment_truncs")
      .where({ id: trunc.id })
      .update({
        status: payment.status,
        transactions: JSON.stringify([...trunc.transactions, payment]),
      })
      .returning("*")
      .then(([trunc]) => trunc);
  };

  createPaymentTrunc = async ({
    amount,
    description,
    short_description,
    title,
    client_id,
  }) => {
    const mpg = await Database("merchant_payment_gateways")
      .select("*")
      .where({
        merchant_id: this.id,
        default: true,
        status: MERCHANT_PAYMENT_GATEWAY_STATUSES.active.name,
      })
      .first();

    if (!mpg) return;

    const paymentGatewayService = await Database("payment_gateways")
      .select("*")
      .where({
        id: mpg.payment_gateway_id,
        status: PAYMENT_GATEWAY_STATUSES.active.name,
      })
      .first();

    if (!paymentGatewayService) return;

    const PaymentGateway = new PaymentGateways[paymentGatewayService.name](
      mpg.config
    );

    const [trunc] = await Database("payment_truncs")
      .insert({
        amount,
        description,
        short_description,
        title,
        merchant_payment_gateway_id: mpg.id,
        client_id,
        status: "pending",
      })
      .returning("*");

    const payment = await PaymentGateway.hold({
      amount,
      external_id: trunc.id,
      description,
      short_description,
      client: {
        source: "external",
        id: trunc.client_id,
      },
      config_id: mpg.config_id,
      title,
    });

    return Database("payment_truncs")
      .where({ id: trunc.id })
      .update({
        status: "pending",
        transactions: JSON.stringify([payment]),
      })
      .returning("*")
      .then(([trunc]) => trunc);
  };
}
export default Merchant;

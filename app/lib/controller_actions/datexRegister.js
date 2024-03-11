import { Datex } from "@local/app/connectors/brands/index.js";
import { Database } from "@local/lib/index.js";

const datexRegister = async (client, merchant) => {
  const brand = await Database("brands").where({ name: "Datex" }).first();
  const datexConfig = await Database("brand_merchants")
    .where({ merchant_id: merchant.id, brand_id: brand.id })
    .first();
  const datex = new Datex(datexConfig.config);

  const [dtxClient] = await datex.createClient({
    euid: client.id,
    fullName: `${client.first_name} ${client.last_name}`,
    shortName: client.first_name,
    ownership: 1,
    etalonId: 1,
  });

  const [result] = await datex.updateClient({
    id_clients: dtxClient.out_id_client,
    phones: client.phone,
  });

  const clientAcc = await datex.createClientAccount({
    account: 1,
    account_owner: result.id_clients,
    day_limit: 0.0,
    day_limit_rest: 0.0,
    month_limit: 0.0,
    month_limit_rest: 0.0,
    title: "ДП_ГРН",
    active: true,
    is_main_account: true,
    version_id: result.version_id,
  });

  await datex.createQRCard(result.id_clients).then(async () => {
    const qrCard = await datex.getClientQRCard(result.id_clients);

    return datex.createQRCardAccount(qrCard.id).then((card) => card);
  });

  await datex.close();

  return clientAcc;
};

export default datexRegister;

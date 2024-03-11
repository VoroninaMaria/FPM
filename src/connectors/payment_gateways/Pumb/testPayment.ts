/*
import Pumb from "./Pumb";
import { v4 as uuidv4 } from "uuid";

const pumb = new Pumb({
  baseUrl: "https:innsmouth.payhub.com.ua",
  login: "svc_ph_test_ptrn",
  password: "quxS2&56xvatPZz66LKG8sJQHn3ZYVSA",
  client: "transacter",
  merchant_config_id: "c949382b-ddd0-4b13-94d3-713dfa3e8cca",
  config_id: "e137fdbc-30ac-470d-8b77-862bad72152f",
});

const external_id = uuidv4();
console.log("external_id", external_id);
const transaction = await pumb.trunc({
  amount: 1000,
  external_id,
  description: "description",
  short_description: "short description test",
  client: {
    source: "external",
    id: "test",
  },
  config_id: "e137fdbc-30ac-470d-8b77-862bad72152f",
  title: "test",
});

console.log("Transaction:", transaction);

const status = await pumb.status({ id: transaction.id });

console.log("status", status);
console.log("transaction_id", transaction.id);
console.log("pumb", pumb);
*/

import Datex from "./Datex.js";

const datex = new Datex({
  user: "postgres",
  database: "datex_sample",
  host: "localhost",
});

// eslint-disable-next-line no-console
// console.log(
//   await datex.getAllTransactions({})
// );
// const [totalCount] = await datex.getTotalTransactions();

// console.log(
//   await datex
//     .updateClient({
//       id_clients: 1732,
//       fn_clients: "Belka Blanch",
//       sn_clients: "Belka",
//       phones: "380000000001",
//       email: "belka@gmail.com",
//       city: "LA",
//       address: "909-1/2 E 49th St Los Angeles, California(CA), 90011",
//     })
//     .then(([client]) => client)
// );

// console.log(
//   await datex.createClient({
//     euid: "10b97107-28bd-468f-87dc-c781883dd7c6",
//     fullName: "Михайло Поплавський",
//     shortName: "Михайло",
//     ownership: 1,
//     etalonId: 1,
//   })
// );

// console.log(await datex.createQRCard(1756));
// console.log(await datex.createQRCardAccount(9088));
// console.log(await datex.getClientQRCard(1756));

// const client = await datex.clientIdByExternalId(
//   "5dd76cdd-b8a5-4853-b040-8b591581d9f8"
// );

// console.log(await datex.getClientJurQRCard("1772212424", "380631397661"));

// console.log(client.id_clients);
export default datex;

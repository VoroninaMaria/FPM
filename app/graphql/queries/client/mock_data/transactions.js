import { Database } from "@local/lib/index.js";

let transactions = [
  {
    id: "2a7a133d-86e2-4078-a3c0-a2ae335640d0",
    type: "topup",
    amount: 672,
    date: "1695542968000",
  },
  {
    id: "401753fe-c3af-46bc-bae8-d0554151708d",
    type: "transfer",
    amount: 7159,
    date: "1695758697000",
  },
  {
    id: "f55908bd-0b7a-4bad-b792-86f776444563",
    type: "buy",
    amount: 290,
    date: "1694902843000",
    fuel_qty: 550,
    saved_money: 223,
    fuel_type: "A-95",
    place: "Харків",
    brand: "WOG",
  },
  {
    id: "87264f84-65a4-4a5d-8878-868ed1b8e8af",
    type: "topup",
    amount: 9622,
    date: "1694627067000",
  },
  {
    id: "6f3e4ba8-bef6-4d43-a0b3-097a81721f84",
    type: "topup",
    amount: 9222,
    date: "1694590325000",
  },
  {
    id: "dbe01ebd-6bfb-4ef6-9fcd-3b843b1b09d2",
    type: "buy",
    amount: 8767,
    date: "1694985925000",
    fuel_qty: 544,
    saved_money: 251,
    fuel_type: "A-95",
    place: "Кропивницький",
    brand: "ОККО",
  },
  {
    id: "62477708-eb13-4983-8c72-c86431a2a55c",
    type: "topup",
    amount: 9725,
    date: "1696244214000",
  },
  {
    id: "6897fa00-d866-4d8f-bca8-733238dd8366",
    type: "transfer",
    amount: 6940,
    date: "1694276321000",
  },
  {
    id: "7c841c59-24a5-461d-9611-3b4b92b06fc9",
    type: "transfer",
    amount: 9251,
    date: "1693901625000",
  },
  {
    id: "c1a213f9-0c56-4bad-b54c-5b427ddc782e",
    type: "topup",
    amount: 4182,
    date: "1695994538000",
  },
  {
    id: "21929536-4a61-4e82-8d96-4569a151842a",
    type: "buy",
    amount: 4825,
    date: "1694657071000",
    fuel_qty: 633,
    saved_money: 397,
    fuel_type: "ДП",
    place: "Київ",
    brand: "Лукойл",
  },
  {
    id: "3ce0412e-ba0b-4c4d-96ae-c39cf328fb21",
    type: "topup",
    amount: 9477,
    date: "1695978591000",
  },
  {
    id: "a6bb3fcd-28a4-4eb0-9eba-3c98d970c33e",
    type: "transfer",
    amount: 1180,
    date: "1695598276000",
  },
  {
    id: "07b3a0c0-63de-4ce3-a001-fe7a1453dfba",
    type: "buy",
    amount: 7641,
    date: "1695188738000",
    fuel_qty: 483,
    saved_money: 286,
    fuel_type: "A-98",
    place: "Київ",
    brand: "WOG",
  },
  {
    id: "1c0e91c3-1707-4607-9326-76046eb7d91c",
    type: "transfer",
    amount: 2454,
    date: "1694423050000",
  },
  {
    id: "9a9cacb9-5bf1-4939-befa-879d4c905f3f",
    type: "buy",
    amount: 7695,
    date: "1695552621000",
    fuel_qty: 802,
    saved_money: 256,
    fuel_type: "A-92",
    place: "Львів",
    brand: "Лукойл",
  },
  {
    id: "33f524e2-724e-403a-8c7a-18d5a9e407d8",
    type: "topup",
    amount: 7056,
    date: "1694079776000",
  },
  {
    id: "f01260ab-8bef-4a56-a8a7-936315248d61",
    type: "transfer",
    amount: 7254,
    date: "1695596015000",
  },
  {
    id: "a9335a14-c194-4b91-8190-8abc60f5b37b",
    type: "transfer",
    amount: 8937,
    date: "1694167810000",
  },
  {
    id: "1b7ab924-5b61-4664-97db-d555b415b97b",
    type: "buy",
    amount: 1944,
    date: "1694729744000",
    fuel_qty: 254,
    saved_money: 868,
    fuel_type: "ДП",
    place: "Харків",
    brand: "Shell",
  },
  {
    id: "64d2790d-cd0a-497f-a91e-cfa9a8737e9a",
    type: "transfer",
    amount: 4603,
    date: "1695623692000",
  },
  {
    id: "5e4a52aa-f80e-45a0-b8a7-195125e41ebc",
    type: "buy",
    amount: 8364,
    date: "1695337100000",
    fuel_qty: 445,
    saved_money: 777,
    fuel_type: "A-92",
    place: "Чернівці",
    brand: "Shell",
  },
  {
    id: "1e210477-5a88-4941-8f91-4523de50eda1",
    type: "buy",
    amount: 3923,
    date: "1696225196000",
    fuel_qty: 751,
    saved_money: 49,
    fuel_type: "ДП",
    place: "Дніпро",
    brand: "Лукойл",
  },
  {
    id: "84507d9a-8364-4223-a0a1-a871b409a93b",
    type: "topup",
    amount: 2966,
    date: "1694330361000",
  },
  {
    id: "51cea74d-781d-49f8-a5ae-3ff1cc3918ab",
    type: "transfer",
    amount: 9924,
    date: "1696204036000",
  },
  {
    id: "15d98112-2f03-43fc-a7c8-f18f91198b7f",
    type: "topup",
    amount: 3538,
    date: "1694682169000",
  },
  {
    id: "2e789887-0256-4503-b51a-1ddc629862b9",
    type: "transfer",
    amount: 4421,
    date: "1694355131000",
  },
  {
    id: "48c4f6b7-e6c7-436f-80fb-3b32e69b4130",
    type: "buy",
    amount: 7881,
    date: "1695033633000",
    fuel_qty: 995,
    saved_money: 108,
    fuel_type: "Газ",
    place: "Кропивницький",
    brand: "ОККО",
  },
  {
    id: "9715e5a6-1b1c-48ab-a4d0-d65252bec86e",
    type: "buy",
    amount: 3266,
    date: "1696280777000",
    fuel_qty: 899,
    saved_money: 141,
    fuel_type: "A-92",
    place: "Миколаїв",
    brand: "WOG",
  },
  {
    id: "046c14ff-35af-442c-9f3a-65ecb9a21f1c",
    type: "topup",
    amount: 3958,
    date: "1693793821000",
  },
];

const getTransactions = () => {
  return transactions;
};

const initializeTransactions = async () => {
  const clients = await Database("clients");

  transactions = transactions.map((transaction) => {
    if (transaction.type === "transfer") {
      transaction.to = clients[Math.floor(Math.random() * clients.length)]?.id;
    }

    return transaction;
  });
};

export { getTransactions, initializeTransactions };

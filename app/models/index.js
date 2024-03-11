export { default as Merchant } from "./merchant.js";

/*
const merchant = await Merchant.find("a904a616-2e0f-4856-a901-2ca4fed36268");

const trunc = merchant
  .createPaymentTrunc({
    amount: 100,
    description: "test",
    short_description: "test",
    title: "test",
  })
  .then((trunc) =>
    merchant
      .checkPaymentTrunc({ id: trunc.id })
      .then((data) => console.log(data))
  );
*/

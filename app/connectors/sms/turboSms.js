import axios from "axios";

const urls = {
  send: "https://api.turbosms.ua/message/send.json",
  balance: "https://api.turbosms.ua/user/balance.json",
};

const turboSmsService = {
  sendSms: (recipient, text, { sender, key }) =>
    axios.post(
      urls.send,
      JSON.stringify({
        recipients: [recipient],
        sms: { sender, text },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
      }
    ),
  getBalance: ({ config: { key } }) =>
    axios
      .post(urls.balance, null, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
      })
      .then(
        ({
          data: {
            response_result: { balance },
          },
        }) => balance
      ),
};

export default turboSmsService;

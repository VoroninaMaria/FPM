import axios from "axios";

const urls = {
  send: "https://sms-fly.ua/api/v2/api.php",
};

const flySmsService = {
  sendSms: (recipient, text, { key, sender }) =>
    axios.post(
      urls.send,
      JSON.stringify({
        auth: key,
        action: "SENDMESSAGE",
        data: {
          recipient: recipient,
          channels: ["sms"],
          sms: {
            source: sender,
            ttl: 300,
            flash: 0,
            text,
          },
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    ),
  getBalance: ({ config: { key } }) =>
    axios
      .post(
        urls.send,
        JSON.stringify({
          auth: { key },
          action: "GETBALANCE",
          data: {},
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(
        ({
          data: {
            data: { balance },
          },
        }) => balance
      ),
};

export default flySmsService;

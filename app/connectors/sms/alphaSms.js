import axios from "axios";

const urls = {
  send: "https://alphasms.ua/api/json.php",
};

const alphaSmsService = {
  sendSms: (phone, sms_message, { key, sender }) =>
    axios.post(
      urls.send,
      JSON.stringify({
        auth: key,
        data: [
          {
            type: "sms",
            phone: parseInt(phone),
            sms_signature: sender,
            sms_message,
          },
        ],
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
          auth: key,
          data: [
            {
              type: "balance",
            },
          ],
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(({ data: { data } }) => data[0].data.amount),
};

export default alphaSmsService;

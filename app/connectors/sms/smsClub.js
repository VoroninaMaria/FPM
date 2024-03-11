import axios from "axios";

const urls = {
  send: "https://im.smsclub.mobi/sms/send",
  balance: "https://im.smsclub.mobi/sms/balance",
};

const smsClubService = {
  sendSms: (phone, message, { key, sender }) =>
    axios.post(
      urls.send,
      JSON.stringify({
        phone: [phone],
        src_addr: sender,
        message,
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
            success_request: {
              info: { money },
            },
          },
        }) => money
      ),
};

export default smsClubService;

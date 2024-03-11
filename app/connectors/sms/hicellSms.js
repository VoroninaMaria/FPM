import axios from "axios";

const urls = {
  send: "https://hicell.com/api/client/messages/sms/",
};
const hicellSmsService = {
  sendSms: (phone_number, text, { key, sender }) =>
    axios.post(
      urls.send,
      JSON.stringify({
        destinations: [phone_number],
        sender,
        text,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${key}`,
        },
      }
    ),
};

export default hicellSmsService;

const RequestFormats = {
  History: {
    type: "History",
    client_id: "client_id",
    created_at: "date",
    limit: 10,
  },
  Chats: { type: "Chats" },
  SubmitMessage: {
    client_id: "uuid", // client id
    author: "", // merchant or client
    body: "some message body", // actually message body
    status: 0, // integer 0 - created, 1 - saved, 3 - seen, -1 - error
    reply_to: "uuid", // nullable
    created_at: 123423143123, // iso timestamp
  },
  UpdateMessageStatus: {
    type: "UpdateMessageStatus",
    client_id: "client_id",
    message_id: "message_id",
    status: 0,
  },
};

const EventFormats = {
  Chats: {
    type: "Chats",
    chats: {
      client_id: "unread_msg_count",
    },
  },
  NewMessage: {
    type: "NewMessage",
    id: "uuid", // message id
    client_id: "uuid", // client id
    author: "", // merchant or client
    body: "some message body", // actually message body
    status: 0, // integer 0 - created, 1 - saved, 3 - seen, -1 - error
    reply_to: "uuid", // nullable
    created_at: 123423143123, // iso timestamp
  },
  History: {
    type: "History",
    messages: ["NewMessage"],
  },
  UpdateMessageStatus: {
    type: "UpdateMessageStatus",
    id: "message_id", // message_id
    status: 0 - 10,
  },
};

export default { RequestFormats, EventFormats };

import { Database, Redis } from "@local/lib/index.js";

const merchantSocket = (id, session_identifier, listener, wsClient) =>
  Database("clients")
    .where({ id, session_identifier })
    .first()
    .then((client) => {
      if (!client) return wsClient.terminate();
      const { merchant_id, id: client_id } = client;

      Redis.subscriber.subscribe(`${merchant_id}#${client_id}`, listener);
      wsClient.addEventListener("message", ({ data }) => {
        const { type, ...request } = JSON.parse(data);

        switch (type) {
          case "SubmitMessage":
            return Database("chat_messages")
              .insert({
                ...request,
                merchant_id,
                client_id,
              })
              .returning("*")
              .then(([{ ...message }]) =>
                Redis.publisher.publish(
                  `${merchant_id}#${client_id}`,
                  JSON.stringify({ type: "NewMessage", message })
                )
              );
          case "Chats":
            return Database("chat_messages")
              .join("clients", "clients.id", "chat_messages.client_id")
              .select(
                Database.raw(
                  "SUM(CASE WHEN chat_messages.status < 2 THEN 1 ELSE 0 END) as msg_count"
                ),
                "clients.phone",
                "chat_messages.client_id as client_id",
                Database.raw("max(chat_messages.created_at) as latest_message")
              )
              .where({
                "chat_messages.merchant_id": merchant_id,
                author: "client",
                client_id,
              })
              .groupBy("client_id", "clients.phone")
              .orderBy(Database.raw("msg_count"), "desc")
              .orderBy(Database.raw("latest_message"), "desc")
              .then((chats) =>
                wsClient.send(JSON.stringify({ type: "Chats", chats }))
              );
          case "History":
            return Database("chat_messages")
              .where({
                merchant_id,
                client_id,
              })
              .whereRaw("created_at < to_timestamp(?) ", request.created_at)
              .orderBy("created_at", "desc")
              .limit(request.limit || 10)
              .then((chat_messages) =>
                wsClient.send(
                  JSON.stringify({
                    type: "History",
                    messages: chat_messages.reverse(),
                  })
                )
              );
          case "UpdateMessageStatus":
            return Database("chat_messages")
              .where({
                merchant_id,
                client_id,
                id: request.message_id,
              })
              .update({ status: request.status })
              .returning(["client_id", "id", "status", "merchant_id"])
              .then(([chat_message]) =>
                Redis.publisher.publish(
                  `${merchant_id}#${client_id}`,
                  JSON.stringify({
                    type: "UpdateMessageStatus",
                    ...chat_message,
                  })
                )
              );
        }
      });
    });

export default merchantSocket;

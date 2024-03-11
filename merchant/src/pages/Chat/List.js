import React, { useState, useEffect } from "react";
import { useLocaleState, useTranslate } from "react-admin";
import Config from "../../config.js";
import PropTypes from "prop-types";
import moment from "moment";
import "./List.scss";
import { DoneAll, Done } from "@mui/icons-material/index.js";
import { SetLocale } from "../../shared/components/index.js";

const ChatItem = ({
  className,
  phone,
  msg_count,
  client_id,
  setActiveChatId,
}) => {
  return (
    <div
      className={`chat-list-item ${className}`}
      onClick={() => {
        setActiveChatId(client_id);
      }}
    >
      <div className="phoneBlock">{phone}</div>
      <div className="messageCounter">{msg_count}</div>
    </div>
  );
};

ChatItem.propTypes = {
  phone: PropTypes.string,
  msg_count: PropTypes.number,
  client_id: PropTypes.string,
  setActiveChatId: PropTypes.func,
  className: PropTypes.string,
  author: PropTypes.string,
};

const ChatMessage = ({ message, updateMessage }) => {
  updateMessage(message);
  const [locale] = useLocaleState();

  SetLocale(locale);

  return (
    <div className={`message ${message.author}`}>
      <div className="content">
        <span className="message-text">{message.message}</span>
        {message.status === 2 && message.author !== "client" && (
          <span className="sender">
            <DoneAll fontSize="small" sx={{ color: "lightblue" }} />
          </span>
        )}
        {message.status !== 2 && message.author !== "client" && (
          <span className="sender">
            <Done fontSize="small" sx={{ color: "lightblue" }} />
          </span>
        )}
      </div>
      <span className="timestamp">{moment(message.created_at).calendar()}</span>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.object,
  updateMessage: PropTypes.func,
};

const ChatList = () => {
  const [socketStarting, setSocketStarting] = useState(false);
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const t = useTranslate();
  let lim;

  const changeChat = (newActiveChatId) => {
    setActiveChatId(newActiveChatId);
    setMessages([]);
    lim = 0;
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.client_id === newActiveChatId) {
          lim = chat.msg_count;
          socket.send(
            JSON.stringify({
              type: "History",
              client_id: newActiveChatId,
              created_at: Date.now(),
              limit: 10 + lim,
            })
          );
        }

        return {
          ...chat,
          msg_count:
            chat.client_id === newActiveChatId
              ? (chat.msg_count = 0)
              : chat.msg_count,
        };
      })
    );
  };

  const updateMessage = ({ author, id, status }) => {
    if (status < 2 && author === "client") {
      const msg = {
        type: "UpdateMessageStatus",
        status: 2,
        id: id,
      };

      socket.send(JSON.stringify(msg));
    }
  };

  const processNewMessage = (msg, setMessages) => {
    if (msg.message.client_id === activeChatId) {
      setMessages((prevMsgs) => [...prevMsgs, msg.message]);
    } else {
      setChats(
        (prevChats) =>
          prevChats.map((chat) => ({
            ...chat,
            msg_count:
              chat.client_id === msg.message.client_id
                ? chat.msg_count + 1
                : chat.msg_count,
          })),
        socket.send(JSON.stringify({ type: "Chats" }))
      );
    }

    if (!chats.map((chat) => chat.client_id).includes(msg.message.client_id)) {
      socket.send(JSON.stringify({ type: "Chats" }));
    }
  };
  const processMessageStatus = (msg, setMessages) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) => {
        if (message.id === msg.id) {
          return { ...message, ...msg };
        } else {
          return message;
        }
      })
    );
  };

  const processMessage = ({ data }) => {
    const { type, ...msg } = JSON.parse(data);

    switch (type) {
      case "Chats":
        return setChats([...msg.chats]);
      case "History":
        return setMessages((prevMsgs) => [...prevMsgs, ...msg.messages]);
      case "NewMessage":
        return processNewMessage(msg, setMessages);
      case "UpdateMessageStatus":
        return processMessageStatus(msg, setMessages);
    }
  };

  const connect = () => {
    const ws = new WebSocket(
      `${Config.serverUrl.replace("http", "ws")}ws/merchant`,
      ["Authorization", localStorage.getItem("token")]
    );

    ws.binaryType = "blob";
    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "Chats" }));
    });
    ws.addEventListener("close", () => setTimeout(connect, 1000));
    setSocket(ws);
  };

  useEffect(() => {
    socket.onmessage = processMessage;
  }, [activeChatId]);

  const formSubmit = (event) => {
    event.preventDefault();
    const message = {
      type: "SubmitMessage",
      client_id: activeChatId,
      author: "merchant",
      status: 0,
      message: currentMessage,
    };

    if (currentMessage !== "") socket.send(JSON.stringify(message));
    setCurrentMessage("");
  };

  if (!socketStarting && (!socket || socket.readyState !== 1)) {
    setSocketStarting(true);
    connect();
  }

  const isValidSms = (message) => {
    return /(^\s+)/.test(message);
  };

  return (
    <div>
      <div className="chat-container">
        <div className="chat-list">
          {chats &&
            chats.map((chat) => (
              <ChatItem
                key={chat.client_id}
                {...chat}
                setActiveChatId={changeChat}
                className={chat.client_id === activeChatId ? "active" : null}
              />
            ))}
        </div>
        <div className="chat-area">
          {messages.map((message) => (
            <ChatMessage
              message={message}
              key={message.id}
              updateMessage={updateMessage}
            />
          ))}
        </div>
      </div>
      {activeChatId && (
        <div className="input-container">
          <form onSubmit={formSubmit}>
            <input
              maxLength={255}
              type="text"
              id="message-input"
              placeholder={t("resources.Chat.fields.input.placeholder")}
              value={currentMessage}
              onChange={(event) => {
                if (!isValidSms(event.target.value)) {
                  setCurrentMessage(event.target.value);
                }
              }}
            />
            <button className="sendButton">
              <svg
                height="10"
                width="10"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path
                  d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                  fill="currentColor"
                ></path>
              </svg>
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

ChatList.propTypes = {
  socket: PropTypes.object,
};

export default ChatList;

"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import urlconfig from "../../config";

const head = urlconfig.serverUrlPrefix;
const socket = io(head);

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [latestMessageId, setLatestMessageId] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(head + "/api/messages");
      const messages = response.data.data;
      setMessages(messages);
      const latestMessageId =
        messages.length > 0 ? Math.max(...messages.map((msg) => msg.messageid)) : 0;
      setLatestMessageId(latestMessageId);
      console.log("Fetched messages:", messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socket.on("newMessage", (message) => {
      if (message?.data?.message && message?.data?.messageid) {
        console.log("Received new message:", message.data);
        setMessages((prevMessages) => [...prevMessages, message.data]);
        setLatestMessageId(message.data.messageid);
      } else {
        console.error("Invalid message format:", message);
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("connect");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim() !== "") {
      setIsSending(true);
      try {
        const newMessageId = latestMessageId + 1;
        await axios.post(head + "/api/messages", {
          data: {
            message: inputMessage,
            messageid: newMessageId,
          },
        });
        setInputMessage("");
        setLatestMessageId(newMessageId);
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message!");
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <div className="bg-[#1d1e20] h-screen flex flex-col">
      <div className="p-7 grid justify-items-start">
        <h1 className="text-xl font-bold mb-4 text-center text-white">
          Secret Room Chat
        </h1>
      </div>

      <div className="h-screen p-12 flex flex-col items-center justify-around">
        <div className="p-4 h-80 overflow-y-auto mb-4 rounded-lg w-full max-w-[50rem] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {messages.map((msg) => (
            <p key={msg.messageid} className="text-white-800 mb-8 break-words">
              {msg.message}
            </p>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex space-x-2 bg-[#313335] p-6 rounded-3xl w-full max-w-[50rem]">
          <input
            type="text"
            className="flex-grow bg-[#313335] outline-none text-white"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <div>
            <button
              onClick={sendMessage}
              disabled={isSending}
              className={`bg-[#5E6668] text-white px-4 py-2 rounded-3xl hover:scale-105 hover:shadow-md transition duration-200 ${
                isSending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
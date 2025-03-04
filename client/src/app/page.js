"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import urlconfig from "../../config";

const head = urlconfig.serverUrlPrefix;
const fun_cloud = urlconfig.cloud_fun;
const socket = io(head);

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [latestMessageId, setLatestMessageId] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [username, setUsername] = useState("");
  const [alertShown, setAlertShown] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const messagesEndRef = useRef(null);

  // สุ่ม username
  const generateRandomUsername = () => {
    const randomNum = Math.floor(Math.random() * 10000000);
    return `Anonymous-${randomNum}`;
  };

  // ตรวจสอบและตั้งค่า username
  const checkAndSetUsername = () => {
    const storedUsername = sessionStorage.getItem("chatUsername");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      const newUsername = generateRandomUsername();
      setUsername(newUsername);
      sessionStorage.setItem("chatUsername", newUsername);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(head + "/api/messages");
      const messages = response.data.data;
      setMessages(messages);
      const latestMessageId =
        messages.length > 0
          ? Math.max(...messages.map((msg) => msg.messageid))
          : 0;
      setLatestMessageId(latestMessageId);
      console.log("Fetched messages:", messages);

      checkAndSetUsername();

      if (messages.length > 300) {
        deleteAllMessages();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // const deleteAllMessages = async () => {
  //   try {
  //     await axios.get(head + "/api/messages/delete-all");
  //     console.log("Called cloud function to delete all messages");
  //     setMessages([]);
  //     setLatestMessageId(0);
  //   } catch (error) {
  //     console.error("Error calling delete cloud function:", error);
  //   }
  // };

  const deleteAllMessages = async () => {
    try {
      await axios.get(fun_cloud);
      console.log("Called cloud function to delete all messages");
      setMessages([]);
      setLatestMessageId(0);
    } catch (error) {
      console.error("Error calling delete cloud function:", error);
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

  const showAlert = (message) => {
    if (!alertShown) {
      setAlertMessage(message);
      setAlertShown(true);
      setTimeout(() => {
        setAlertMessage("");
      }, 5000);
    }
  };

  const dismissAlert = () => {
    setAlertMessage("");
    setAlertShown(false);
  };

  const sendMessage = async () => {
    if (inputMessage.trim() !== "") {
      setIsSending(true);
      try {
        const newMessageId = latestMessageId + 1;
        await axios.post(head + "/api/messages", {
          data: {
            message: `${username} : ${inputMessage}`,
            messageid: newMessageId,
          },
        });
        setInputMessage("");
        setLatestMessageId(newMessageId);

        if (messages.length + 1 > 300) {
          showAlert(
            "Messages exceed 300! Please refresh the page to clear all messages."
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        showAlert("Failed to send message!");
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleUsernameChange = () => {
    if (newUsername.trim()) {
      setUsername(newUsername);
      sessionStorage.setItem("chatUsername", newUsername);
      setIsModalOpen(false);
      setNewUsername("");
    }
  };

  return (
    <div className="relative h-screen">
      {/* Main content wrapper */}
      <div
        className={`bg-[#1d1e20] h-full flex flex-col transition-all duration-300 ${
          isModalOpen ? "blur-sm" : ""
        }`}
      >
        {/* Alert */}
        {alertShown && alertMessage && (
          <div
            id="alert-additional-content-5"
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 border border-gray-300 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-800 w-full max-w-md"
            role="alert"
          >
            <div className="flex items-center">
              <svg
                className="shrink-0 w-4 h-4 me-2 dark:text-gray-300"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-300">
                Warning
              </h3>
            </div>
            <div className="mt-2 mb-4 text-sm text-gray-800 dark:text-gray-300">
              {alertMessage}
            </div>
            <div className="flex">
              <button
                type="button"
                className="text-gray-800 bg-transparent border border-gray-700 hover:bg-gray-800 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-gray-800 dark:text-gray-300 dark:hover:text-white"
                onClick={dismissAlert}
                aria-label="Close"
              >
                Ok
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-7 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Secret Room Chat</h1>
          <div className="text-white flex justify-between items-center">
            {username}{" "}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-full hover:bg-[#5E6668] transition-colors ml-2"
            >
              <svg
                className="h-6 w-6 text-white-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat interface */}
        <div className="h-screen p-12 flex flex-col items-center justify-around relative">

          <div className="p-4 h-80 overflow-y-auto mb-4 rounded-lg w-full max-w-[50rem] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {messages.map((msg) => {
              const [displayUsername, messageContent] = msg.message.split(
                " : ",
                2
              );
              const storedUsername = sessionStorage.getItem("chatUsername");
              const isCurrentUser = displayUsername === storedUsername;

              return (
                <div
                  key={msg.messageid}
                  className={`mb-4 break-words ${
                    isCurrentUser ? "flex justify-end" : "flex justify-start"
                  }`}
                >
                  <div className={isCurrentUser ? "text-right" : "text-left"}>
                    <div className="text-white-400 font-bold text-sm">
                      {displayUsername}
                    </div>
                    <div
                      className={`${
                        isCurrentUser
                          ? "bg-blue-600" // สีสำหรับข้อความของตัวเอง
                          : "bg-gray-700" // สีสำหรับข้อความของคนอื่น
                      } bg-gray-700 text-white p-3 rounded-lg mt-1 inline-block break-all`}
                    >
                      {messageContent}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Modal */}
      <div
        id="username-modal"
        tabIndex="-1"
        aria-hidden={!isModalOpen}
        className={`${
          isModalOpen ? "flex" : "hidden"
        } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Change Username
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setIsModalOpen(false)}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="p-4 md:p-5">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    New Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Enter new username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleUsernameChange()
                    }
                    required
                  />
                </div>
                <button
                  type="button"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={handleUsernameChange}
                >
                  Save Username
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

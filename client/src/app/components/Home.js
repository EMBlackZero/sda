"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import urlconfig from "../../../config";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import AlertMessage from "./AlertMessage";
import UsernameModal from "./UsernameModal";

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
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);

  const generateRandomUsername = () => {
    const randomNum = Math.floor(Math.random() * 10000000);
    return `Anonymous-${randomNum}`;
  };

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
      if (message?.data?.messageid) {
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

  const showAlert = (message, type = "warning") => {
    if (!alertShown) {
      setAlertMessage({ text: message, type });
      setAlertShown(true);
      setTimeout(() => {
        setAlertMessage("");
        setAlertShown(false);
      }, 5000);
    }
  };

  const dismissAlert = () => {
    setAlertMessage("");
    setAlertShown(false);
  };

  const sendMessage = async () => {
    if (inputMessage.trim() !== "" || selectedImage) {
      setIsSending(true);
      try {
        const newMessageId = latestMessageId + 1;
        const messageData = {
          data: {
            messageid: newMessageId,
          },
        };

        if (inputMessage.trim() !== "") {
          messageData.data.message = `${username} : ${inputMessage}`;
        } else {
          messageData.data.message = `${username} : `;
        }

        if (selectedImage) {
          messageData.data.imageText = selectedImage;
        }

        await axios.post(head + "/api/messages", messageData);
        setInputMessage("");
        setSelectedImage(null);
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
    const nameToSave = newUsername.trim() || username;
    if (nameToSave) {
      setUsername(nameToSave);
      sessionStorage.setItem("chatUsername", nameToSave);
      setIsModalOpen(false);
      setNewUsername("");
    }
  };

  const openModal = () => {
    setNewUsername(username);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showAlert("Image size must be less than 1 MB!", "danger");
        return;
      }

      const htmlImage = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        htmlImage.src = event.target.result;

        htmlImage.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          const MOBILE_MAX_WIDTH = 400;
          const MOBILE_MAX_HEIGHT = 400;

          const isMobile = window.innerWidth <= 768;
          const maxWidth = isMobile ? MOBILE_MAX_WIDTH : MAX_WIDTH;
          const maxHeight = isMobile ? MOBILE_MAX_HEIGHT : MAX_HEIGHT;

          let width = htmlImage.width;
          let height = htmlImage.height;

          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(htmlImage, 0, 0, width, height);

          const resizedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          console.log("Resized base64 length:", resizedBase64.length);

          if (resizedBase64.startsWith("data:image/")) {
            setSelectedImage(resizedBase64);
          } else {
            showAlert("Error processing image!", "danger");
          }
        };

        htmlImage.onerror = () => {
          showAlert("Error loading image file!", "danger");
        };
      };

      reader.onerror = () => {
        showAlert("Error reading image file!", "danger");
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <div
        className={`bg-[#1d1e20] h-full flex flex-col transition-all duration-300 ${
          isModalOpen ? "blur-sm" : ""
        }`}
      >
        <AlertMessage
          alertShown={alertShown}
          alertMessage={alertMessage}
          dismissAlert={dismissAlert}
        />
        <ChatHeader username={username} openModal={openModal} />
        <ChatMessages
          messages={messages}
          username={username}
          messagesEndRef={messagesEndRef}
          isValidBase64Image={(str) =>
            str && typeof str === "string" && str.startsWith("data:image/")
          }
        />
        <div className="p-2 mb-4">
          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            isSending={isSending}
            sendMessage={sendMessage}
            handleImageChange={handleImageChange}
          />
        </div>
      </div>
      <UsernameModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        newUsername={newUsername}
        setNewUsername={setNewUsername}
        handleUsernameChange={handleUsernameChange}
      />
    </div>
  );
}

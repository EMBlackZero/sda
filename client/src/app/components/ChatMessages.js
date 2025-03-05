"use client";

import NextImage from "next/image";

export default function ChatMessages({ messages, username, messagesEndRef, isValidBase64Image }) {
  return (
    <div className="flex flex-col flex-grow p-4 sm:p-8 overflow-hidden">
      <div className="p-2 flex-grow overflow-y-auto rounded-lg w-full max-w-[50rem] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:p-2 h-64 sm:h-72 mx-auto">
        {messages.map((msg) => {
          const [displayUsername, messageContent] = msg.message
            ? msg.message.split(" : ", 2)
            : [msg.username || username, ""];
          const storedUsername = sessionStorage.getItem("chatUsername");
          const isCurrentUser = displayUsername?.trim() === storedUsername?.trim();

          return (
            <div
              key={msg.messageid}
              className={`mb-4 break-words ${isCurrentUser ? "flex justify-end" : "flex justify-start"}`}
            >
              <div className={`flex flex-col ${isCurrentUser ? "items-end text-right" : "items-start text-left"}`}>
                <div className="text-white-400 font-bold text-sm">{displayUsername}</div>
                {messageContent && (
                  <div className={`${isCurrentUser ? "bg-blue-600" : "bg-gray-700"} text-white p-3 rounded-lg mt-1 inline-block break-all max-w-full sm:max-w-full`}>
                    {messageContent}
                  </div>
                )}
                {msg.imageText && isValidBase64Image(msg.imageText) && (
                  <div className={`mt-2 ${isCurrentUser ? "text-right" : "text-left"}`}>
                    <NextImage
                      src={msg.imageText}
                      alt="uploaded"
                      width={250}
                      height={250}
                      sizes="(max-width: 768px) 80vw, 400px"
                      unoptimized
                      className="rounded-md object-contain w-full h-auto max-w-[50vw] max-h-[40vh] md:max-w-[250px] md:max-h-[250px]"
                      onError={(e) => {
                        console.error("Error loading image:", e);
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
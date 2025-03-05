"use client";

export default function ChatInput({
  inputMessage,
  setInputMessage,
  selectedImage,
  setSelectedImage,
  isSending,
  sendMessage,
  handleImageChange,
}) {
  return (
    <div className="flex space-x-2 bg-[#313335] p-4 rounded-3xl w-full max-w-[50rem] mx-auto sm:p-6 sm:rounded-3xl shrink-0">
      <input
        type="text"
        className="flex-grow bg-[#313335] outline-none text-white text-sm sm:text-base"
        placeholder="Type your message..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="image-upload"
        onChange={handleImageChange}
      />
      <button
        className="p-2 rounded-full hover:bg-[#5E6668] transition-colors"
        onClick={() => document.getElementById("image-upload").click()}
      >
        {selectedImage ? (
          <svg
            className="h-8 w-8 text-white-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ) : (
          <svg
            className="h-8 w-8 text-white-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </button>
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
  );
}

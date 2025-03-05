"use client";

export default function ChatHeader({ username, openModal }) {
  return (
    <div className="p-7 flex justify-between items-center sm:p-7 shrink-0">
      <div className="flex items-center">
        <img src="/logo3.png" alt="Logo" className="h-8 w-8 mr-2" />
        <h1 className="text-xl font-bold text-white">Secret Room Chat</h1>
      </div>
      <div className="text-white flex justify-between items-center">
        <span className="hidden sm:inline truncate max-w-[200px] sm:max-w-none">
          {username}
        </span>
        <button
          onClick={openModal}
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
  );
}
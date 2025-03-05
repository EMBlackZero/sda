"use client";

export default function AlertMessage({ alertShown, alertMessage, dismissAlert }) {
  return (
    alertShown && alertMessage && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
        {alertMessage.type === "warning" ? (
          <div className="p-4 border border-gray-600 rounded-lg bg-gray-800 sm:p-4">
            <div className="flex items-center">
              <svg
                className="shrink-0 w-4 h-4 me-2 text-gray-300"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <h3 className="text-lg font-medium text-gray-300">Warning</h3>
            </div>
            <div className="mt-2 mb-4 text-sm text-gray-300">
              {alertMessage.text}
            </div>
            <div className="flex">
              <button
                type="button"
                className="text-gray-300 bg-transparent border border-gray-600 hover:bg-gray-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-xs px-3 py-1.5"
                onClick={dismissAlert}
              >
                Ok
              </button>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
            role="alert"
          >
            <svg
              className="shrink-0 inline w-4 h-4 me-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-medium">Danger alert!</span>{" "}
              {alertMessage.text}
            </div>
          </div>
        )}
      </div>
    )
  );
}
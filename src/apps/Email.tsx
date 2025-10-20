import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaSearch,
  FaEdit,
  FaInbox,
  FaStar,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoIosMore } from "react-icons/io";
import AppsLayout from "./AppsLayout";
import emailsData from "../data/emails.json";

const Email = ({
  onClose,
  clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show loading screen for 1.5 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const emails = emailsData.emails;

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-blue-500">
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <MdEmail className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">Mail</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout onClose={onClose} title="Mail">
        <div className="h-full flex flex-col bg-white pt-30">
          {/* Navigation Tabs */}
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <div className="flex space-x-4">
              <button className="flex items-center space-x-1 text-blue-600 border-b-2 border-blue-600 pb-1">
                <FaInbox className="text-sm" />
                <span className="text-sm font-medium">Inbox</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                <FaStar className="text-sm" />
                <span className="text-sm">Starred</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                <FaTrash className="text-sm" />
                <span className="text-sm">Trash</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3 bg-gray-50">
            <div className="bg-white rounded-lg px-3 py-2 flex items-center space-x-2 shadow-sm">
              <FaSearch className="text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search emails"
                className="flex-1 text-sm outline-none"
              />
            </div>
          </div>

          {/* Emails List */}
          <div className="flex-1 overflow-y-auto">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  email.unread ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      {email.avatar}
                    </div>
                    {email.starred && (
                      <FaStar className="absolute -top-1 -right-1 text-yellow-500 text-xs" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3
                          className={`font-semibold truncate ${
                            email.unread ? "text-gray-900" : "text-gray-600"
                          }`}
                        >
                          {email.sender}
                        </h3>
                        {email.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {email.time}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        email.unread
                          ? "font-semibold text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {email.preview}
                    </p>
                  </div>

                  {/* More options */}
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <IoIosMore />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Action Button */}
          <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-200 z-50">
            <FaPlus className="text-xl" />
          </button>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Email;

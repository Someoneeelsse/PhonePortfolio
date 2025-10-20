import { useEffect, useState } from "react";
import { FaArrowLeft, FaSearch, FaEdit } from "react-icons/fa";
import { FaRegMessage } from "react-icons/fa6";
import { IoIosMore } from "react-icons/io";
import AppsLayout from "./AppsLayout";
import messagesData from "../data/messages.json";

const Messages = ({
  onClose,
  clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    // Show loading screen for 1.5 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const conversations = messagesData.conversations;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "text-gray-400";
      case "delivered":
        return "text-gray-400";
      case "read":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-green-500">
        <div
          className="flex flex-col items-center space-y-4 animate-fadeInFromCenter"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "appOpen 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <FaRegMessage className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">Messages</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    // Show chat view if conversation is selected
    if (selectedConversation) {
      return (
        <AppsLayout
          onClose={() => setSelectedConversation(null)}
          title={selectedConversation.name}
        >
          <div className="h-full flex flex-col bg-gray-100 pt-30">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.isMe
                        ? "bg-green-500 text-white rounded-br-md"
                        : "bg-white text-gray-900 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-lg">{message.text}</p>
                    <div
                      className={`flex items-center justify-end mt-1 space-x-1`}
                    >
                      <span
                        className={`text-sm ${
                          message.isMe ? "text-green-100" : "text-gray-500"
                        }`}
                      >
                        {message.time}
                      </span>
                      {message.isMe && (
                        <span
                          className={`text-sm ${getStatusColor(
                            message.status
                          )}`}
                        >
                          {getStatusIcon(message.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white px-4 py-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Message"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors">
                  <FaRegMessage className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </AppsLayout>
      );
    }

    return (
      <AppsLayout onClose={onClose} title="Messages">
        <div className="h-full flex flex-col bg-white pt-30">
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => {
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];
              return (
                <div
                  key={conversation.id}
                  className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                        {conversation.avatar}
                      </div>
                      {conversation.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {conversation.unread}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate text-lg">
                          {conversation.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {conversation.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-base text-gray-600 truncate flex-1">
                          {lastMessage.text}
                        </p>
                        {lastMessage.isMe && (
                          <span
                            className={`text-sm ml-2 ${getStatusColor(
                              lastMessage.status
                            )}`}
                          >
                            {getStatusIcon(lastMessage.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Messages;

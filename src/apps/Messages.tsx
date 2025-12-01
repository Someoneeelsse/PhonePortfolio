import { useEffect, useState } from "react";
import { FaRegMessage } from "react-icons/fa6";
import AppsLayout from "./AppsLayout";
import messagesData from "../data/messages.json";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  status: string;
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

const Messages = ({
  onClose,
  clickPosition: _clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    // Show loading screen for 1.5 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
      // Dispatch event when content is shown
      window.dispatchEvent(
        new CustomEvent("messagesContentShown", { detail: { shown: true } })
      );
    }, 1500);

    return () => {
      clearTimeout(timer);
      // Dispatch event when Messages app is closed/unmounted
      window.dispatchEvent(
        new CustomEvent("messagesAppClosed", { detail: { closed: true } })
      );
    };
  }, []);

  const conversations = messagesData.conversations;

  // Generate initials from name (first two letters)
  const getInitials = (name: string): string => {
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate a consistent gray color based on name (for subtle variations)
  const getAvatarColor = (name: string): string => {
    const grayColors = [
      "bg-gradient-to-br from-gray-500 to-gray-600",
      "bg-gradient-to-br from-gray-600 to-gray-700",
      "bg-gradient-to-br from-slate-500 to-slate-600",
      "bg-gradient-to-br from-slate-600 to-slate-700",
      "bg-gradient-to-br from-zinc-500 to-zinc-600",
      "bg-gradient-to-br from-zinc-600 to-zinc-700",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return grayColors[Math.abs(hash) % grayColors.length];
  };

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
            transformOrigin: "50% 100%",
            animation:
              "appOpen 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
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
          statusBarTextColor="text-black"
          batteryColorScheme="light"
        >
          <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-yellow-50 pt-30">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                    message.isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar for received messages */}
                  {!message.isMe && (
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-semibold shadow-md flex-shrink-0 ${getAvatarColor(
                        selectedConversation.name
                      )}`}
                    >
                      {getInitials(selectedConversation.name)}
                    </div>
                  )}
                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={`px-5 py-3  ${
                        message.isMe
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-xl rounded-tl-xl shadow-md"
                          : "bg-white text-gray-900 rounded-bl-xl rounded-tr-xl shadow-sm border border-gray-200"
                      }`}
                    >
                      <p className="text-lg leading-relaxed">{message.text}</p>
                    </div>
                    <div
                      className={`flex items-center gap-2 mt-1.5 px-1 ${
                        message.isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span
                        className={`text-sm ${
                          message.isMe ? "text-gray-400" : "text-gray-500"
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
                  {/* Avatar for sent messages */}
                  {message.isMe && (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-semibold shadow-md flex-shrink-0 bg-gradient-to-br from-gray-400 to-gray-500">
                      ME
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AppsLayout>
      );
    }

    return (
      <AppsLayout
        onClose={onClose}
        title="Messages"
        statusBarTextColor="text-black"
        batteryColorScheme="light"
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-yellow-50 pt-30">
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => {
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];
              return (
                <div
                  key={conversation.id}
                  className="px-4 py-3 border-b border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-semibold shadow-md ${getAvatarColor(
                          conversation.name
                        )}`}
                      >
                        {getInitials(conversation.name)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-base">
                          {conversation.name}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {conversation.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {lastMessage.text}
                        </p>
                        {lastMessage.isMe && (
                          <span
                            className={`text-xs ml-2 flex-shrink-0 ${getStatusColor(
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

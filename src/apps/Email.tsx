import { useEffect, useState } from "react";
import { FaStar, FaPlus, FaPaperPlane, FaTimes } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoIosMore } from "react-icons/io";
import AppsLayout from "./AppsLayout";
import emailsData from "../data/emails.json";
// Uncomment when you install @emailjs/browser:
// import emailjs from "@emailjs/browser";

const Email = ({
  onClose,
  clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [emailTo, setEmailTo] = useState("panjakub15@gmail.com");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  useEffect(() => {
    // Show loading screen for 1.5 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const emails = emailsData.emails;

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
    // Show compose view if enabled
    if (showCompose) {
      return (
        <AppsLayout onClose={onClose} title="New Message">
          <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-yellow-50 pt-30">
            {/* Compose Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-sm">
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                New Message
              </h2>
              <button
                onClick={async () => {
                  if (!emailSubject.trim() || !emailBody.trim()) {
                    alert("Please fill in both subject and message");
                    return;
                  }

                  setIsSending(true);
                  setSendStatus("idle");

                  try {
                    // Option 1: Using EmailJS (requires setup)
                    // Uncomment and configure with your EmailJS credentials:
                    /*
                    await emailjs.send(
                      "YOUR_SERVICE_ID", // Replace with your EmailJS service ID
                      "YOUR_TEMPLATE_ID", // Replace with your EmailJS template ID
                      {
                        to_email: emailTo,
                        subject: emailSubject,
                        message: emailBody,
                        from_name: "Portfolio Contact",
                      },
                      "YOUR_PUBLIC_KEY" // Replace with your EmailJS public key
                    );
                    */

                    // Option 2: Using mailto: link (opens default email client)
                    const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(
                      emailSubject
                    )}&body=${encodeURIComponent(emailBody)}`;
                    window.location.href = mailtoLink;

                    // Simulate sending for demo (remove when using real service)
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    setSendStatus("success");
                    setTimeout(() => {
                      setShowCompose(false);
                      setEmailSubject("");
                      setEmailBody("");
                      setSendStatus("idle");
                    }, 1500);
                  } catch (error) {
                    console.error("Error sending email:", error);
                    setSendStatus("error");
                    setTimeout(() => setSendStatus("idle"), 3000);
                  } finally {
                    setIsSending(false);
                  }
                }}
                disabled={isSending}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  isSending
                    ? "bg-gray-400 cursor-not-allowed"
                    : sendStatus === "success"
                    ? "bg-green-500 hover:bg-green-600"
                    : sendStatus === "error"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Sending...</span>
                  </>
                ) : sendStatus === "success" ? (
                  <>
                    <span className="text-sm font-medium">✓ Sent</span>
                  </>
                ) : sendStatus === "error" ? (
                  <>
                    <span className="text-sm font-medium">Error</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-sm" />
                    <span className="text-sm font-medium">Send</span>
                  </>
                )}
              </button>
            </div>

            {/* Compose Form */}
            <div className="flex-1 flex flex-col overflow-y-auto bg-white/50">
              {/* To Field */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <div className="text-xs text-gray-500 mb-1 font-medium">To</div>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full text-sm outline-none text-gray-900"
                  placeholder="Recipient email"
                />
              </div>

              {/* Subject Field */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <div className="text-xs text-gray-500 mb-1 font-medium">
                  Subject
                </div>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full text-sm outline-none text-gray-900"
                  placeholder="Email subject"
                />
              </div>

              {/* Body Field */}
              <div className="flex-1 px-4 py-3 bg-white">
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full h-full text-sm outline-none resize-none text-gray-900"
                  placeholder="Type your message here..."
                />
              </div>
            </div>
          </div>
        </AppsLayout>
      );
    }

    return (
      <AppsLayout onClose={onClose} title="Mail">
        <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-yellow-50 pt-30">
          {/* Emails List */}
          <div className="flex-1 overflow-y-auto">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`px-4 py-3 border-b border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer ${
                  email.unread ? "bg-white/50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md ${getAvatarColor(
                        email.sender
                      )}`}
                    >
                      {getInitials(email.sender)}
                    </div>
                    {email.starred && (
                      <FaStar className="absolute -top-1 -right-1 text-yellow-500 text-xs fill-yellow-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3
                          className={`font-semibold truncate text-base ${
                            email.unread ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {email.sender}
                        </h3>
                        {email.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
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
          <button
            onClick={() => {
              // Open default email client with pre-filled email to panjakub15@gmail.com
              const mailtoLink = `mailto:panjakub15@gmail.com`;
              window.location.href = mailtoLink;
            }}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:from-blue-700 hover:to-blue-800 hover:shadow-3xl transition-all duration-300 z-50 transform hover:scale-110 active:scale-105"
            style={{
              boxShadow:
                "0 10px 40px rgba(37, 99, 235, 0.4), 0 0 20px rgba(37, 99, 235, 0.2)",
            }}
          >
            <FaPlus className="text-2xl font-bold" />
          </button>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Email;

import { useEffect, useState } from "react";
import AppsLayout from "./AppsLayout";

const Contacts = ({
  onClose,
  clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Generate initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate consistent gray gradient color for avatar based on name
  const getAvatarColor = (name: string): string => {
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate gray tones (lighter to darker)
    const grays = [
      "from-gray-400 to-gray-500",
      "from-gray-500 to-gray-600",
      "from-gray-600 to-gray-700",
      "from-gray-500 to-gray-700",
      "from-gray-400 to-gray-600",
    ];

    return grays[Math.abs(hash) % grays.length];
  };

  const name = "Jakub Grzybowski";
  const phoneNumber = "+47 xxx xx xxx";
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600">
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <div className="text-white text-6xl">📞</div>
          <div className="text-white text-2xl font-semibold">Contacts</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout onClose={onClose} title="Contacts">
        <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-yellow-50 pt-30">
          <div className="flex-1 overflow-y-auto">
            {/* Profile Section */}
            <div className="flex flex-col items-center justify-center px-6 py-12">
              {/* Large Avatar */}
              <div
                className={`w-40 h-40 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg mb-6 bg-gradient-to-br ${avatarColor}`}
              >
                {initials}
              </div>

              {/* Name */}
              <h1 className="text-4xl font-bold text-gray-900 mb-3 text-center">
                {name}
              </h1>

              {/* Phone Number */}
              <div className="flex items-center gap-3 mt-4">
                <div className="text-2xl">📞</div>
                <a
                  href={`tel:${phoneNumber.replace(/\s/g, "")}`}
                  className="text-2xl text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  {phoneNumber}
                </a>
              </div>
            </div>
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Contacts;

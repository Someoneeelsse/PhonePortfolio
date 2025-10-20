import { useEffect, useState } from "react";
import { MdBolt } from "react-icons/md";
import { MdOutlineWifi } from "react-icons/md";
import { FaRegMessage } from "react-icons/fa6";
import Messages from "../apps/Messages";
import Email from "../apps/Email";
import Github from "../apps/Github";
import LinkedIn from "../apps/LinkedIn";
import Settings from "../apps/Settings";
import Calculator from "../apps/Calculator";

const PhoneMainScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMessages, setShowMessages] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // App icons data
  const apps = [
    {
      name: "Messages",
      icon: <FaRegMessage className="text-white text-2xl z-1 w-8 h-8" />,
      color: "bg-green-500",
    },
    { name: "Phone", icon: "📞", color: "bg-green-600" },
    { name: "Mail", icon: "📧", color: "bg-blue-500" },
    { name: "Safari", icon: "🌐", color: "bg-blue-600" },
    { name: "LinkedIn", icon: "💼", color: "bg-blue-600" },
    { name: "Photos", icon: "📷", color: "bg-yellow-500" },
    { name: "Camera", icon: "📸", color: "bg-gray-600" },
    { name: "Settings", icon: "⚙️", color: "bg-gray-500" },
    { name: "Maps", icon: "🗺️", color: "bg-blue-700" },
    { name: "Weather", icon: "☀️", color: "bg-orange-500" },
    { name: "Notes", icon: "📝", color: "bg-yellow-600" },
    { name: "Calculator", icon: "🧮", color: "bg-gray-700" },
    { name: "Calendar", icon: "📅", color: "bg-red-600" },
    { name: "Clock", icon: "⏰", color: "bg-indigo-500" },
    { name: "GitHub", icon: "🐙", color: "bg-gray-800" },
    { name: "Health", icon: "❤️", color: "bg-red-400" },
  ];

  // Handle app clicks
  const handleAppClick = (appName: string, event: React.MouseEvent) => {
    // Get the click position relative to the phone screen
    const rect = event.currentTarget
      .closest("[data-phone-screen]")
      ?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setClickPosition({ x, y });
    }

    if (appName === "Messages") {
      setShowMessages(true);
    } else if (appName === "Mail") {
      setShowEmail(true);
    } else if (appName === "GitHub") {
      setShowGithub(true);
    } else if (appName === "LinkedIn") {
      setShowLinkedIn(true);
    } else if (appName === "Settings") {
      setShowSettings(true);
    } else if (appName === "Calculator") {
      setShowCalculator(true);
    }
  };

  // Show Messages app if selected
  if (showMessages) {
    return (
      <Messages
        onClose={() => setShowMessages(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Email app if selected
  if (showEmail) {
    return (
      <Email
        onClose={() => setShowEmail(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show GitHub app if selected
  if (showGithub) {
    return (
      <Github
        onClose={() => setShowGithub(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show LinkedIn app if selected
  if (showLinkedIn) {
    return (
      <LinkedIn
        onClose={() => setShowLinkedIn(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Settings app if selected
  if (showSettings) {
    return (
      <Settings
        onClose={() => setShowSettings(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Calculator app if selected
  if (showCalculator) {
    return (
      <Calculator
        onClose={() => setShowCalculator(false)}
        clickPosition={clickPosition}
      />
    );
  }

  return (
    <div className="w-151 h-321.5 rounded-[71px] relative flex flex-col overflow-hidden ">
      {/* Home Screen Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Time Widget */}
        <div className="px-6 py-4">
          <div className="text-white ml-6 mt-[-7px] flex">
            <div className="text-3xl font-light">
              {currentTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
            <div className="ml-87  flex items-center justify-center gap-3">
              <MdOutlineWifi className="text-white text-2xl z-1 w-8 h-8" />
              {/* Battery container */}
              <div className="relative w-10 h-6 rounded-md bg-white flex items-center justify-center">
                {/* Battery outline */}
                <div className="absolute inset-[2px] rounded-md bg-black flex items-center justify-center">
                  {/* Green charge fill */}
                  <div className="absolute left-[2px] top-[2px] bottom-[2px] w-[50%] bg-green-400 rounded-l-sm transition-all duration-700"></div>

                  {/* Thunderbolt (lightning bolt) */}

                  <MdBolt className="text-white text-2xl z-1 w-5 h-5" />
                </div>

                {/* Battery tip */}
                <div className="absolute right-[-3px] top-[8px] w-[3px] h-[10px] bg-white rounded-r-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="flex-1 px-4 pb-20 mt-5">
          <div className="grid grid-cols-4 gap-4">
            {apps.map((app, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-1 cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => handleAppClick(app.name, e)}
              >
                <div
                  className={`w-24 h-24 ${app.color} rounded-xl flex items-center justify-center text-white text-4xl shadow-lg`}
                >
                  {app.icon}
                </div>
                <span className="text-white text-lg text-center font-medium">
                  {app.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dock */}
        <div className="absolute bottom-4 left-4 right-4 mb-3">
          <div className="bg-black/20 backdrop-blur-sm rounded-[30px] p-2">
            <div className="flex justify-around">
              {apps.slice(0, 4).map((app, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-1 cursor-pointer"
                  onClick={(e) => handleAppClick(app.name, e)}
                >
                  <div
                    className={`w-24 h-24 ${app.color} rounded-xl flex items-center justify-center text-white text-4xl shadow-lg`}
                  >
                    {app.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMainScreen;

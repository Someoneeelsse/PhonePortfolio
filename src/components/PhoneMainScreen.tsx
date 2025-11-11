import { useEffect, useState } from "react";
import {
  MdOutlineWifi,
  MdOutlineWorkHistory,
  MdBolt,
  MdNotes,
} from "react-icons/md";
import { FaRegMessage } from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
import Messages from "../apps/Messages";
import Email from "../apps/Email";
import Github from "../apps/Github";
import LinkedIn from "../apps/LinkedIn";
import Settings from "../apps/Settings";
import Calculator from "../apps/Calculator";
import Notes from "../apps/Notes";
import Snake from "../apps/Snake";
import Weather from "../apps/Weather";
import Calendar from "../apps/Calendar";
import Job from "../apps/Job";
import Projects from "../apps/Projects";
import Education from "../apps/Education";
import Contacts from "../apps/Contacts";
import Safari from "../apps/Safari";
import {
  IoSchoolOutline,
  IoMailOpenOutline,
  IoSettingsOutline,
  IoCalculatorOutline,
  IoCalendarClearOutline,
} from "react-icons/io5";
import { VscSnake } from "react-icons/vsc";
import { ImSafari } from "react-icons/im";
import { AiOutlineLinkedin } from "react-icons/ai";
import { PiImageSquare } from "react-icons/pi";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { LuProjector, LuGithub } from "react-icons/lu";

const PhoneMainScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMessages, setShowMessages] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSnake, setShowSnake] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showJob, setShowJob] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showSafari, setShowSafari] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Listen for close all apps event (from Scene reset)
  useEffect(() => {
    const handleCloseAllApps = () => {
      // Dispatch event to prevent Projects app from triggering reset on unmount
      // This prevents duplicate reset animations
      window.dispatchEvent(new CustomEvent("closeAllAppsEvent"));
      // Close all apps
      setShowMessages(false);
      setShowEmail(false);
      setShowGithub(false);
      setShowLinkedIn(false);
      setShowSettings(false);
      setShowCalculator(false);
      setShowNotes(false);
      setShowSnake(false);
      setShowWeather(false);
      setShowCalendar(false);
      setShowJob(false);
      setShowProjects(false);
      setShowEducation(false);
      setShowContacts(false);
      setShowSafari(false);
    };

    window.addEventListener("closeAllApps", handleCloseAllApps);

    return () => {
      window.removeEventListener("closeAllApps", handleCloseAllApps);
    };
  }, []);

  // App icons data with glass morphism gradients
  const apps = [
    {
      name: "Messages",
      icon: <FaRegMessage className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(34, 197, 94, 0.85)",
      gradientTo: "rgba(16, 185, 129, 0.85)",
    },
    {
      name: "Phone",
      icon: <FiPhone className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(34, 197, 94, 0.85)",
      gradientTo: "rgba(20, 184, 166, 0.85)",
    },
    {
      name: "Mail",
      icon: <IoMailOpenOutline className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(96, 165, 250, 0.85)",
      gradientTo: "rgba(6, 182, 212, 0.85)",
    },
    {
      name: "Safari",
      icon: <ImSafari className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(59, 130, 246, 0.85)",
      gradientTo: "rgba(99, 102, 241, 0.85)",
    },
    {
      name: "LinkedIn",
      icon: <AiOutlineLinkedin className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(37, 99, 235, 0.85)",
      gradientTo: "rgba(29, 78, 216, 0.85)",
    },
    {
      name: "Photos",
      icon: <PiImageSquare className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(250, 204, 21, 0.85)",
      gradientTo: "rgba(245, 158, 11, 0.85)",
    },
    {
      name: "Education",
      icon: <IoSchoolOutline className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(147, 51, 234, 0.85)",
      gradientTo: "rgba(99, 102, 241, 0.85)",
    },
    {
      name: "Settings",
      icon: <IoSettingsOutline className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(156, 163, 175, 0.85)",
      gradientTo: "rgba(107, 114, 128, 0.85)",
    },
    {
      name: "Job",
      icon: (
        <MdOutlineWorkHistory className="text-white text-2xl z-1 w-10 h-10" />
      ),
      gradientFrom: "rgba(147, 51, 234, 0.85)",
      gradientTo: "rgba(124, 58, 237, 0.85)",
    },
    {
      name: "Weather",
      icon: (
        <TiWeatherPartlySunny className="text-white text-2xl z-1 w-10 h-10" />
      ),
      gradientFrom: "rgba(251, 146, 60, 0.85)",
      gradientTo: "rgba(234, 179, 8, 0.85)",
    },
    {
      name: "Notes",
      icon: <MdNotes className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(234, 179, 8, 0.85)",
      gradientTo: "rgba(249, 115, 22, 0.85)",
    },
    {
      name: "Calculator",
      icon: (
        <IoCalculatorOutline className="text-white text-2xl z-1 w-10 h-10" />
      ),
      gradientFrom: "rgba(75, 85, 99, 0.85)",
      gradientTo: "rgba(55, 65, 81, 0.85)",
    },
    {
      name: "Calendar",
      icon: (
        <IoCalendarClearOutline className="text-white text-2xl z-1 w-10 h-10" />
      ),
      gradientFrom: "rgba(239, 68, 68, 0.85)",
      gradientTo: "rgba(225, 29, 72, 0.85)",
    },
    {
      name: "Projects",
      icon: <LuProjector className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(99, 102, 241, 0.85)",
      gradientTo: "rgba(147, 51, 234, 0.85)",
    },
    {
      name: "GitHub",
      icon: <LuGithub className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(55, 65, 81, 0.85)",
      gradientTo: "rgba(31, 41, 55, 0.85)",
    },
    {
      name: "Snake",
      icon: <VscSnake className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(34, 197, 94, 0.85)",
      gradientTo: "rgba(132, 204, 22, 0.85)",
    },
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
    } else if (appName === "Safari") {
      setShowSafari(true);
    } else if (appName === "GitHub") {
      // Open GitHub directly in new tab
      window.open(
        "https://github.com/Someoneeelsse",
        "_blank",
        "noopener,noreferrer"
      );
    } else if (appName === "LinkedIn") {
      // Open LinkedIn directly in new tab
      window.open("https://linkedin.com", "_blank", "noopener,noreferrer");
    } else if (appName === "Settings") {
      setShowSettings(true);
    } else if (appName === "Calculator") {
      setShowCalculator(true);
    } else if (appName === "Notes") {
      setShowNotes(true);
    } else if (appName === "Snake") {
      setShowSnake(true);
    } else if (appName === "Weather") {
      setShowWeather(true);
    } else if (appName === "Calendar") {
      setShowCalendar(true);
    } else if (appName === "Job") {
      setShowJob(true);
    } else if (appName === "Projects") {
      setShowProjects(true);
    } else if (appName === "Education") {
      setShowEducation(true);
    } else if (appName === "Phone") {
      setShowContacts(true);
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

  // Show Notes app if selected
  if (showNotes) {
    return (
      <Notes
        onClose={() => setShowNotes(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Snake app if selected
  if (showSnake) {
    return (
      <Snake
        onClose={() => setShowSnake(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Weather app if selected
  if (showWeather) {
    return (
      <Weather
        onClose={() => setShowWeather(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Calendar app if selected
  if (showCalendar) {
    return (
      <Calendar
        onClose={() => setShowCalendar(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Job app if selected
  if (showJob) {
    return (
      <Job onClose={() => setShowJob(false)} clickPosition={clickPosition} />
    );
  }

  // Show Projects app if selected
  if (showProjects) {
    return (
      <Projects
        onClose={() => setShowProjects(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Education app if selected
  if (showEducation) {
    return (
      <Education
        onClose={() => setShowEducation(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Contacts app if selected
  if (showContacts) {
    return (
      <Contacts
        onClose={() => setShowContacts(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Safari app if selected
  if (showSafari) {
    return (
      <Safari
        onClose={() => setShowSafari(false)}
        clickPosition={clickPosition}
      />
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes glow-sweep {
            0% {
              background-position: -100% -100%;
            }
            100% {
              background-position: 100% 100%;
            }
          }
        `}
      </style>
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
                <MdOutlineWifi className="text-white text-2xl z-1 w-10 h-10" />
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
                  className="flex flex-col items-center space-y-1 cursor-pointer group"
                  onClick={(e) => handleAppClick(app.name, e)}
                >
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-4xl relative overflow-hidden backdrop-blur-xl transition-all duration-300 group-hover:border-2 group-hover:border-gray-700"
                    style={{
                      background: `linear-gradient(135deg, ${app.gradientFrom}, ${app.gradientTo})`,
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                      border: "2px solid transparent",
                      boxShadow:
                        "0 8px 32px 0 rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {/* Animated glow sweep on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `linear-gradient(
                        135deg,
                        transparent 0%,
                        transparent 30%,
                        rgba(255, 255, 255, 0.3) 50%,
                        transparent 70%,
                        transparent 100%
                      )`,
                        backgroundSize: "200% 200%",
                        backgroundPosition: "-100% -100%",
                        animation: "glow-sweep 1.5s ease-in-out",
                      }}
                    />
                    {/* Secondary glow for depth */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(
                        circle at 30% 30%,
                        rgba(255, 255, 255, 0.4) 0%,
                        transparent 50%
                      )`,
                      }}
                    />
                    {/* Content */}
                    <div className="relative z-10 drop-shadow-lg">
                      {app.icon}
                    </div>
                  </div>
                  <span className="text-white text-lg text-center font-medium drop-shadow-lg">
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
                    className="flex flex-col items-center space-y-1 cursor-pointer group"
                    onClick={(e) => handleAppClick(app.name, e)}
                  >
                    <div
                      className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-4xl relative overflow-hidden backdrop-blur-xl transition-all duration-300 group-hover:border-2 group-hover:border-gray-700"
                      style={{
                        background: `linear-gradient(135deg, ${app.gradientFrom}, ${app.gradientTo})`,
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        border: "2px solid transparent",
                        boxShadow:
                          "0 8px 32px 0 rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      {/* Animated glow sweep on hover */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `linear-gradient(
                          135deg,
                          transparent 0%,
                          transparent 30%,
                          rgba(255, 255, 255, 0.3) 50%,
                          transparent 70%,
                          transparent 100%
                        )`,
                          backgroundSize: "200% 200%",
                          backgroundPosition: "-100% -100%",
                          animation: "glow-sweep 1.5s ease-in-out",
                        }}
                      />
                      {/* Secondary glow for depth */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `radial-gradient(
                          circle at 30% 30%,
                          rgba(255, 255, 255, 0.4) 0%,
                          transparent 50%
                        )`,
                        }}
                      />
                      {/* Content */}
                      <div className="relative z-10 drop-shadow-lg">
                        {app.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhoneMainScreen;

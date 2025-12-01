import { useEffect, useState } from "react";
import { MdOutlineWorkHistory, MdBolt, MdNotes } from "react-icons/md";
import { FaRegMessage } from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
import { GoLocation } from "react-icons/go";
import Messages from "../apps/Messages";
import Email from "../apps/Email";
import Github from "../apps/Github";
import LinkedIn from "../apps/LinkedIn";
//import Settings from "../apps/Settings";
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
import Timer from "../apps/Timer";
import Photos from "../apps/Photos";
import {
  IoSchoolOutline,
  IoMailOpenOutline,
  //IoSettingsOutline,
  IoCalculatorOutline,
  IoCalendarClearOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { VscSnake } from "react-icons/vsc";
import { ImSafari } from "react-icons/im";
import { AiOutlineLinkedin } from "react-icons/ai";
import { PiImageSquare } from "react-icons/pi";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { LuProjector, LuGithub } from "react-icons/lu";

interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  minTemp: number;
  maxTemp: number;
  loading: boolean;
  error: string | null;
}

// Get weather icon emoji based on condition
const getWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase();
  if (
    lowerCondition.includes("clearsky") ||
    lowerCondition === "clear" ||
    lowerCondition.includes("sunny")
  ) {
    return "☀️";
  } else if (lowerCondition.includes("thunder")) {
    return "⛈️";
  } else if (
    lowerCondition.includes("heavyrain") ||
    lowerCondition.includes("heavy rain")
  ) {
    return "🌧️";
  } else if (
    lowerCondition.includes("rain") ||
    lowerCondition.includes("drizzle")
  ) {
    return "🌦️";
  } else if (
    lowerCondition.includes("heavysnow") ||
    lowerCondition.includes("heavy snow")
  ) {
    return "❄️";
  } else if (
    lowerCondition.includes("snow") ||
    lowerCondition.includes("sleet")
  ) {
    return "🌨️";
  } else if (lowerCondition.includes("cloudy") || lowerCondition === "clouds") {
    return "☁️";
  } else if (
    lowerCondition.includes("partlycloudy") ||
    lowerCondition.includes("partly cloudy") ||
    lowerCondition.includes("fair")
  ) {
    return "⛅";
  } else if (
    lowerCondition.includes("fog") ||
    lowerCondition.includes("mist") ||
    lowerCondition.includes("haze")
  ) {
    return "🌫️";
  }
  return "🌤️";
};

const PhoneMainScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temp: 0,
    condition: "",
    description: "",
    minTemp: 0,
    maxTemp: 0,
    loading: true,
    error: null,
  });
  const [showMessages, setShowMessages] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  //const [showSettings, setShowSettings] = useState(false);
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
  const [showTimer, setShowTimer] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [isChargerConnected, setIsChargerConnected] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch weather data for Bergen
  useEffect(() => {
    const fetchBergenWeather = async () => {
      const bergenLat = 60.3913;
      const bergenLon = 5.3221;

      try {
        const isDevelopment =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";

        let apiUrl;
        if (isDevelopment) {
          apiUrl = `/api/metno/weatherapi/locationforecast/2.0/compact?lat=${bergenLat}&lon=${bergenLon}`;
        } else {
          apiUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${bergenLat}&lon=${bergenLon}`;
        }

        let response;
        let data;

        try {
          response = await fetch(apiUrl, {
            headers: {
              "User-Agent": "WeatherApp/1.0 (someoneelssesmainportfolio)",
            },
          });

          if (response.ok) {
            data = await response.json();
          } else {
            throw new Error(`API returned ${response.status}`);
          }
        } catch (fetchError: any) {
          if (
            !isDevelopment &&
            (fetchError.message?.includes("CORS") ||
              fetchError.message?.includes("blocked"))
          ) {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
              apiUrl
            )}`;
            response = await fetch(proxyUrl);
            if (!response.ok) {
              throw new Error("Failed to fetch weather data");
            }
            data = await response.json();
          } else {
            throw fetchError;
          }
        }

        if (!data || !data.properties) {
          throw new Error("Invalid API response");
        }

        // Group timeseries by day (same logic as Weather.tsx)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all items for today
        const todayItems = data.properties.timeseries.filter((item: any) => {
          const itemDate = new Date(item.time);
          return itemDate >= today && itemDate < tomorrow;
        });

        if (todayItems.length === 0) {
          throw new Error("No weather data for today");
        }

        // Use the middle interval of the day (around noon) as representative (same as Weather.tsx)
        const representativeItem =
          todayItems[Math.floor(todayItems.length / 2)] || todayItems[0];

        // Calculate average temp from all intervals for today (same as Weather.tsx)
        const temps = todayItems.map(
          (item: any) => item.data.instant.details.air_temperature
        );
        const avgTemp =
          temps.reduce((sum: number, temp: number) => sum + temp, 0) /
          temps.length;
        const temp = Math.round(avgTemp);

        // Get weather condition from symbol code (same as Weather.tsx)
        const symbolCode =
          representativeItem.data.next_6_hours?.summary?.symbol_code ||
          representativeItem.data.next_1_hours?.summary?.symbol_code ||
          representativeItem.data.next_12_hours?.summary?.symbol_code ||
          "clearsky_day";

        const condition = symbolCode.replace(/_day|_night|_polartwilight/g, "");
        const description = condition
          .replace(/_/g, " ")
          .split(" ")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        // Calculate min/max temperatures for today
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));

        setWeatherData({
          temp,
          condition,
          description,
          minTemp,
          maxTemp,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setWeatherData({
          temp: 0,
          condition: "",
          description: "",
          minTemp: 0,
          maxTemp: 0,
          loading: false,
          error: error.message || "Failed to load weather",
        });
      }
    };

    fetchBergenWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchBergenWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
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
      //setShowSettings(false);
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
      setShowTimer(false);
      setShowPhotos(false);
    };

    window.addEventListener("closeAllApps", handleCloseAllApps);

    return () => {
      window.removeEventListener("closeAllApps", handleCloseAllApps);
    };
  }, []);

  // Listen for charger connection status
  useEffect(() => {
    const handleChargerConnected = (event: Event) => {
      const customEvent = event as CustomEvent<{ connected: boolean }>;
      setIsChargerConnected(customEvent.detail.connected);
    };

    window.addEventListener(
      "chargerConnected",
      handleChargerConnected as EventListener
    );

    return () => {
      window.removeEventListener(
        "chargerConnected",
        handleChargerConnected as EventListener
      );
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
    /*{
      name: "Settings",
      icon: <IoSettingsOutline className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(156, 163, 175, 0.85)",
      gradientTo: "rgba(107, 114, 128, 0.85)",
    },*/
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
    {
      name: "Timer",
      icon: <IoTimeOutline className="text-white text-2xl z-1 w-10 h-10" />,
      gradientFrom: "rgba(249, 115, 22, 0.85)",
      gradientTo: "rgba(239, 68, 68, 0.85)",
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
    } /*else if (appName === "Settings") {
      setShowSettings(true);
    }*/ else if (appName === "Calculator") {
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
    } else if (appName === "Timer") {
      setShowTimer(true);
    } else if (appName === "Photos") {
      setShowPhotos(true);
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
  /*if (showSettings) {
    return (
      <Settings
        onClose={() => setShowSettings(false)}
        clickPosition={clickPosition}
      />
    );
  }*/

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

  // Show Timer app if selected
  if (showTimer) {
    return (
      <Timer
        onClose={() => setShowTimer(false)}
        clickPosition={clickPosition}
      />
    );
  }

  // Show Photos app if selected
  if (showPhotos) {
    return (
      <Photos
        onClose={() => setShowPhotos(false)}
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
            <div className="text-white ml-3 mt-[-7px] flex">
              <div className="text-3xl font-light">
                {currentTime.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
              <div className="ml-101 flex items-center justify-center">
                {/* Battery container */}
                <div className="relative w-12 h-7 rounded-md bg-white flex items-center justify-center">
                  {/* Battery outline */}
                  <div className="absolute inset-[2px] rounded-md bg-black flex items-center justify-center">
                    {/* Green charge fill */}
                    <div className="absolute left-[2px] top-[2px] bottom-[2px] w-[50%] bg-green-400 rounded-l-sm transition-all duration-700"></div>

                    {/* Thunderbolt (lightning bolt) */}
                    {isChargerConnected && (
                      <MdBolt className="text-white text-2xl z-1 w-5 h-5" />
                    )}
                  </div>

                  {/* Battery tip */}
                  <div className="absolute right-[-3px] top-[8px] w-[3px] h-[10px] bg-white rounded-r-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Apps Grid with Clock Widget */}
          <div className="flex-1 px-4 pb-20 mt-5">
            <div
              className="grid grid-cols-4 gap-4"
              style={{ gridAutoRows: "minmax(auto, auto)" }}
            >
              {/* Clock Widget - 2x2 */}
              <div
                className="col-span-2 row-span-2 rounded-2xl flex flex-col justify-center items-center text-white relative overflow-hidden backdrop-blur-xl p-4"
                style={{
                  background: `linear-gradient(135deg, rgba(75, 85, 99, 0.85), rgba(55, 65, 81, 0.85))`,
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  border: "2px solid transparent",
                  boxShadow:
                    "0 8px 32px 0 rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  alignSelf: "stretch",
                }}
              >
                {/* Analog Clock */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 200 200"
                    style={{ maxWidth: "220px", maxHeight: "220px" }}
                  >
                    {/* Dashed circle border */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.6)"
                      strokeWidth="2"
                      strokeDasharray="4 8"
                      strokeLinecap="round"
                    />

                    {/* Hour marks (12 dashes pointing inward) */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const x1 = 100 + 85 * Math.cos(angle);
                      const y1 = 100 + 85 * Math.sin(angle);
                      const x2 = 100 + 75 * Math.cos(angle);
                      const y2 = 100 + 75 * Math.sin(angle);
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="rgba(255, 255, 255, 0.8)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* Center dot */}
                    <circle
                      cx="100"
                      cy="100"
                      r="4"
                      fill="rgba(255, 255, 255, 0.9)"
                    />

                    {/* Hour hand (shorter) - moves smoothly with minutes and seconds */}
                    <line
                      x1="100"
                      y1="100"
                      x2={
                        100 +
                        40 *
                          Math.cos(
                            ((currentTime.getHours() % 12) * 30 +
                              currentTime.getMinutes() * 0.5 +
                              currentTime.getSeconds() * (0.5 / 60) -
                              90) *
                              (Math.PI / 180)
                          )
                      }
                      y2={
                        100 +
                        40 *
                          Math.sin(
                            ((currentTime.getHours() % 12) * 30 +
                              currentTime.getMinutes() * 0.5 +
                              currentTime.getSeconds() * (0.5 / 60) -
                              90) *
                              (Math.PI / 180)
                          )
                      }
                      stroke="rgba(255, 255, 255, 0.95)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Minute hand (longer) - moves smoothly with seconds */}
                    <line
                      x1="100"
                      y1="100"
                      x2={
                        100 +
                        60 *
                          Math.cos(
                            (currentTime.getMinutes() * 6 +
                              currentTime.getSeconds() * 0.1 -
                              90) *
                              (Math.PI / 180)
                          )
                      }
                      y2={
                        100 +
                        60 *
                          Math.sin(
                            (currentTime.getMinutes() * 6 +
                              currentTime.getSeconds() * 0.1 -
                              90) *
                              (Math.PI / 180)
                          )
                      }
                      stroke="rgba(255, 255, 255, 0.95)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Weather Widget - 2x2 */}
              <div
                className="col-span-2 row-span-2 rounded-2xl flex flex-col justify-center items-center text-white relative overflow-hidden backdrop-blur-xl p-4 cursor-pointer group"
                onClick={() => setShowWeather(true)}
                style={{
                  background: `linear-gradient(135deg, rgba(251, 146, 60, 0.85), rgba(234, 179, 8, 0.85))`,
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  border: "2px solid transparent",
                  boxShadow:
                    "0 8px 32px 0 rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  alignSelf: "stretch",
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
                {weatherData.loading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <div className="text-sm opacity-70">Loading...</div>
                  </div>
                ) : weatherData.error ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-2">🌤️</div>
                    <div className="text-sm opacity-70">Bergen</div>
                    <div className="text-xs opacity-50 mt-1">
                      Unable to load
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col w-full h-full p-3 relative z-10">
                    {/* Background Weather Icon */}
                    <div
                      className="absolute inset-0 flex items-center justify-center z-0"
                      style={{ opacity: 0.55 }}
                    >
                      <div className="text-[200px] drop-shadow-2xl">
                        {getWeatherIcon(weatherData.condition)}
                      </div>
                    </div>

                    {/* Content on top */}
                    <div className="relative z-10 flex flex-col w-full h-full">
                      {/* Top row: Location (left) and Temperature (right) */}
                      <div className="flex justify-between items-start mb-3">
                        {/* Location - Top Left */}
                        <div className="flex items-center gap-2">
                          <GoLocation className="text-black/90 text-2xl" />
                          <span className="text-xl font-medium text-black opacity-90 drop-shadow-md">
                            Bergen
                          </span>
                        </div>
                        {/* Temperature - Top Right */}
                        <div className="text-6xl font-light mt-10 drop-shadow-lg text-white">
                          {weatherData.temp}°C
                        </div>
                      </div>

                      {/* Bottom section: Lowest and Highest */}
                      <div className="flex-1"></div>
                      <div className="flex justify-between items-end">
                        {/* Left side: Lowest */}
                        <div className="text-lg text-black opacity-80 drop-shadow-sm">
                          Low: {weatherData.minTemp}°C
                        </div>
                        {/* Right side: Highest */}
                        <div className="text-lg text-black opacity-80 drop-shadow-sm">
                          High: {weatherData.maxTemp}°C
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Apps - starting from position 3 (after widgets) */}
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

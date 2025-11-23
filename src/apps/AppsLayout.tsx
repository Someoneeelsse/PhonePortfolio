import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdBolt } from "react-icons/md";

interface AppsLayoutProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  textColor?: string;
  statusBarTextColor?: string; // Color for time and status bar elements
  batteryColorScheme?: "light" | "dark"; // "light" for light backgrounds, "dark" for dark backgrounds
}

const AppsLayout = ({
  children,
  onClose,
  title,
  textColor = "text-gray-700",
  statusBarTextColor = "text-white", // Default to white for dark backgrounds
  batteryColorScheme = "dark", // Default to dark (white border, black fill) for dark backgrounds
}: AppsLayoutProps) => {
  // Determine battery colors based on scheme
  const batteryBorderColor =
    batteryColorScheme === "light" ? "bg-black" : "bg-white";
  const batteryFillColor =
    batteryColorScheme === "light" ? "bg-white" : "bg-black";
  const batteryThunderboltColor =
    batteryColorScheme === "light" ? "text-black" : "text-white";
  const batteryTipColor =
    batteryColorScheme === "light" ? "bg-black" : "bg-white";
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-151 h-321.5 rounded-[71px] absolute top-0 left-0 overflow-hidden">
      {/* App Content - Full Screen */}
      <div className="w-full h-full">{children}</div>

      {/* Status Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className={`${statusBarTextColor} ml-3 mt-[-7px] flex`}>
          <div className="text-3xl font-light">
            {currentTime.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: false,
            })}
          </div>
          <div className="ml-101 flex items-center justify-center">
            {/* Battery container */}
            <div
              className={`relative w-12 h-7 rounded-md ${batteryBorderColor} flex items-center justify-center`}
            >
              {/* Battery outline */}
              <div
                className={`absolute inset-[2px] rounded-md ${batteryFillColor} flex items-center justify-center`}
              >
                {/* Green charge fill */}
                <div className="absolute left-[2px] top-[2px] bottom-[2px] w-[50%] bg-green-400 rounded-l-sm transition-all duration-700"></div>

                {/* Thunderbolt (lightning bolt) */}
                <MdBolt
                  className={`${batteryThunderboltColor} text-2xl z-1 w-5 h-5`}
                />
              </div>

              {/* Battery tip */}
              <div
                className={`absolute right-[-3px] top-[8px] w-[3px] h-[10px] ${batteryTipColor} rounded-r-sm`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Title Overlay */}
      <div className="absolute top-15 left-0 right-0 z-50 px-4 py-2 flex items-center pointer-events-none">
        <button
          onClick={onClose}
          className={`flex items-center space-x-2 ${textColor} transition-colors pointer-events-auto`}
        >
          <FaArrowLeft className="text-3xl" />
          <span className="text-3xl font-medium">{title}</span>
        </button>
      </div>
    </div>
  );
};

export default AppsLayout;

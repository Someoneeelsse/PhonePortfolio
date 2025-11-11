import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdBolt } from "react-icons/md";
import { MdOutlineWifi } from "react-icons/md";

interface AppsLayoutProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  textColor?: string;
}

const AppsLayout = ({
  children,
  onClose,
  title,
  textColor = "text-gray-700",
}: AppsLayoutProps) => {
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
      <div className="absolute top-0 left-0 right-0 z-50  px-6 py-4 flex items-center justify-between ">
        <div className="text-black text-3xl font-light ml-6 mt-[-7px]">
          {currentTime.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: false,
          })}
        </div>
        <div className="mr-7 flex items-center justify-center gap-3">
          <MdOutlineWifi className="text-black text-2xl z-1 w-8 h-8" />
          {/* Battery container */}
          <div className="relative w-10 h-6 rounded-md bg-white flex items-center justify-center ">
            {/* Battery outline */}
            <div className="absolute inset-[2px] rounded-md bg-black flex items-center justify-center">
              {/* Green charge fill */}
              <div className="absolute left-[2px] top-[2px] bottom-[2px] w-[50%] bg-green-400 rounded-l-sm transition-all duration-700"></div>

              {/* Thunderbolt (lightning bolt) */}

              <MdBolt className="text-white text-2xl z-1 w-5 h-5" />
            </div>

            {/* Battery tip */}
            <div className="absolute right-[-3px] top-[8px] w-[3px] h-[10px] bg-white rounded-r-sm border-black border-1"></div>
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

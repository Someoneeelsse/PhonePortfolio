import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import AppsLayout from "./AppsLayout";

const Github = ({
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

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-gray-800">
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <FaGithub className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">GitHub</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout onClose={onClose} title="GitHub">
        <div className="h-full flex flex-col bg-white pt-30">
          {/* GitHub iframe */}
          <div className="flex-1 w-full h-full">
            <iframe
              src="https://github.com/Someoneeelsse"
              className="w-full h-full border-0"
              title="GitHub"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            />
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Github;

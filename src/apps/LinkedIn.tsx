import { useEffect, useState } from "react";
import { FaLinkedin } from "react-icons/fa";
import AppsLayout from "./AppsLayout";

const LinkedIn = ({
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
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-blue-600">
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <FaLinkedin className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">LinkedIn</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout onClose={onClose} title="LinkedIn">
        <div className="h-full flex flex-col bg-white pt-30">
          {/* LinkedIn iframe */}
          <div className="flex-1 w-full h-full">
            <iframe
              src="https://linkedin.com"
              className="w-full h-full border-0"
              title="LinkedIn"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            />
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default LinkedIn;

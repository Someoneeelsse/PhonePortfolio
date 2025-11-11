import { useEffect, useState } from "react";
import AppsLayout from "./AppsLayout";
import { ImSafari } from "react-icons/im";

const Safari = ({
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

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600">
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <ImSafari className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">Safari</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout onClose={onClose} title="Safari">
        <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-yellow-50 pt-30">
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6">
            <div className="text-center space-y-6 max-w-full">
              {/* Safari Image */}
              <div className="flex justify-center mb-4">
                <img
                  src="./images/Safari.png"
                  alt="Safari"
                  className="max-w-full h-auto rounded-2xl shadow-2xl"
                  style={{ maxHeight: "400px" }}
                />
              </div>

              {/* Subtitle */}
              <p className="text-xl text-gray-700 font-medium">
                It is just a safari, I guess, nothing more to it, sorry
              </p>
            </div>
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Safari;

import { useEffect, useState } from "react";
import AppsLayout from "./AppsLayout";

const Projects = ({
  onClose,
  clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger background change when Projects app opens
    window.dispatchEvent(new CustomEvent("projectsAppClicked"));

    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    let shouldResetOnUnmount = true;

    // Listen for closeAllAppsEvent to prevent duplicate reset
    const handleCloseAllApps = () => {
      shouldResetOnUnmount = false;
    };

    window.addEventListener("closeAllAppsEvent", handleCloseAllApps);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("closeAllAppsEvent", handleCloseAllApps);

      // Only trigger reset if we're not being closed by closeAllApps event
      // This prevents duplicate reset triggers
      if (shouldResetOnUnmount) {
        // When component unmounts (app closes via back button), trigger reset to initial view
        // This will reset background, hide ProjectsCard, and move phone back
        window.dispatchEvent(new CustomEvent("resetToInitialView"));
      }
    };
  }, []);

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-purple-600">
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <div className="text-white text-6xl">📽️</div>
          <div className="text-white text-2xl font-semibold">Projects</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout onClose={onClose} title="Projects">
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          {/* Projects content will be shown in the 3D scene via ProjectsCard */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-4xl mb-4">📽️</div>
              <div className="text-2xl font-semibold mb-2">Projects</div>
              <div className="text-gray-400">View projects in the 3D scene</div>
            </div>
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Projects;

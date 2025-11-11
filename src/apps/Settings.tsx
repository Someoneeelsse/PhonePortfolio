import { useEffect, useState } from "react";
import {
  FaCog,
  FaWifi,
  FaBluetooth,
  FaShieldAlt,
  FaUser,
  FaBell,
  FaBatteryThreeQuarters,
  FaMobile,
  FaGamepad,
  FaPalette,
  FaKey,
  FaEye,
  FaLanguage,
  FaChevronRight,
} from "react-icons/fa";
import AppsLayout from "./AppsLayout";

const Settings = ({
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
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-gray-500">
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <FaCog className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">Settings</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout onClose={onClose} title="Settings">
        <div className="h-full flex flex-col bg-gray-50 pt-30">
          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Apple ID Section */}
            <div className="bg-white mb-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-xl" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      John Doe
                    </div>
                    <div className="text-sm text-gray-500">
                      Apple ID, iCloud+, Media & Purchases
                    </div>
                  </div>
                  <FaChevronRight className="text-gray-400 ml-auto" />
                </div>
              </div>
            </div>

            {/* Airplane Mode, WiFi, Bluetooth */}
            <div className="bg-white mb-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaMobile className="text-gray-600 text-lg" />
                    <span className="text-gray-900">Airplane Mode</span>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaWifi className="text-gray-600 text-lg" />
                    <span className="text-gray-900">Wi-Fi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 text-sm">Home Network</span>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaBluetooth className="text-gray-600 text-lg" />
                    <span className="text-gray-900">Bluetooth</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 text-sm">On</span>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Cellular, Personal Hotspot */}
            <div className="bg-white mb-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">📶</span>
                    </div>
                    <span className="text-gray-900">Cellular</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">📱</span>
                    </div>
                    <span className="text-gray-900">Personal Hotspot</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">Off</span>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications, Control Center, Screen Time */}
            <div className="bg-white mb-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaBell className="text-gray-600 text-lg" />
                    <span className="text-gray-900">Notifications</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaGamepad className="text-gray-600 text-lg" />
                    <span className="text-gray-900">Control Center</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">⏰</span>
                    </div>
                    <span className="text-gray-900">Screen Time</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* General, Appearance, Accessibility */}
            <div className="bg-white mb-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaCog className="text-gray-600 text-lg" />
                    <span className="text-gray-900">General</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaPalette className="text-gray-600 text-lg" />
                    <span className="text-gray-900">Appearance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">Light</span>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaEye className="text-gray-600 text-lg" />
                    <span className="text-gray-900">Accessibility</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Privacy & Security, App Store */}
            <div className="bg-white mb-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaShieldAlt className="text-gray-600 text-lg" />
                    <span className="text-gray-900">Privacy & Security</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">🛍️</span>
                    </div>
                    <span className="text-gray-900">App Store</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Battery, Storage */}
            <div className="bg-white mb-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaBatteryThreeQuarters className="text-gray-600 text-lg" />
                    <span className="text-gray-900">Battery</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">💾</span>
                    </div>
                    <span className="text-gray-900">Storage</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Siri & Search, Language & Region */}
            <div className="bg-white mb-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🎤</span>
                    </div>
                    <span className="text-gray-900">Siri & Search</span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaLanguage className="text-gray-600 text-lg" />
                    <span className="text-gray-900">Language & Region</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">English (US)</span>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Software Update, Transfer or Reset */}
            <div className="bg-white mb-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">🔄</span>
                    </div>
                    <span className="text-gray-900">Software Update</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 text-sm">iOS 17.2</span>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaKey className="text-gray-600 text-lg" />
                    <span className="text-gray-900">
                      Transfer or Reset iPhone
                    </span>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Settings;

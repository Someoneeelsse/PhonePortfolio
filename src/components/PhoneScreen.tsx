import { useEffect, useState, useRef } from "react";
import PhoneMainScreen from "./PhoneMainScreen";

const PhoneScreen = () => {
  const [showRedDot, setShowRedDot] = useState(false);
  const [showBattery, setShowBattery] = useState(false);
  const [showLockscreen, setShowLockscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [batterySequenceComplete, setBatterySequenceComplete] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lockscreenOffset, setLockscreenOffset] = useState(0);
  const [_, setShowMainScreen] = useState(false);
  const [isPhoneScreenVisible, setIsPhoneScreenVisible] = useState(true);
  const dragRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleAnimationComplete = () => {
      setShowRedDot(true);
      setShowBattery(true);

      // Hide battery after animation completes (3.2s + 0.5s buffer)
      setTimeout(() => {
        setShowBattery(false);
        setBatterySequenceComplete(true);

        // Don't show lockscreen here - only after green battery

        // Dispatch event to trigger charger text slide up
        window.dispatchEvent(new CustomEvent("batteryAnimationComplete"));
      }, 3700);
    };

    // Listen for green battery completion from Scene.tsx
    const handleGreenBatteryComplete = () => {
      setShowLockscreen(true);
    };

    window.addEventListener("dotsAnimationComplete", handleAnimationComplete);
    window.addEventListener("greenBatteryComplete", handleGreenBatteryComplete);

    return () => {
      window.removeEventListener(
        "dotsAnimationComplete",
        handleAnimationComplete
      );
      window.removeEventListener(
        "greenBatteryComplete",
        handleGreenBatteryComplete
      );
    };
  }, []);

  // Debug logs for state changes
  useEffect(() => {}, [
    showRedDot,
    showBattery,
    showLockscreen,
    isUnlocked,
    batterySequenceComplete,
  ]);

  // Update time every second
  useEffect(() => {
    const handleVisibilityChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ visible: boolean }>;
      setIsPhoneScreenVisible(customEvent.detail.visible);
    };
    window.addEventListener("phoneScreenVisibility", handleVisibilityChange);
    return () => {
      window.removeEventListener("phoneScreenVisibility", handleVisibilityChange);
    };
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isUnlocked) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startYRef.current = e.clientY;

    // Don't show main screen on click, only when actually dragging

    // Add global mouse move and up listeners to prevent losing track
    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || isUnlocked) return;

    // Store current Y position
    currentYRef.current = e.clientY;

    // Calculate delta from where we started dragging
    const deltaY = e.clientY - startYRef.current;

    // Get the phone screen element to calculate relative position
    const phoneElement = document.querySelector(
      "[data-phone-screen]"
    ) as HTMLElement;
    if (!phoneElement) return;

    const phoneRect = phoneElement.getBoundingClientRect();

    // Calculate lockscreen offset based on delta movement (invert for upward movement)
    const maxOffset = phoneRect.height;
    const lockscreenOffset = Math.max(0, Math.min(maxOffset, -deltaY));
    setLockscreenOffset(lockscreenOffset);

    // Update dragY for unlock logic

    // Show main screen only when lockscreen is significantly moved up
    if (lockscreenOffset > 50) {
      setShowMainScreen(true);
    }
  };

  const handleGlobalMouseUp = () => {
    if (!isDraggingRef.current || isUnlocked) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    // Remove global listeners
    document.removeEventListener("mousemove", handleGlobalMouseMove);
    document.removeEventListener("mouseup", handleGlobalMouseUp);

    // Check if slider reached Y = 350 threshold
    if (currentYRef.current < 350 || lockscreenOffset >= 200) {
      // Snap upwards (unlock) when slider is above Y = 350

      setIsUnlocked(true);
      setLockscreenOffset(1321.5 + 50); // Slide completely off screen
      window.dispatchEvent(new CustomEvent("phoneUnlocked"));
    } else {
      // Snap back to original position (locked)
      isDraggingRef.current = false;
      setLockscreenOffset(0);
      setShowMainScreen(false); // Hide main screen when locked
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isUnlocked) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;

    // Don't show main screen on touch, only when actually dragging

    // Add global touch listeners for mobile
    document.addEventListener("touchmove", handleGlobalTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleGlobalTouchEnd);
  };

  const handleGlobalTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current || isUnlocked) return;
    e.preventDefault(); // Prevent scrolling

    // Store current Y position
    currentYRef.current = e.touches[0].clientY;

    // Calculate delta from where we started dragging
    const deltaY = e.touches[0].clientY - startYRef.current;

    // Get the phone screen element to calculate relative position
    const phoneElement = document.querySelector(
      "[data-phone-screen]"
    ) as HTMLElement;
    if (!phoneElement) return;

    const phoneRect = phoneElement.getBoundingClientRect();

    // Calculate lockscreen offset based on delta movement (invert for upward movement)
    const maxOffset = phoneRect.height;
    const lockscreenOffset = Math.max(0, Math.min(maxOffset, -deltaY));
    setLockscreenOffset(lockscreenOffset);

    // Update dragY for unlock logic

    // Show main screen only when lockscreen is significantly moved up
    if (lockscreenOffset > 50) {
      setShowMainScreen(true);
    }

    // Auto-drop upwards when slider reaches Y position > 350
    if (e.touches[0].clientY < 350) {
      setIsUnlocked(true);
      // Smooth animation to slide lockscreen completely off screen
      setLockscreenOffset(phoneRect.height + 50);
      // Dispatch unlock event
      window.dispatchEvent(new CustomEvent("phoneUnlocked"));
    }
  };

  const handleGlobalTouchEnd = () => {
    if (!isDraggingRef.current || isUnlocked) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    // Remove global listeners
    document.removeEventListener("touchmove", handleGlobalTouchMove);
    document.removeEventListener("touchend", handleGlobalTouchEnd);

    // Check if slider reached Y = 350 threshold
    if (currentYRef.current < 350 || lockscreenOffset >= 200) {
      // Snap upwards (unlock) when slider is above Y = 350

      setIsUnlocked(true);
      setLockscreenOffset(321.5 + 50); // Slide completely off screen
      window.dispatchEvent(new CustomEvent("phoneUnlocked"));
    } else {
      // Snap back to original position (locked)
      isDraggingRef.current = false;
      setLockscreenOffset(0);
      setShowMainScreen(false); // Hide main screen when locked
    }
  };

  return (
    <div
      data-phone-screen
      className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        clipPath:
          "polygon(0% 0%, 22% 0%, 22.7% 3px, 23.5% 31px, 23.7% 33px, 24.2% 37px, 24.9% 41px, 25.8% 43.2px, 26.2% 44px,    72.8% 44px,  73.2% 43.2px,  74.1% 41px,  74.8% 37px, 75.3% 33px,  75.5% 31px, 76.3% 3px, 77% 0%, 100% 0%, 100% 100%, 0% 100%  )",
        // Ensure PhoneScreen is always visible on top
        zIndex: 1000,
        opacity: isPhoneScreenVisible ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: isPhoneScreenVisible ? "auto" : "none",
      }}
    >
      {/* Background layer that can fade independently */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: "url('./images/BlackGlass.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: showLockscreen ? 0 : 1,
          transition: "opacity 1.2s ease-out",
          zIndex: 1,
          // Ensure background is always visible from the start
          pointerEvents: "auto",
        }}
      />

      {showRedDot && showBattery && !batterySequenceComplete && (
        <div
          className="flex items-center justify-center pl-10"
          style={{
            animation: "blink3times 3.2s ease-in-out",
          }}
        >
          {/* Battery Icon */}
          <div className="relative">
            {/* Battery Body */}
            <div className="w-65 h-30 rounded-lg bg-gray-400 relative">
              <div className="w-63 h-28 rounded-lg bg-black absolute top-1 left-1" />
              <div
                className="w-10 h-10 bg-gray-400 absolute top-1/3 left-14/15"
                style={{
                  clipPath: "polygon(50% 0%, 80% 0%, 80% 100%, 50% 100%)",
                  borderRadius: "0 100% 100% 0",
                }}
              />
              <div className="w-3 h-28 bg-red-500 absolute left-[4px] top-1 rounded-l-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Main Phone Screen - Only show when lockscreen is visible and user is dragging */}
      {showLockscreen && lockscreenOffset > 50 && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: 1,
            clipPath:
              "polygon(0% 0%, 22% 0%, 22.7% 3px, 23.5% 31px, 23.7% 33px, 24.2% 37px, 24.9% 41px, 25.8% 43.2px, 26.2% 44px,    72.8% 44px,  73.2% 43.2px,  74.1% 41px,  74.8% 37px, 75.3% 33px,  75.5% 31px, 76.3% 3px, 77% 0%, 100% 0%, 100% 100%, 0% 100%  )",
          }}
        >
          <PhoneMainScreen />
        </div>
      )}

      {/* Lockscreen - Slides up when dragged */}
      {showLockscreen && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: 2,
            transform: `translateY(-${lockscreenOffset}px)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
            backgroundImage: "url('./images/LockScreen.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            clipPath:
              "polygon(0% 0%, 22% 0%, 22.7% 3px, 23.5% 31px, 23.7% 33px, 24.2% 37px, 24.9% 41px, 25.8% 43.2px, 26.2% 44px,    72.8% 44px,  73.2% 43.2px,  74.1% 41px,  74.8% 37px, 75.3% 33px,  75.5% 31px, 76.3% 3px, 77% 0%, 100% 0%, 100% 100%, 0% 100%  )",
          }}
        >
          {/* Time and date */}
          <div
            className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center text-white"
            style={{
              animation: "fadeInUp 0.6s ease-out 0.2s both",
            }}
          >
            <div className="text-lg opacity-80 mb-1">
              {(() => {
                const date = currentTime;
                const weekday = date.toLocaleDateString([], {
                  weekday: "short",
                });
                const day = date.getDate();
                const month = date.toLocaleDateString([], { month: "short" });
                return `${weekday} ${day} ${month}`;
              })()}
            </div>
            <div className="text-[100px] font-light">
              {currentTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
          </div>

          {/* Unlock slider */}
          <div
            className="absolute bottom-2 left-4 right-4 flex items-center justify-center"
            style={{
              animation: "fadeInUp 0.6s ease-out 0.6s both",
            }}
          >
            <div
              ref={dragRef}
              className="relative bg-white/20 backdrop-blur-sm rounded-full w-50 h-3 flex items-center justify-center cursor-pointer select-none"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                transition: isDragging ? "none" : "transform 0.3s ease-out",
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneScreen;

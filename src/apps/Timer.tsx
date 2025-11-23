import { useEffect, useState, useRef, useCallback } from "react";
import { IoTimeOutline } from "react-icons/io5";
import { FaPlay, FaPause } from "react-icons/fa";
import AppsLayout from "./AppsLayout";

// Wheel Picker Component
interface WheelPickerProps {
  options: number[];
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const WheelPicker = ({ options, value, onChange, label }: WheelPickerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // Constants
  const itemHeight = 48; // Height of each item in pixels
  const containerHeight = 192; // max-h-48 = 192px
  const viewportCenter = containerHeight / 2; // Center of viewport (96px)
  const paddingCount = 3; // Number of padding items at top and bottom
  const paddingHeight = paddingCount * itemHeight; // Total padding height (144px)
  const friction = 0.92; // Friction coefficient
  const minVelocity = 0.1; // Minimum velocity to continue scrolling

  // Helper: Calculate scroll position to center an item in the viewport
  // The white box is always at viewportCenter (96px from top)
  const getScrollForIndex = (index: number): number => {
    // Position of item's top edge in content (after padding)
    const itemTop = paddingHeight + index * itemHeight;
    // Position of item's center
    const itemCenter = itemTop + itemHeight / 2;

    // Always center items at viewport center (96px from top)
    // scrollTop + viewportCenter = itemCenter
    // Therefore: scrollTop = itemCenter - viewportCenter
    const scrollTop = itemCenter - viewportCenter;

    // For index 0, ensure it's centered (should be 72px)
    // This positions 00 in the middle of the viewport
    return scrollTop;
  };

  // Helper: Calculate which item index is centered in the viewport
  const getIndexFromScroll = (scrollTop: number): number => {
    // Position of viewport center in content coordinates
    const centerInContent = scrollTop + viewportCenter;
    // Subtract padding to get position relative to first item's top
    const relativeToFirstItemTop = centerInContent - paddingHeight;
    // Subtract half item height to get position relative to first item's center
    const relativeToFirstItemCenter = relativeToFirstItemTop - itemHeight / 2;
    // Divide by item height to get the index (round to nearest)
    const index = Math.round(relativeToFirstItemCenter / itemHeight);
    // Clamp to valid range
    return Math.max(0, Math.min(index, options.length - 1));
  };

  // Initial scroll position on mount
  useEffect(() => {
    if (!isInitializedRef.current && scrollRef.current) {
      const index = options.indexOf(value);
      if (index !== -1) {
        const targetScroll = getScrollForIndex(index);

        const setScroll = () => {
          if (scrollRef.current && !isInitializedRef.current) {
            scrollRef.current.scrollTop = targetScroll;
            // Verify it was set
            const actualScroll = scrollRef.current.scrollTop;
            if (Math.abs(actualScroll - targetScroll) < 1) {
              isInitializedRef.current = true;
            }
          }
        };
        setScroll();
        requestAnimationFrame(setScroll);
        setTimeout(setScroll, 10);
        setTimeout(setScroll, 50);
        setTimeout(setScroll, 100);
      }
    }
  }, [
    value,
    options,
    itemHeight,
    paddingHeight,
    viewportCenter,
    getScrollForIndex,
  ]);

  // Scroll to selected value when value changes externally (but not on initial mount)
  useEffect(() => {
    if (
      scrollRef.current &&
      !isDraggingRef.current &&
      !animationFrameRef.current &&
      isInitializedRef.current
    ) {
      const index = options.indexOf(value);
      if (index !== -1) {
        const targetScroll = getScrollForIndex(index);
        scrollRef.current.scrollTop = targetScroll;
      }
    }
  }, [value, options, itemHeight, paddingHeight, viewportCenter]);

  // Calculate which value is in the center
  const getValueFromScroll = useCallback(
    (scrollTop: number): number => {
      const index = getIndexFromScroll(scrollTop);
      return options[index];
    },
    [options, itemHeight, paddingHeight, viewportCenter]
  );

  // Snap to nearest value - always center perfectly
  const snapToValue = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const index = getIndexFromScroll(scrollTop);
    const targetScroll = getScrollForIndex(index);

    // Use instant scroll to center perfectly
    scrollRef.current.scrollTop = targetScroll;

    const newValue = options[index];
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [options, value, onChange, getIndexFromScroll, getScrollForIndex]);

  // Momentum scrolling animation
  const startMomentumScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = () => {
      if (!scrollRef.current) return;

      // Apply velocity (velocity is already in the correct direction from drag)
      const currentScroll = scrollRef.current.scrollTop;
      const newScroll = currentScroll + velocityRef.current; // Add velocity (it's already signed correctly)

      // Clamp scroll position
      const minScroll = getScrollForIndex(0);
      const maxScroll = getScrollForIndex(options.length - 1);
      const clampedScroll = Math.max(minScroll, Math.min(maxScroll, newScroll));

      // If we hit a boundary, reduce velocity significantly
      if (clampedScroll === minScroll || clampedScroll === maxScroll) {
        velocityRef.current *= 0.3; // Strong damping at boundaries
      }

      scrollRef.current.scrollTop = clampedScroll;

      // Update value
      const newValue = getValueFromScroll(clampedScroll);
      if (newValue !== value) {
        onChange(newValue);
      }

      // Apply friction
      velocityRef.current *= friction;

      // Continue or stop
      if (Math.abs(velocityRef.current) > minVelocity) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Velocity is low, snap to nearest value
        velocityRef.current = 0;
        snapToValue();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [
    friction,
    minVelocity,
    itemHeight,
    paddingHeight,
    options,
    getValueFromScroll,
    value,
    onChange,
    snapToValue,
    viewportCenter,
  ]);

  // Handle scroll event (for wheel scrolling)
  const handleScroll = () => {
    if (!scrollRef.current || isDraggingRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const index = getIndexFromScroll(scrollTop);
    const newValue = options[index];

    if (newValue !== value) {
      onChange(newValue);
      // Immediately center the new value perfectly
      const targetScroll = getScrollForIndex(index);
      scrollRef.current.scrollTop = targetScroll;
    }
    lastScrollTopRef.current = scrollRef.current.scrollTop;
  };

  // Global mouse move handler
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !scrollRef.current) return;

      const now = Date.now();
      const currentScroll = scrollRef.current.scrollTop;

      // Calculate velocity (pixels per frame, negative because dragging down scrolls up)
      if (lastTimeRef.current > 0) {
        const deltaTime = now - lastTimeRef.current;
        const deltaScroll = currentScroll - lastScrollTopRef.current;

        if (deltaTime > 0) {
          // Velocity in pixels per millisecond, converted to pixels per frame (assuming 60fps)
          velocityRef.current = (deltaScroll / deltaTime) * 16.67;
        }
      }

      const deltaY = e.clientY - startYRef.current;
      const newScrollTop = scrollTopRef.current - deltaY;
      scrollRef.current.scrollTop = newScrollTop;
      const newValue = getValueFromScroll(newScrollTop);
      if (newValue !== value) {
        onChange(newValue);
      }

      // Update tracking values
      lastTimeRef.current = now;
      lastScrollTopRef.current = newScrollTop;
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;

        // Capture final velocity right before release
        if (scrollRef.current && lastTimeRef.current > 0) {
          const now = Date.now();
          const currentScroll = scrollRef.current.scrollTop;
          const deltaTime = now - lastTimeRef.current;
          const deltaScroll = currentScroll - lastScrollTopRef.current;

          if (deltaTime > 0) {
            // Update velocity one more time with the most recent movement
            velocityRef.current = (deltaScroll / deltaTime) * 16.67;
          }
        }

        // Start momentum scrolling if there's enough velocity
        if (Math.abs(velocityRef.current) > minVelocity) {
          startMomentumScroll();
        } else {
          // No momentum, just snap
          snapToValue();
        }

        // Reset tracking
        lastTimeRef.current = 0;
      }
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    value,
    onChange,
    getValueFromScroll,
    snapToValue,
    startMomentumScroll,
    minVelocity,
  ]);

  // Mouse/Touch drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Stop any ongoing momentum scroll
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    velocityRef.current = 0;
    lastTimeRef.current = Date.now();

    if (scrollRef.current) {
      scrollTopRef.current = scrollRef.current.scrollTop;
      lastScrollTopRef.current = scrollRef.current.scrollTop;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Stop any ongoing momentum scroll
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    isDraggingRef.current = true;
    startYRef.current = e.touches[0].clientY;
    velocityRef.current = 0;
    lastTimeRef.current = Date.now();

    if (scrollRef.current) {
      scrollTopRef.current = scrollRef.current.scrollTop;
      lastScrollTopRef.current = scrollRef.current.scrollTop;
    }
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;

    const now = Date.now();
    const currentScroll = scrollRef.current.scrollTop;

    // Calculate velocity
    if (lastTimeRef.current > 0) {
      const deltaTime = now - lastTimeRef.current;
      const deltaScroll = currentScroll - lastScrollTopRef.current;

      if (deltaTime > 0) {
        velocityRef.current = (deltaScroll / deltaTime) * 16.67;
      }
    }

    const deltaY = e.touches[0].clientY - startYRef.current;
    const newScrollTop = scrollTopRef.current - deltaY;
    scrollRef.current.scrollTop = newScrollTop;
    const newValue = getValueFromScroll(newScrollTop);
    if (newValue !== value) {
      onChange(newValue);
    }

    // Update tracking values
    lastTimeRef.current = now;
    lastScrollTopRef.current = newScrollTop;

    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;

      // Capture final velocity right before release
      if (scrollRef.current && lastTimeRef.current > 0) {
        const now = Date.now();
        const currentScroll = scrollRef.current.scrollTop;
        const deltaTime = now - lastTimeRef.current;
        const deltaScroll = currentScroll - lastScrollTopRef.current;

        if (deltaTime > 0) {
          // Update velocity one more time with the most recent movement
          velocityRef.current = (deltaScroll / deltaTime) * 16.67;
        }
      }

      // Start momentum scrolling if there's enough velocity
      if (Math.abs(velocityRef.current) > minVelocity) {
        startMomentumScroll();
      } else {
        // No momentum, just snap
        snapToValue();
      }

      // Reset tracking
      lastTimeRef.current = 0;
    }
  };

  // Add padding items for infinite scroll effect
  const paddingItemsArray = Array.from({ length: paddingCount }, () => null);

  return (
    <div className="flex flex-col items-center">
      <div className="text-gray-400 text-xs mb-3 font-medium">{label}</div>
      <div className="relative">
        {/* Scrollable container */}
        <div
          ref={(el) => {
            scrollRef.current = el;
            // Set initial scroll position when ref is attached
            if (el && !isInitializedRef.current) {
              const index = options.indexOf(value);
              if (index !== -1) {
                const targetScroll = getScrollForIndex(index);
                // Force scroll position multiple times to ensure it sticks
                const forceScroll = () => {
                  if (el && !isInitializedRef.current) {
                    el.scrollTop = targetScroll;
                    // Verify
                    if (Math.abs(el.scrollTop - targetScroll) < 1) {
                      isInitializedRef.current = true;
                    }
                  }
                };
                // Try immediately
                forceScroll();
                // Try after layout
                setTimeout(forceScroll, 0);
                setTimeout(forceScroll, 10);
                setTimeout(forceScroll, 50);
              }
            }
          }}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex flex-col gap-0 max-h-48 overflow-y-auto cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "y mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          {/* Top padding */}
          {paddingItemsArray.map((_: any, i: number) => (
            <div key={`top-${i}`} style={{ height: `${itemHeight}px` }} />
          ))}
          {/* Options */}
          {options.map((option) => {
            const isSelected = option === value;
            return (
              <div
                key={option}
                className="flex items-center justify-center"
                style={{
                  height: `${itemHeight}px`,
                  scrollSnapAlign: "center",
                }}
              >
                <div
                  className={`px-6 py-2 rounded-lg text-3xl font-light transition-all ${
                    isSelected
                      ? "bg-white text-gray-900 scale-110"
                      : "text-gray-500"
                  }`}
                >
                  {option.toString().padStart(2, "0")}
                </div>
              </div>
            );
          })}
          {/* Bottom padding */}
          {paddingItemsArray.map((_, i) => (
            <div key={`bottom-${i}`} style={{ height: `${itemHeight}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Timer = ({
  onClose,
  clickPosition: _clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [initialTime, setInitialTime] = useState(0); // in seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play sound or show notification when timer ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  // Calculate total time from hours, minutes, seconds
  const calculateTotalTime = () => {
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Handle start/pause
  const handleStartPause = () => {
    if (timeRemaining === 0) {
      const total = calculateTotalTime();
      if (total === 0) return;
      setInitialTime(total);
      setTimeRemaining(total);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  // Handle cancel/reset
  const handleCancel = () => {
    setIsRunning(false);
    setTimeRemaining(0);
    setInitialTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Format time for display
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return {
      hours: h.toString().padStart(2, "0"),
      minutes: m.toString().padStart(2, "0"),
      seconds: s.toString().padStart(2, "0"),
    };
  };

  // Calculate progress percentage
  const progress = initialTime > 0 ? (timeRemaining / initialTime) * 100 : 0;
  const displayTime = timeRemaining > 0 ? timeRemaining : calculateTotalTime();
  const {
    hours: displayHours,
    minutes: displayMinutes,
    seconds: displaySeconds,
  } = formatTime(displayTime);

  // Generate number options for picker
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
  const secondOptions = Array.from({ length: 60 }, (_, i) => i);

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 to-red-600">
        <div
          className="flex flex-col items-center space-y-4 animate-fadeInFromCenter"
          style={{
            transformOrigin: "50% 100%",
            animation:
              "appOpen 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          <IoTimeOutline className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">Timer</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout
        onClose={onClose}
        title="Timer"
        statusBarTextColor="text-black"
        batteryColorScheme="light"
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-black pt-30">
          {/* Circular Timer Display */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Background Circle */}
            <div className="relative w-64 h-64">
              {/* Progress Circle */}
              <svg
                className="absolute inset-0 transform -rotate-90"
                width="256"
                height="256"
              >
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 120 * (1 - progress / 100)
                  }`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Time Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {timeRemaining > 0 || isRunning ? (
                  <>
                    <div className="text-white text-5xl font-light tracking-tight">
                      {displayHours}:{displayMinutes}:{displaySeconds}
                    </div>
                    {initialTime > 0 && (
                      <div className="text-gray-400 text-sm mt-2">
                        {formatTime(initialTime).hours}:
                        {formatTime(initialTime).minutes}:
                        {formatTime(initialTime).seconds}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-white text-5xl font-light tracking-tight">
                    {displayHours}:{displayMinutes}:{displaySeconds}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Time Picker (shown when timer is not running) */}
          {!isRunning && timeRemaining === 0 && (
            <div className="px-8 pb-8">
              <div className="flex items-center justify-center gap-6 bg-gray-800/50 rounded-3xl p-6">
                <WheelPicker
                  options={hourOptions}
                  value={hours}
                  onChange={setHours}
                  label="HOURS"
                />
                <WheelPicker
                  options={minuteOptions}
                  value={minutes}
                  onChange={setMinutes}
                  label="MINUTES"
                />
                <WheelPicker
                  options={secondOptions}
                  value={seconds}
                  onChange={setSeconds}
                  label="SECONDS"
                />
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="px-8 pb-12 flex items-center justify-center gap-6">
            {timeRemaining > 0 && (
              <button
                onClick={handleCancel}
                className="px-8 py-4 bg-gray-800 text-white rounded-full text-lg font-medium hover:bg-gray-700 transition-colors"
                type="button"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleStartPause}
              disabled={calculateTotalTime() === 0 && timeRemaining === 0}
              className={`px-12 py-4 rounded-full text-lg font-medium transition-all ${
                isRunning
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              }`}
              type="button"
            >
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <>
                    <FaPause className="text-xl" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <FaPlay className="text-xl" />
                    <span>Start</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Timer;

import { useEffect, useState, useRef } from "react";
import AppsLayout from "./AppsLayout";
import { MdOutlineWorkHistory } from "react-icons/md";

interface WorkExperience {
  id: number;
  title: string;
  year: string;
  description?: string;
  position?: string;
  responsibilities?: string[];
  learned?: string[];
}

const Job = ({
  onClose,
  clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const scrollTopRef = useRef(0);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const velocityXRef = useRef(0);
  const velocityYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      // Cleanup animation frame on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle mouse down for drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    // Cancel any ongoing momentum scroll
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    startYRef.current = e.pageY - scrollContainerRef.current.offsetTop;
    lastXRef.current = e.pageX;
    lastYRef.current = e.pageY;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    scrollTopRef.current = scrollContainerRef.current.scrollTop;
    velocityXRef.current = 0;
    velocityYRef.current = 0;
    lastTimeRef.current = Date.now();

    scrollContainerRef.current.style.cursor = "grabbing";
    scrollContainerRef.current.style.userSelect = "none";
  };

  // Handle mouse move for drag scrolling
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();

    const currentTime = Date.now();
    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime > 0) {
      // Calculate velocity for momentum scrolling (vertical only)
      const deltaY = e.pageY - lastYRef.current;
      velocityXRef.current = 0; // Disable horizontal scrolling
      velocityYRef.current = (deltaY / deltaTime) * 16; // Normalize to 60fps
    }

    lastXRef.current = e.pageX;
    lastYRef.current = e.pageY;
    lastTimeRef.current = currentTime;

    const y = e.pageY - scrollContainerRef.current.offsetTop;
    const walkY = (y - startYRef.current) * 1.5; // Scroll speed multiplier (vertical only)
    scrollContainerRef.current.scrollTop = scrollTopRef.current - walkY;
  };

  // Momentum scrolling animation (vertical only)
  const momentumScroll = () => {
    if (!scrollContainerRef.current) return;

    const friction = 0.92; // Deceleration factor (0.92 = 8% per frame)
    const minVelocity = 0.1; // Minimum velocity to continue scrolling

    velocityYRef.current *= friction;

    if (Math.abs(velocityYRef.current) > minVelocity) {
      scrollContainerRef.current.scrollTop -= velocityYRef.current * 1.5;

      animationFrameRef.current = requestAnimationFrame(momentumScroll);
    } else {
      velocityXRef.current = 0;
      velocityYRef.current = 0;
      animationFrameRef.current = null;
    }
  };

  // Handle mouse up/leave for drag scrolling
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.style.userSelect = "";

      // Start momentum scrolling if there's velocity (vertical only)
      if (Math.abs(velocityYRef.current) > 0.5) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(momentumScroll);
      }
    }
  };

  // Handle mouse leave to stop dragging
  const handleMouseLeave = () => {
    handleMouseUp();
  };

  // Work experiences - edit directly here to customize
  const [workExperiences] = useState<WorkExperience[]>([
    {
      id: 1,
      title: "Freelancing",
      year: "2020 - Present",
      position: "Web & Software Developer",
      responsibilities: [
        "Developing and maintaining web applications",
        "Creating and maintaining software applications",
        "Providing technical support to clients",
      ],
      learned: ["React", "Pandas", "FastAPI", "Docker"],
    },
    {
      id: 2,
      title: "Nordomatic AD",
      year: "2022 - 2025",
      position: "Web & Software Developer",
      responsibilities: ["Responsibility 1", "Responsibility 2"],
      learned: ["Skill 1", "Skill 2"],
    },
    {
      id: 3,
      title: "Bergen Byggautomation ",
      year: "2024 - 2025",
      position: "Web & Software Developer",
      responsibilities: ["Responsibility 1", "Responsibility 2"],
      learned: ["Skill 1", "Skill 2"],
    },
  ]);

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
          <div className="text-white text-6xl">
            <MdOutlineWorkHistory className="text-white text-2xl z-1 w-10 h-10" />
          </div>
          <div className="text-white text-2xl font-semibold">Job</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout onClose={onClose} title="Career Roadmap">
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-10">
          {/* Timeline Container - Bigger Roadmap with 3x spacing and scrolling */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden relative cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="relative right-80"
              style={{ minHeight: "1800px", width: "100%" }}
            >
              {/* Sine Wave Curve on Right - Simplified */}
              <svg
                className="absolute pointer-events-none"
                width="100%"
                height="1800"
                style={{ zIndex: 1 }}
              >
                <path
                  d="
    M 380 120
    Q 430 210, 380 300
    T 380 480
    T 380 660
    T 380 840
    T 380 1020
    T 380 1200
    T 380 1380
    T 380 1560
  "
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4.5"
                  strokeDasharray="8,8"
                  opacity="1"
                />
              </svg>

              {/* Freelancing - Position with Tailwind classes */}
              <div className="absolute ml-97 mt-38 flex items-start">
                <div className="relative flex-shrink-0 mt-1">
                  <div
                    className="absolute w-8 h-8 rounded-full bg-orange-500 opacity-30"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                  <div
                    className="w-6 h-6 rounded-full bg-orange-400 shadow-lg"
                    style={{
                      boxShadow: "0 0 25px rgba(249, 115, 22, 0.9)",
                      animation: "blink 2s ease-in-out infinite",
                    }}
                  />
                </div>
                <div className="ml-5 max-w-[1200px]">
                  <h3 className="text-white font-bold text-4xl mb-3">
                    {workExperiences[0]?.title || "Freelancing"}
                  </h3>
                  <p className="text-orange-300 font-semibold text-2xl mb-3">
                    {workExperiences[0]?.position || "Web & Software Developer"}
                  </p>
                  <p className="text-gray-400 text-xl mb-4">
                    {workExperiences[0]?.year || "2020 - Present"}
                  </p>
                  {workExperiences[0]?.responsibilities && (
                    <div className="mb-4 w-[500px]">
                      <p className="text-gray-500 text-xl font-semibold mb-2">
                        Responsibilities:
                      </p>
                      <ul className="text-gray-400 text-xl list-disc list-inside space-y-1.5">
                        {workExperiences[0].responsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Work 2 - Position with Tailwind classes */}
              <div className="absolute ml-97 mt-130 flex items-start">
                <div className="relative flex-shrink-0 mt-1">
                  <div
                    className="absolute w-8 h-8 rounded-full bg-orange-500 opacity-30"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                  <div
                    className="w-6 h-6 rounded-full bg-orange-400 shadow-lg"
                    style={{
                      boxShadow: "0 0 25px rgba(249, 115, 22, 0.9)",
                    }}
                  />
                </div>
                <div className="ml-5 max-w-[1200px]">
                  <h3 className="text-white font-bold text-4xl mb-3">
                    {workExperiences[1]?.title || "Work 2"}
                  </h3>
                  <p className="text-orange-300 font-semibold text-2xl mb-3">
                    {workExperiences[1]?.position || "Web & Software Developer"}
                  </p>
                  <p className="text-gray-400 text-xl mb-4">
                    {workExperiences[1]?.year || "2020 - Present"}
                  </p>
                  {workExperiences[1]?.responsibilities && (
                    <div className="mb-4 w-[500px]">
                      <p className="text-gray-500 text-xl font-semibold mb-2">
                        Responsibilities:
                      </p>
                      <ul className="text-gray-400 text-xl list-disc list-inside space-y-1.5">
                        {workExperiences[1].responsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {workExperiences[1]?.learned && (
                    <div>
                      <p className="text-gray-500 text-xl font-semibold mb-2">
                        Learned:
                      </p>
                      <ul className="text-gray-400 text-xl list-disc list-inside space-y-1.5">
                        {workExperiences[1].learned.map((skill, i) => (
                          <li key={i}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {/* Work 2 - Position with Tailwind classes */}
                <div className="absolute ml-1 mt-105 flex items-start">
                  <div className="relative flex-shrink-0 mt-1">
                    <div
                      className="absolute w-8 h-8 rounded-full bg-orange-500 opacity-30"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                    />
                    <div
                      className="w-6 h-6 rounded-full bg-orange-400 shadow-lg"
                      style={{
                        boxShadow: "0 0 25px rgba(249, 115, 22, 0.9)",
                        animation: "blink 2s ease-in-out infinite",
                      }}
                    />
                  </div>
                  <div className="ml-5 max-w-[1200px]">
                    <h3 className="text-white font-bold text-4xl mb-3">
                      {workExperiences[2]?.title || "Bergen Byggautomation"}
                    </h3>
                    <p className="text-orange-300 font-semibold text-2xl mb-3">
                      {workExperiences[2]?.position ||
                        "Web & Software Developer"}
                    </p>
                    <p className="text-gray-400 text-xl mb-4">
                      {workExperiences[2]?.year || "2024 - 2025"}
                    </p>
                    {workExperiences[2]?.responsibilities && (
                      <div className="mb-4 w-[500px]">
                        <p className="text-gray-500 text-xl font-semibold mb-2">
                          Responsibilities:
                        </p>
                        <ul className="text-gray-400 text-xl list-disc list-inside space-y-1.5">
                          {workExperiences[2].responsibilities.map(
                            (resp, i) => (
                              <li key={i}>{resp}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                    {workExperiences[2]?.learned && (
                      <div>
                        <p className="text-gray-500 text-xl font-semibold mb-2">
                          Learned:
                        </p>
                        <ul className="text-gray-400 text-xl list-disc list-inside space-y-1.5">
                          {workExperiences[2].learned.map((skill, i) => (
                            <li key={i}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes blink {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.1);
            }
          }
        `}</style>
      </AppsLayout>
    );
  }

  return null;
};

export default Job;

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { LuGithub } from "react-icons/lu";
import { AiOutlineLinkedin } from "react-icons/ai";
import { IoMailOpenOutline } from "react-icons/io5";

export default function LoadingScreen({
  onComplete,
  onErrorShow,
  isCompleted = false,
  onLoadingAnimationComplete,
  initialProgress = 0,
}: {
  onComplete: () => void;
  onErrorShow?: () => void;
  isCompleted?: boolean;
  onLoadingAnimationComplete?: () => void;
  initialProgress?: number;
}) {
  const [progress, setProgress] = useState(initialProgress);
  const [showError, setShowError] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [shouldStartFromThreshold, setShouldStartFromThreshold] =
    useState(false);
  const [isChargerConnected, setIsChargerConnected] = useState(true);
  const [hasInitialAnimationPlayed, setHasInitialAnimationPlayed] =
    useState(false);
  const [showMobileNotification, setShowMobileNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const nameTextRef = useRef<HTMLDivElement>(null);
  const socialMediaRef = useRef<HTMLDivElement>(null);
  const githubLinkRef = useRef<HTMLAnchorElement>(null);
  const linkedinLinkRef = useRef<HTMLAnchorElement>(null);
  const instagramLinkRef = useRef<HTMLAnchorElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) ||
        (window.innerWidth <= 768 && window.innerHeight <= 1024);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Show mobile notification after 4 seconds
  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setShowMobileNotification(true);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // Change to threshold after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldStartFromThreshold(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let startTime = Date.now();
    const duration = 2500; // 2.5 seconds
    let isStuck = false;
    let animationId: number;

    const updateProgress = () => {
      // Stop the animation loop if the final animation is complete
      if (isAnimationComplete) {
        return;
      }

      const elapsed = Date.now() - startTime;

      if (!isStuck && elapsed < duration && !shouldStartFromThreshold) {
        // Normal progress up to 90%
        const normalProgress = Math.min(elapsed / duration, 0.9);
        setProgress(normalProgress);

        // Check if we should get stuck at 90%
        if (normalProgress >= 0.9) {
          isStuck = true;
        }
      } else if (
        isStuck ||
        initialProgress >= 0.95 ||
        shouldStartFromThreshold
      ) {
        if (isCompleted) {
          // Complete the loading bar to 100% smoothly
          setProgress(1.0);
        } else {
          // Oscillate between 95% and 98%
          const stuckTime = (Date.now() - startTime - duration) / 1000; // seconds since getting stuck
          const oscillation = Math.sin(stuckTime * 2) * 0.015; // oscillate ±1.5%
          const stuckProgress = 0.965 + oscillation; // center at 96.5%, oscillate ±1.5%
          setProgress(Math.max(0.95, Math.min(0.98, stuckProgress)));
        }
      }

      // Show error message after 5 seconds, but keep oscillating
      if (elapsed >= 3000 && !showError) {
        setShowError(true);
        onErrorShow?.(); // Notify parent that error is shown
      }

      // Keep the animation running indefinitely
      animationId = requestAnimationFrame(updateProgress);
    };

    animationId = requestAnimationFrame(updateProgress);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [onComplete, isCompleted, isAnimationComplete, shouldStartFromThreshold]);

  // Effect to show name when loading completes
  useEffect(() => {
    if (isCompleted) {
      const nameTimer = setTimeout(() => {
        setShowName(true);
      }, 1300); // Wait 2 seconds after completion

      return () => clearTimeout(nameTimer);
    }
  }, [isCompleted]);

  // Listen for charger connection status
  useEffect(() => {
    const handleChargerConnected = (event: Event) => {
      const customEvent = event as CustomEvent<{ connected: boolean }>;
      setIsChargerConnected(customEvent.detail.connected);
    };

    window.addEventListener(
      "chargerConnected",
      handleChargerConnected as EventListener
    );

    return () => {
      window.removeEventListener(
        "chargerConnected",
        handleChargerConnected as EventListener
      );
    };
  }, []);

  // Effect to animate loading bar when name appears
  useEffect(() => {
    if (showName && loadingBarRef.current && nameTextRef.current) {
      // Wait 2 seconds after "Someoneelsse" appears, then animate both elements
      const moveTimer = setTimeout(() => {
        // Animate loading bar to y: 500
        gsap.to(loadingBarRef.current, {
          //y: 520,
          y: window.innerHeight * 0.5,
          duration: 3,
          //width: 900,
          width: Math.min(window.innerWidth * 0.6, 900),

          height: 7,
          ease: "sine.out",
        });

        // Animate "Someoneelsse" text to the same position + 50px (y: 550)
        gsap.to(nameTextRef.current, {
          //y: 570,
          y: window.innerHeight * 0.55,
          scale: 8.3, // Expand the text to 2x size
          duration: 3,
          ease: "sine.out",
          onComplete: () => {
            // Stop the progress animation loop
            setIsAnimationComplete(true);
            // Show social media text when "Someoneelsse" animation completes
            setShowSocialMedia(true);
            // Mark initial animation as played after fade-in completes (1 second)
            setTimeout(() => {
              setHasInitialAnimationPlayed(true);
            }, 1000);
            // Call the callback when animation completes
            onLoadingAnimationComplete?.();
          },
        });
      }, 1400); // Wait 2 seconds after name appears

      return () => clearTimeout(moveTimer);
    }
  }, [showName, onLoadingAnimationComplete]);

  return (
    <>
      <div
        className="loading-screen-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <style>
          {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(10px) rotate(180deg);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0) rotate(180deg);
            }
          }
          
          @keyframes fadeInSocialMedia {
            from {
              opacity: 0;
              transform: translateY(calc(-50% + 10px));
            }
            to {
              opacity: 1;
              transform: translateY(-50%);
            }
          }
          
          @keyframes fadeInMobileNotification {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) translateY(0);
            }
          }
          
          .mobile-notification-card {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: white;
            padding: 32px 28px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 16px;
            line-height: 1.7;
            pointer-events: auto;
            opacity: 0;
            animation: fadeInMobileNotification 0.5s ease-out forwards;
            z-index: 10004;
            font-weight: 300;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
            cursor: pointer;
            min-width: 320px;
            max-width: 400px;
            min-height: 200px;
            white-space: normal;
            text-align: left;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .mobile-notification-card-title {
            font-size: 22px;
            font-weight: 400;
            margin-bottom: 4px;
          }
          
          .mobile-notification-card-divider {
            width: 100%;
            height: 1px;
            background: rgba(255, 255, 255, 0.2);
            margin: 8px 0;
          }
          
          .mobile-notification-card-content {
            font-size: 16px;
            line-height: 1.7;
          }
          
          .mobile-notification-card:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translate(-50%, -50%) scale(1.02);
          }
          
          /* Prevent text selection on loading screen */
          .loading-screen-container * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        `}
        </style>
        <div
          style={{
            textAlign: "center",
            position: "relative",
            userSelect: "none",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: "16px",
              fontWeight: "300",
              marginBottom: "10px",
              opacity: showName ? 0 : 1,
              transition: "opacity 1s ease-out",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            Loading...
          </div>
          <div
            ref={loadingBarRef}
            style={{
              width: "300px",
              height: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                backgroundColor: "white",
                borderRadius: "3px",
                transition: "width 0.1s linear",
              }}
            />
          </div>

          {showName && !isMobile && (
            <div
              ref={nameTextRef}
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%) rotate(180deg)",
                color: "white",
                fontSize: "16px",
                fontWeight: "300",
                textAlign: "center",
                marginTop: "20px",
                opacity: 1,
                animation: "fadeIn 1s ease-in",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
            >
              Someoneelsse
            </div>
          )}

          {/* Social media text - appears when phone starts falling */}
          {showSocialMedia && !isMobile && (
            <div
              ref={socialMediaRef}
              style={{
                position: "fixed",
                bottom: "0%",
                right: "34%",

                rotate: "270deg",
                color: "white",
                transform: hasInitialAnimationPlayed
                  ? "translateY(-50%)"
                  : undefined,
                fontSize: "20px",
                fontWeight: "300",
                textAlign: "left",

                animation: hasInitialAnimationPlayed
                  ? "none"
                  : "fadeInSocialMedia 1s ease-in forwards",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                display: "flex",
                flexDirection: "column",
                gap: "90px",
                zIndex: 2000,
                pointerEvents: isChargerConnected ? "auto" : "none",
                marginBottom: "-65px",
                opacity: isChargerConnected ? 1 : 0,
                transition: hasInitialAnimationPlayed
                  ? "opacity 0.5s ease-in-out"
                  : "none",
              }}
            >
              <a
                ref={githubLinkRef}
                href="https://github.com/Someoneeelsse"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  window.open(
                    "https://github.com/Someoneeelsse",
                    "_blank",
                    "noopener,noreferrer"
                  );
                  e.preventDefault();
                }}
                style={{
                  color: "white",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                  pointerEvents: "auto",
                  marginBottom: "50px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <LuGithub size={24} />
                <span
                  style={{
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                  }}
                >
                  @Someoneelsse
                </span>
              </a>
              <a
                ref={linkedinLinkRef}
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  window.open(
                    "https://linkedin.com",
                    "_blank",
                    "noopener,noreferrer"
                  );
                  e.preventDefault();
                }}
                style={{
                  color: "white",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                  pointerEvents: "auto",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <AiOutlineLinkedin size={24} />
                <span
                  style={{
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                  }}
                >
                  @Jakub Grzybowski
                </span>
              </a>
              <a
                ref={instagramLinkRef}
                href="mailto:panjakub15@gmail.com"
                onClick={() => {
                  window.location.href = "mailto:panjakub15@gmail.com";
                }}
                style={{
                  color: "white",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                  pointerEvents: "auto",
                  marginTop: "50px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <IoMailOpenOutline size={24} />
                <span
                  style={{
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                  }}
                >
                  panjakub15@gmail.com
                </span>
              </a>
            </div>
          )}
        </div>

        {/* Mobile notification card */}
        {showMobileNotification && (
          <a
            href="https://simple-portfolio-someoneelsse.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              window.open(
                "https://simple-portfolio-someoneelsse.vercel.app/",
                "_blank",
                "noopener,noreferrer"
              );
              e.preventDefault();
            }}
            className="mobile-notification-card"
            style={{
              textDecoration: "none",
              color: "white",
            }}
          >
            <div className="mobile-notification-card-title">I am sorry</div>
            <div className="mobile-notification-card-divider"></div>
            <div className="mobile-notification-card-content">
              This website is dedicated for desktop devices only, please visit
              it on your computer, or device with bigger resolution. If you want
              to see the Simplified version of my portfolio, click onto that
              card.
            </div>
          </a>
        )}
      </div>
    </>
  );
}

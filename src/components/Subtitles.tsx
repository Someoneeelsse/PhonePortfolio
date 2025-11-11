import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";

interface SubtitlesProps {
  text: string;
  isVisible?: boolean;
  position?: "bottom" | "top" | "center";
  className?: string;
  showNextButton?: boolean;
  onNextClick?: (feedback: boolean) => void;
  characterWidthParam?: number;
  showButton?: boolean;
  onAnimationComplete?: () => void;
  shouldFadeOut?: boolean;
}

const Subtitles: React.FC<SubtitlesProps> = ({
  text,
  isVisible = true,
  position = "bottom",
  className,
  showNextButton = false,
  onNextClick,
  characterWidthParam,
  showButton = true,
  onAnimationComplete,
  shouldFadeOut = false,
}) => {
  const [hasAppeared, setHasAppeared] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && !hasAppeared) {
      setHasAppeared(true);

      // Split text into characters array
      const characters = text.split("");

      // Start GSAP typing animation
      if (textRef.current) {
        // Clear any existing content
        textRef.current.innerHTML = "";

        // Create spans for each character
        const characterSpans: HTMLSpanElement[] = [];
        characters.forEach(() => {
          const span = document.createElement("span");
          span.textContent = "█"; // Start with terminal cursor block
          span.style.opacity = "0";
          span.style.color = "white"; // Terminal green color
          span.style.display = "inline"; // Ensure inline display
          textRef.current?.appendChild(span);
          characterSpans.push(span);
        });

        // Create GSAP timeline
        const tl = gsap.timeline();

        // Animate each character with typewriter effect and container width
        characterSpans.forEach((span, index) => {
          // First: Show the terminal cursor with subtle blinking
          tl.to(
            span,
            {
              opacity: 1,
              duration: 0.1,
              ease: "none",
            },
            0.5 + index * 0.067 // 1.5x faster than 2x speed (0.1 / 1.5 = 0.067)
          );

          // Add subtle blinking to the cursor block
          tl.to(
            span,
            {
              opacity: 0.3,
              duration: 0.1,
              repeat: 1,
              yoyo: true,
              ease: "power2.inOut",
            },
            0.5 + index * 0.067 + 0.033 // 1.5x faster (0.05 / 1.5 = 0.033)
          );

          // Then: Change to actual character after 0.1s
          tl.to(
            span,
            {
              textContent: characters[index],
              color: "white", // Change to normal text color
              opacity: 1, // Ensure full opacity for final character
              duration: 0.1,
              ease: "none",
            },
            0.5 + index * 0.067 + 0.067 // 1.5x faster (0.1 / 1.5 = 0.067)
          );

          // Animate container width to grow with each character (no button during animation)
          const buttonWidth = 0; // No button width during typing animation
          const baseWidth = 50; // Base width for text
          const characterWidth = characterWidthParam ? characterWidthParam : 6;
          const totalWidth =
            baseWidth + (index + 1) * characterWidth + buttonWidth;

          tl.to(
            containerRef.current,
            {
              width: `${totalWidth}px`,
              duration: 0.1,
              ease: "none",
            },
            0.5 + index * 0.067 + 0.067 // 1.5x faster (0.1 / 1.5 = 0.067)
          );
        });

        // No blinking cursor needed - terminal blocks serve as typing indicator

        // Call completion callback when animation finishes
        if (onAnimationComplete) {
          const totalDuration = 0.5 + characters.length * 0.067 + 0.067; // Total animation time (1.5x faster)
          setTimeout(() => {
            setIsAnimationComplete(true);
            onAnimationComplete();
          }, totalDuration * 1000); // Convert to milliseconds
        } else {
          // If no callback, still set animation complete
          const totalDuration = 0.5 + characters.length * 0.067 + 0.067; // Total animation time (1.5x faster)
          setTimeout(() => {
            setIsAnimationComplete(true);
          }, totalDuration * 1000); // Convert to milliseconds
        }
      }
    }
  }, [isVisible, hasAppeared, text]);

  // Handle button appearance animation
  useEffect(() => {
    if (isAnimationComplete && showButton && showNextButton) {
      // Calculate the actual width needed: text width + button width
      const characters = text.split("");
      const baseWidth = 50; // Base width for text
      const characterWidth = characterWidthParam ? characterWidthParam : 6;
      const buttonWidth = 40; // Button column width
      const actualWidth =
        baseWidth + characters.length * characterWidth + buttonWidth;

      // Animate container width to accommodate button
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          width: `${actualWidth}px`, // Use calculated width
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }
  }, [
    isAnimationComplete,
    showButton,
    showNextButton,
    text,
    characterWidthParam,
  ]);

  // Handle fade out effect
  useEffect(() => {
    if (shouldFadeOut && containerRef.current) {
      // Apply the fade out animation
      containerRef.current.style.animation =
        "fadeOutToBottom 0.8s ease-out forwards";

      // Hide the element completely after animation
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.display = "none";
        }
      }, 800); // Match the animation duration
    }
  }, [shouldFadeOut]);

  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return {
          top: "20px",
          bottom: "auto",
        };
      case "center":
        return {
          top: "50%",
          bottom: "auto",
          transform: "translateY(-50%)",
        };
      case "bottom":
      default:
        return {
          top: "auto",
          bottom: "20px",
        };
    }
  };

  const handleNextClick = (feedback: boolean) => {
    if (onNextClick) {
      onNextClick(feedback);
    } else {
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeInLine {
            from {
              opacity: 0;
              transform: scaleY(0);
            }
            to {
              opacity: 1;
              transform: scaleY(1);
            }
          }
          
          @keyframes fadeInButton {
            from {
              opacity: 0;
              transform: translateX(10px) scale(0.8);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
          
          @keyframes fadeInFromBottom {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeOutToBottom {
            from {
              opacity: 1;
              transform: translateY(0);
            }
            to {
              opacity: 0;
              transform: translateY(20px);
            }
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          
          .typing-cursor {
            animation: blink 1s infinite;
            font-weight: bold;
          }
        `}
      </style>
      <div
        ref={containerRef}
        className={className}
        style={{
          position: "fixed",
          left: className ? undefined : "50%",
          ...(className ? {} : getPositionStyles()),
          ...(className
            ? {}
            : {
                transform: `translateX(-50%) ${
                  getPositionStyles().transform || ""
                }`.trim(),
              }),
          background:
            "radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.2) 0%, rgba(255, 107, 157, 0.05) 30%, transparent 80%), radial-gradient(circle at 80% 50%, rgba(248, 181, 0, 0.15) 0%, rgba(248, 181, 0, 0.03) 40%, transparent 85%), radial-gradient(circle at 50% 90%, rgba(224, 86, 253, 0.2) 0%, rgba(224, 86, 253, 0.05) 35%, transparent 90%), radial-gradient(circle at 30% 70%, rgba(255, 138, 0, 0.1) 0%, rgba(255, 138, 0, 0.02) 25%, transparent 70%), radial-gradient(circle at 60% 30%, rgba(196, 69, 105, 0.15) 0%, rgba(196, 69, 105, 0.03) 30%, transparent 75%), linear-gradient(45deg, rgba(26, 26, 46, 0.8), rgba(22, 33, 62, 0.6))",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "12px 16px",

          width: "50px", // Start with base width (no button during animation)
          textAlign: "left",
          overflow: "visible",
          zIndex: 10000,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          animation: hasAppeared
            ? "fadeInFromBottom 0.8s ease-out forwards"
            : "none",
          pointerEvents: showNextButton ? "auto" : "none",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 30px rgba(255, 107, 157, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
          border: "1px solid rgba(255, 107, 157, 0.6)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Text Column - Grows in width */}
        <div
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "1.4",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
            fontFamily: "monospace",
            flex: 1,
            minWidth: "0", // Allow shrinking, container handles width
          }}
        >
          <div
            ref={textRef}
            style={{
              display: "inline",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          ></div>
        </div>

        {/* Button Column - Fixed width */}
        {showButton && showNextButton && isAnimationComplete && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0, // Don't shrink
              width: "40px", // Fixed width for button area
            }}
          >
            {/* Straight line with fade-in animation */}
            <div
              style={{
                width: "1px",
                height: "24px",
                background: "rgba(255, 255, 255, 0.3)",
                opacity: 0,
                animation: "fadeInLine 0.8s ease-out 0.3s forwards",
              }}
            />

            {/* Next button with enhanced animations */}
            <button
              onClick={() => handleNextClick(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "10px",
                fontWeight: "400",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 8px",
                borderRadius: "6px",
                opacity: 0,
                transform: "translateX(10px)",
                animation: "fadeInButton 0.6s ease-out 0.5s forwards",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
                e.currentTarget.style.transform = "translateX(0) scale(1.15)";
                e.currentTarget.style.background = "rgba(255, 107, 157, 0.1)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(255, 107, 157, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
                e.currentTarget.style.transform = "translateX(0) scale(1)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <MdKeyboardDoubleArrowRight
                className="text-white text-xm"
                size={16}
              />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Subtitles;

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import LoadingScreen from "./components/LoadingScreen";
import Phone from "./models/Phone";
import Subtitles from "./components/Subtitles";
import { LuArrowBigLeftDash } from "react-icons/lu";
import Charger from "./models/Charger";

function AnimatedPhone({
  shouldStart,
  onAnimationComplete,
}: {
  shouldStart: boolean;
  onAnimationComplete?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (shouldStart && groupRef.current) {
      console.log("Starting phone animation from [0, 5, 0] to [0, 0, 0]");

      // Animate to final position
      gsap.to(groupRef.current.position, {
        y: 0,
        duration: 2,
        ease: "power2.out",
        onComplete: () => {
          console.log("Phone animation complete!");
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        },
      });
    }
  }, [shouldStart, onAnimationComplete]);

  return (
    <group ref={groupRef} position={[0, 4, 0]}>
      <Phone position={[0, -1.35, 2.3]} />
    </group>
  );
}

function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    const handleCameraChange = () => {
      console.log("Camera change event received!"); // Debug log
      // Animate camera to new position
      gsap.to(camera.position, {
        x: 0,
        y: -7,
        z: 7,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          // Keep looking at the center while moving
          camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
          // Final lookAt to ensure proper targeting
          camera.lookAt(0, 0, 0);
        },
      });
    };

    const handleCameraReset = () => {
      console.log("Camera reset event received!"); // Debug log
      // Reset camera to initial position
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 5,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          // Keep looking at the center while moving
          camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
          // Final lookAt to ensure proper targeting
          camera.lookAt(0, 0, 0);
        },
      });
    };

    window.addEventListener("changeCameraPosition", handleCameraChange);
    window.addEventListener("resetCameraPosition", handleCameraReset);

    return () => {
      window.removeEventListener("changeCameraPosition", handleCameraChange);
      window.removeEventListener("resetCameraPosition", handleCameraReset);
    };
  }, [camera]);

  return null;
}

export default function Scene({
  onPhoneLanded,
}: {
  onPhoneLanded?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [showError, setShowError] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoadingAnimationComplete, setIsLoadingAnimationComplete] =
    useState(false);
  const [isHelpingTextButtonClicked, setIsHelpingTextButtonClicked] =
    useState(false);
  const [showSecondSubtitles, setShowSecondSubtitles] = useState(false);
  const [showFinalSubtitle, setShowFinalSubtitle] = useState(false);
  const [shouldFadeOutSubtitles, setShouldFadeOutSubtitles] = useState(false);
  const [gravitationText, setGravitationText] = useState(false);
  const [showCompletionText, setShowCompletionText] = useState(false);
  const [shouldFadeOutFinal, setShouldFadeOutFinal] = useState(false);
  const [showHoldProgress, setShowHoldProgress] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showLowBattery, setShowLowBattery] = useState(false);
  const [shouldBlinkBattery, setShouldBlinkBattery] = useState(false);
  const [showChargeText, setShowChargeText] = useState(false);
  const [shouldFadeOutChargeText, setShouldFadeOutChargeText] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);
  const [shouldFadeOutStartButton, setShouldFadeOutStartButton] =
    useState(false);
  const [hasCompletedLoading, setHasCompletedLoading] = useState(false);
  const [isInteractionBlocked, setIsInteractionBlocked] = useState(false);
  const [showBatteryOnReset, setShowBatteryOnReset] = useState(false);
  const [batteryResetShown, setBatteryResetShown] = useState(false);

  const handlePhoneAnimationComplete = () => {
    setShowStartButton(true);
    if (onPhoneLanded) {
      onPhoneLanded();
    }
  };
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleLoadingAnimationComplete = () => {
    console.log(
      "Loading animation complete - text and div reached destination"
    );
    setIsLoadingAnimationComplete(true);
  };

  // Log when the loading animation state changes
  useEffect(() => {
    console.log("isLoadingAnimationComplete:", isLoadingAnimationComplete);
  }, [isLoadingAnimationComplete]);

  // Log when the nice button clicked state changes
  useEffect(() => {
    console.log(
      "isHelpingTextButtonClicked state changed to:",
      isHelpingTextButtonClicked
    );
  }, [isHelpingTextButtonClicked]);

  const handleManualComplete = () => {
    if (isCompleted) {
      console.log("Manual completion triggered");
      handleLoadingComplete();
    }
  };

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // Allow rotation when showFinalSubtitle is true
      if (showFinalSubtitle) {
        if (showError && rotationY < 1.55) {
          // 89 degrees in radians (89 * Math.PI / 180)
          console.log(
            "Mouse down detected - rotation enabled after final subtitle appears"
          );
          setIsDragging(true);
          setLastMouseX(event.clientX);
        } else if (rotationY >= 1.55) {
          console.log(
            "Mouse down detected - rotation locked, preventing all interaction"
          );
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      } else {
        console.log(
          "Mouse down detected - final subtitle not shown yet, rotation disabled"
        );
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      // If loading animation is complete, allow normal interactions (OrbitControls)
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging && showError) {
        const deltaX = (event.clientX - lastMouseX) * 0.01; // Sensitivity
        const newRotation = rotationY + deltaX;
        const maxRotation = Math.PI / 2; // 90 degrees in radians

        // Limit rotation to 0 to 90 degrees (0 to π/2 radians)
        const clampedRotation = Math.max(0, Math.min(maxRotation, newRotation));

        console.log("Dragging:", deltaX, "New rotation:", clampedRotation);
        setRotationY(clampedRotation);
        setLastMouseX(event.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Add to window to capture events outside the canvas
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    lastMouseX,
    rotationY,
    showError,
    isLoadingAnimationComplete,
    isHelpingTextButtonClicked,
    showFinalSubtitle,
  ]);

  // Effect to detect when rotation is disabled and complete loading
  useEffect(() => {
    if (rotationY >= 1.55 && showError && !isCompleted) {
      // 89 degrees reached
      console.log("89 degrees reached - starting completion sequence...");

      // Wait 0.3 seconds then complete
      const completionTimer = setTimeout(() => {
        console.log("Completing loading bar...");
        setIsCompleted(true);
        // Don't automatically complete the loading - let user control it
      }, 300);

      return () => {
        clearTimeout(completionTimer);
      };
    }
  }, [rotationY, showError, isCompleted]);

  // Effect to show completion text when rotation reaches 90 degrees
  useEffect(() => {
    if (rotationY >= 1.55 && gravitationText && !showCompletionText) {
      console.log("90 degrees reached - showing completion text");
      setShowCompletionText(true);
    }
  }, [rotationY, gravitationText, showCompletionText]);

  // Listen for hold progress events
  useEffect(() => {
    const handleHoldProgress = (event: CustomEvent) => {
      // Block interaction if already completed loading
      if (isInteractionBlocked) {
        return;
      }

      const { holdTime } = event.detail;
      const progress = Math.min(holdTime / 3.0, 1); // 3 seconds total
      setHoldProgress(progress);
      setShowHoldProgress(true);

      // Fade out charge text and start button when holding starts
      if (holdTime > 0) {
        setShouldFadeOutChargeText(true);
        setShouldFadeOutStartButton(true);
      }

      // When hold reaches 2.59 seconds, mark loading as completed
      if (holdTime >= 2.59) {
        setHasCompletedLoading(true);
      }

      // When progress reaches 100%, fade out and show low battery
      if (progress >= 1) {
        // Block interaction immediately when battery starts flashing
        setIsInteractionBlocked(true);

        setTimeout(() => {
          setShowHoldProgress(false);
          setShowLowBattery(true);
          setShouldBlinkBattery(true);

          // Hide battery after 3 blinks and show charge text
          setTimeout(() => {
            setShowLowBattery(false);
            setShouldBlinkBattery(false);
            setShowChargeText(true);
            setShouldFadeOutChargeText(false); // Reset fade out state
          }, 3500); // 3s animation + 0.5s delay
        }, 500); // Fade out after 0.5s
      }
    };

    const handleHoldReset = () => {
      // Don't reset if interaction is blocked
      if (isInteractionBlocked) {
        return;
      }

      setShowHoldProgress(false);
      setHoldProgress(0);
      setShowLowBattery(false);
      setShouldBlinkBattery(false);
      setShouldFadeOutChargeText(false); // Reset fade out state
      setShouldFadeOutStartButton(false); // Reset start button fade out state
      // Only show start button again if it hasn't been permanently hidden
      // (This will only happen if the user releases before completing the 3-second hold)
    };

    window.addEventListener(
      "holdProgress",
      handleHoldProgress as EventListener
    );
    window.addEventListener("holdReset", handleHoldReset);

    return () => {
      window.removeEventListener(
        "holdProgress",
        handleHoldProgress as EventListener
      );
      window.removeEventListener("holdReset", handleHoldReset);
    };
  }, [isInteractionBlocked]);

  // Listen for camera reset event to show battery
  useEffect(() => {
    const handleCameraReset = () => {
      // Prevent multiple battery displays
      if (batteryResetShown) {
        console.log("Battery already shown on reset, ignoring event");
        return;
      }

      console.log(
        "Camera reset detected - waiting 2 seconds before showing battery"
      );
      setBatteryResetShown(true);

      // Wait 2 seconds before showing battery
      setTimeout(() => {
        console.log("Showing battery after 2 second delay");
        setShowBatteryOnReset(true);

        // Hide battery after 2 seconds of showing
        setTimeout(() => {
          console.log("Hiding battery after 2 seconds of display");
          setShowBatteryOnReset(false);
          // Wait 1 second before showing lockscreen
          setTimeout(() => {
            console.log("Dispatching greenBatteryComplete after 1s delay");
            window.dispatchEvent(new CustomEvent("greenBatteryComplete"));
          }, 1000);
        }, 2000);
      }, 2000);
    };

    window.addEventListener("resetCameraPosition", handleCameraReset);

    return () => {
      window.removeEventListener("resetCameraPosition", handleCameraReset);
    };
  }, [batteryResetShown]);

  return (
    <div className="w-full h-screen font-serif">
      {isLoading && (
        <div
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
            zIndex: isLoadingAnimationComplete ? 1 : 9999,
            transform: `rotateZ(${rotationY}rad)`,
            transformOrigin: "center center",
            cursor: "default",
            pointerEvents: isLoadingAnimationComplete ? "none" : "auto",
          }}
          onClick={
            !isLoadingAnimationComplete && rotationY < 1.55
              ? handleManualComplete
              : undefined
          }
        >
          <LoadingScreen
            onComplete={handleLoadingComplete}
            onErrorShow={() => setShowError(true)}
            isCompleted={isCompleted}
            onLoadingAnimationComplete={handleLoadingAnimationComplete}
            initialProgress={showError ? 0.95 : 0}
          />
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        shadows
        style={{
          background: `
            radial-gradient(circle at 20% 20%, #ff6b9d 0%, rgba(255, 107, 157, 0.3) 30%, transparent 80%),
            radial-gradient(circle at 80% 50%, #f8b500 0%, rgba(248, 181, 0, 0.4) 40%, transparent 85%),
            radial-gradient(circle at 50% 90%, #e056fd 0%, rgba(224, 86, 253, 0.3) 35%, transparent 90%),
            radial-gradient(circle at 30% 70%, #ff8a00 0%, rgba(255, 138, 0, 0.2) 25%, transparent 70%),
            radial-gradient(circle at 60% 30%, #c44569 0%, rgba(196, 69, 105, 0.2) 30%, transparent 75%),
            linear-gradient(45deg, #1a1a2e, #16213e)
          `,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
        }}
      >
        <CameraController />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 15, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Show Phone when loading animation is complete */}
        {isLoadingAnimationComplete && (
          <AnimatedPhone
            shouldStart={isLoadingAnimationComplete}
            onAnimationComplete={handlePhoneAnimationComplete}
          />
        )}

        {/* Show Charger when loading animation is complete */}
        {isLoadingAnimationComplete && <Charger />}
      </Canvas>

      {/* Fixed "Nice" subtitle that doesn't rotate */}
      {showError && (
        <Subtitles
          text="Ugh, Again? Whoever developed this website has to fix that loading issue... "
          className="top-140 left-1/2 -translate-x-1/2 max-w-[760px]"
          showNextButton={false}
          characterWidthParam={9.5}
          showButton={false}
          shouldFadeOut={shouldFadeOutSubtitles}
          onAnimationComplete={() => {
            console.log("First subtitles animation completed");
            // Show second subtitles after 0.5s delay
            setTimeout(() => {
              setShowSecondSubtitles(true);
            }, 500);
          }}
        />
      )}
      {showSecondSubtitles && (
        <Subtitles
          text="Would you mind helping me load this thing?"
          className="top-155 left-1/2 -translate-x-1/2 max-w-[760px]"
          showNextButton={true}
          characterWidthParam={9.5}
          shouldFadeOut={shouldFadeOutSubtitles}
          onNextClick={(feedback) => {
            console.log("Second button clicked with feedback:", feedback);
            console.log(
              "Current isHelpingTextButtonClicked state:",
              isHelpingTextButtonClicked
            );
            setIsHelpingTextButtonClicked(true);
            console.log("Set niceButtonClicked to true");
            console.log("Rotation is now enabled!");

            // Start fade out animation for existing subtitles
            setTimeout(() => {
              console.log("Starting fade out animation after 2s");
              setShouldFadeOutSubtitles(true);

              // Show final subtitle after fade out completes
              setTimeout(() => {
                console.log("Showing final subtitle");
                setShowFinalSubtitle(true);
              }, 1000); // Wait for fade out animation to complete (1 second)
            }, 2000); // Wait 2 seconds after button click
          }}
          showButton={true}
        />
      )}
      {isHelpingTextButtonClicked && (
        <Subtitles
          text="Perfect"
          className="top-170 left-1/2 -translate-x-1/2 max-w-[100px] "
          showNextButton={true}
          characterWidthParam={9.3}
          showButton={false}
          shouldFadeOut={shouldFadeOutSubtitles}
        />
      )}
      {showFinalSubtitle && (
        <>
          {/* Arrow positioned in top-right corner */}
          <div
            className={`fixed top-10 right-10 z-[10000] transition-opacity duration-800 ${
              shouldFadeOutFinal ? "opacity-0" : "opacity-100"
            }`}
            style={{
              width: "300px",
              height: "300px",
              transform: "rotate(45deg)",
            }}
          >
            <svg
              width="300px"
              height="300px"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M35 262C80 100 280 80 361 215.518"
                stroke="white"
                strokeOpacity="0.9"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M343.69 143C355.23 190.289 361 214.681 361 216.177C361 218.421 327.488 234.13 312 258"
                stroke="white"
                strokeOpacity="0.9"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Thank you subtitle positioned below and to the left of arrow */}
          <Subtitles
            text="Lets just give it a little push, shal we."
            className="top-37 right-40 max-w-[550px]"
            showNextButton={false}
            characterWidthParam={9.5}
            showButton={false}
            shouldFadeOut={shouldFadeOutFinal}
            onAnimationComplete={() => {
              console.log("First subtitles animation completed");
              // Show second subtitles after 0.5s delay
              setTimeout(() => {
                setGravitationText(true);
              }, 200);
            }}
          />
          {gravitationText && (
            <Subtitles
              text="Gravitation has yet to fail me."
              className="top-50 right-40 max-w-[550px]"
              showNextButton={false}
              characterWidthParam={9.5}
              showButton={false}
              shouldFadeOut={shouldFadeOutFinal}
            />
          )}
          {showCompletionText && (
            <Subtitles
              text="There you go!"
              className="top-63 right-40 max-w-[300px]"
              showNextButton={false}
              characterWidthParam={9.5}
              showButton={false}
              shouldFadeOut={shouldFadeOutFinal}
              onAnimationComplete={() => {
                console.log("There you go! animation completed");
                // Wait 0.3s then fade out all final elements
                setTimeout(() => {
                  console.log("Starting final fade out");
                  setShouldFadeOutFinal(true);
                }, 300);
              }}
            />
          )}
        </>
      )}

      {/* Hold Progress Loading Bar - Always visible */}
      {showHoldProgress && (
        <div
          style={{
            position: "fixed",
            bottom: "15%",
            right: "26%",
            transform: "translateX(-50%) translateY(-50%)",
            width: "300px",
            height: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "20px",
            overflow: "hidden",
            opacity: showHoldProgress ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
            zIndex: 10000,
            boxShadow:
              "0 0 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Animated background gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />

          {/* Progress fill with gradient */}
          <div
            style={{
              width: `${holdProgress * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #3b82f6, #1d4ed8, #3b82f6)",
              borderRadius: "20px",
              transition: "width 0.1s linear",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Animated shine effect */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
                animation: "progressShine 1.5s ease-in-out infinite",
              }}
            />

            {/* Glowing edge */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "2px",
                height: "100%",
                background: "rgba(255, 255, 255, 0.8)",
                boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                borderRadius: "0 20px 20px 0",
              }}
            />
          </div>

          {/* Progress percentage text */}
          <div
            style={{
              position: "absolute",
              top: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              fontSize: "12px",
              fontWeight: "600",
              textShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
              fontFamily: "monospace",
            }}
          >
            {Math.round(holdProgress * 100)}%
          </div>
        </div>
      )}

      {/* Low Battery Indicator */}
      {showLowBattery && (
        <div
          className={shouldBlinkBattery ? "animate-blink3times" : ""}
          style={{
            position: "fixed",
            top: "35%",
            left: "53%",
            transform: "translateX(-50%) translateY(-50%)",
            zIndex: 10000,
          }}
        >
          <div className="relative">
            {/* Battery Body */}
            <div
              className="w-30 h-16 rounded-lg relative"
              style={{
                background: "linear-gradient(-135deg, #343434, #7c8189)",
              }}
            >
              <div className="w-29 h-15 rounded-lg bg-black absolute top-0.5 left-0.5" />
              <div
                className="w-4 h-4 absolute top-[25px] left-14/15"
                style={{
                  clipPath: "polygon(50% 0%, 80% 0%, 80% 100%, 50% 100%)",
                  borderRadius: "0 100% 100% 0",
                  background: "linear-gradient(-135deg, #383839, #4a4b4d)",
                }}
              />
              <div
                className="w-3 h-15 absolute left-[2.2px] top-0.5 rounded-l-lg"
                style={{
                  background: "linear-gradient(-135deg, #ab292f,#ad4046)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showBatteryOnReset && (
        <div
          style={{
            position: "fixed",
            top: "35%",
            left: "53%",
            transform: "translateX(-50%) translateY(-50%)",
            zIndex: 10000,
          }}
        >
          <div className="relative">
            <div
              className="w-30 h-16 rounded-lg relative"
              style={{
                background: "linear-gradient(-135deg, #343434, #7c8189)",
              }}
            >
              <div className="w-29 h-15 rounded-lg bg-black absolute top-0.5 left-0.5" />
              <div
                className="w-4 h-4 absolute top-[25px] left-14/15"
                style={{
                  clipPath: "polygon(50% 0%, 80% 0%, 80% 100%, 50% 100%)",
                  borderRadius: "0 100% 100% 0",
                  background: "linear-gradient(-135deg, #383839, #4a4b4d)",
                }}
              />
              <div
                className="w-1 h-15 absolute left-[2.2px] top-0.5 rounded-l-lg"
                style={{
                  background: "linear-gradient(-135deg, #48b524,#00ff00)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Charge the phone text */}
      {showChargeText && (
        <Subtitles
          text="It looks like phone, is dead, can you charge it?"
          className="bottom-5 right-1/12 -translate-x-1/2 max-w-[760px]"
          showNextButton={true}
          characterWidthParam={9.5}
          shouldFadeOut={shouldFadeOutChargeText}
          onNextClick={(feedback) => {
            console.log("Second button clicked with feedback:", feedback);
            // Fade out the charge text
            setShouldFadeOutChargeText(true);
            // Dispatch event to change camera position (same as PhoneChargerText.tsx)
            window.dispatchEvent(new CustomEvent("changeCameraPosition"));
          }}
          showButton={true}
        />
      )}

      {/* Start button text */}
      {showStartButton && !hasCompletedLoading && (
        <div
          className={`fixed top-81 right-60 z-[10000] flex items-center gap-3 text-white text-xl font-medium ${
            shouldFadeOutStartButton
              ? "animate-fadeOut"
              : "animate-fadeInCorrect"
          }`}
        >
          <LuArrowBigLeftDash className="text-2xl" />
          <span>Press here to start</span>
        </div>
      )}
    </div>
  );
}

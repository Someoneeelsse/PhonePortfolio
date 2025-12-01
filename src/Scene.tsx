import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import LoadingScreen from "./components/LoadingScreen";
import Phone from "./models/Phone";
import Subtitles from "./components/Subtitles";
import { LuArrowBigLeftDash } from "react-icons/lu";
import Charger from "./models/Charger";
import ProjectsCard from "./components/ProjectsCard";
import fireworksVertexShader from "/shaders/fireworks/vertex.glsl?raw";
import fireworksFragmentShader from "/shaders/fireworks/fragment.glsl?raw";
// Memoized ProjectsCard to prevent unnecessary rerenders
const MemoizedProjectsCard = memo(ProjectsCard);

// Arrow Animation Component
function ArrowAnimation({ shouldFadeOut }: { shouldFadeOut: boolean }) {
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const [path1Length, setPath1Length] = useState(0);
  const [path2Length, setPath2Length] = useState(0);

  useEffect(() => {
    if (path1Ref.current && path2Ref.current) {
      const length1 = path1Ref.current.getTotalLength();
      const length2 = path2Ref.current.getTotalLength();
      setPath1Length(length1);
      setPath2Length(length2);
    }
  }, []);

  return (
    <div
      className={`fixed top-[-110px] right-[-30px] z-[10000] transition-opacity duration-800 ${
        shouldFadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        width: "600px",
        height: "600px",
        transform: "rotate(45deg)",
        display: shouldFadeOut ? "none" : "block",
      }}
    >
      <svg
        width="600px"
        height="600px"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {path1Length > 0 &&
            path2Length > 0 &&
            `
            @keyframes drawPath1 {
              from {
                stroke-dashoffset: ${path1Length};
              }
              to {
                stroke-dashoffset: 0;
              }
            }
            @keyframes drawPath2 {
              from {
                stroke-dashoffset: ${path2Length};
              }
              to {
                stroke-dashoffset: 0;
              }
            }
            .arrow-path-1 {
              stroke-dasharray: ${path1Length};
              stroke-dashoffset: ${path1Length};
              animation: drawPath1 1.5s ease-out forwards;
            }
            .arrow-path-2 {
              stroke-dasharray: ${path2Length};
              stroke-dashoffset: ${path2Length};
              animation: drawPath2 0.8s ease-out 1.5s forwards;
            }
          `}
        </style>
        <path
          ref={path1Ref}
          className="arrow-path-1"
          d="M35 262C80 100 280 80 361 215.518"
          stroke="white"
          strokeOpacity="0.9"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          ref={path2Ref}
          className="arrow-path-2"
          d="M343.69 143C355.23 190.289 361 214.681 361 216.177C361 218.421 327.488 234.13 312 258"
          stroke="white"
          strokeOpacity="0.9"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function StraightArrow() {
  const shaftRef = useRef<SVGLineElement>(null);
  const arrowheadRef = useRef<SVGPathElement>(null);
  const [shaftLength, setShaftLength] = useState(0);
  const [arrowheadLength, setArrowheadLength] = useState(0);

  useEffect(() => {
    if (shaftRef.current && arrowheadRef.current) {
      const x1 = 460;
      const x2 = 20;
      const length = Math.abs(x1 - x2);
      setShaftLength(length);

      const arrowheadLen = arrowheadRef.current.getTotalLength();
      setArrowheadLength(arrowheadLen);
    }
  }, []);

  return (
    <div
      style={{
        width: "500px",
        height: "80px", // <<--- dramatically reduced
        position: "relative",
      }}
    >
      <svg
        width="500px"
        height="80px" // <<--- also small
        viewBox="0 0 500 80" // <<--- small vertical viewBox
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {shaftLength > 0 &&
            arrowheadLength > 0 &&
            `
              @keyframes drawShaft {
                from { stroke-dashoffset: ${shaftLength}; }
                to   { stroke-dashoffset: 0; }
              }
              @keyframes drawArrowhead {
                from { stroke-dashoffset: ${arrowheadLength}; }
                to   { stroke-dashoffset: 0; }
              }
              .arrow-shaft {
                stroke-dasharray: ${shaftLength};
                stroke-dashoffset: ${shaftLength};
                animation: drawShaft 1.5s ease-out forwards;
              }
              .arrow-head {
                stroke-dasharray: ${arrowheadLength};
                stroke-dashoffset: ${arrowheadLength};
                animation: drawArrowhead 0.8s ease-out 1.5s forwards;
              }
            `}
        </style>

        {/* Long left-pointing arrow shaft */}
        <line
          ref={shaftRef}
          className="arrow-shaft"
          x1="460"
          y1="40"
          x2="20"
          y2="40"
          stroke="white"
          strokeOpacity="0.9"
          strokeWidth="12" // thinner to save height
          strokeLinecap="round"
        />

        {/* Arrowhead */}
        <path
          ref={arrowheadRef}
          className="arrow-head"
          d="M 20 40 L 45 25 M 20 40 L 45 55"
          stroke="white"
          strokeOpacity="0.9"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Text */}
      <div
        style={{
          position: "absolute",
          right: "40px",
          top: "10%",
          transform: "translateY(-50%) rotate(-90deg)",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          rotate: "90deg",
          width: "400px",

          // Make text unselectable:
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          pointerEvents: "none",
        }}
      >
        Click & drag the charger, connect to phone
      </div>
    </div>
  );
}

function AnimatedPhone({
  shouldStart,
  onAnimationComplete,
  shouldMoveToProjects,
  onMoveToProjectsComplete,
  shouldResetToInitial,
  onResetComplete,
  onPositionUpdate,
}: {
  shouldStart: boolean;
  onAnimationComplete?: () => void;
  shouldMoveToProjects?: boolean;
  onMoveToProjectsComplete?: () => void;
  shouldResetToInitial?: boolean;
  onResetComplete?: () => void;
  onPositionUpdate?: (screenPos: { x: number; y: number }) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, size } = useThree();

  useEffect(() => {
    if (shouldStart && groupRef.current) {
      // Animate to final position
      gsap.to(groupRef.current.position, {
        y: 0,
        duration: 2,
        ease: "power2.out",
        onComplete: () => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        },
      });
    }
  }, [shouldStart, onAnimationComplete]);

  // Animate phone to Projects position after background change
  useEffect(() => {
    // Only animate if shouldMoveToProjects is true AND we're not resetting
    // This prevents the animation from retriggering during reset
    if (shouldMoveToProjects && groupRef.current && !shouldResetToInitial) {
      // Animate camera and phone together
      const timeline = gsap.timeline({
        onComplete: () => {
          if (onMoveToProjectsComplete) {
            onMoveToProjectsComplete();
          }
        },
      });

      // Animate camera to [0, 10, 1]
      timeline.to(camera.position, {
        x: 0,
        y: 2,
        z: 4.5,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          camera.lookAt(-0.3, 1, 0);
        },
      });

      // Animate phone position and rotation at the same time as camera
      timeline
        .to(
          groupRef.current.position,
          {
            x: 0.5,
            y: 1.2,
            z: 1.3,
            duration: 2,
            ease: "power2.out",
          },
          0 // Start at the same time as camera
        )
        .to(
          groupRef.current.rotation,
          {
            x: Math.PI / 2,
            y: 0,
            z: Math.PI / 2,
            duration: 2,
            ease: "power2.out",
          },
          0 // Start at the same time as position and camera
        );
    }
  }, [
    shouldMoveToProjects,
    onMoveToProjectsComplete,
    camera,
    shouldResetToInitial,
  ]);

  // Reset to initial position
  useEffect(() => {
    if (shouldResetToInitial && groupRef.current) {
      // Animate camera and phone back to initial positions
      const timeline = gsap.timeline({
        onComplete: () => {
          if (onResetComplete) {
            onResetComplete();
          }
        },
      });

      // Animate camera back to initial position [0, 0, 5]
      timeline.to(camera.position, {
        x: 0,
        y: 0,
        z: 5,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });

      // Animate phone position and rotation back to initial
      timeline
        .to(
          groupRef.current.position,
          {
            x: 0,
            y: 0,
            z: 0,
            duration: 2,
            ease: "power2.out",
          },
          0 // Start at the same time as camera
        )
        .to(
          groupRef.current.rotation,
          {
            x: 0,
            y: 0,
            z: 0,
            duration: 2,
            ease: "power2.out",
          },
          0 // Start at the same time as position and camera
        );
    }
  }, [shouldResetToInitial, onResetComplete, camera]);

  // Update screen position for text positioning
  useFrame(() => {
    if (groupRef.current && onPositionUpdate) {
      const worldPosition = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPosition);

      // Project 3D position to 2D screen coordinates
      const vector = worldPosition.project(camera);

      // Convert normalized device coordinates to screen coordinates
      const x = (vector.x * 0.5 + 0.5) * size.width;
      const y = (vector.y * -0.5 + 0.5) * size.height;

      onPositionUpdate({ x, y });
    }
  });

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

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const { size } = useThree();

  // Create particle geometry and material
  const { geometry, material } = useMemo(() => {
    const particleCount = 200; // Further reduced from 300 for better performance
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const timeMultipliers = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Random positions in a large sphere
      const radius = Math.random() * 50 + 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      sizes[i] = Math.random() * 0.5 + 0.1;
      timeMultipliers[i] = Math.random() * 2 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute(
      "aTimeMultiplier",
      new THREE.BufferAttribute(timeMultipliers, 1)
    );

    // Load textures
    const glowTexture = new THREE.TextureLoader().load(
      "/images/particles/glow.png"
    );
    const particleTexture = new THREE.TextureLoader().load(
      "/images/particles/particle.png"
    );

    const material = new THREE.ShaderMaterial({
      vertexShader: fireworksVertexShader,
      fragmentShader: fireworksFragmentShader,
      uniforms: {
        uSize: { value: 0.3 },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uProgress: { value: 1.0 }, // Set to 1.0 so particles are fully visible from the start
        uTexture: {
          value: Math.random() > 0.5 ? glowTexture : particleTexture,
        },
        uColor: { value: new THREE.Color(0xffffff) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { geometry, material };
  }, []);

  // Update resolution on resize (optimized - updates in useFrame only when size actually changes)
  const prevSizeRef = useRef({ width: size.width, height: size.height });
  useFrame(() => {
    if (
      material &&
      particlesRef.current &&
      (prevSizeRef.current.width !== size.width ||
        prevSizeRef.current.height !== size.height)
    ) {
      material.uniforms.uResolution.value.set(size.width, size.height);
      prevSizeRef.current = { width: size.width, height: size.height };
    }
  });

  // No need to update uProgress - particles stay visible without periodic explosions

  return <points ref={particlesRef} geometry={geometry} material={material} />;
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
  const [_, setShouldFadeOutStartButton] = useState(false);
  const [showMessagesSubtitle, setShowMessagesSubtitle] = useState(false);
  const [showNothingSpecialSubtitle, setShowNothingSpecialSubtitle] =
    useState(false);
  const [shouldFadeOutMessagesSubtitle, setShouldFadeOutMessagesSubtitle] =
    useState(false);
  const [showEmailSubtitle, setShowEmailSubtitle] = useState(false);
  const [shouldFadeOutEmailSubtitle, setShouldFadeOutEmailSubtitle] =
    useState(false);
  const [showSafariSubtitle, setShowSafariSubtitle] = useState(false);
  const [shouldFadeOutSafariSubtitle, setShouldFadeOutSafariSubtitle] =
    useState(false);
  const [showNotesSubtitle, setShowNotesSubtitle] = useState(false);
  const [shouldFadeOutNotesSubtitle, setShouldFadeOutNotesSubtitle] =
    useState(false);
  const [showSnakeSubtitle, setShowSnakeSubtitle] = useState(false);
  const [shouldFadeOutSnakeSubtitle, setShouldFadeOutSnakeSubtitle] =
    useState(false);
  const [hasCompletedLoading, setHasCompletedLoading] = useState(false);
  const [isInteractionBlocked, setIsInteractionBlocked] = useState(false);
  const [showBatteryOnReset, setShowBatteryOnReset] = useState(false);
  const [batteryResetShown, setBatteryResetShown] = useState(false);
  const wobbleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [phoneScreenPos, setPhoneScreenPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [background, setBackground] = useState(getOriginalBackground());
  const animRef = useRef<number | null>(null);
  const [shouldMovePhoneToProjects, setShouldMovePhoneToProjects] =
    useState(false);
  const [showProjectsCard, setShowProjectsCard] = useState(false);
  const [shouldResetToInitial, setShouldResetToInitial] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const isResettingRef = useRef(false);
  const chargerGroupRef = useRef<THREE.Group>(null);

  const dispatchPhoneScreenVisibility = useCallback((visible: boolean) => {
    window.dispatchEvent(
      new CustomEvent("phoneScreenVisibility", { detail: { visible } })
    );
  }, []);

  const dispatchChargerConnected = useCallback((connected: boolean) => {
    window.dispatchEvent(
      new CustomEvent("chargerConnected", { detail: { connected } })
    );
  }, []);

  const animateChargerTo = useCallback(
    (targetY: number) => {
      if (chargerGroupRef.current) {
        gsap.to(chargerGroupRef.current.position, {
          y: targetY,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            // Dispatch charger connection status based on Y position
            // -5.2 is connected (initial position), -6 is disconnected
            dispatchChargerConnected(targetY === -5.2);
          },
        });
      }
    },
    [dispatchChargerConnected]
  );

  useEffect(() => {
    dispatchPhoneScreenVisibility(true);
  }, [dispatchPhoneScreenVisibility]);

  useEffect(() => {
    if (!shouldMovePhoneToProjects) return;
    const timeoutId = setTimeout(() => {
      dispatchPhoneScreenVisibility(false);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [shouldMovePhoneToProjects, dispatchPhoneScreenVisibility]);

  const handlePhoneAnimationComplete = () => {
    setShowStartButton(true);
    if (onPhoneLanded) {
      onPhoneLanded();
    }
  };

  const handleBackgroundChange = useCallback(() => {
    if (animRef.current) return; // prevent multiple runs

    const totalDuration = 5000; // total cascade time
    const perGradientDelay = 1000; // ms delay between each color
    const perGradientDuration = 3000; // each color's transition duration
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const tValues = Array.from({ length: 5 }, (_, i) => {
        const localT = (elapsed - i * perGradientDelay) / perGradientDuration;
        return Math.min(Math.max(localT, 0), 1);
      });

      const bg = getInterpolatedBackground(tValues);
      setBackground(bg);

      if (elapsed < totalDuration) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        animRef.current = null;
        // Background animation complete - wait 2s then move phone
        setTimeout(() => {
          setShouldMovePhoneToProjects(true);
        }, 1000);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const handleBackgroundReset = useCallback((onComplete?: () => void) => {
    if (animRef.current) return; // prevent multiple runs

    const totalDuration = 5000; // total cascade time
    const perGradientDelay = 1000; // ms delay between each color
    const perGradientDuration = 3000; // each color's transition duration
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      // Reverse animation: start from 1 (current Projects background) and go back to 0 (original)
      const tValues = Array.from({ length: 5 }, (_, i) => {
        const localT = (elapsed - i * perGradientDelay) / perGradientDuration;
        // Reverse: 1 - localT to go from 1 to 0
        return Math.min(Math.max(1 - localT, 0), 1);
      });

      const bg = getInterpolatedBackground(tValues);
      setBackground(bg);

      if (elapsed < totalDuration) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        animRef.current = null;
        // Background reset complete - ensure we're at original
        setBackground(getOriginalBackground());
        // Call completion callback if provided
        if (onComplete) {
          onComplete();
        }
      }
    };

    requestAnimationFrame(animate);
  }, []);
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleLoadingAnimationComplete = () => {
    setIsLoadingAnimationComplete(true);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (wobbleTimerRef.current) {
        clearInterval(wobbleTimerRef.current);
      }
    };
  }, []);

  // Log when the loading animation state changes
  useEffect(() => {}, [isLoadingAnimationComplete]);

  // Log when the nice button clicked state changes
  useEffect(() => {}, [isHelpingTextButtonClicked]);

  const handleManualComplete = () => {
    if (isCompleted) {
      handleLoadingComplete();
    }
  };

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // Allow rotation when showFinalSubtitle is true
      if (showFinalSubtitle) {
        if (showError && rotationY < 1.55) {
          // 89 degrees in radians (89 * Math.PI / 180)

          setIsDragging(true);
          setLastMouseX(event.clientX);
        } else if (rotationY >= 1.55) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      } else {
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

      // Wait 0.3 seconds then complete
      const completionTimer = setTimeout(() => {
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
      const progress = Math.min(holdTime / 2.5, 1); // 2.5 seconds total
      // Ensure progress reaches exactly 1.0 when complete
      const finalProgress = progress >= 1 ? 1.0 : progress;
      setHoldProgress(finalProgress);
      setShowHoldProgress(true);

      // Don't fade out charge text when holding starts - it will be shown later
      // The charge text is shown after the battery blinks, not during holding

      // When progress reaches 100%, fade out and show low battery
      if (progress >= 1) {
        // Block interaction immediately when battery starts flashing
        setIsInteractionBlocked(true);
        // Mark loading as completed and fade out start button when progress completes
        setHasCompletedLoading(true);
        setShouldFadeOutStartButton(true);

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
        return;
      }

      setBatteryResetShown(true);

      // Wait 2 seconds before showing battery
      setTimeout(() => {
        setShowBatteryOnReset(true);

        // Hide battery after 2 seconds of showing
        setTimeout(() => {
          setShowBatteryOnReset(false);
          // Wait 1 second before showing lockscreen
          setTimeout(() => {
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

  // Listen for Projects app click to trigger background change
  useEffect(() => {
    const handleProjectsClick = () => {
      // Hide bolt immediately when unplugging starts
      setTimeout(() => {
        animateChargerTo(-6);
      }, 400);
      setTimeout(() => {
        dispatchChargerConnected(false);
      }, 500);
      handleBackgroundChange();
    };

    const handleResetToInitialView = () => {
      // Prevent multiple reset triggers
      if (isResettingRef.current) {
        return;
      }

      isResettingRef.current = true;
      // Hide ProjectsCard immediately
      setShowProjectsCard(false);
      // Reset phone movement state
      setShouldMovePhoneToProjects(false);
      // Start background reset animation
      handleBackgroundReset(() => {
        // After background resets, move phone back
        setTimeout(() => {
          setShouldResetToInitial(true);
        }, 200);
      });
    };

    window.addEventListener("projectsAppClicked", handleProjectsClick);
    window.addEventListener("resetToInitialView", handleResetToInitialView);

    return () => {
      window.removeEventListener("projectsAppClicked", handleProjectsClick);
      window.removeEventListener(
        "resetToInitialView",
        handleResetToInitialView
      );
    };
  }, [
    handleBackgroundChange,
    handleBackgroundReset,
    animateChargerTo,
    dispatchChargerConnected,
  ]);

  // Listen for Messages app content shown and closed events
  useEffect(() => {
    const handleMessagesContentShown = (event: Event) => {
      const customEvent = event as CustomEvent<{ shown: boolean }>;
      if (customEvent.detail.shown) {
        // Show subtitle after 100ms timeout
        setTimeout(() => {
          setShowMessagesSubtitle(true);
        }, 100);
      }
    };

    const handleMessagesAppClosed = (event: Event) => {
      const customEvent = event as CustomEvent<{ closed: boolean }>;
      if (customEvent.detail.closed) {
        // Hide subtitle when app is closed
        setShouldFadeOutMessagesSubtitle(false);
        setShowMessagesSubtitle(false);
        setShowNothingSpecialSubtitle(false);
      }
    };

    const handleEmailContentShown = (event: Event) => {
      const customEvent = event as CustomEvent<{ shown: boolean }>;
      if (customEvent.detail.shown) {
        // Show subtitle after 100ms timeout
        setTimeout(() => {
          setShowEmailSubtitle(true);
        }, 100);
      }
    };

    const handleEmailAppClosed = (event: Event) => {
      const customEvent = event as CustomEvent<{ closed: boolean }>;
      if (customEvent.detail.closed) {
        // Hide subtitle when app is closed
        setShouldFadeOutEmailSubtitle(false);
        setShowEmailSubtitle(false);
      }
    };

    const handleSafariContentShown = (event: Event) => {
      const customEvent = event as CustomEvent<{ shown: boolean }>;
      if (customEvent.detail.shown) {
        // Show subtitle after 100ms timeout
        setTimeout(() => {
          setShowSafariSubtitle(true);
        }, 100);
      }
    };

    const handleSafariAppClosed = (event: Event) => {
      const customEvent = event as CustomEvent<{ closed: boolean }>;
      if (customEvent.detail.closed) {
        // Hide subtitle when app is closed
        setShouldFadeOutSafariSubtitle(false);
        setShowSafariSubtitle(false);
      }
    };

    const handleNotesContentShown = (event: Event) => {
      const customEvent = event as CustomEvent<{ shown: boolean }>;
      if (customEvent.detail.shown) {
        // Show subtitle after 100ms timeout
        setTimeout(() => {
          setShowNotesSubtitle(true);
        }, 100);
      }
    };

    const handleNotesAppClosed = (event: Event) => {
      const customEvent = event as CustomEvent<{ closed: boolean }>;
      if (customEvent.detail.closed) {
        // Hide subtitle when app is closed
        setShouldFadeOutNotesSubtitle(false);
        setShowNotesSubtitle(false);
      }
    };

    const handleSnakeContentShown = (event: Event) => {
      const customEvent = event as CustomEvent<{ shown: boolean }>;
      if (customEvent.detail.shown) {
        // Show subtitle after 100ms timeout
        setTimeout(() => {
          setShowSnakeSubtitle(true);
        }, 100);
      }
    };

    const handleSnakeAppClosed = (event: Event) => {
      const customEvent = event as CustomEvent<{ closed: boolean }>;
      if (customEvent.detail.closed) {
        // Hide subtitle when app is closed
        setShouldFadeOutSnakeSubtitle(false);
        setShowSnakeSubtitle(false);
      }
    };

    window.addEventListener(
      "messagesContentShown",
      handleMessagesContentShown as EventListener
    );
    window.addEventListener(
      "messagesAppClosed",
      handleMessagesAppClosed as EventListener
    );
    window.addEventListener(
      "emailContentShown",
      handleEmailContentShown as EventListener
    );
    window.addEventListener(
      "emailAppClosed",
      handleEmailAppClosed as EventListener
    );
    window.addEventListener(
      "safariContentShown",
      handleSafariContentShown as EventListener
    );
    window.addEventListener(
      "safariAppClosed",
      handleSafariAppClosed as EventListener
    );
    window.addEventListener(
      "notesContentShown",
      handleNotesContentShown as EventListener
    );
    window.addEventListener(
      "notesAppClosed",
      handleNotesAppClosed as EventListener
    );
    window.addEventListener(
      "snakeContentShown",
      handleSnakeContentShown as EventListener
    );
    window.addEventListener(
      "snakeAppClosed",
      handleSnakeAppClosed as EventListener
    );

    return () => {
      window.removeEventListener(
        "messagesContentShown",
        handleMessagesContentShown as EventListener
      );
      window.removeEventListener(
        "messagesAppClosed",
        handleMessagesAppClosed as EventListener
      );
      window.removeEventListener(
        "emailContentShown",
        handleEmailContentShown as EventListener
      );
      window.removeEventListener(
        "emailAppClosed",
        handleEmailAppClosed as EventListener
      );
      window.removeEventListener(
        "safariContentShown",
        handleSafariContentShown as EventListener
      );
      window.removeEventListener(
        "safariAppClosed",
        handleSafariAppClosed as EventListener
      );
      window.removeEventListener(
        "notesContentShown",
        handleNotesContentShown as EventListener
      );
      window.removeEventListener(
        "notesAppClosed",
        handleNotesAppClosed as EventListener
      );
      window.removeEventListener(
        "snakeContentShown",
        handleSnakeContentShown as EventListener
      );
      window.removeEventListener(
        "snakeAppClosed",
        handleSnakeAppClosed as EventListener
      );
    };
  }, []);

  return (
    <div className="relative w-full h-screen font-serif">
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
        style={{ background, transition: "background 1s linear" }}
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
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Animated WobbleSpheres - Appear after phone lands 
        {visibleWobbles.map((index) => {
          const wobblePositions = [
            { position: [15, 8, -25] as [number, number, number], radius: 1.5 },
            {
              position: [-12, -5, -35] as [number, number, number],
              radius: 2.2,
            },
            {
              position: [8, -10, -20] as [number, number, number],
              radius: 1.8,
            },
            {
              position: [-20, 12, -40] as [number, number, number],
              radius: 1.2,
            },
            {
              position: [25, -8, -30] as [number, number, number],
              radius: 2.0,
            },
          ];
          const wobble = wobblePositions[index];
          return (
            <AnimatedWobbleSphere
              key={index}
              position={wobble.position}
              radius={wobble.radius}
            />
          );
        })}*/}

        {/* Floating White Particles */}
        <FloatingParticles />

        {/* Show Phone when loading animation is complete */}
        {isLoadingAnimationComplete && (
          <AnimatedPhone
            shouldStart={isLoadingAnimationComplete}
            onAnimationComplete={handlePhoneAnimationComplete}
            shouldMoveToProjects={shouldMovePhoneToProjects}
            onMoveToProjectsComplete={() => {
              // Wait 1 second after phone animation completes, then show ProjectsCard
              setTimeout(() => {
                setShowProjectsCard(true);
              }, 1000);
            }}
            shouldResetToInitial={shouldResetToInitial}
            onResetComplete={() => {
              setShowProjectsCard(false);
              setShouldResetToInitial(false);
              setShouldMovePhoneToProjects(false);
              // Background reset is handled by handleBackgroundReset animation
              // It will set to original when animation completes
              setIsResetting(false);
              // Reset the flag to allow future resets
              isResettingRef.current = false;
              // Dispatch event to close all apps and return to main screen
              window.dispatchEvent(new CustomEvent("closeAllApps"));
            }}
            onPositionUpdate={setPhoneScreenPos}
          />
        )}

        {/* Show Charger when loading animation is complete */}
        {isLoadingAnimationComplete && (
          <group ref={chargerGroupRef} position={[0.25, -5.2, 2.35]}>
            <Charger />
          </group>
        )}

        {/* Straight Arrow 2 units to the right of Charger */}
        {isLoadingAnimationComplete && (
          <Html position={[2, -3, 2.35]} center style={{ width: "100px" }}>
            <div
              style={{
                transform: "rotate(78deg)",
                transformOrigin: "center",
              }}
            >
              <StraightArrow />
            </div>
          </Html>
        )}

        {/* ProjectsCard - Always render when phone is loaded, but invisible until needed */}

        {isLoadingAnimationComplete && (
          <MemoizedProjectsCard
            position={[-0.6, 1.25, 1.98]}
            rotation={[0, Math.PI / 4, 0]}
            color="#70c1ff"
            width={2.5}
            height={3.5}
            depth={0.2}
            scale={[0.5, 0.5, 0.5]}
            visible={showProjectsCard}
          />
        )}
      </Canvas>

      {/* Reset Button - Show when ProjectsCard is visible or during reset */}
      {(showProjectsCard || isResetting) && (
        <button
          onClick={() => {
            // Set resetting flag to keep button visible during animation
            setIsResetting(true);
            // Reset phone movement state to prevent animation retrigger
            // This prevents onMoveToProjectsComplete from firing and showing ProjectsCard again
            setShouldMovePhoneToProjects(false);
            // Ensure ProjectsCard stays visible during background animation
            // (it should already be visible, but we ensure it stays that way)
            // Step 1: Start gradual background reset animation first
            // After background completes, hide ProjectCard, then move phone
            handleBackgroundReset(() => {
              // Step 2: Hide ProjectsCard after background animation completes
              setShowProjectsCard(false);
              // Step 3: Wait a bit then move phone back
              setTimeout(() => {
                setShouldResetToInitial(true);
              }, 200);
            });
            setTimeout(() => {
              dispatchPhoneScreenVisibility(true);
            }, 5370);
            setTimeout(() => {
              animateChargerTo(-5.2); // Move charger back to initial position
            }, 7000);
          }}
          className="fixed top-5 left-90 z-[10001] bg-white/90 hover:bg-white text-gray-800 px-2 py-2 rounded-lg shadow-lg flex items-center transition-all hover:scale-105"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <LuArrowBigLeftDash className="text-2xl" />
        </button>
      )}

      {/* Fixed "Nice" subtitle that doesn't rotate */}
      {showError && (
        <Subtitles
          text="Ugh, again? The person who built this site really needs to sort out that loading issue."
          className="top-140 left-1/2 -translate-x-1/2 max-w-[870px]"
          showNextButton={false}
          characterWidthParam={9.5}
          showButton={false}
          shouldFadeOut={shouldFadeOutSubtitles}
          onAnimationComplete={() => {
            // Show second subtitles after 0.5s delay
            setTimeout(() => {
              setShowSecondSubtitles(true);
            }, 500);
          }}
        />
      )}
      {showSecondSubtitles && (
        <Subtitles
          text="Would you mind helping me get this thing to spin up?"
          className="top-155 left-1/2 -translate-x-1/2 max-w-[760px]"
          showNextButton={true}
          characterWidthParam={9.5}
          shouldFadeOut={shouldFadeOutSubtitles}
          onNextClick={() => {
            setIsHelpingTextButtonClicked(true);

            // Start fade out animation for existing subtitles
            setTimeout(() => {
              setShouldFadeOutSubtitles(true);

              // Show final subtitle after fade out completes
              setTimeout(() => {
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
          {/* Thank you subtitle positioned below and to the left of arrow */}
          <Subtitles
            text="Let’s give it a little push, shall we?"
            className="top-45 right-40 max-w-[400px]"
            showNextButton={false}
            characterWidthParam={9.5}
            showButton={false}
            shouldFadeOut={shouldFadeOutFinal}
            onAnimationComplete={() => {
              // Show second subtitles after 0.5s delay
              setTimeout(() => {
                setGravitationText(true);
              }, 200);
            }}
          />
          {gravitationText && (
            <>
              <ArrowAnimation shouldFadeOut={shouldFadeOutFinal} />
              <Subtitles
                text="Gravity has yet to let me down."
                className="top-60 right-40 max-w-[332px]"
                showNextButton={false}
                characterWidthParam={9.5}
                showButton={false}
                shouldFadeOut={shouldFadeOutFinal}
              />
            </>
          )}

          {showCompletionText && (
            <Subtitles
              text="Thanks and enjoy!"
              className="top-75 right-40 max-w-[197px]"
              showNextButton={false}
              characterWidthParam={9.5}
              showButton={false}
              shouldFadeOut={shouldFadeOutFinal}
              onAnimationComplete={() => {
                // Wait 0.3s then fade out all final elements
                setTimeout(() => {
                  setShouldFadeOutFinal(true);
                }, 300);
              }}
            />
          )}
        </>
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

      {/* Start button text, loading bar, and charge text */}
      {phoneScreenPos && showStartButton && !hasCompletedLoading && (
        <div
          className="absolute z-[10000] flex flex-col items-start gap-3 animate-fadeInCorrect"
          style={{
            left: `${phoneScreenPos.x + 250}px`,
            top: `${phoneScreenPos.y - 180}px`,
            transform: "translateY(-50%)",
          }}
        >
          {/* Push/Hold text and loading bar */}
          {showStartButton && !hasCompletedLoading && (
            <>
              <div className="flex items-center gap-3 text-white text-xl font-medium">
                <LuArrowBigLeftDash className="text-2xl" />
                <span>
                  {showHoldProgress
                    ? holdProgress >= 0.8
                      ? "Nice!"
                      : "Hold"
                    : "Push and hold the button to start"}
                </span>
              </div>

              {/* Progress bar - matching LoadingScreen style - shows when holding */}
              {showHoldProgress && (
                <div
                  style={{
                    width: "150px",
                    height: "6px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginLeft: "38px",
                  }}
                >
                  <div
                    style={{
                      width: `${holdProgress * 107}%`,
                      height: "100%",
                      backgroundColor: "white",
                      borderRadius: "3px",
                      transition: "width 0.1s linear",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showChargeText && (
        <div
          className={`absolute z-[10000] flex flex-col items-start gap-3 ${
            shouldFadeOutChargeText
              ? "animate-fadeOut"
              : "animate-fadeInCorrect"
          }`}
          style={{
            left: phoneScreenPos ? `${phoneScreenPos.x - 235}px` : "50%",
            bottom: phoneScreenPos ? `${phoneScreenPos.y - 480}px` : "20%",
            transform: phoneScreenPos
              ? "translateY(-50%)"
              : "translate(-50%, -50%)",
          }}
        >
          {/* Charge the phone text */}
          <Subtitles
            text="It looks like phone, is dead, can you charge it?"
            className=""
            showNextButton={true}
            characterWidthParam={9.5}
            shouldFadeOut={shouldFadeOutChargeText}
            onNextClick={() => {
              // Fade out the charge text
              setShouldFadeOutChargeText(true);
              // Dispatch event to change camera position (same as PhoneChargerText.tsx)
              window.dispatchEvent(new CustomEvent("changeCameraPosition"));
            }}
            showButton={true}
          />
        </div>
      )}

      {/* Messages app subtitle */}
      {showMessagesSubtitle && (
        <>
          <Subtitles
            text="We can skip the messages checking on this phone"
            className="top-50 left-4/5 -translate-x-1/2 max-w-[900px]"
            showNextButton={false}
            characterWidthParam={9.5}
            showButton={false}
            shouldFadeOut={shouldFadeOutMessagesSubtitle}
            onAnimationComplete={() => {
              setTimeout(() => {
                setShowNothingSpecialSubtitle(true);
              }, 650);
            }}
          />
          {showNothingSpecialSubtitle && (
            <Subtitles
              text="Nothing special here..."
              className="top-65 left-308 -translate-x-1/2 max-w-[900px]"
              showNextButton={false}
              characterWidthParam={9.5}
              showButton={false}
              shouldFadeOut={shouldFadeOutMessagesSubtitle}
              onAnimationComplete={() => {
                setTimeout(() => {
                  setShouldFadeOutMessagesSubtitle(true);
                  setTimeout(() => {
                    setShowMessagesSubtitle(false);
                    setShowNothingSpecialSubtitle(false);
                    setShouldFadeOutMessagesSubtitle(false);
                  }, 700);
                }, 300);
              }}
            />
          )}
        </>
      )}

      {/* Email app subtitle */}
      {showEmailSubtitle && (
        <Subtitles
          text="You can send me an email from here"
          className="top-50 left-4/5 -translate-x-1/2 max-w-[900px]"
          showNextButton={false}
          characterWidthParam={9.5}
          showButton={false}
          shouldFadeOut={shouldFadeOutEmailSubtitle}
          onAnimationComplete={() => {
            // Wait 200ms after animation completes, then fade out
            setTimeout(() => {
              setShouldFadeOutEmailSubtitle(true);
              // Hide subtitle after fade out animation completes
              setTimeout(() => {
                setShowEmailSubtitle(false);
                setShouldFadeOutEmailSubtitle(false);
              }, 700);
            }, 200);
          }}
        />
      )}

      {/* Safari app subtitle */}
      {showSafariSubtitle && (
        <Subtitles
          text="Well that is awkward"
          className="top-50 left-4/5 -translate-x-1/2 max-w-[900px]"
          showNextButton={false}
          characterWidthParam={9.5}
          showButton={false}
          shouldFadeOut={shouldFadeOutSafariSubtitle}
          onAnimationComplete={() => {
            // Wait 200ms after animation completes, then fade out
            setTimeout(() => {
              setShouldFadeOutSafariSubtitle(true);
              // Hide subtitle after fade out animation completes
              setTimeout(() => {
                setShowSafariSubtitle(false);
                setShouldFadeOutSafariSubtitle(false);
              }, 700);
            }, 200);
          }}
        />
      )}

      {/* Notes app subtitle */}
      {showNotesSubtitle && (
        <Subtitles
          text="The only TODO app I would ever make..."
          className="top-50 left-4/5 -translate-x-1/2 max-w-[900px]"
          showNextButton={false}
          characterWidthParam={9.5}
          showButton={false}
          shouldFadeOut={shouldFadeOutNotesSubtitle}
          onAnimationComplete={() => {
            // Wait 200ms after animation completes, then fade out
            setTimeout(() => {
              setShouldFadeOutNotesSubtitle(true);
              // Hide subtitle after fade out animation completes
              setTimeout(() => {
                setShowNotesSubtitle(false);
                setShouldFadeOutNotesSubtitle(false);
              }, 700);
            }, 200);
          }}
        />
      )}

      {/* Snake app subtitle */}
      {showSnakeSubtitle && (
        <Subtitles
          text="I have spend to much time on this; Playing..."
          className="top-50 left-4/5 -translate-x-1/2 max-w-[900px]"
          showNextButton={false}
          characterWidthParam={9.5}
          showButton={false}
          shouldFadeOut={shouldFadeOutSnakeSubtitle}
          onAnimationComplete={() => {
            // Wait 200ms after animation completes, then fade out
            setTimeout(() => {
              setShouldFadeOutSnakeSubtitle(true);
              // Hide subtitle after fade out animation completes
              setTimeout(() => {
                setShowSnakeSubtitle(false);
                setShouldFadeOutSnakeSubtitle(false);
              }, 700);
            }, 200);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------
   Background Helper Functions
------------------------ */

function getOriginalBackground() {
  return buildBackground([
    ["#ff6b9d", "rgba(255, 107, 157, 0.3)"],
    ["#f8b500", "rgba(248, 181, 0, 0.4)"],
    ["#e056fd", "rgba(224, 86, 253, 0.3)"],
    ["#ff8a00", "rgba(255, 138, 0, 0.2)"],
    ["#c44569", "rgba(196, 69, 105, 0.2)"],
  ]);
}

function getInterpolatedBackground(tValues: number[]) {
  const from: [string, string][] = [
    ["#ff6b9d", "rgba(255, 107, 157, 0.3)"],
    ["#f8b500", "rgba(248, 181, 0, 0.4)"],
    ["#e056fd", "rgba(224, 86, 253, 0.3)"],
    ["#ff8a00", "rgba(255, 138, 0, 0.2)"],
    ["#c44569", "rgba(196, 69, 105, 0.2)"],
  ];
  const to: [string, string][] = [
    ["#8b5cf6", "rgba(139, 92, 246, 0.3)"],
    ["#60a5fa", "rgba(96, 165, 250, 0.4)"],
    ["#e056fd", "rgba(224, 86, 253, 0.3)"],
    ["#3b82f6", "rgba(59, 130, 246, 0.2)"],
    ["#c44569", "rgba(196, 69, 105, 0.2)"],
  ];

  const blended: [string, string][] = from.map(([start1, start2], i) => {
    const [end1, end2] = to[i];
    const t = tValues[i];
    return [lerpColor(start1, end1, t), lerpRgba(start2, end2, t)] as [
      string,
      string
    ];
  });

  return buildBackground(blended);
}

function buildBackground(colors: [string, string][]) {
  const [a, b, c, d, e] = colors;
  return `
    radial-gradient(circle at 20% 20%, ${a[0]} 0%, ${a[1]} 30%, transparent 80%),
    radial-gradient(circle at 80% 50%, ${b[0]} 0%, ${b[1]} 40%, transparent 85%),
    radial-gradient(circle at 50% 90%, ${c[0]} 0%, ${c[1]} 35%, transparent 90%),
    radial-gradient(circle at 30% 70%, ${d[0]} 0%, ${d[1]} 25%, transparent 70%),
    radial-gradient(circle at 60% 30%, ${e[0]} 0%, ${e[1]} 30%, transparent 75%),
    linear-gradient(45deg, #1a1a2e, #16213e)
  `;
}

function lerpColor(a: string, b: string, t: number) {
  const parse = (hex: string) =>
    hex
      .replace("#", "")
      .match(/.{2}/g)!
      .map((x) => parseInt(x, 16));

  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b_ = Math.round(b1 + (b2 - b1) * t);

  return `rgb(${r}, ${g}, ${b_})`;
}

function lerpRgba(a: string, b: string, t: number) {
  const parse = (rgba: string) => rgba.match(/[\d.]+/g)!.map(Number);
  const [r1, g1, b1, a1] = parse(a);
  const [r2, g2, b2, a2] = parse(b);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b_ = Math.round(b1 + (b2 - b1) * t);
  const alpha = (a1 + (a2 - a1) * t).toFixed(2);

  return `rgba(${r}, ${g}, ${b_}, ${alpha})`;
}

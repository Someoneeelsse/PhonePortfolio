import { Html, useGLTF } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import PhoneScreen from "../components/PhoneScreen";
import type { Object3D } from "three";

export default function Phone({
  position,
}: {
  position: [number, number, number];
}) {
  //const phone = useGLTF(
  //  "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/iphone-x/model.gltf"
  //);
  const phone = useGLTF("/Iphone.glb");

  const [, setIsHolding] = useState(false);
  const [_, setHoldTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);
  const hasCompletedRef = useRef<boolean>(false);
  const globalTouchEndHandlerRef = useRef<((e: TouchEvent) => void) | null>(
    null
  );
  const globalMouseUpHandlerRef = useRef<((e: MouseEvent) => void) | null>(
    null
  );
  const spotTarget = useRef<Object3D | null>(null);

  const resetTimer = () => {
    // Don't reset if hold has completed successfully
    if (hasCompletedRef.current) {
      return;
    }

    isHoldingRef.current = false;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsHolding(false);
    setHoldTime(0);
    startTimeRef.current = 0;

    // Remove global listeners
    if (globalTouchEndHandlerRef.current) {
      document.removeEventListener(
        "touchend",
        globalTouchEndHandlerRef.current
      );
      document.removeEventListener(
        "touchcancel",
        globalTouchEndHandlerRef.current
      );
      globalTouchEndHandlerRef.current = null;
    }
    if (globalMouseUpHandlerRef.current) {
      document.removeEventListener("mouseup", globalMouseUpHandlerRef.current);
      globalMouseUpHandlerRef.current = null;
    }

    // Dispatch reset event
    window.dispatchEvent(new CustomEvent("holdReset"));
  };

  const startHoldTimer = () => {
    if (isHoldingRef.current) return;

    hasCompletedRef.current = false; // Reset completion flag for new hold
    isHoldingRef.current = true;
    setIsHolding(true);
    setHoldTime(0);
    startTimeRef.current = Date.now();

    // Use requestAnimationFrame for smoother updates and better performance
    let lastUpdateTime = startTimeRef.current;

    const updateProgress = () => {
      // Check if we're still holding using ref (more reliable)
      if (!isHoldingRef.current || startTimeRef.current === 0) {
        animationFrameRef.current = null;
        return;
      }

      const currentTime = Date.now();
      const elapsed = (currentTime - startTimeRef.current) / 1000; // Convert to seconds

      if (elapsed >= 2.5) {
        // Completed - mark as completed and stop the timer without resetting
        hasCompletedRef.current = true;
        setHoldTime(2.5);
        window.dispatchEvent(
          new CustomEvent("holdProgress", {
            detail: { holdTime: 2.5 },
          })
        );

        // Stop the animation frame
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Clear the timeout
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        // Remove global listeners
        if (globalTouchEndHandlerRef.current) {
          document.removeEventListener(
            "touchend",
            globalTouchEndHandlerRef.current
          );
          document.removeEventListener(
            "touchcancel",
            globalTouchEndHandlerRef.current
          );
          globalTouchEndHandlerRef.current = null;
        }
        if (globalMouseUpHandlerRef.current) {
          document.removeEventListener(
            "mouseup",
            globalMouseUpHandlerRef.current
          );
          globalMouseUpHandlerRef.current = null;
        }

        isHoldingRef.current = false;
        setIsHolding(false);
        return;
      }

      setHoldTime(elapsed);

      // Dispatch progress event (throttle to every ~50ms for performance)
      if (currentTime - lastUpdateTime >= 50) {
        window.dispatchEvent(
          new CustomEvent("holdProgress", {
            detail: { holdTime: elapsed },
          })
        );
        lastUpdateTime = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    // Add global touch end listener for mobile
    const handleGlobalTouchEnd = (_e: TouchEvent) => {
      if (isHoldingRef.current) {
        resetTimer();
      }
    };

    const handleGlobalTouchCancel = (_e: TouchEvent) => {
      if (isHoldingRef.current) {
        resetTimer();
      }
    };

    const handleGlobalMouseUp = (_e: MouseEvent) => {
      if (isHoldingRef.current) {
        resetTimer();
      }
    };

    globalTouchEndHandlerRef.current = handleGlobalTouchEnd;
    globalMouseUpHandlerRef.current = handleGlobalMouseUp;

    document.addEventListener("touchend", handleGlobalTouchEnd, {
      passive: true,
    });
    document.addEventListener("touchcancel", handleGlobalTouchCancel, {
      passive: true,
    });
    document.addEventListener("mouseup", handleGlobalMouseUp);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetTimer();
    };
  }, []);

  return (
    <group position={position}>
      <primitive object={phone.scene}>
        <Html
          position={[0.168, 1.336, 0.085]}
          transform
          occlude={false}
          distanceFactor={1}
          zIndexRange={[1000, 1000]}
          style={{ pointerEvents: "auto" }}
        >
          <PhoneScreen />
        </Html>
      </primitive>
      <mesh
        position={[1, 2.05, 0]}
        visible={true}
        onPointerDown={(event) => {
          // Start hold timer for both mouse and touch
          event.stopPropagation();
          startHoldTimer();
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          if (isHoldingRef.current) {
            resetTimer();
          }
        }}
        onPointerLeave={(_event) => {
          if (isHoldingRef.current) {
            resetTimer();
          }
        }}
        onPointerCancel={(_event) => {
          if (isHoldingRef.current) {
            resetTimer();
          }
        }}
      >
        <boxGeometry args={[0.05, 0.4, 0.1]} />
        <meshBasicMaterial color="transparent" visible={false} />
      </mesh>
      {/* The spotlight target */}
      <mesh ref={spotTarget} position={[0.165, -0.29, -0.042]} visible={false}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshBasicMaterial />
      </mesh>

      {/* Spotlight shining upward */}
      <spotLight
        position={[0.165, -1, -0.042]}
        intensity={4}
        angle={0.8}
        penumbra={0.4}
        distance={5}
        color="white"
        target={spotTarget.current || undefined}
      />
    </group>
  );
}

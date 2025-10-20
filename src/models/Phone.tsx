import { Html, useGLTF } from "@react-three/drei";
import { useRef, useState } from "react";
import PhoneScreen from "../components/PhoneScreen";

export default function Phone({
  position,
}: {
  position: [number, number, number];
}) {
  const phone = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/iphone-x/model.gltf"
  );

  const [isHolding, setIsHolding] = useState(false);
  const [_, setHoldTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHoldTimer = () => {
    if (isHolding) return;

    setIsHolding(true);
    setHoldTime(0);
    console.log("Hold timer started!");

    // Start progress timer
    progressRef.current = setInterval(() => {
      setHoldTime((prev) => {
        const newTime = prev + 0.1;
        console.log(`Hold time: ${newTime.toFixed(1)}s`);

        // Dispatch progress event in next tick to avoid setState during render
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("holdProgress", {
              detail: { holdTime: newTime },
            })
          );
        }, 0);

        return newTime;
      });
    }, 100);

    // Start completion timer
    timerRef.current = setTimeout(() => {
      console.log("Congrats!");
      resetTimer();
    }, 3200);
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    setIsHolding(false);
    setHoldTime(0);

    // Dispatch reset event
    window.dispatchEvent(new CustomEvent("holdReset"));
  };

  return (
    <group position={position}>
      <primitive object={phone.scene}>
        <Html
          position={[0.168, 1.336, 0.085]}
          transform
          occlude
          distanceFactor={1}
          zIndexRange={[1, 0]}
        >
          <PhoneScreen />
        </Html>
      </primitive>
      <mesh
        position={[1, 2.05, 0]}
        visible={true}
        onPointerDown={(event) => {
          // Only start hold timer if it's a left click, allow other interactions
          if (event.button === 0) {
            // Left mouse button
            event.stopPropagation();
            startHoldTimer();
          }
        }}
        onPointerUp={(event) => {
          if (event.button === 0) {
            // Left mouse button
            event.stopPropagation();
            if (isHolding) {
              console.log("Hold released early - timer reset");
              resetTimer();
            }
          }
        }}
        onPointerLeave={(event) => {
          if (isHolding) {
            console.log("Cursor left box - timer reset");
            resetTimer();
          }
        }}
      >
        <boxGeometry args={[0.05, 0.4, 0.1]} />
        <meshBasicMaterial color="transparent" visible={false} />
      </mesh>
    </group>
  );
}

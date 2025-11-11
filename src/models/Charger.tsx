import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

export default function IPhoneCharger() {
  const band = useRef<THREE.Mesh>(null);
  const box = useRef<THREE.Mesh>(null);
  const { width: _, height: __ } = useThree((s) => s.size);

  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<THREE.Vector2 | null>(null);
  const [hasDispatchedReset, setHasDispatchedReset] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Rope curve points
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -5.5, 0), // bottom
        new THREE.Vector3(0, -1.25, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0), // box position
      ])
  );

  const cableMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e8e8e8",
        metalness: 0.1,
        roughness: 0.3,
      }),
    []
  );

  useFrame((state) => {
    if (!box.current || !band.current) return;

    // Cancel drag if not hovering while dragging
    if (dragging && !hovered) {
      setDragging(false);
      setLastMousePos(null);
    }

    // Check if box has reached the lock position and reset camera (only once)
    if (box.current.position.y >= 3.32 && !hasDispatchedReset) {
      setHasDispatchedReset(true);
      setIsLocked(true);
      // Dispatch event to reset camera to initial position
      window.dispatchEvent(new CustomEvent("resetCameraPosition"));
    }

    // Only follow cursor when dragging AND hovering over the box
    // Block dragging if Y position reaches 3.29
    if (dragging && lastMousePos && hovered && box.current.position.y < 3.32) {
      // Calculate mouse movement delta
      const currentMouse = new THREE.Vector2(state.pointer.x, state.pointer.y);
      const delta = new THREE.Vector2().subVectors(currentMouse, lastMousePos);

      // Calculate distance between cursor and charger head
      const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

      // Adaptive speed based on distance - higher speed for larger distances
      const baseSpeed = 5;
      const adaptiveSpeed = baseSpeed + distance * 10; // Increase speed with distance

      // Convert screen delta to world delta with adaptive speed
      // Different multipliers for X and Y axes to account for camera perspective
      const worldDelta = new THREE.Vector3(
        delta.x * adaptiveSpeed * 1.5, // Higher multiplier for X-axis (left/right)
        delta.y * adaptiveSpeed,
        0
      );

      // Apply movement to box
      box.current.position.add(worldDelta);
      box.current.position.z = 0; // Keep Z at 0

      // Constrain X-axis movement between -1 and +1
      box.current.position.x = Math.max(
        -1,
        Math.min(1, box.current.position.x)
      );

      // Constrain Y-axis based on X position (valley effect)
      const currentX = box.current.position.x;
      if (currentX >= -0.09 && currentX <= -0.03) {
        // Center range: limit Y to 3.5
        box.current.position.y = Math.min(3.32, box.current.position.y);
      } else {
        // Outer ranges: limit Y to 3.2
        box.current.position.y = Math.min(3.2, box.current.position.y);
      }

      // Update last mouse position
      setLastMousePos(currentMouse);
    }

    // Rope curve from bottom to box
    const bottom = curve.points[0];
    const mid1 = curve.points[1];
    const mid2 = curve.points[2];
    const boxPos = box.current.position;

    mid1.lerpVectors(bottom, boxPos, 0.33);
    mid2.lerpVectors(bottom, boxPos, 0.66);
    mid1.y -= 0.2;
    mid2.y -= 0.2;
    curve.points[3].copy(boxPos);

    // Create cylindrical cable geometry
    const cableGeometry = new THREE.TubeGeometry(curve, 50, 0.02, 8, false);
    band.current.geometry.dispose();
    band.current.geometry = cableGeometry;
  });

  return (
    <>
      <group position={[0.25, -5.2, 2.35]}>
        {/* Rope */}
        <mesh ref={band} castShadow receiveShadow material={cableMaterial} />

        {/* Draggable Rounded Rectangle with smaller rectangle */}
        <group
          ref={box}
          position={[0, 0, 0]} // start in middle
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onPointerDown={(e) => {
            e.stopPropagation();
            setDragging(true);
            setLastMousePos(new THREE.Vector2(e.pointer.x, e.pointer.y));
          }}
          onPointerUp={() => {
            setDragging(false);
            setLastMousePos(null);
          }}
        >
          {/* Main rounded rectangle */}
          <RoundedBox
            position={[0, 0, 0]}
            args={[0.25, 0.4, 0.1]} // width, height, depth
            radius={0.015} // rounded corners
            smoothness={8} // smoothness of rounded corners
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={hovered && !isLocked ? "#ff6b6b" : "white"}
              metalness={0.1}
              roughness={0.3}
            />
          </RoundedBox>
          <RoundedBox
            position={[0, -0.22, 0]}
            args={[0.1, 0.05, 0.08]} // width, height, depth
            radius={0.01} // rounded corners
            smoothness={8} // smoothness of rounded corners
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={hovered && !isLocked ? "#ff6b6b" : "white"}
              metalness={0.1}
              roughness={0.3}
            />
          </RoundedBox>

          {/* Smaller rectangle at the end */}
          <RoundedBox
            position={[0, 0.245, 0.005]} // positioned at the top end
            args={[0.17, 0.1, 0.01]} // smaller dimensions
            radius={0.01} // smaller rounded corners
            smoothness={6}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={hovered && !isLocked ? "#ff6b6b" : "#f0f0f0"}
              metalness={0.1}
              roughness={0.3}
            />
          </RoundedBox>
        </group>
      </group>
    </>
  );
}

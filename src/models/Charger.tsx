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
  const isFirstDragFrame = useRef(true);

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
      isFirstDragFrame.current = true; // Reset for next drag
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
      // Clamp pointer coordinates to valid range (-1 to 1) to prevent jumps
      const clampedPointerX = Math.max(-1, Math.min(1, state.pointer.x));
      const clampedPointerY = Math.max(-1, Math.min(1, state.pointer.y));

      // Calculate mouse movement delta
      const currentMouse = new THREE.Vector2(clampedPointerX, clampedPointerY);
      let delta = new THREE.Vector2().subVectors(currentMouse, lastMousePos);

      // Skip first frame to prevent initial jump (pointer might have moved between event and frame)
      if (isFirstDragFrame.current) {
        isFirstDragFrame.current = false;
        // Reset delta to zero on first frame to prevent jump
        delta.set(0, 0);
        // Update lastMousePos to current position for next frame
        setLastMousePos(currentMouse);
        return;
      }

      // Clamp delta to prevent extreme jumps (max 0.1 per frame)
      const maxDelta = 0.1;
      const deltaMagnitude = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
      if (deltaMagnitude > maxDelta) {
        delta.normalize().multiplyScalar(maxDelta);
      }

      // Calculate distance between cursor and charger head
      const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

      // Adaptive speed based on distance - higher speed for larger distances
      // Cap the adaptive speed to prevent extreme movements
      const baseSpeed = 5;
      const maxSpeed = 15; // Maximum speed cap
      const adaptiveSpeed = Math.min(maxSpeed, baseSpeed + distance * 10);

      // Convert screen delta to world delta with adaptive speed
      // Different multipliers for X and Y axes to account for camera perspective
      const worldDelta = new THREE.Vector3(
        delta.x * adaptiveSpeed * 1.5, // Higher multiplier for X-axis (left/right)
        delta.y * adaptiveSpeed,
        0
      );

      // Clamp world delta to prevent extreme movements
      const maxWorldDelta = 0.5; // Maximum world movement per frame
      const worldDeltaMagnitude = worldDelta.length();
      if (worldDeltaMagnitude > maxWorldDelta) {
        worldDelta.normalize().multiplyScalar(maxWorldDelta);
      }

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
      <group>
        {/* Rope */}
        <mesh ref={band} castShadow receiveShadow material={cableMaterial} />

        {/* Draggable Rounded Rectangle with smaller rectangle */}
        {/* DRAGGABLE REALISTIC LIGHTNING CONNECTOR */}
        <group
          ref={box}
          position={[0, 0, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onPointerDown={(e) => {
            e.stopPropagation();
            const clampedX = Math.max(-1, Math.min(1, e.pointer.x));
            const clampedY = Math.max(-1, Math.min(1, e.pointer.y));
            setDragging(true);
            setLastMousePos(new THREE.Vector2(clampedX, clampedY));
          }}
          onPointerUp={() => {
            setDragging(false);
            setLastMousePos(null);
            isFirstDragFrame.current = true;
          }}
        >
          {/* === WHITE PLASTIC BODY (same approximate size as before) === */}
          <RoundedBox
            args={[0.26, 0.42, 0.12]} // a bit thicker and more realistic
            radius={0.05}
            smoothness={16}
            castShadow
            receiveShadow
            position={[0, 0, 0]}
          >
            <meshStandardMaterial
              color={hovered && !isLocked ? "#ff6b6b" : "#ffffff"}
              metalness={0.05}
              roughness={0.4}
            />
          </RoundedBox>

          {/* === CHAMFER / TRANSITION PART === */}
          <RoundedBox
            args={[0.15, 0.12, 0.11]}
            radius={0.03}
            smoothness={14}
            position={[0, -0.23, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={hovered && !isLocked ? "#ff6b6b" : "#fafafa"}
              metalness={0.05}
              roughness={0.4}
            />
          </RoundedBox>

          {/* === LIGHTNING METAL TIP === */}
          <RoundedBox
            args={[0.17, 0.11, 0.04]} // metallic tip thickness
            radius={0.008}
            smoothness={12}
            position={[0, 0.28, 0.015]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#d0d0d0"
              metalness={0.6}
              roughness={0.15}
            />
          </RoundedBox>

          {/* === LIGHTNING BLACK INSERTS (fake holes) === */}
          <RoundedBox
            args={[0.11, 0.04, 0.005]}
            radius={0.003}
            smoothness={8}
            position={[0, 0.28, 0.04]}
          >
            <meshStandardMaterial
              color="#444" // dark insert
              metalness={0.2}
              roughness={0.5}
            />
          </RoundedBox>

          <RoundedBox
            args={[0.11, 0.04, 0.005]}
            radius={0.003}
            smoothness={8}
            position={[0, 0.28, -0.01]}
          >
            <meshStandardMaterial
              color="#444"
              metalness={0.2}
              roughness={0.5}
            />
          </RoundedBox>
        </group>
      </group>
    </>
  );
}

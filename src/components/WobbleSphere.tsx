import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import wobbleVertexShader from "/shaders/wobble/vertex.glsl?raw";
import wobbleFragmentShader from "/shaders/wobble/fragment.glsl?raw";

import * as THREE from "three";

interface WobbleSphereProps {
  // Geometry parameters
  radius?: number;
  detail?: number;

  // Material parameters
  metalness?: number;
  roughness?: number;
  transmission?: number;
  ior?: number;
  thickness?: number;
  color?: string;

  // Shader uniforms
  positionFrequency?: number;
  timeFrequency?: number;
  strength?: number;
  warpPositionFrequency?: number;
  warpTimeFrequency?: number;
  warpStrength?: number;
  colorA?: string;
  colorB?: string;

  // Transform
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];

  // Shadow settings
  castShadow?: boolean;
  receiveShadow?: boolean;
}

const WobbleSphere = ({
  // Geometry defaults
  radius = 2.5,
  detail = 50,

  // Material defaults
  metalness = 0,
  roughness = 0.5,
  transmission = 0,
  ior = 1.5,
  thickness = 1.5,
  color = "#ffffff",

  // Shader defaults
  positionFrequency = 0.5,
  timeFrequency = 0.4,
  strength = 0.3,
  warpPositionFrequency = 0.38,
  warpTimeFrequency = 0.12,
  warpStrength = 1.7,
  colorA = "#0000ff",
  colorB = "#ff0000",

  // Transform defaults
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],

  // Shadow defaults
  castShadow = true,
  receiveShadow = true,
}: WobbleSphereProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  console.log("WobbleSphere rendering with:", { radius, position, color });

  // Create uniforms
  const uniforms = useMemo(
    () => ({
      uTime: new THREE.Uniform(0),
      uPositionFrequency: new THREE.Uniform(positionFrequency),
      uTimeFrequency: new THREE.Uniform(timeFrequency),
      uStrength: new THREE.Uniform(strength),
      uWarpPositionFrequency: new THREE.Uniform(warpPositionFrequency),
      uWarpTimeFrequency: new THREE.Uniform(warpTimeFrequency),
      uWarpStrength: new THREE.Uniform(warpStrength),
      uColorA: new THREE.Uniform(new THREE.Color(colorA)),
      uColorB: new THREE.Uniform(new THREE.Color(colorB)),
    }),
    [
      positionFrequency,
      timeFrequency,
      strength,
      warpPositionFrequency,
      warpTimeFrequency,
      warpStrength,
      colorA,
      colorB,
    ]
  );

  // Create material with error handling
  const material = useMemo(() => {
    try {
      console.log("Creating CustomShaderMaterial...");
      const mat = new CustomShaderMaterial({
        // CSM
        baseMaterial: THREE.MeshPhysicalMaterial,
        vertexShader: wobbleVertexShader,
        fragmentShader: wobbleFragmentShader,
        uniforms: uniforms,

        // MeshPhysicalMaterial
        metalness,
        roughness,
        color,
        transmission,
        ior,
        thickness,
        transparent: true,
        wireframe: false,
      });
      console.log("CustomShaderMaterial created successfully");
      return mat;
    } catch (error) {
      console.error("CustomShaderMaterial failed:", error);
      console.log("Using fallback MeshPhysicalMaterial");
      return new THREE.MeshPhysicalMaterial({
        metalness,
        roughness,
        color,
        transmission,
        ior,
        thickness,
        transparent: true,
        wireframe: false,
      });
    }
  }, [uniforms, metalness, roughness, color, transmission, ior, thickness]);

  // Create depth material with error handling
  const depthMaterial = useMemo(() => {
    try {
      return new CustomShaderMaterial({
        // CSM
        baseMaterial: THREE.MeshDepthMaterial,
        vertexShader: wobbleVertexShader,
        uniforms: uniforms,

        // MeshDepthMaterial
        depthPacking: THREE.RGBADepthPacking,
      });
    } catch (error) {
      console.error("Depth material failed:", error);
      return new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
      });
    }
  }, [uniforms]);

  // Create geometry
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(radius, detail);
    const mergedGeo = mergeVertices(geo);
    mergedGeo.computeTangents();
    return mergedGeo;
  }, [radius, detail]);

  // Update uniforms on each frame
  useFrame(() => {
    if (uniforms.uTime) {
      uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  console.log("Rendering mesh with:", { geometry, material, position });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      customDepthMaterial={depthMaterial}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
};

export default WobbleSphere;

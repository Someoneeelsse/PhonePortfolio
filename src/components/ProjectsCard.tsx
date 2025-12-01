import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import holographicVertexShader from "/shaders/holographic/vertex.glsl?raw";
import holographicFragmentShader from "/shaders/holographic/fragment.glsl?raw";
import outlineVertexShader from "/shaders/holographic/outlineVertex.glsl?raw";
import outlineFragmentShader from "/shaders/holographic/outlineFragment.glsl?raw";
import coneGradientFragmentShader from "/shaders/holographic/coneGradientFragment.glsl?raw";

interface ProjectsCardProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  width?: number;
  height?: number;
  depth?: number;
  visible?: boolean;
}

const projects = [
  {
    id: 1,
    title: "YouTube Analyzer",
    description:
      "A web app where users can enter any YouTube channel and get detailed stats across different time frames. It also runs AI-powered reviews of up to 45 videos per channel, giving summaries and practical insights.",
    video: "/images/LockScreen.jpg",
    link: "https://youtubechannelanalyzer.vercel.app/",
    technologies: ["React", "Node.js", "YouTube API", "Chart.js"],
    features: ["Data Analytics", "API Handling", "AI Analysis"],
  },
  {
    id: 2,
    title: "Digital Graffiti",
    description:
      "A small side project — an online gallery where anyone can make one drawing on a shared canvas. Once saved, the drawing stays there permanently with the label the creator chose.",
    video: "/images/LockScreen.jpg",
    link: "https://digitalgraffiti.vercel.app/",
    technologies: ["React", "Node.js", "YouTube API", "Chart.js"],
    features: [
      "Web development",
      "Databse using Supabase",
      "Custom Drawing Logic",
    ],
  },

  {
    id: 3,
    title: "Design Hub",
    description:
      "A site designed to highlight a fresh, uniquely styled website every month. It’s built to give anonymous artists and designers a platform to share their work.",
    video: "/images/LockScreen.jpg",
    link: "https://github.com/Someoneeelsse/Parralax",
    technologies: ["React", "Node.js", "YouTube API", "Chart.js"],
    features: ["3D Showcase", "Blender Models"],
  },
  {
    id: 4,
    title: "Parallax",
    description:
      "A fun project where AI writes articles as if they came from a parallel universe. Each new piece is stored in memory, so the AI builds on past events before writing the next one.",
    video: "/images/LockScreen.jpg",
    link: "https://github.com/Someoneeelsse/Parralax",
    technologies: ["React", "Node.js", "YouTube API", "Chart.js"],
    features: [
      "Web development",
      "Databse using Supabase",
      "Custom Drawing Logic",
    ],
  },
  {
    id: 5,
    title: "Auto SRE",
    description:
      "A DevOps-focused site that automatically redeploys whenever a new commit is pushed to the repository, keeping everything up to date without manual steps.",
    video: "/images/LockScreen.jpg",
    link: "https://github.com/Someoneeelsse/Parralax",
    technologies: ["React", "Node.js", "YouTube API", "Chart.js"],
    features: ["GitHub Actions & CI/CD", "Docker", "Kubernetes", "Grafana"],
  },
];

export default function ProjectsCard({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color = "#70c1ff",
  width = 2,
  height = 3,
  depth = 0.1,
  visible = true,
}: ProjectsCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const imageRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();
  const [currentProject, setCurrentProject] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [ringAngle, setRingAngle] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);
  const cardGroupRef = useRef<THREE.Group>(null);
  const infoBoxRef = useRef<HTMLDivElement>(null);
  // Adjustable snap aggressiveness (degrees). Lower = less eager snapping. Set to 0 to effectively disable.
  const SNAP_THRESHOLD_DEGREES = 2;

  // Create image texture - LAZY LOAD: Only load when visible
  const imageTexture = useMemo(() => {
    if (!projects[currentProject].video) return null;

    // Don't load image until visible to save bandwidth and performance
    if (!visible) {
      return null;
    }

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      projects[currentProject].video,
      () => {
        // Image loaded successfully
        setIsImageReady(true);
      },
      undefined,
      (error) => {
        console.warn("Image load error:", error);
        setIsImageReady(false);
      }
    );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    return texture;
  }, [currentProject, visible]);

  // Create holographic material for the card
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: holographicVertexShader,
      fragmentShader: holographicFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color("#ffffff")),
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [color]);

  // Create holographic outline material for the image
  // Use a placeholder texture if image not loaded yet
  const imageMaterial = useMemo(() => {
    // Create placeholder texture for when image is not loaded
    const placeholderTexture = imageTexture || new THREE.Texture();

    return new THREE.ShaderMaterial({
      vertexShader: outlineVertexShader,
      fragmentShader: outlineFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color("#70c1ff")),
        uTexture: new THREE.Uniform(placeholderTexture),
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [imageTexture]);

  // Update image material uniform when image texture loads
  useEffect(() => {
    if (imageMaterial && imageTexture) {
      imageMaterial.uniforms.uTexture.value = imageTexture;
      imageMaterial.needsUpdate = true;
    }
  }, [imageTexture, imageMaterial]);

  // Create holographic material for the cone with gradient opacity
  const coneMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: holographicVertexShader,
      fragmentShader: coneGradientFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color("#22d3ee")),
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Create holographic material for the ring
  const ringMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: holographicVertexShader,
      fragmentShader: holographicFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color("#ff6b9d")),
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Consolidated useFrame - Update all uniforms and video texture in one loop
  // Throttled updates for better performance
  const lastUpdateTimeRef = useRef<number>(0);
  const UPDATE_INTERVAL = 16; // ~60fps (update every 16ms)

  useFrame((state) => {
    if (!visible) return; // Skip updates when not visible

    // Throttle updates to reduce CPU/GPU load
    const currentTime = state.clock.elapsedTime * 1000; // Convert to milliseconds
    if (currentTime - lastUpdateTimeRef.current < UPDATE_INTERVAL) {
      return;
    }
    lastUpdateTimeRef.current = currentTime;

    const time = clock.getElapsedTime();

    // Update all material uniforms
    if (material && meshRef.current) {
      material.uniforms.uTime.value = time;
    }
    if (imageMaterial && imageRef.current) {
      imageMaterial.uniforms.uTime.value = time;
    }
    if (coneMaterial && coneRef.current) {
      coneMaterial.uniforms.uTime.value = time;
      coneRef.current.rotation.y = time * 0.2;
    }
    if (ringMaterial && ringRef.current) {
      ringMaterial.uniforms.uTime.value = time;
    }
  });

  // Check which project container the dot is closest to
  const checkProjectSelection = (currentRingAngle: number) => {
    const projectAngle = (2 * Math.PI) / projects.length;

    // Normalize the ring angle to be between 0 and 2π
    let normalizedAngle = currentRingAngle;
    while (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
    while (normalizedAngle >= 2 * Math.PI) normalizedAngle -= 2 * Math.PI;

    // Find which project container is closest to the blue dot (at 0°)
    let closestProject = 0;
    let minDistance = Infinity;

    for (let i = 0; i < projects.length; i++) {
      // Calculate where this container is after rotation
      const containerAngle =
        (i * projectAngle + normalizedAngle) % (2 * Math.PI);
      const distance = Math.abs(containerAngle); // Distance from 0° (blue dot position)
      const normalizedDistance = Math.min(distance, 2 * Math.PI - distance);

      if (normalizedDistance < minDistance) {
        minDistance = normalizedDistance;
        closestProject = i;
      }
    }

    // Only update if we're close enough to a container
    const snapThreshold = (SNAP_THRESHOLD_DEGREES * Math.PI) / 180;
    if (minDistance < snapThreshold) {
      if (closestProject !== currentProject) {
        setCurrentProject(closestProject);
      }
    } else {
    }
  };

  // Handle dot drag events
  const handleDotPointerDown = (event: any) => {
    event.stopPropagation();

    setIsDragging(true);
    setLastMouseX(event.point.x);
  };

  // Handle ring rotation with Three.js events
  const handleDotPointerMove = (event: any) => {
    if (!isDragging) return;

    const currentMouseX = event.point.x;
    const deltaX = currentMouseX - lastMouseX; // Use actual mouse movement
    const sensitivity = 0.5; // Sensitivity for ring rotation
    const newAngle = ringAngle + deltaX * sensitivity;

    setRingAngle(newAngle);
    setLastMouseX(currentMouseX); // Update last mouse position

    // Check which project container the dot is closest to
    checkProjectSelection(-newAngle);

    // Temporarily disable snapping to see movement
    // const snapThreshold = 1.05; // Very small threshold - only snap when very close
    // const projectAngle = (2 * Math.PI) / projects.length;

    // for (let i = 0; i < projects.length; i++) {
    //   const targetAngle = i * projectAngle;
    //   const angleDiff = Math.abs(newAngle - targetAngle);
    //   const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);

    //   console.log(
    //     `Project ${i}: target=${targetAngle.toFixed(
    //       2
    //     )}, current=${newAngle.toFixed(2)}, diff=${normalizedDiff.toFixed(2)}`
    //   );

    //   if (normalizedDiff < snapThreshold) {
    //     console.log("Snapping to project:", i);
    //     setCurrentProject(i);
    //     setDotAngle(targetAngle);
    //     break;
    //   }
    // }
  };

  const handleDotPointerUp = () => {
    setIsDragging(false);
    // Final check when dragging stops
    checkProjectSelection(-ringAngle);
  };

  const handleDotPointerEnter = () => {
    setIsHovering(true);
  };

  const handleDotPointerLeave = () => {
    setIsHovering(false);
  };

  // Initialize ring angle based on current project
  useEffect(() => {
    const projectAngle = (2 * Math.PI) / projects.length;
    // Previously: setRingAngle(-currentProject * projectAngle);
    setRingAngle(currentProject * projectAngle);
  }, [currentProject, projects.length]);

  // Animation sequence when component becomes visible
  useEffect(() => {
    if (!visible) {
      // Reset states when not visible
      if (cardGroupRef.current) {
        cardGroupRef.current.scale.set(0, 0, 0);
      }
      if (infoBoxRef.current) {
        gsap.set(infoBoxRef.current, {
          opacity: 0,
          y: 20,
        });
      }
      return;
    }

    // Animate card appearance first (starts after 0.1s, takes 0.8s)
    if (cardGroupRef.current) {
      cardGroupRef.current.scale.set(0, 0, 0);

      gsap.to(cardGroupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.1,
      });
    }

    // Animate HTML info container 0.5s after card starts (0.1s + 0.5s = 0.6s total delay)
    if (infoBoxRef.current) {
      gsap.set(infoBoxRef.current, {
        opacity: 0,
        y: 20,
      });

      gsap.to(infoBoxRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.6, // 0.5s after card animation starts (0.1s card delay + 0.5s)
      });
    }
  }, [visible]);

  // Test: Make dot rotate automatically for debugging (disabled for now)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!isDragging) {
  //       setDotAngle((prev) => prev + 0.01);
  //     }
  //   }, 50);

  //   return () => clearInterval(interval);
  // }, [isDragging]);

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      visible={visible}
    >
      {/* Holographic Card Mesh */}
      <group ref={cardGroupRef} position={[0, 0.6, 0]}>
        <mesh ref={meshRef} material={material}>
          <boxGeometry args={[width, height, depth]} />
        </mesh>

        {/* Holographic Outline Image on the card - only show when image is ready */}
        {projects[currentProject].video && isImageReady && (
          <mesh ref={imageRef} position={[0, 0, depth / 2 + 0.01]}>
            <planeGeometry args={[width * 0.95, height * 0.95]} />
            <primitive object={imageMaterial} />
          </mesh>
        )}

        {/* Holographic Title Above Card */}
        <Text
          position={[0, height / 2 + 0.5, 0]}
          fontSize={0.3}
          color="#70c1ff"
          anchorX="center"
          anchorY="middle"
        >
          {projects[currentProject].title}
        </Text>
      </group>

      {/* Holographic Cone */}
      <mesh
        ref={coneRef}
        position={[0, -1, 0]}
        rotation={[Math.PI, 0, 0]}
        material={coneMaterial}
      >
        <coneGeometry args={[4, 7, 32]} />
      </mesh>

      {/* Interactive Ring for Project Selection */}
      <mesh
        ref={ringRef}
        position={[0, -height / 2 + 0.5, depth / 2 + 0.01]}
        rotation={[Math.PI / 2, 0, ringAngle]}
        material={ringMaterial}
        onPointerDown={handleDotPointerDown}
        onPointerMove={handleDotPointerMove}
        onPointerUp={handleDotPointerUp}
      >
        <torusGeometry args={[width * 0.6, 0.1, 16, 32]} />
      </mesh>

      {/* Invisible Inner Circle for Easy Dragging */}
      <mesh
        position={[0, -height / 2 + 0.5, depth / 2 + 0.01]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerDown={handleDotPointerDown}
        onPointerMove={handleDotPointerMove}
        onPointerUp={handleDotPointerUp}
      >
        <circleGeometry args={[width * 0.6, 32]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Project Container Spheres */}
      <group
        position={[0, -height / 2 + 0.5, depth / 2 + 0.01]}
        rotation={[0, ringAngle, 0]}
      >
        {projects.map((_, index) => {
          const angle = (index / projects.length) * Math.PI * 2;
          const x = Math.cos(angle) * (width * 0.6);
          const z = Math.sin(angle) * (width * 0.6);
          const isActive = index === currentProject;

          return (
            <mesh key={`container-${index}`} position={[x, 0, z]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial
                color={isActive ? "#ff6b9d" : "#ffffff"}
                transparent
                opacity={isActive ? 0.9 : 0.7}
              />
            </mesh>
          );
        })}
      </group>
      {visible && (
        <group
          rotation={[
            THREE.MathUtils.degToRad(45),
            THREE.MathUtils.degToRad(-30),
            THREE.MathUtils.degToRad(15),
          ]}
        >
          <Html
            position={[0.6, -height / 2 - 1, depth / 2 + 0.01]}
            center
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                width: "600px",
                height: "600px",
                transform: `
      rotateX(65deg)
      rotateY(180deg)
      rotateZ(330deg)
      rotate(180deg)
    `,
                transformStyle: "preserve-3d",
              }}
            >
              <svg
                width="550px"
                height="550px"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Circular Arc 70% line, 30% gap */}
                <circle
                  cx="200"
                  cy="200"
                  r="84"
                  stroke="white"
                  strokeWidth="16"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="370 158" // 70% visible, 30% gap
                  transform="rotate(-45 200 200)" // rotate so the gap is positioned nicely
                />

                {/* Arrowhead at the end */}
                <path
                  d="M 264 128 L 256 148 M 264 128 L 282 142"
                  stroke="white"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Html>
        </group>
      )}
      {/* Fixed Blue Dot */}
      <mesh
        position={[
          Math.cos(0) * (width * 0.6),
          -height / 2 + 0.5,
          depth / 2 + Math.sin(0) * (width * 0.6),
        ]}
        rotation={[Math.PI / 2, Math.PI / 2, 0]}
        onPointerDown={handleDotPointerDown}
        onPointerMove={handleDotPointerMove}
        onPointerUp={handleDotPointerUp}
        onPointerEnter={handleDotPointerEnter}
        onPointerLeave={handleDotPointerLeave}
        scale={isHovering ? [1.3, 1.3, 1.3] : [1, 1, 1]}
      >
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} />
      </mesh>

      {/* Information Box - only show when visible */}
      {visible && (
        <Html position={[width + 10.5, -1, 0]} center>
          <div
            ref={infoBoxRef}
            className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-cyan-400/40 rounded-xl p-8 w-96 text-white shadow-2xl"
            style={{
              boxShadow:
                "0 0 30px rgba(34, 211, 238, 0.4), inset 0 0 30px rgba(34, 211, 238, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h3
              className="text-2xl font-bold text-cyan-400 mb-4"
              style={{ textShadow: "0 0 15px #22d3ee" }}
            >
              {projects[currentProject].title}
            </h3>

            {projects[currentProject].description && (
              <p className="text-base text-slate-200 mb-6 leading-relaxed">
                {projects[currentProject].description}
              </p>
            )}

            {projects[currentProject].technologies && (
              <div className="mb-6">
                <h4 className="text-base font-semibold text-cyan-300 mb-3">
                  Technologies:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {projects[currentProject].technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 text-sm rounded-lg border border-cyan-400/40 hover:bg-cyan-500/30 transition-colors"
                      style={{ textShadow: "0 0 8px #22d3ee" }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {projects[currentProject].features && (
              <div className="mb-6">
                <h4 className="text-base font-semibold text-cyan-300 mb-3">
                  Features:
                </h4>
                <ul className="text-sm text-slate-300 space-y-2">
                  {projects[currentProject].features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-cyan-400 mr-3 mt-1">✦</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {projects[currentProject].link && (
              <a
                href={projects[currentProject].link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 text-base font-medium rounded-lg border border-cyan-400/50 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 hover:scale-105"
                style={{ textShadow: "0 0 10px #22d3ee" }}
              >
                View Project →
              </a>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

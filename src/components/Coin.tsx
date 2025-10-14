// app/page.tsx
"use client";

import { a, useSpring } from "@react-spring/three";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { easeQuadIn, easeQuadOut } from "d3-ease";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";

import { useFlip } from "@/contexts/FlipContext";
import * as THREE from "three";

// ==========================================================
// The 3D Coin Component
// ==========================================================
function Coin() {

    const { addFlip } = useFlip();
    const meshRef = useRef<THREE.Group>(null!);
    const [isFlipping, setIsFlipping] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Load textures for the coin faces
    const [
        headsTexture,
        headsNormal,
        headsAO,
        headsDisplacement,
        tailsTexture,
        tailsNormal,
        tailsAO,
        tailsDisplacement,
        edgeNormal,
    ] = useLoader(THREE.TextureLoader, [
        "/img/heads/heads.png",
        "/img/heads/heads_normal.png",
        "/img/heads/heads_ambient.png", // Your new AO map
        "/img/heads/heads_displacement.png", // Your new Displacement map
        "/img/tails/tails.png",
        "/img/tails/tails_normal.png",
        "/img/tails/tails_ambient.png", // Your new AO map
        "/img/tails/tails_displacement.png", // Your new Displacement map
        "/img/edge/edge_displacement.png",
    ]);

    if (!headsTexture || !tailsTexture || !headsNormal || !tailsNormal || !edgeNormal) {
        return <div>
            <p>No textures found.</p>
        </div>
    }

    useMemo(() => {
        // This tells the texture to tile instead of stretch
        edgeNormal.wrapS = THREE.RepeatWrapping;
        // This sets how many times it tiles around the coin's circumference
        edgeNormal.repeat.x = 30; // Tweak this number for finer/coarser ribs
        edgeNormal.needsUpdate = true;
    }, [edgeNormal]);

    const createModifiedTexture = (
        texture: THREE.Texture,
        zoom: number,
        isDataTexture: boolean = false,
    ): THREE.Texture => {
        const cloned = texture.clone();
        cloned.repeat.set(zoom, zoom);
        const offset = (zoom - 1) / 2;
        cloned.offset.set(-offset, -offset);

        if (isDataTexture) {
            cloned.colorSpace = THREE.NoColorSpace; // Critical for data textures
        }

        cloned.needsUpdate = true;
        return cloned;
    };

    // NEW: Animate both position and rotation
    const props = useSpring({
        from: {
            position: [0, 0.3, 0] as [number, number, number],
            rotation: [0, 90, 0] as [number, number, number],
        },
        to: async (next) => {
            if (isFlipping) {
                // --- Logic for determining outcome ---
                const outcome = Math.random() < 0.5;
                const result = outcome ? "Tails" : "Heads";

                const spins = 2;
                const baseRotation = spins * Math.PI * 2;
                const outcomeRotation = outcome ? Math.PI : 0;
                const endRotation = baseRotation + outcomeRotation;

                // --- NEW: Multi-stage animation ---
                // 1. Move the coin up in the air while spinning
                await next({
                    position: [0, 0.15, 0],
                    rotation: [0, 90, 0],
                    immediate: true, // This is the key! It makes the change instant.
                });

                await next({
                    position: [0, 4, 0],
                    // Animate to a point *before* the final rotation
                    rotation: [endRotation * 0.5, 90, 0],
                    config: { duration: 350, easing: easeQuadOut },
                });

                // 2. Let the coin fall back down while completing the spin
                await next({
                    position: [0, 0.15, 0], // Slightly above the ground
                    // Animate to the final, precise rotation
                    rotation: [endRotation, 90, 0],
                    config: { duration: 500, easing: easeQuadIn },
                });

                // --- NEW: Log the result to the console after animation ---
                addFlip(result === "Heads" ? "H" : "T")

                // --- Reset state ---
                setIsFlipping(false);

            } else if (isHovered && !isFlipping) {

                await next({
                    position: [0, 1, 0],
                    config: { duration: 350, easing: easeQuadOut },
                });
            } else if (!isHovered) {
                await next({
                    position: [0, 0.15, 0],
                    config: { duration: 350, easing: easeQuadOut },
                });
            }
        },
        reset: false,
    });

    const handleCoinClick = () => {
        if (!isFlipping) {
            setIsHovered(false);
            setIsFlipping(true);
        }
    };

    const handleCoinHover = () => {
        if (!isFlipping) {
            document.body.style.cursor = "pointer";
            setIsHovered(true);
        }
    }

    const handleCoinUnhover = () => {
        document.body.style.cursor = "auto";
        setIsHovered(false);
    }



    // Materials for the coin faces and edge
    const materials = [
        new THREE.MeshStandardMaterial({
            color: "#D3B856",
            metalness: 0.7,
            roughness: 1,
            normalMap: edgeNormal,
        }), // Side
        new THREE.MeshStandardMaterial({
            map: headsTexture, // <-- Use the modified texture
            metalness: 0.7,
            roughness: 1,
            normalMap: headsNormal,
            aoMap: headsAO,
            displacementMap: headsDisplacement,
            displacementScale: 0.01
            // We can remove alphaTest as the transparent edge is now outside the mesh
        }), // Heads
        new THREE.MeshStandardMaterial({
            map: tailsTexture, // <-- Use the modified texture
            metalness: 0.7,
            roughness: 1,
            normalMap: tailsNormal,
            aoMap: tailsAO,
            displacementMap: tailsDisplacement,
            displacementScale: 0.01,
        }), // Tails
    ];

    return (
        // We go back to the simple, single-cylinder geometry
        <a.group
            ref={meshRef}
            {...props as any}
            onClick={handleCoinClick}
            onPointerOver={handleCoinHover}
            onPointerOut={handleCoinUnhover}
        >
            <mesh
                castShadow
                receiveShadow
                geometry={new THREE.CylinderGeometry(1, 1, 0.2, 64)}
                material={materials}
            />
        </a.group>
    );
}

function CameraManager({ originalHeight, originalWidth }: { originalHeight: number, originalWidth: number }) {
    const { camera, size } = useThree();

    useEffect(() => {
        // size.height is the *actual* height of the canvas (e.g., 640px)
        // originalHeight is the *virtual* height we want the camera to base its perspective on (e.g., 800px)
        if (size.width > 0 && size.height > 0) {
            // setViewOffset(fullW, fullH, offsetX, offsetY, renderW, renderH)
            camera.setViewOffset(
                originalWidth,       // fullWidth: Use the actual canvas width
                originalHeight,   // fullHeight: The VIRTUAL height for aspect calculation
                0,                // x: Start from the left edge
                0,                // y: Start from the top edge
                size.width,       // width: Render the full width of the canvas
                size.height       // height: Render the full (new) height of the canvas
            );
        }

        camera.updateProjectionMatrix();
        // Cleanup function to reset the camera if the component unmounts
        return () => {
            camera.clearViewOffset();
        };
    }, [camera, size, originalHeight]);

    return null;
}

// ==========================================================
// The Main Page Component
// ==========================================================
export default function CoinBox() {
    const { theme } = useTheme();


    const originalCanvasHeight = 900;
    const originalCanvasWidth = 600;

    return (
        <div className="w-[600px] h-[600px] rounded-xl overflow-hidden">
            <div style={{
                width: `100%`,
                height: `100%`
            }}>
                {/* The main 3D scene */}
                <Canvas flat shadows camera={{ position: [1, 20, 12], fov: 20 }} gl={{ antialias: true }}>
                    {/* NEW: Adjusted lighting for a more moderate, focused look */}
                    <CameraManager originalHeight={originalCanvasHeight} originalWidth={originalCanvasWidth} />
                    <ambientLight intensity={4} />
                    <directionalLight
                        position={[5, 30, 1]}
                        intensity={3}
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                    />

                    <Coin />
                    <group rotation={[-Math.PI / 2, 0, 0]}>
                        {/* Plane 1: The visible white background */}
                        {/* This uses MeshBasicMaterial, so it's not affected by light */}
                        <mesh position={[0, 0, 0]}>
                            <planeGeometry args={[60, 60]} />
                            <meshBasicMaterial color={theme === "light" ? "#faf7f5" : "#292524"} />
                        </mesh>

                        {/* Plane 2: The invisible shadow catcher */}
                        {/* This uses ShadowMaterial, which is transparent everywhere */}
                        {/* except for where shadows are cast. */}
                        <mesh receiveShadow position={[0, 0, 0.001]}> {/* Tiny offset to prevent z-fighting */}
                            <planeGeometry args={[40, 40]} />
                            <shadowMaterial transparent opacity={0.4} />
                        </mesh>
                    </group>
                </Canvas>
            </div>
        </div>
    );
}
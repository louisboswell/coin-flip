// app/page.tsx
"use client";

import { useState, useRef, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { useSpring, a } from "@react-spring/three";
import { easeQuadIn, easeQuadOut } from "d3-ease";
import { useTheme } from "next-themes";

import * as THREE from "three";
import { Badge } from "./ui/badge";
import { Card, CardDescription } from "./ui/card";

// ==========================================================
// The 3D Coin Component
// ==========================================================
function Coin() {
    const meshRef = useRef<THREE.Group>(null!);
    const [isFlipping, setIsFlipping] = useState(false);

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
            position: [0, 0.15, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
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

                await next({
                    position: [0, 0.15, 0],
                    rotation: [0, 0, 0],
                    immediate: true, // This is the key! It makes the change instant.
                });

                // --- NEW: Multi-stage animation ---
                // 1. Move the coin up in the air while spinning

                await next({
                    position: [0, 4, 0],
                    // Animate to a point *before* the final rotation
                    rotation: [endRotation * 0.5, 0, 0],
                    config: { duration: 350, easing: easeQuadOut },
                });

                // 2. Let the coin fall back down while completing the spin
                await next({
                    position: [0, 0.15, 0], // Slightly above the ground
                    // Animate to the final, precise rotation
                    rotation: [endRotation, 0, 0],
                    config: { duration: 600, easing: easeQuadIn },
                });

                // --- NEW: Log the result to the console after animation ---
                console.log("The result is:", result);

                // --- Reset state ---
                setIsFlipping(false);
            }
        },
        reset: false,
    });

    const handleCoinClick = () => {
        if (!isFlipping) {
            setIsFlipping(true);
        }
    };

    // Materials for the coin faces and edge
    const materials = [
        new THREE.MeshStandardMaterial({
            color: "#D3B856",
            metalness: 0.8,
            roughness: 0.2,
            normalMap: edgeNormal
        }), // Side
        new THREE.MeshStandardMaterial({
            map: headsTexture, // <-- Use the modified texture
            metalness: 0.7,
            roughness: 0.2,
            transparent: true,
            normalMap: headsNormal,
            aoMap: headsAO,
            displacementMap: headsDisplacement,
            displacementScale: 0.01
            // We can remove alphaTest as the transparent edge is now outside the mesh
        }), // Heads
        new THREE.MeshStandardMaterial({
            map: tailsTexture, // <-- Use the modified texture
            metalness: 0.7,
            roughness: 0.2,
            transparent: true,
            normalMap: tailsNormal,
            aoMap: tailsAO,
            displacementMap: tailsDisplacement,
            displacementScale: 0.01

        }), // Tails
    ];

    return (
        // We go back to the simple, single-cylinder geometry
        <a.group
            ref={meshRef}
            {...props as any}
            onClick={handleCoinClick}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "auto")}
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

// ==========================================================
// The Main Page Component
// ==========================================================
export default function CoinBox() {
    const { theme } = useTheme();

    return (
        <div style={{ width: "500px", height: "800px", background: "#1a1a1a" }}>
            {/* The main 3D scene */}
            <Canvas flat shadows camera={{ position: [0, 11, 7], fov: 40 }} gl={{ antialias: true }}>
                {/* NEW: Adjusted lighting for a more moderate, focused look */}
                <ambientLight intensity={1} />
                <directionalLight
                    position={[5, 10, 7]}
                    intensity={2.5}
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
                        <meshBasicMaterial color={theme === "light" ? "#ffffff" : "#171717"} />
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

            <div className="flex flex-col items-center relative bottom-64">
                <div className="grid grid-cols-2 grid-rows-2 w-full text-center gap-x-2 gap-y-2 px-12">
                    <div className="bg-card border border-1 rounded-xl p-2 flex flex-col">
                        <p className="font-bold text-4xl">20</p>
                        <CardDescription className="font-light">Session Flips</CardDescription>
                    </div>
                    <div className="bg-card border border-1 rounded-xl p-2 flex flex-col">
                        <p className="font-bold text-4xl">2,000</p>
                        <CardDescription className="font-light">Session Record</CardDescription>
                    </div>
                    <div className="bg-card border border-1 rounded-xl p-2 flex flex-col">
                        <p className="font-bold text-4xl">20</p>
                        <CardDescription className="font-light">All Time Flips</CardDescription>
                    </div>
                    <div className="bg-card border border-1 rounded-xl p-2 flex flex-col">
                        <p className="font-bold text-4xl">20</p>
                        <CardDescription className="font-light">All Time Record</CardDescription>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center relative bottom-56">
                <p className="font-semibold">Recent Flips</p>
                <div className="flex flex-row gap-1 mt-2">
                    {Array(5).fill(0).map((_, index) => (
                        <Badge key={index}>Heads</Badge> // `fill(0)` provides actual array elements
                    ))}
                </div>
            </div >

            <div className="flex flex-row justify-between relative -top-256 mx-8 bg-opacity-95">
                <div className="text-start">
                    <p className="font-bold text-4xl">Heads</p>
                    <CardDescription className="font-light">Last Result</CardDescription>
                </div>
                <div className="text-end">
                    <p className="font-bold text-4xl">20</p>
                    <CardDescription className="font-light">Current Streak</CardDescription>
                </div>
            </div>
        </div>
    );
}
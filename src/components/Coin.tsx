// app/page.tsx
"use client";

import { a, useSpring } from "@react-spring/three";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { easeBack, easeBackIn, easeQuadIn, easeQuadOut } from "d3-ease";
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
        "/img/heads/heads_ambient.png",
        "/img/heads/heads_displacement.png",
        "/img/tails/tails.png",
        "/img/tails/tails_normal.png",
        "/img/tails/tails_ambient.png",
        "/img/tails/tails_displacement.png",
        "/img/edge/edge_displacement.png",
    ]);

    if (
        !headsTexture ||
        !tailsTexture ||
        !headsNormal ||
        !tailsNormal ||
        !edgeNormal
    ) {
        return (
            <div>
                <p>No textures found.</p>
            </div>
        );
    }

    useMemo(() => {
        edgeNormal.wrapS = THREE.RepeatWrapping;
        edgeNormal.repeat.x = 30;
        edgeNormal.needsUpdate = true;
    }, [edgeNormal]);

    // 1. We get the imperative `api` from useSpring to control animations manually.
    const [props, api] = useSpring(() => ({
        // The coin's initial and resting state.
        from: {
            position: [0, 0.15, 0] as [number, number, number],
            rotation: [0, 90, 0] as [number, number, number],
        },
    }));

    // 2. This useEffect handles the HOVER and UNHOVER animations.
    useEffect(() => {
        // We only want this to run if the coin is NOT flipping.
        if (!isFlipping) {
            api.start({
                to: {
                    position: isHovered ? [0, 1, 0] : [0, 0.15, 0], // Float up or down
                },
                config: { duration: 350, easing: easeQuadOut },
            });
        }
    }, [isHovered, isFlipping, api]);

    // 3. This useEffect handles the complex FLIP animation.
    useEffect(() => {
        if (isFlipping) {
            api.start({
                // The `to` function is now the clean, multi-stage async logic.
                to: async (next) => {
                    const outcome = Math.random() < 0.5;
                    const result = outcome ? "Tails" : "Heads";
                    const spins = 2;


                    const randomSeed = Math.random();
                    const baseRotation = spins * Math.PI * 2;
                    const outcomeRotation = outcome ? Math.PI : 0;
                    const endRotation = baseRotation + outcomeRotation;

                    // Ensure coin starts from resting position before jumping up
                    await next({
                        position: [0, 0.15, 0],
                        rotation: [0, 90, 0],
                        immediate: true,
                    });

                    // 1. Move up
                    await next({
                        position: [0, 3, 0],
                        rotation: [endRotation * 0.3, 90, 0],
                        config: { duration: 150, easing: easeQuadIn },
                    });

                    await next({
                        position: [0, 4, 0],
                        rotation: [endRotation * 0.8, 90, 0],
                        config: { duration: 300, easing: easeQuadOut },
                    });

                    // 2. Fall down
                    await next({
                        position: [0, 0.15, 0],
                        rotation: [endRotation, 90, 0],
                        config: { duration: 300, easing: easeQuadOut },
                    });

                    addFlip(result === "Heads" ? "H" : "T");
                    setIsFlipping(false); // Reset state after animation is complete
                },
            });
        }
    }, [isFlipping, api, addFlip]);

    const handleCoinClick = () => {
        if (!isFlipping) {
            setIsHovered(false); // Ensure hover state is false before flipping
            setIsFlipping(true);
        }
    };

    const handleCoinHover = () => {
        if (!isFlipping) {
            document.body.style.cursor = "pointer";
            setIsHovered(true);
        }
    };

    const handleCoinUnhover = () => {
        document.body.style.cursor = "auto";
        setIsHovered(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === "Space" && !isFlipping) {
                event.preventDefault();
                handleCoinClick();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isFlipping]);

    const materials = [
        new THREE.MeshStandardMaterial({
            color: "#D3B856",
            metalness: 0.7,
            roughness: 1,
            normalMap: edgeNormal,
        }), // Side
        new THREE.MeshStandardMaterial({
            map: headsTexture,
            metalness: 0.7,
            roughness: 1,
            normalMap: headsNormal,
            aoMap: headsAO,
            displacementMap: headsDisplacement,
            displacementScale: 0.01,
        }), // Heads
        new THREE.MeshStandardMaterial({
            map: tailsTexture,
            metalness: 0.7,
            roughness: 1,
            normalMap: tailsNormal,
            aoMap: tailsAO,
            displacementMap: tailsDisplacement,
            displacementScale: 0.01,
        }), // Tails
    ];

    return (
        <a.group
            ref={meshRef}
            {...(props as any)}
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

// ... the rest of your file (CameraManager, CoinBox) remains the same ...

function CameraManager({
    originalHeight,
    originalWidth,
}: {
    originalHeight: number;
    originalWidth: number;
}) {
    const { camera, size } = useThree();

    useEffect(() => {
        if (size.width > 0 && size.height > 0) {
            camera.setViewOffset(
                originalWidth,
                originalHeight,
                0,
                0,
                size.width,
                size.height,
            );
        }

        camera.updateProjectionMatrix();
        return () => {
            camera.clearViewOffset();
        };
    }, [camera, size, originalHeight, originalWidth]);

    return null;
}

export default function CoinBox() {
    const { theme } = useTheme();

    const originalCanvasHeight = 900;
    const originalCanvasWidth = 600;

    return (
        <div className="h-[550px] w-[600px] overflow-hidden rounded-xl">
            <div
                style={{
                    width: `100%`,
                    height: `100%`,
                }}
            >
                <Canvas flat shadows camera={{ position: [1, 20, 12], fov: 20 }} gl={{ antialias: true }}>
                    <CameraManager
                        originalHeight={originalCanvasHeight}
                        originalWidth={originalCanvasWidth}
                    />
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
                        <mesh position={[0, 0, 0]}>
                            <planeGeometry args={[60, 60]} />
                            <meshBasicMaterial
                                color={theme === "light" ? "#faf7f5" : "#292524"}
                            />
                        </mesh>
                        <mesh receiveShadow position={[0, 0, 0.001]}>
                            <planeGeometry args={[40, 40]} />
                            <shadowMaterial transparent opacity={0.4} />
                        </mesh>
                    </group>
                </Canvas>
            </div>
        </div>
    );
}
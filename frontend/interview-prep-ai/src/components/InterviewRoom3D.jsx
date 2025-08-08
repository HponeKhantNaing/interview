import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

// Interview Room Component
const InterviewRoom = () => {
  const groupRef = useRef();

  // Auto-rotate the entire room
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005; // Slow rotation
    }
  });

  return (
    <group ref={groupRef}>
      {/* Desk */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[3.5, 0.1, 1.8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Desk Legs */}
      <mesh position={[-1.5, 0.3, -0.7]}>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[1.5, 0.3, -0.7]}>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[-1.5, 0.3, 0.7]}>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[1.5, 0.3, 0.7]}>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Interviewer Chair - Office Style */}
      <mesh position={[0, 0.3, -1.2]}>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Chair Backrest */}
      <mesh position={[0, 0.9, -1.6]}>
        <boxGeometry args={[0.8, 1, 0.15]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Chair Arms */}
      <mesh position={[-0.4, 0.6, -1.2]}>
        <boxGeometry args={[0.15, 0.3, 0.8]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      <mesh position={[0.4, 0.6, -1.2]}>
        <boxGeometry args={[0.15, 0.3, 0.8]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Candidate Chair - Office Style */}
      <mesh position={[0, 0.3, 1.2]}>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      {/* Chair Backrest */}
      <mesh position={[0, 0.9, 1.6]}>
        <boxGeometry args={[0.8, 1, 0.15]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      {/* Chair Arms */}
      <mesh position={[-0.4, 0.6, 1.2]}>
        <boxGeometry args={[0.15, 0.3, 0.8]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      <mesh position={[0.4, 0.6, 1.2]}>
        <boxGeometry args={[0.15, 0.3, 0.8]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>

      {/* Computer Monitor - More realistic */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.15]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Monitor Stand */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Monitor Base */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Monitor Screen */}
      <mesh position={[0, 1.3, 0.09]}>
        <boxGeometry args={[1.1, 0.7, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Monitor Bezel */}
      <mesh position={[0, 1.3, 0.075]}>
        <boxGeometry args={[1.15, 0.75, 0.01]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Laptop on Left Side - Interviewer's side */}
      <mesh position={[-0.8, 0.95, -0.3]}>
        <boxGeometry args={[0.6, 0.03, 0.4]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Laptop Screen */}
      <mesh position={[-0.8, 1.25, -0.3]}>
        <boxGeometry args={[0.6, 0.4, 0.03]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Laptop Screen Display */}
      <mesh position={[-0.8, 1.25, -0.27]}>
        <boxGeometry args={[0.55, 0.35, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Laptop Keyboard */}
      <mesh position={[-0.8, 0.965, -0.3]}>
        <boxGeometry args={[0.55, 0.01, 0.35]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Laptop Trackpad */}
      <mesh position={[-0.8, 0.97, -0.25]}>
        <boxGeometry args={[0.3, 0.005, 0.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Laptop Hinge */}
      <mesh position={[-0.8, 1.1, -0.3]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Laptop on Right Side - Candidate's side */}
      <mesh position={[0.8, 0.95, 0.3]}>
        <boxGeometry args={[0.6, 0.03, 0.4]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Laptop Screen */}
      <mesh position={[0.8, 1.25, 0.3]}>
        <boxGeometry args={[0.6, 0.4, 0.03]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Laptop Screen Display */}
      <mesh position={[0.8, 1.25, 0.33]}>
        <boxGeometry args={[0.55, 0.35, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Laptop Keyboard */}
      <mesh position={[0.8, 0.965, 0.3]}>
        <boxGeometry args={[0.55, 0.01, 0.35]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Laptop Trackpad */}
      <mesh position={[0.8, 0.97, 0.35]}>
        <boxGeometry args={[0.3, 0.005, 0.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Laptop Hinge */}
      <mesh position={[0.8, 1.1, 0.3]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Coffee Cup - Front right of desk */}
      <mesh position={[0.6, 0.95, 0.6]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Coffee Cup Handle */}
      <mesh position={[0.68, 0.95, 0.6]}>
        <torusGeometry args={[0.04, 0.02, 8, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Coffee Cup Saucer */}
      <mesh position={[0.6, 0.89, 0.6]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Coffee Cup Shadow */}
      <mesh position={[0.6, 0.88, 0.6]}>
        <cylinderGeometry args={[0.13, 0.13, 0.01]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      {/* Coffee Steam */}
      <mesh position={[0.6, 1.1, 0.6]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.3} />
      </mesh>
      {/* Coffee Steam 2 */}
      <mesh position={[0.58, 1.13, 0.6]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.2} />
      </mesh>

      {/* Phone - Front left of desk */}
      <mesh position={[-0.6, 0.95, 0.6]}>
        <boxGeometry args={[0.08, 0.02, 0.15]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Phone Screen */}
      <mesh position={[-0.6, 0.96, 0.6]}>
        <boxGeometry args={[0.07, 0.01, 0.14]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Phone Camera */}
      <mesh position={[-0.6, 0.96, 0.67]}>
        <cylinderGeometry args={[0.005, 0.005, 0.01]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Phone Home Button */}
      <mesh position={[-0.6, 0.96, 0.53]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Phone Shadow */}
      <mesh position={[-0.6, 0.94, 0.6]}>
        <boxGeometry args={[0.09, 0.01, 0.16]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Mouse - Near monitor */}
      <mesh position={[0.3, 0.95, 0.2]}>
        <boxGeometry args={[0.12, 0.05, 0.08]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Mouse Scroll Wheel */}
      <mesh position={[0.3, 0.98, 0.24]}>
        <cylinderGeometry args={[0.01, 0.01, 0.02]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Mouse Left Button */}
      <mesh position={[0.25, 0.98, 0.2]}>
        <boxGeometry args={[0.04, 0.01, 0.06]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Mouse Right Button */}
      <mesh position={[0.35, 0.98, 0.2]}>
        <boxGeometry args={[0.04, 0.01, 0.06]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Mouse Cable */}
      <mesh position={[0.3, 0.95, 0.25]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Mouse Shadow */}
      <mesh position={[0.3, 0.94, 0.2]}>
        <boxGeometry args={[0.13, 0.01, 0.09]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Plant Pot - Corner of desk */}
      <mesh position={[-1.4, 0.95, 0.6]}>
        <cylinderGeometry args={[0.15, 0.15, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Plant Pot Rim */}
      <mesh position={[-1.4, 1.1, 0.6]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Plant Soil */}
      <mesh position={[-1.4, 1.11, 0.6]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Plant Stem */}
      <mesh position={[-1.4, 1.15, 0.6]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
      {/* Plant Main Leaves */}
      <mesh position={[-1.4, 1.35, 0.6]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      {/* Plant Leaves Detail */}
      <mesh position={[-1.35, 1.4, 0.6]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
      <mesh position={[-1.45, 1.3, 0.6]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      {/* Plant Small Leaves */}
      <mesh position={[-1.38, 1.45, 0.6]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
      {/* Plant Pot Shadow */}
      <mesh position={[-1.4, 0.94, 0.6]}>
        <cylinderGeometry args={[0.16, 0.16, 0.01]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Books - Stacked on right side */}
      <mesh position={[1.3, 0.95, 0.4]}>
        <boxGeometry args={[0.15, 0.2, 0.25]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <mesh position={[1.3, 1.15, 0.4]}>
        <boxGeometry args={[0.15, 0.2, 0.25]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <mesh position={[1.3, 1.35, 0.4]}>
        <boxGeometry args={[0.15, 0.2, 0.25]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>
      {/* Book Spines */}
      <mesh position={[1.375, 0.95, 0.4]}>
        <boxGeometry args={[0.01, 0.2, 0.25]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh position={[1.375, 1.15, 0.4]}>
        <boxGeometry args={[0.01, 0.2, 0.25]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      <mesh position={[1.375, 1.35, 0.4]}>
        <boxGeometry args={[0.01, 0.2, 0.25]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
      {/* Book Pages */}
      <mesh position={[1.225, 0.95, 0.4]}>
        <boxGeometry args={[0.01, 0.2, 0.25]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[1.225, 1.15, 0.4]}>
        <boxGeometry args={[0.01, 0.2, 0.25]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[1.225, 1.35, 0.4]}>
        <boxGeometry args={[0.01, 0.2, 0.25]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Book Titles */}
      <mesh position={[1.37, 1.05, 0.4]}>
        <boxGeometry args={[0.005, 0.1, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[1.37, 1.25, 0.4]}>
        <boxGeometry args={[0.005, 0.1, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[1.37, 1.45, 0.4]}>
        <boxGeometry args={[0.005, 0.1, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Books Shadow */}
      <mesh position={[1.3, 0.94, 0.4]}>
        <boxGeometry args={[0.16, 0.01, 0.26]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Sticky Notes - Near monitor */}
      <mesh position={[0.4, 1, 0.4]}>
        <boxGeometry args={[0.08, 0.08, 0.01]} />
        <meshStandardMaterial color="#f1c40f" />
      </mesh>
      <mesh position={[0.5, 1, 0.4]}>
        <boxGeometry args={[0.08, 0.08, 0.01]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      {/* Sticky Note Shadow */}
      <mesh position={[0.4, 0.995, 0.4]}>
        <boxGeometry args={[0.08, 0.01, 0.08]} />
        <meshStandardMaterial color="#d4ac0d" />
      </mesh>
      <mesh position={[0.5, 0.995, 0.4]}>
        <boxGeometry args={[0.08, 0.01, 0.08]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>

      {/* Paper Stack - Back of desk */}
      <mesh position={[0, 0.9, -0.6]}>
        <boxGeometry args={[0.2, 0.25, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Paper Stack Shadow */}
      <mesh position={[0, 0.895, -0.6]}>
        <boxGeometry args={[0.2, 0.01, 0.15]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Notepad - Interviewer's side */}
      <mesh position={[-0.4, 0.9, -0.4]}>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Notepad Spiral */}
      <mesh position={[-0.4, 0.91, -0.5]}>
        <cylinderGeometry args={[0.01, 0.01, 0.22]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Notepad Lines */}
      <mesh position={[-0.4, 0.91, -0.4]}>
        <boxGeometry args={[0.25, 0.01, 0.15]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Pen - Near notepad */}
      <mesh position={[-0.3, 0.9, -0.3]}>
        <cylinderGeometry args={[0.01, 0.01, 0.08]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Pen Cap */}
      <mesh position={[-0.3, 0.94, -0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 0.01]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Pen Tip */}
      <mesh position={[-0.3, 0.86, -0.3]}>
        <cylinderGeometry args={[0.005, 0.01, 0.01]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Interviewer - Sitting on left chair */}
      {/* Torso */}
      <mesh position={[0, 1.2, -1.2]}>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.8, -1.2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.85, -1.2]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.05, 1.82, -1.05]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.05, 1.82, -1.05]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.05, 1.82, -1.03]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.05, 1.82, -1.03]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 1.78, -1.05]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, 1.75, -1.05]}>
        <boxGeometry args={[0.03, 0.01, 0.01]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.35, 1.2, -1.2]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      <mesh position={[0.35, 1.2, -1.2]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      {/* Hands */}
      <mesh position={[-0.35, 0.9, -1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      <mesh position={[0.35, 0.9, -1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.2, 0.6, -1.2]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      <mesh position={[0.2, 0.6, -1.2]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      {/* Feet */}
      <mesh position={[-0.2, 0.2, -1.2]}>
        <boxGeometry args={[0.15, 0.1, 0.25]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0.2, 0.2, -1.2]}>
        <boxGeometry args={[0.15, 0.1, 0.25]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Candidate - Sitting on right chair */}
      {/* Torso */}
      <mesh position={[0, 1.2, 1.2]}>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.8, 1.2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.85, 1.2]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.05, 1.82, 1.35]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.05, 1.82, 1.35]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.05, 1.82, 1.37]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.05, 1.82, 1.37]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 1.78, 1.35]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, 1.75, 1.35]}>
        <boxGeometry args={[0.03, 0.01, 0.01]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.35, 1.2, 1.2]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      <mesh position={[0.35, 1.2, 1.2]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      {/* Hands */}
      <mesh position={[-0.35, 0.9, 1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      <mesh position={[0.35, 0.9, 1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.2, 0.6, 1.2]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <mesh position={[0.2, 0.6, 1.2]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      {/* Feet */}
      <mesh position={[-0.2, 0.2, 1.2]}>
        <boxGeometry args={[0.15, 0.1, 0.25]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      <mesh position={[0.2, 0.2, 1.2]}>
        <boxGeometry args={[0.15, 0.1, 0.25]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>

      {/* Lighting - Soft and even for better camouflage */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[0, 1, 1]} intensity={0.3} />
    </group>
  );
};

// Main 3D Scene Component
const InterviewRoom3D = () => {
  return (
    <div className="w-full h-[500px] relative">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 65 }}
        style={{ background: '#ffffff' }}
      >
        <InterviewRoom />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default InterviewRoom3D;

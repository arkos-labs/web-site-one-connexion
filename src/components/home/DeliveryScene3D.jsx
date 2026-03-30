import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, ContactShadows, Stars } from '@react-three/drei';

function Moto() {
  const wheelsRef = useRef([]);

  useFrame((state, delta) => {
    wheelsRef.current.forEach((w) => {
      if (w) w.rotation.x += delta * 12; // Moto wheels rotate fast
    });
  });

  const setWheelRef = (v) => {
    if (v && !wheelsRef.current.includes(v)) {
      wheelsRef.current.push(v);
    }
  };

  return (
    <group dispose={null} scale={1.3}>
      {/* Main Body Frame */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.4, 0.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Front Fork */}
      <mesh position={[0.9, 0.6, 0]} rotation={[0, 0, -Math.PI / 8]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.0, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Handlebars */}
      <mesh position={[0.9, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Headlight */}
      <mesh position={[1.05, 0.9, 0]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>

      {/* Seat */}
      <mesh position={[-0.2, 0.95, 0]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.35]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Delivery Cargo Box (Top Case) */}
      <mesh position={[-0.85, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#ed5518" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Reflector stripe on cargo */}
      <mesh position={[-1.16, 1.1, 0]} castShadow>
        <boxGeometry args={[0.02, 0.08, 0.61]} />
        <meshStandardMaterial color="#fed7aa" emissive="#fed7aa" emissiveIntensity={0.5} />
      </mesh>

      {/* Wheels */}
      {/* Front Wheel */}
      <mesh ref={setWheelRef} position={[1.1, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.1, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
        {/* Mag wheel inner */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.21, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
      </mesh>

      {/* Back Wheel */}
      <mesh ref={setWheelRef} position={[-0.8, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.26, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
      </mesh>

      {/* Taillight */}
      <mesh position={[-1.16, 0.8, 0]} castShadow>
        <boxGeometry args={[0.05, 0.1, 0.2]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function FloatingPackage({ position, color, rotation, speed = 2, scale = 1 }) {
  const boxRef = useRef();

  useFrame((state) => {
    if (boxRef.current) {
      boxRef.current.rotation.x += 0.01 * speed;
      boxRef.current.rotation.y += 0.015 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <group position={position} rotation={rotation} scale={scale}>
        <mesh ref={boxRef} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

export default function DeliveryScene3D() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px', cursor: 'grab' }}>
      <Canvas shadows camera={{ position: [6, 3, 6], fov: 45 }}>
        {/* Dark constellation/network background points */}
        <Stars radius={50} depth={50} count={1500} factor={6} saturation={1} fade speed={1} color="#ed5518" />

        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[1024, 1024]} 
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <Environment preset="city" />
        
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
          <group position={[0, -0.5, 0]}>
            <Moto />
            <FloatingPackage position={[-2, 3, 1.5]} color="#f97316" rotation={[0.4, 0.2, 0.5]} speed={1.5} scale={0.7} />
            <FloatingPackage position={[1.5, 3.5, -1.5]} color="#cbd5e1" rotation={[0.2, 0.6, 0.1]} speed={2.5} scale={0.9} />
            <FloatingPackage position={[3, 1.2, 1.5]} color="#ed5518" rotation={[0.1, 0.8, 0.3]} speed={2} scale={0.6} />
            <FloatingPackage position={[-1.5, 1.5, -2.5]} color="#cbd5e1" rotation={[0.5, 0.3, 0.8]} speed={1.8} scale={0.8} />
          </group>
        </Float>

        <ContactShadows position={[0, -1.2, 0]} opacity={0.7} scale={15} blur={1.5} far={4} color="#000000" />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={2.5} 
          maxPolarAngle={Math.PI / 2.1} 
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}

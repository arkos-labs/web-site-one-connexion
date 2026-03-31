import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';

export default function DeliveryScene3D() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', opacity: 0.6 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Stars radius={100} depth={50} count={3000} factor={6} saturation={1} fade speed={1.5} color="#ed5518" />
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} color="#ffffff" />
        <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

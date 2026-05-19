import React, { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Heart, Shield, Sparkles, Brain, Clock, Bell } from 'lucide-react';

function FloatingCapsule({ position, color, rotation }: { position: [number, number, number], color: string, rotation: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y += Math.sin(state.clock.getElapsedTime() + position[0]) * 0.002;
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.z += 0.005;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={mesh}>
        <capsuleGeometry args={[0.2, 0.6, 32, 64]} />
        <meshPhongMaterial color={color} shininess={100} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function FloatingHeart({ position, color, speed = 1, rotation = [0, 0, 0] }: { position: [number, number, number], color: string, speed?: number, rotation?: [number, number, number] }) {
  const mesh = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * speed) * 0.2;
      mesh.current.rotation.y += 0.01 * speed;
    }
  });

  return (
    <group ref={mesh} position={position} rotation={rotation as [number, number, number]}>
      {/* Simple 3D Heart shape using two spheres and a cone/box */}
      <mesh position={[0.2, 0.2, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhongMaterial color={color} />
      </mesh>
      <mesh position={[-0.2, 0.2, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhongMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.42, 0.8, 32]} />
        <meshPhongMaterial color={color} />
      </mesh>
    </group>
  );
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#0058be" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#006c49" />
      <spotLight position={[0, 5, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />

      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <group scale={1.2}>
          {/* Central Medical Cross Symbol 3D */}
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[2, 0.6, 0.6]} />
            <meshStandardMaterial color="#0058be" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[2, 0.6, 0.6]} />
            <meshStandardMaterial color="#0058be" roughness={0.3} metalness={0.8} />
          </mesh>
          
          {/* Inner details to make it look like tech/medical device */}
          <mesh position={[0, 0, 0.35]}>
            <boxGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
          </mesh>
        </group>
      </Float>

      <Suspense fallback={null}>
        <FloatingHeart position={[-2.5, 1.5, -1]} color="#ff4d4d" speed={1.2} />
        <FloatingHeart position={[2.5, -1.8, 0]} color="#ff4d4d" speed={0.8} rotation={[0.2, 0.5, 0]} />
        
        {/* Floating Pills/Capsules around the cross */}
        <FloatingCapsule position={[-3, -1, 1]} color="#006c49" rotation={[Math.PI / 4, Math.PI / 4, 0]} />
        <FloatingCapsule position={[3, 1.2, -1]} color="#924700" rotation={[-Math.PI / 4, 0, Math.PI / 6]} />
      </Suspense>

      <ContactShadows
        position={[0, -3, 0]}
        opacity={0.4}
        scale={15}
        blur={2}
        far={4.5}
      />
    </>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[6, 4, 6]} intensity={1.1} color="#0058be" />
      <pointLight position={[-6, -4, -6]} intensity={0.8} color="#006c49" />
      <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.2}>
        <Sphere args={[1.8, 64, 64]} position={[0, 0, -3]}>
          <MeshDistortMaterial color="#0058be" distort={0.35} speed={1.5} transparent opacity={0.25} />
        </Sphere>
      </Float>
    </>
  );
}

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
    viewport={{ once: true }}
    className="p-8 rounded-xl glass-dark border border-white/20 hover:border-primary/30 transition-all group"
  >
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-semibold mb-3 text-on-surface">{title}</h3>
    <p className="text-on-surface-variant leading-relaxed">{description}</p>
  </motion.div>
);

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#f8f9ff]">
      {/* 3D Background */}
      <div className="fixed inset-0 -z-10 h-screen w-full">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="DWAYA Logo" className="w-10 h-10 rounded-lg shadow-sm" />
            <span className="text-2xl font-bold text-primary tracking-tight">DWAYA</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-full font-medium text-on-surface hover:bg-white/10 transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-6 py-2 rounded-full font-medium bg-primary text-white hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles size={16} />
              <span>Smart Health Companion</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold text-on-surface leading-[1.1] mb-8">
              Your Health, <br />
              <span className="text-gradient">Simplified.</span>
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed mb-10 max-w-lg">
              The intelligent medication management system designed for ease of use, 
              clarity, and your ultimate peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/signup')}
                className="px-10 py-4 rounded-full bg-primary text-white text-lg font-semibold hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2"
              >
                Start for free <ArrowRight size={20} />
              </button>
              <button className="px-10 py-4 rounded-full glass-dark text-on-surface text-lg font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                Learn more
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative h-[600px] flex items-center justify-center"
          >
            {/* 3D Animated Pic / Scene */}
            <div className="w-full h-full relative">
              <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <Suspense fallback={null}>
                  <HeroScene />
                </Suspense>
              </Canvas>
              
              {/* Floating UI overlays for that "tech" feel */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-0 glass p-4 rounded-2xl shadow-xl border border-white/40 z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Next Dose</p>
                    <p className="text-sm font-bold text-on-surface">12:30 PM - Paracetamol</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-0 glass p-4 rounded-2xl shadow-xl border border-white/40 z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center text-secondary">
                    <Heart size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Health Status</p>
                    <p className="text-sm font-bold text-on-surface">Stable & Improved</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative Floating Blobs for Depth */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/30 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-secondary/30 rounded-full blur-[100px] animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Users Worldwide', value: '10k+' },
            { label: 'Doses Tracked', value: '1M+' },
            { label: 'Success Rate', value: '99.9%' },
            { label: 'App Rating', value: '4.9/5' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-on-surface-variant font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6">Designed for Your Life</h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Everything you need to manage your health journey in one beautiful, 
              intuitive interface.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Clock}
              title="Smart Reminders"
              description="Never miss a dose with intelligent, context-aware notifications that adapt to your schedule."
              delay={0.1}
            />
            <FeatureCard 
              icon={Brain}
              title="Health Analytics"
              description="Gain insights into your treatment progress with easy-to-understand visual reports."
              delay={0.2}
            />
            <FeatureCard 
              icon={Shield}
              title="Secure & Private"
              description="Your health data is encrypted and protected with industry-leading security standards."
              delay={0.3}
            />
            <FeatureCard 
              icon={Heart}
              title="Family Sync"
              description="Keep your loved ones informed and connected to your health journey effortlessly."
              delay={0.4}
            />
            <FeatureCard 
              icon={Bell}
              title="Emergency Alerts"
              description="Automatic notifications for caregivers if important medications are missed."
              delay={0.5}
            />
            <FeatureCard 
              icon={Activity}
              title="Vitals Tracking"
              description="Monitor your blood pressure, heart rate, and other essential vitals in one place."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto rounded-[3rem] overflow-hidden bg-[#0b1c30] text-white p-12 lg:p-20 relative"
        >
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
             <Canvas camera={{ position: [0, 0, 5] }}>
                <mesh rotation={[10, 10, 0]}>
                   <torusKnotGeometry args={[1, 0.3, 100, 16]} />
                   <meshPhongMaterial color="#0058be" wireframe />
                </mesh>
                <ambientLight intensity={10} />
             </Canvas>
          </div>
          <div className="relative z-10 text-center">
            <h2 className="text-5xl font-bold mb-8 leading-tight">Ready to transform <br/> your healthcare experience?</h2>
            <p className="text-xl text-primary-fixed-dim/80 mb-12 max-w-2xl mx-auto">
              Join thousands of users who have simplified their lives with DWAYA's 
              advanced health management platform.
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className="px-12 py-5 rounded-full bg-white text-[#0b1c30] text-xl font-bold hover:bg-primary-fixed-dim transition-all shadow-2xl"
            >
              Get Started Now
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-on-surface-variant">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/logo.jpeg" alt="DWAYA Logo" className="w-6 h-6 rounded-full object-cover" />
          <span className="font-bold text-on-surface">DWAYA</span>
        </div>
        <p>© 2026 DWAYA Healthcare. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;

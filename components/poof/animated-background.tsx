'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  delay: number
  duration: number
  size: number
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 4,
      size: 2 + Math.random() * 4,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
        <div 
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(124, 92, 252, 0.2) 0%, rgba(124, 92, 252, 0.05) 40%, transparent 70%)',
          }}
        />
      </div>
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            bottom: '-10px',
            width: particle.size,
            height: particle.size,
            background: 'rgba(200, 184, 255, 0.4)',
            animation: `float-up ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export function RadialGlow({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124, 92, 252, 0.2) 0%, rgba(124, 92, 252, 0.05) 40%, transparent 70%)',
        }}
      />
    </div>
  )
}

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Particle } from '../lib/confetti'
import './Confetti.css'

interface ConfettiProps {
  /** Changing the key replays the animation. `null` renders nothing. */
  burstKey: number | null
  particles: Particle[]
}

export function Confetti({ burstKey, particles }: ConfettiProps) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return null

  return (
    <div className="confetti" aria-hidden="true">
      <AnimatePresence>
        {burstKey !== null &&
          particles.map((particle) => (
            <motion.span
              key={`${burstKey}-${particle.id}`}
              className="confetti__piece"
              style={{
                background: particle.color,
                width: particle.size,
                height: particle.size * 0.45,
              }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
              animate={{
                x: particle.x,
                y: [0, particle.y, particle.y + 140],
                opacity: [1, 1, 0],
                rotate: particle.rotate,
                scale: 1,
              }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: particle.delay }}
            />
          ))}
      </AnimatePresence>
    </div>
  )
}

export interface Particle {
  id: number
  x: number
  y: number
  rotate: number
  color: string
  size: number
  delay: number
}

const COLORS = ['#8b7bff', '#20c997', '#f5b82e', '#ff5c6c', '#4f8cff', '#f06bc4']

/** Builds a random burst. Called from event handlers so rendering stays pure. */
export function createBurst(count = 36, spread = 260): Particle[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.5
    const distance = spread * (0.45 + Math.random() * 0.55)
    return {
      id: index,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance * 0.75 - 40,
      rotate: Math.random() * 540 - 270,
      color: COLORS[index % COLORS.length] ?? '#8b7bff',
      size: 6 + Math.random() * 6,
      delay: Math.random() * 0.08,
    }
  })
}

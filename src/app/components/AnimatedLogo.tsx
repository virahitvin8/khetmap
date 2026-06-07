import { motion } from 'motion/react'
import { Satellite, Waves, Leaf } from 'lucide-react'

const AnimatedLogo = ({ size = 200, className = '' }: { size?: number; className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Satellite - orbits into position */}
      <motion.div
        initial={{ opacity: 0, x: 50, y: -50, rotate: -45 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute" style={{ top: '10%', right: '10%' }}>
        <Satellite size={size * 0.2} className="text-[#2563EB]" />
      </motion.div>

      {/* Signal waves */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute" style={{ top: '10%', right: '10%' }}>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: [0.5, 2, 0.5], opacity: [0.6, 0.15, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full border-2 border-[#93C5FD]" style={{ width: size * 0.15 * (i + 1), height: size * 0.15 * (i + 1) }} />
          </motion.div>
        ))}
      </motion.div>

      {/* Hexagonal grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute inset-0 flex items-center justify-center">
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 100 100" className="text-[#93C5FD]">
          <motion.path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="1"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2, duration: 1, ease: "easeInOut" }} />
          <motion.path d="M50 5 L50 95 M10 25 L90 75 M10 75 L90 25" fill="none" stroke="currentColor" strokeWidth="0.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.2, duration: 0.8, ease: "easeInOut" }} />
        </svg>
      </motion.div>

      {/* Green leaf */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: [0, 1.1, 1] }}
        transition={{ delay: 3, duration: 1, scale: { delay: 3, duration: 1, ease: "easeOut" } }}
        className="absolute">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [1, 0.9, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <Leaf size={size * 0.35} className="text-[#22C55E] drop-shadow-lg" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      {/* KhetMap text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4, duration: 0.8, ease: "easeOut" }}
        className="absolute" style={{ bottom: '5%' }}>
        <h1 className="text-2xl font-bold text-[#2563EB] tracking-wide" style={{ fontSize: size * 0.12 }}>KhetMap</h1>
      </motion.div>
    </div>
  )
}

export default AnimatedLogo

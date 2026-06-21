import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
}

/** Ambient twinkling starfield behind the graph (from the design mockup). */
export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let stars: Star[] = []
    let raf = 0

    const init = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      const count = Math.min(420, Math.floor((width * height) / 4500))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5,
        opacity: Math.random(),
        speed: Math.random() * 0.05,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#ffffff'
      for (const s of stars) {
        ctx.globalAlpha = s.opacity
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
        s.opacity += s.speed
        if (s.opacity > 1 || s.opacity < 0) s.speed *= -1
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    init()
    draw()
    window.addEventListener('resize', init)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', init)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-20"
        style={{ background: 'radial-gradient(circle at center, #0c1324 0%, #020617 100%)' }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-nova-violet/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-nebula-blue/5 blur-[100px]" />
      </div>
    </>
  )
}

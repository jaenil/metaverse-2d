import { useRef, useEffect } from 'react'

interface Player {
  x: number
  y: number
  color: string
}

interface Players {
  [id: string]: Player
}

function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const playersRef = useRef<Players>({
    player_1: { x: 50, y: 50, color: 'blue' },
    player_2: { x: 100, y: 150, color: 'red' }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function renderLoop() {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const playersData = playersRef.current

      for (const id in playersData) {
        const player = playersData[id]
        ctx.fillStyle = player.color
        ctx.fillRect(player.x, player.y, 20, 20)
      }

      requestAnimationFrame(renderLoop)
    }

    const animationId = requestAnimationFrame(renderLoop)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas ref={canvasRef} width={800} height={600} />
  )
}

export default GameCanvas

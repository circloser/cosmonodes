/** Compose the live graph canvas onto a branded cosmic backdrop and download a PNG. */
export function downloadUniverseSnapshot(
  graphCanvas: HTMLCanvasElement,
  { title, subtitle }: { title: string; subtitle: string },
): void {
  const W = graphCanvas.width
  const H = graphCanvas.height
  if (!W || !H) return

  const out = document.createElement('canvas')
  out.width = W
  out.height = H
  const ctx = out.getContext('2d')
  if (!ctx) return

  // deep-space backdrop (the app renders the graph on a transparent canvas)
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.4)
  bg.addColorStop(0, '#0c1324')
  bg.addColorStop(1, '#020617')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // faint ambient stars
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 170; i++) {
    ctx.globalAlpha = Math.random() * 0.45 + 0.08
    ctx.beginPath()
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.2 + 0.2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.drawImage(graphCanvas, 0, 0)

  // branding overlay
  const s = Math.max(W, H) / 1000
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = `700 ${28 * s}px "Plus Jakarta Sans", sans-serif`
  ctx.fillText(title, 24 * s, 20 * s)
  ctx.fillStyle = 'rgba(196,199,200,0.85)'
  ctx.font = `500 ${14 * s}px "Plus Jakarta Sans", sans-serif`
  ctx.fillText(subtitle, 24 * s, 56 * s)

  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = 'rgba(129,140,248,0.9)'
  ctx.font = `600 ${12 * s}px "JetBrains Mono", monospace`
  ctx.fillText('COSMONODES ✦', W - 20 * s, H - 16 * s)

  out.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'cosmonodes-universe.png'
    a.click()
    URL.revokeObjectURL(a.href)
  }, 'image/png')
}

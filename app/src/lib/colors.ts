export const COLORS = {
  deepVoid: '#020617',
  background: '#0c1324',
  starlight: '#ffffff',
  nebulaBlue: '#38BDF8',
  novaViolet: '#818CF8',
  onSurfaceVariant: '#c4c7c8',
} as const

/** Visual spec for a node based on its degree + match state. */
export function nodeStyle(degree: number, matched: boolean): {
  radius: number
  fill: string
  glow: string
  glowBlur: number
  alpha: number
  showLabel: boolean
} {
  if (degree === 0) {
    return { radius: 9, fill: COLORS.starlight, glow: '#ffffff', glowBlur: 22, alpha: 1, showLabel: true }
  }
  if (degree === 1) {
    return {
      radius: matched ? 6.5 : 5.5,
      fill: matched ? COLORS.nebulaBlue : COLORS.novaViolet,
      glow: matched ? COLORS.nebulaBlue : COLORS.novaViolet,
      glowBlur: matched ? 16 : 10,
      alpha: 1,
      showLabel: true,
    }
  }
  // degree 2 — faint far star
  return { radius: 3, fill: COLORS.novaViolet, glow: COLORS.novaViolet, glowBlur: 6, alpha: 0.35, showLabel: false }
}

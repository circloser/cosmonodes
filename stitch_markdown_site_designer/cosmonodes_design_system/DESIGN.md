---
name: Cosmonodes Design System
colors:
  surface: '#0c1324'
  surface-dim: '#0c1324'
  surface-bright: '#33394c'
  surface-container-lowest: '#070d1f'
  surface-container-low: '#151b2d'
  surface-container: '#191f31'
  surface-container-high: '#23293c'
  surface-container-highest: '#2e3447'
  on-surface: '#dce1fb'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#dce1fb'
  inverse-on-surface: '#2a3043'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#ffffff'
  on-tertiary: '#490080'
  tertiary-container: '#f0dbff'
  on-tertiary-container: '#8a33d9'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#0c1324'
  on-background: '#dce1fb'
  surface-variant: '#2e3447'
  starlight-white: '#FFFFFF'
  deep-void: '#020617'
  nebula-blue: '#38BDF8'
  nova-violet: '#818CF8'
  interface-gray: '#1E293B'
  node-glow: rgba(99, 102, 241, 0.4)
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is centered on the concept of "Digital Astral Cartography." It serves an audience seeking a high-signal, low-noise social environment where human connections are visualized as stellar phenomena. The brand personality is intellectual, mysterious, and cinematic, moving away from the "feed-scrolling" fatigue of traditional SNS toward a focused, exploratory experience.

The design style is **Minimalist-Glassmorphism**. It utilizes heavy whitespace (represented here by "empty space" or "void"), translucent surfaces that mimic cosmic dust, and vibrant background blurs to create a sense of depth. High-contrast elements ensure readability against the dark void, while elegant, thin lines connect nodes to evoke the feeling of a sophisticated scientific instrument or a futuristic star map.

## Colors

The palette is rooted in the high contrast of a midnight sky. **Deep Void** serves as the primary canvas, providing an infinite backdrop that allows chromatic elements to "pop" without overwhelming the user. **Starlight White** is used exclusively for primary typography and essential UI borders to maintain a clinical, sophisticated edge.

**Nebula Blue** and **Nova Violet** function as functional accents, representing "active" nodes and connection paths. These colors should be used sparingly—primarily as glow effects, small status indicators, or data-visualization lines—to preserve the minimalist aesthetic. A subtle gradient between these two hues can be used to denote the strength or "gravitational pull" of a relationship.

## Typography

This design system uses **Plus Jakarta Sans** for its modern, approachable yet geometric structure. It provides the clarity needed for a data-centric SNS while feeling softer than a standard neo-grotesque font. 

To reinforce the "scientific instrument" feel, **JetBrains Mono** is introduced for labels, coordinates, and metadata. This monospaced font suggests precision and technicality. 

**Instructional Note:**
- Use "Starlight White" for all primary headings.
- Use "Interface Gray" for secondary body text to create a clear visual hierarchy through value rather than just size.
- Letter spacing should be increased for labels to ensure legibility against dark backgrounds.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with an emphasis on "negative space as a feature." The 3D Graph View is treated as a full-bleed immersive layer that sits beneath the UI chrome.

- **Desktop:** A 12-column grid with wide margins (40px) to allow the "universe" to breathe. Sidebars for user data or messaging should be treated as semi-transparent "HUD" (Heads-Up Display) panels that slide over the graph.
- **Mobile:** A single-column layout where the graph remains the background. Navigation is handled via a bottom-docked translucent bar.
- **Rhythm:** All spacing (padding, margins) must be a multiple of the 4px base unit to maintain a tight, mathematical consistency.

## Elevation & Depth

Hierarchy is established through **Backdrop Blurs** and **Tonal Layering** rather than traditional shadows. Since there is no single light source in deep space, shadows are physically inconsistent; instead, we use "glow" and "translucency."

1.  **Level 0 (The Void):** The interactive 3D relationship graph.
2.  **Level 1 (The Dust):** Semi-transparent surfaces (10-20% opacity) with a heavy backdrop blur (20px+) for sidebars and cards. This creates the "Glassmorphism" effect.
3.  **Level 2 (The Stars):** Solid white or vibrant blue/violet elements (buttons, active nodes) that appear to emit light. These use a "soft glow" (box-shadow with the same color as the element, low opacity, high blur) to simulate luminosity.

## Shapes

The shape language is a mix of **perfect circles** and **softened rectangles**. 
- **Nodes:** Must be perfect circles. The size of the circle represents the "influence" or "depth" of the relationship.
- **UI Elements:** Buttons and cards use a 0.5rem (8px) radius. This provides a modern, friendly touch that balances the coldness of the dark cosmic theme.
- **Connecting Lines:** These should be hair-thin (1px or less) with a slight gradient or "pulse" animation to indicate flow and connectivity.

## Components

### Buttons
Primary buttons are solid "Starlight White" with black text, creating an unmistakable call to action. Secondary buttons use a "Ghost" style: a 1px white border with a translucent background that blurs the graph behind it.

### Node Cards
When a star (node) is clicked, a small card appears. This card should have a "Glassmorphism" background (15% white opacity, 24px blur). The border should be a very thin, 0.5px white line.

### Relationship Lines
The lines connecting nodes are dynamic. A dashed line represents a "pending" or "weak" connection, while a solid, glowing line represents a "verified" or "strong" bond.

### Input Fields
Inputs are minimalist: a single bottom border (1px white) that glows when focused. Use the monospaced "label-font" for placeholder text to keep the aesthetic technical.

### Interaction Animation
When adding a new person (star), the UI should trigger a brief "Supernova" animation: a white flash at the center of the new node that expands and fades into a soft blue glow as the connection lines grow toward the center.
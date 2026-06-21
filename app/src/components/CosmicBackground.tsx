/** Static cosmic backdrop: dark radial gradient + soft ambient glows (no twinkle). */
export default function CosmicBackground() {
  return (
    <>
      <div
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

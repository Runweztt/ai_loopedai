import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef    = useRef(null)
  const ringRef   = useRef(null)
  const pos       = useRef({ x: 0, y: 0 })
  const mouse     = useRef({ x: 0, y: 0 })
  const raf       = useRef(null)
  const visible   = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px'
        dotRef.current.style.top  = e.clientY + 'px'
      }
      // Reveal both elements on first mouse move so they don't flash at (0,0)
      if (!visible.current) {
        visible.current = true
        if (dotRef.current)  dotRef.current.style.opacity  = '1'
        if (ringRef.current) ringRef.current.style.opacity = '1'
      }
    }

    const loop = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.12
      pos.current.y += (mouse.current.y - pos.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = pos.current.x + 'px'
        ringRef.current.style.top  = pos.current.y + 'px'
      }
      raf.current = requestAnimationFrame(loop)
    }

    const onEnter = (e) => {
      if (e.target.closest('a, button, [data-hover]')) {
        dotRef.current?.classList.add('scale-[2]')
        ringRef.current?.classList.add('scale-[1.6]')
      }
    }
    const onLeave = (e) => {
      if (e.target.closest('a, button, [data-hover]')) {
        dotRef.current?.classList.remove('scale-[2]')
        ringRef.current?.classList.remove('scale-[1.6]')
      }
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onEnter)
    document.addEventListener('mouseout', onLeave)
    raf.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter)
      document.removeEventListener('mouseout', onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <>
      {/* Start invisible — revealed on first mousemove so they don't flash at (0,0) */}
      <div
        ref={dotRef}
        style={{ opacity: 0, transition: 'opacity 0.15s, transform 0.15s' }}
        className="fixed z-[9999] w-2.5 h-2.5 bg-gold rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
      />
      <div
        ref={ringRef}
        style={{ opacity: 0, transition: 'opacity 0.15s, transform 0.15s' }}
        className="fixed z-[9998] w-8 h-8 border-2 border-gold/60 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
      />
    </>
  )
}

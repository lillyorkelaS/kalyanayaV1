'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/**
 * Wraps wedding template pages with:
 *  - Lenis smooth-scroll (buttery momentum scrolling)
 *  - An IntersectionObserver that adds `[data-revealed]` to every <section>
 *    so any element inside can fade/slide in via the global CSS in globals.css
 *
 * Keep template files untouched — the wrapper handles the dynamic feel.
 */
export default function WeddingPageWrapper({ children }) {
  const rootRef = useRef(null)

  useEffect(() => {
    // ----- Lenis smooth scroll -----
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false, // keep native feel on mobile
    })
    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // ----- IntersectionObserver section reveals -----
    const root = rootRef.current
    if (!root) return () => { cancelAnimationFrame(rafId); lenis.destroy() }

    const sections = root.querySelectorAll('section')
    sections.forEach((s, i) => {
      s.setAttribute('data-reveal', '')
      s.style.setProperty('--reveal-delay', `${(i % 3) * 80}ms`)
    })

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', '')
            // Only animate once
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    sections.forEach((s) => obs.observe(s))

    // ----- Hero parallax -----
    const hero = root.querySelector('section:first-of-type')
    let heroImg = null
    if (hero) {
      heroImg = hero.querySelector('img')
      if (heroImg) {
        heroImg.style.willChange = 'transform'
      }
    }
    function onScroll() {
      if (!heroImg) return
      const y = window.scrollY
      // Limit parallax to first viewport-and-a-half
      if (y < window.innerHeight * 1.4) {
        heroImg.style.transform = `translate3d(0, ${y * 0.3}px, 0) scale(${1 + y * 0.0003})`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      obs.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div ref={rootRef} className="kalyanaya-wedding-root">
      {children}
    </div>
  )
}

import { Controller } from "@hotwired/stimulus"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    // console.log("controller connected")
    // console.log("reveal elements found:", gsap.utils.toArray("[data-reveal]").length)
    this.initHero()
    this.initScrollReveals()
    this.initParallax()
    this.initSkills()
  }

  disconnect() {
    ScrollTrigger.getAll().forEach(t => t.kill())
  }

  initScrollReveals() {
    gsap.utils.toArray("[data-reveal]:not([data-skills])").forEach((el, i) => {
      gsap.from(el, {
        y: 48,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: (i % 3) * 0.12,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      })
    })
  }
    

  initHero() {
    const title = document.querySelector("[data-hero='title']")
    
    if (!title) return;
    
    const text = "Full stack developer specialising in Ruby on Rails"

    const tl = gsap.timeline({
      onComplete: () => {
        // Give the browser a full frame to repaint before measuring
        setTimeout(() => {
          ScrollTrigger.refresh()
        }, 100)
      }
    })

    tl.from("[data-hero='badge']", {
      opacity: 0, y: -10, duration: 0.4, ease: "power2.out"
    })
    .add(() => {
      let i = 0
      const interval = setInterval(() => {
        title.textContent = text.slice(0, i)
        i++
        if (i > text.length) clearInterval(interval)
      }, 35)
    })
    .from("[data-hero='bio']", {
      opacity: 0, y: 16, duration: 0.6, ease: "power2.out"
    }, `+=${text.length * 0.035 + 0.1}`)
    .from("[data-hero='actions']", {
      opacity: 0, x: 20, duration: 0.5, ease: "power2.out"
    }, "-=0.4")
  }

  initParallax() {
    gsap.to("[data-hero='card']", {
      y: -60,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-hero='card']",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    })
  }

  initSkills() {
    gsap.fromTo("[data-skills] .skills-group-label",
      { opacity: 0, x: -16 },
      {
        opacity: 1, x: 0,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: "[data-skills]",
          start: "top 80%",
          once: true
        }
      }
    )

    gsap.fromTo("[data-skills] .skill-badge",
      { opacity: 0, y: 20, scale: 0.85 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.35,
        ease: "back.out(1.4)",
        stagger: 0.1,
        scrollTrigger: {
          trigger: "[data-skills]",
          start: "top 80%",
          once: true
        }
      }
    )
  }
}
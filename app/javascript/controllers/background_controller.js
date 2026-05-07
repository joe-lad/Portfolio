import { Controller } from "@hotwired/stimulus"

const SHAPE_COUNT = 48
const SPEED_MULT  = 1.0
const MOUSE_FORCE = 2.5
const MOUSE_AREA = 160

export default class extends Controller {
  connect() {
    this.canvas = this.element
    this.ctx = this.canvas.getContext('2d')
    this.mouse = { x: -999, y: -999 }
    this.dark = document.documentElement.getAttribute('data-theme') === 'dark'
    this.shapeCount = SHAPE_COUNT
    this.speedMult  = SPEED_MULT
    this.mouseForce = MOUSE_FORCE
    this.mouseArea = MOUSE_AREA
    this.shapes = this.buildShapes()
    this.resize()
    this.bindEvents()
    this.tick()
  }

  disconnect() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this._resize)
    window.removeEventListener('mousemove', this._mousemove)
    window.removeEventListener('mouseleave', this._mouseleave)
    this._observer?.disconnect()
  }

  buildShapes() {
    return Array.from({length: this.shapeCount}, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 20 + Math.random() * 60,
      rotation: Math.random() * Math.PI * 2,
      bvx: (Math.random() - 0.5) * 0.18,
      bvy: (Math.random() - 0.5) * 0.18,
      vr: (Math.random() - 0.5) * 0.003,
      type: i % 3,
      opacity: 0.04 + Math.random() * 0.2,
      lw: Math.floor(Math.random() * 2) + 1,
      fx: 0, fy: 0
    }))
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  bindEvents() {
    this._resize    = () => this.resize()
    this._mousemove = e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY }
    this._mouseleave = () => { this.mouse.x = -999; this.mouse.y = -999 }

    window.addEventListener('resize', this._resize)
    window.addEventListener('mousemove', this._mousemove)
    window.addEventListener('mouseleave', this._mouseleave)

    const observer = new MutationObserver(() => {
      this.dark = document.documentElement.getAttribute('data-theme') === 'dark'
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    this._observer = observer

    // Slider events — only wire up if the sliders exist on the page
    document.getElementById('bg-count')?.addEventListener('input', e => {
      let shapes = this.buildShapes()
      const n = parseInt(e.target.value)
      while(this.shapes.length < n) this.shapes.push(shapes[Math.floor(Math.random() * shapes.length)])
      if(this.shapes.length > n) this.shapes = this.shapes.slice(0, n)
    })

    document.getElementById('bg-speed')?.addEventListener('input', e => {
      this.speedMult = parseFloat(e.target.value)
    })

    document.getElementById('bg-force')?.addEventListener('input', e => {
      this.mouseForce = parseFloat(e.target.value)
    })

    document.getElementById('bg-area')?.addEventListener('input', e => {
      this.mouseArea = parseFloat(e.target.value)
    })
  }

  drawShape(s) {
    const ctx = this.ctx
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(s.rotation)
    ctx.strokeStyle = this.dark ? `rgba(255,255,255,${s.opacity})` : `rgba(0,0,0,${s.opacity})`
    ctx.lineWidth = s.lw

    if(s.type === 0) {
      ctx.beginPath()
      ctx.rect(-s.size/2, -s.size/2, s.size, s.size)
      ctx.stroke()
    } else if(s.type === 1) {
      ctx.beginPath()
      ctx.moveTo(0, -s.size/2)
      ctx.lineTo(s.size/2, s.size/2)
      ctx.lineTo(-s.size/2, s.size/2)
      ctx.closePath()
      ctx.stroke()
    } else {
      ctx.beginPath()
      for(let i = 0; i < 6; i++) {
        const a = (i/6) * Math.PI * 2
        i === 0 ? ctx.moveTo(Math.cos(a)*s.size/2, Math.sin(a)*s.size/2)
                : ctx.lineTo(Math.cos(a)*s.size/2, Math.sin(a)*s.size/2)
      }
      ctx.closePath()
      ctx.stroke()
    }
    ctx.restore()
  }

  tick() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.shapes.forEach(s => {
      const dx = s.x - this.mouse.x
      const dy = s.y - this.mouse.y
      const dist = Math.sqrt(dx*dx + dy*dy)
      const radius = this.mouseArea

      if(dist < radius && dist > 0) {
        const force = (radius - dist) / radius
        const angle = Math.atan2(dy, dx)
        s.fx += Math.cos(angle) * force * this.mouseForce
        s.fy += Math.sin(angle) * force * this.mouseForce
      }

      s.fx *= 0.88
      s.fy *= 0.88
      s.x += s.bvx * this.speedMult + s.fx
      s.y += s.bvy * this.speedMult + s.fy
      s.rotation += s.vr * this.speedMult

      if(s.x < -100) s.x = this.canvas.width + 100
      if(s.x > this.canvas.width + 100) s.x = -100
      if(s.y < -100) s.y = this.canvas.height + 100
      if(s.y > this.canvas.height + 100) s.y = -100

      this.drawShape(s)
    })

    this.raf = requestAnimationFrame(() => this.tick())
  }
}
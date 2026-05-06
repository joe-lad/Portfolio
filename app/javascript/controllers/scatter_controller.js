import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    console.log("controller connected")
    this.wrapWords()
    this.element.addEventListener("mousemove", this.onMouseMove.bind(this))
    this.element.addEventListener("mouseleave", this.onMouseLeave.bind(this))
  }

  disconnect() {
    this.element.removeEventListener("mousemove", this.onMouseMove.bind(this))
    this.element.removeEventListener("mouseleave", this.onMouseLeave.bind(this))
  }

  wrapWords() {
    const walker = document.createTreeWalker(
      this.element,
      NodeFilter.SHOW_TEXT,
      null
    )

    const textNodes = []
    let node
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) textNodes.push(node)
    }

    textNodes.forEach(textNode => {
      const words = textNode.textContent.split(/(\s+)/)
      const fragment = document.createDocumentFragment()

      words.forEach(word => {
        if (word.match(/^\s+$/)) {
          fragment.appendChild(document.createTextNode(word))
        } else if (word.trim()) {
          const span = document.createElement("span")
          span.className = "scatter-word"
          span.textContent = word
          fragment.appendChild(span)
        }
      })

      textNode.parentNode.replaceChild(fragment, textNode)
    })
  }

  onMouseMove(e) {
    const words = this.element.querySelectorAll(".scatter-word")
    words.forEach(word => {
      const rect = word.getBoundingClientRect()
      const wordX = rect.left + rect.width / 2
      const wordY = rect.top + rect.height / 2
      const dx = e.clientX - wordX
      const dy = e.clientY - wordY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const radius = 80

      if (dist < radius) {
        const force = (radius - dist) / radius
        const angle = Math.atan2(dy, dx)
        const pushX = -Math.cos(angle) * force * 8
        const pushY = -Math.sin(angle) * force * 8
        const rotate = (Math.random() - 0.5) * force * 12

        word.style.transform = `translate(${pushX}px, ${pushY}px) rotate(${rotate}deg)`
        word.style.opacity = 1 - force * 1
      } else {
        word.style.transform = ""
        word.style.opacity = ""
      }
    })
  }

  onMouseLeave() {
    this.element.querySelectorAll(".scatter-word").forEach(word => {
      word.style.transform = ""
      word.style.opacity = ""
    })
  }
}
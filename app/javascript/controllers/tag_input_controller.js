import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "suggestions", "tagList", "hidden"]

  connect() {
    this.tags = Array.from(this.tagListTarget.querySelectorAll("span"))
      .map(el => el.dataset.name || el.textContent.trim().replace("×", "").trim())
    this.updateHidden()
  }

  async suggest() {
    const q = this.inputTarget.value.trim()
    if (q.length < 1) { this.hideSuggestions(); return }

    const res = await fetch(`/tags/search?q=${encodeURIComponent(q)}`)
    const tags = await res.json()

    this.suggestionsTarget.innerHTML = tags
      .filter(t => !this.tags.includes(t))
      .map(t => `<li class="list-group-item list-group-item-action" data-action="click->tag-input#select" data-name="${t}">${t}</li>`)
      .join("")

    this.suggestionsTarget.style.display = tags.length ? "block" : "none"
  }

  select(e) {
    this.addTag(e.currentTarget.dataset.name)
  }

  handleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      const val = this.inputTarget.value.trim()
      if (val) this.addTag(val)
    }
  }

  addTag(name) {
    if (this.tags.includes(name)) return
    this.tags.push(name)

    const badge = document.createElement("span")
    badge.className = "tag-badge"
    badge.innerHTML = `${name} <button type="button" class="tag-remove p-0" data-action="click->tag-input#remove" data-tag-input-name-param="${name}"><i class="fa-solid fa-x" style="font-size: 10px"></i></button>`
    this.tagListTarget.appendChild(badge)

    this.inputTarget.value = ""
    this.hideSuggestions()
    this.updateHidden()
  }

  remove(e) {
    const name = e.params.name
    this.tags = this.tags.filter(t => t !== name)
    e.currentTarget.closest("span").remove()
    this.updateHidden()
  }

  hideSuggestions() {
    this.suggestionsTarget.style.display = "none"
    this.suggestionsTarget.innerHTML = ""
  }

  updateHidden() {
    this.hiddenTarget.value = this.tags.join(",")
  }
}
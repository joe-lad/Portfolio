// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
import * as bootstrap from "bootstrap"
import "jquery"
import "jquery_ujs"
import jquery from "jquery"
import "theme"
import "sidebar"
import "scrollspy"
import "uptime"
window.$ = jquery
window.jQuery = jquery
import "trix"
import "@rails/actiontext"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Attach to window so other modules can reuse
window.gsap = gsap
window.ScrollTrigger = ScrollTrigger
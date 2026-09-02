import { PhoneScene } from './phone-scene.js'
import { initScrollAnimations } from './scroll-rig.js'

// Scroll reveal
const ro = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }),
  { threshold: 0.15 }
)
document.querySelectorAll('.reveal').forEach(el => ro.observe(el))

// Three.js phone scenes — no hero phone (video slot in hero)
const livePhone = new PhoneScene(document.getElementById('liveStage'), { mode: 'showcase', speed: 1.4, drag: true })
const howPhone  = new PhoneScene(document.getElementById('howStage'),  { mode: 'float',    speed: 1.0 })
const floatSc   = new PhoneScene(document.getElementById('floatStage'),{ mode: 'float',    speed: 2.4 })
const showSc    = new PhoneScene(document.getElementById('showStage'), { mode: 'showcase', speed: 2.4 })

initScrollAnimations({ livePhone, howPhone, float: floatSc, show: showSc })

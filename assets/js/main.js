// Reveal animations run unconditionally — no dep on Three.js or GSAP
const ro = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }),
  { threshold: 0.15 }
)
document.querySelectorAll('.reveal').forEach(el => ro.observe(el))

// 3D phone scenes — async, so a load failure never blocks reveals
try {
  const [{ PhoneScene }, { initScrollAnimations }] = await Promise.all([
    import('./phone-scene.js'),
    import('./scroll-rig.js'),
  ])
  const livePhone = document.getElementById('liveStage')  && new PhoneScene(document.getElementById('liveStage'),  { mode: 'showcase', speed: 1.4, drag: true })
  const howPhone  = document.getElementById('howStage')   && new PhoneScene(document.getElementById('howStage'),   { mode: 'float',    speed: 1.0 })
  const floatSc   = document.getElementById('floatStage') && new PhoneScene(document.getElementById('floatStage'), { mode: 'float',    speed: 2.4 })
  const showSc    = document.getElementById('showStage')  && new PhoneScene(document.getElementById('showStage'),  { mode: 'showcase', speed: 2.4 })
  initScrollAnimations({ livePhone, howPhone, float: floatSc, show: showSc })
} catch (e) {
  console.warn('[TiltCast] Phone scene unavailable:', e.message)
}

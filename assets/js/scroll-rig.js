// GSAP is loaded as a UMD script (window.gsap / window.ScrollTrigger)
const gsap = window.gsap
const { ScrollTrigger } = window

gsap.registerPlugin(ScrollTrigger)

export function initScrollAnimations({ livePhone, howPhone, float, show }) {

  // ── Live section — step activation + phone pose ───────────────
  const liveSteps = document.querySelectorAll('.live-step')
  const livePoses = [
    { ry:  0.1, rx:  0.05 },
    { ry: -0.5, rx:  0.20 },
    { ry:  0.4, rx: -0.10 },
  ]

  liveSteps[0]?.classList.add('active')

  liveSteps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter()     { liveSteps.forEach(s => s.classList.remove('active')); step.classList.add('active') },
      onEnterBack() { liveSteps.forEach(s => s.classList.remove('active')); step.classList.add('active') },
    })

    if (i === 0 || !livePhone) return
    ScrollTrigger.create({
      trigger: step,
      start: 'top 65%',
      onEnter() {
        gsap.to(livePhone.phoneGroup.rotation, { y: livePoses[i].ry, x: livePoses[i].rx, duration: 0.8, ease: 'power2.inOut', overwrite: true })
      },
      onEnterBack() {
        gsap.to(livePhone.phoneGroup.rotation, { y: livePoses[i - 1].ry, x: livePoses[i - 1].rx, duration: 0.6, ease: 'power2.inOut', overwrite: true })
      },
    })
  })

  // ── How section — sticky scroll story ────────────────────────
  const howSteps = document.querySelectorAll('.how-step')
  const howPoses = [
    { ry:  0,    rx:  0    },
    { ry: -0.4,  rx:  0.20 },
    { ry:  0.6,  rx: -0.15 },
  ]

  howSteps[0]?.classList.add('active')

  howSteps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter()     { howSteps.forEach(s => s.classList.remove('active')); step.classList.add('active') },
      onEnterBack() { howSteps.forEach(s => s.classList.remove('active')); step.classList.add('active') },
    })

    if (i === 0 || !howPhone) return
    ScrollTrigger.create({
      trigger: step,
      start: 'top 65%',
      onEnter() {
        gsap.to(howPhone.phoneGroup.rotation, { y: howPoses[i].ry, x: howPoses[i].rx, duration: 0.8, ease: 'power2.inOut', overwrite: true })
      },
      onEnterBack() {
        gsap.to(howPhone.phoneGroup.rotation, { y: howPoses[i - 1].ry, x: howPoses[i - 1].rx, duration: 0.6, ease: 'power2.inOut', overwrite: true })
      },
    })
  })
}

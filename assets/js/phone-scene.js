import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

const AMP = {
  float:    { yaw: 0.085, pitch: 0.055, roll: 0.035, bob: 0.022 },
  showcase: { yaw: 0.420, pitch: 0.200, roll: 0.130, bob: 0.090 },
}

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function rrPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function buildScreenCanvas() {
  const W = 390, H = 844
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const g = c.getContext('2d')

  // background
  g.fillStyle = '#0A0C10'
  g.fillRect(0, 0, W, H)

  // header
  g.fillStyle = '#F2F4F6'
  g.font = 'bold 28px -apple-system, system-ui, sans-serif'
  g.fillText('Overview', 38, 100)

  g.fillStyle = '#2C3138'
  g.beginPath()
  g.arc(342, 86, 16, 0, Math.PI * 2)
  g.fill()

  // hero card
  g.fillStyle = '#192035'
  rrPath(g, 28, 124, W - 56, 164, 18)
  g.fill()
  g.strokeStyle = 'rgba(255,255,255,0.07)'
  g.lineWidth = 1
  g.stroke()

  g.fillStyle = '#7C8798'
  g.font = '500 16px "Courier New", monospace'
  g.fillText('THIS WEEK', 46, 162)

  g.fillStyle = '#EEF1F4'
  g.font = 'bold 46px "Courier New", monospace'
  g.fillText('14,208', 46, 216)

  // progress bar bg
  g.fillStyle = 'rgba(255,255,255,0.09)'
  rrPath(g, 46, 232, W - 92, 10, 5)
  g.fill()
  // progress fill
  g.fillStyle = '#5C7CFF'
  rrPath(g, 46, 232, (W - 92) * 0.64, 10, 5)
  g.fill()

  // list rows
  const rowY = [320, 390, 460]
  for (const y of rowY) {
    g.fillStyle = 'rgba(255,255,255,0.045)'
    rrPath(g, 28, y, W - 56, 56, 10)
    g.fill()

    g.fillStyle = '#2E3542'
    rrPath(g, 40, y + 12, 32, 32, 7)
    g.fill()

    g.fillStyle = 'rgba(255,255,255,0.22)'
    rrPath(g, 84, y + 14, 160, 8, 4)
    g.fill()

    g.fillStyle = 'rgba(255,255,255,0.10)'
    rrPath(g, 84, y + 30, 100, 8, 4)
    g.fill()
  }

  // tab bar
  const tabY = H - 68
  g.strokeStyle = 'rgba(255,255,255,0.07)'
  g.lineWidth = 1
  g.beginPath(); g.moveTo(0, tabY); g.lineTo(W, tabY); g.stroke()

  const tabW = W / 4
  for (let i = 0; i < 4; i++) {
    g.fillStyle = i === 0 ? '#5C7CFF' : 'rgba(255,255,255,0.12)'
    rrPath(g, i * tabW + tabW * 0.2, tabY + 22, tabW * 0.6, 8, 4)
    g.fill()
  }

  return c
}

export class PhoneScene {
  constructor(container, { mode = 'showcase', speed = 1, drag = false, bloom = false } = {}) {
    this._container = container
    this._mode = mode
    this._speed = speed
    this._drag = drag
    this._bloom = bloom

    // spring state
    this._tgtY = 0; this._tgtX = 0
    this._curY = 0; this._curX = 0
    this._velY = 0; this._velX = 0

    this._init()
  }

  _init() {
    const el = this._container
    el.style.position = 'relative'
    const W = el.clientWidth || 400
    const H = el.clientHeight || 500

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    Object.assign(renderer.domElement.style, {
      position: 'absolute', inset: '0',
      width: '100%', height: '100%', display: 'block'
    })
    el.appendChild(renderer.domElement)
    this._renderer = renderer

    // scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x08090A)
    this.scene = scene

    // env
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.3
    pmrem.dispose()

    // camera
    const camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 50)
    camera.position.z = 3.8
    this.camera = camera

    // lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.06))

    const key = new THREE.DirectionalLight(0xFFF5E6, 3.8)
    key.position.set(2.5, 3, 2)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    scene.add(key)

    const fill = new THREE.DirectionalLight(0x7095FF, 0.5)
    fill.position.set(-2.5, 0.5, 1.5)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0xE0E8FF, 1.4)
    rim.position.set(-1, 2, -2)
    scene.add(rim)

    // phone
    this.phoneGroup = this._buildPhone()
    scene.add(this.phoneGroup)

    // post
    if (this._bloom) {
      const composer = new EffectComposer(renderer)
      composer.addPass(new RenderPass(scene, camera))
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.35, 0.4, 0.72))
      composer.addPass(new OutputPass())
      this._composer = composer
    }

    // interaction
    if (this._drag) this._setupDrag()

    // resize
    this._ro = new ResizeObserver(() => this._onResize())
    this._ro.observe(el)

    // loop
    if (REDUCED) {
      this._step(3.4, 0)
      renderer.render(scene, camera)
    } else {
      const t0 = performance.now()
      let prev = t0
      const frame = (now) => {
        this._raf = requestAnimationFrame(frame)
        const t = (now - t0) / 1000
        const dt = Math.min((now - prev) / 1000, 0.05)
        prev = now
        this._step(t, dt)
        this._composer ? this._composer.render() : renderer.render(scene, camera)
      }
      this._raf = requestAnimationFrame(frame)
    }
  }

  _buildPhone() {
    const group = new THREE.Group()

    const body = new THREE.Mesh(
      new RoundedBoxGeometry(0.95, 2.05, 0.115, 4, 0.072),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2C3238'),
        metalness: 0.88,
        roughness: 0.18,
        envMapIntensity: 1.1,
      })
    )
    body.castShadow = true
    group.add(body)

    const screenTex = new THREE.CanvasTexture(buildScreenCanvas())
    screenTex.colorSpace = THREE.SRGBColorSpace
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 1.72),
      new THREE.MeshBasicMaterial({ map: screenTex })
    )
    screen.position.z = 0.059
    group.add(screen)

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 1.72),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.06,
        roughness: 0.04,
        envMapIntensity: 2.5,
      })
    )
    glass.position.z = 0.062
    group.add(glass)

    return group
  }

  _setupDrag() {
    const el = this._container
    el.style.cursor = 'grab'
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      this._tgtY = (((e.clientX - r.left) / r.width) * 2 - 1) * 0.42
      this._tgtX = -(((e.clientY - r.top) / r.height) * 2 - 1) * 0.26
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', () => { this._tgtY = 0; this._tgtX = 0 })
    el.addEventListener('pointerdown', () => { el.style.cursor = 'grabbing' })
    el.addEventListener('pointerup', () => { el.style.cursor = 'grab' })
  }

  _step(t, dt) {
    const amp = AMP[this._mode]
    const s = t * this._speed

    let yaw   = amp.yaw   * Math.sin(s * 0.31)
    let pitch = amp.pitch * Math.sin(s * 0.47 + 1.1)
    let roll  = amp.roll  * Math.sin(s * 0.23 + 2.3)
    const bob = amp.bob   * Math.sin(s * 0.37 + 0.6)

    if (dt > 0) {
      this._velY += (this._tgtY - this._curY) * 110 * dt
      this._velY *= Math.exp(-16 * dt)
      this._curY += this._velY * dt

      this._velX += (this._tgtX - this._curX) * 110 * dt
      this._velX *= Math.exp(-16 * dt)
      this._curX += this._velX * dt
    }

    yaw   += this._curY
    pitch += this._curX

    this.phoneGroup.rotation.y = yaw
    this.phoneGroup.rotation.x = pitch
    this.phoneGroup.rotation.z = roll
    this.phoneGroup.position.y = bob * 0.4
  }

  _onResize() {
    const W = this._container.clientWidth
    const H = this._container.clientHeight
    if (!W || !H) return
    this.camera.aspect = W / H
    this.camera.updateProjectionMatrix()
    this._renderer.setSize(W, H)
    if (this._composer) this._composer.setSize(W, H)
  }

  dispose() {
    cancelAnimationFrame(this._raf)
    this._ro.disconnect()
    this._renderer.dispose()
    this._container.removeChild(this._renderer.domElement)
  }
}

// Light Rays background (ported from reactbits.dev/backgrounds/light-rays, vanilla JS + OGL).
// Each .light-rays-container element on the page is configured via data-* attributes
// and lazily started/stopped with an IntersectionObserver.
import { Renderer, Program, Triangle, Mesh } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.js';

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
}

function getAnchorAndDir(origin, w, h) {
  const outside = 0.2;
  switch (origin) {
    case 'top-left': return { anchor: [0, -outside * h], dir: [0, 1] };
    case 'top-right': return { anchor: [w, -outside * h], dir: [0, 1] };
    case 'left': return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case 'right': return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case 'bottom-left': return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
    case 'bottom-center': return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
    case 'bottom-right': return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
    default: return { anchor: [0.5 * w, -outside * h], dir: [0, 1] }; // top-center
  }
}

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

function initLightRays(container, opts) {
  let renderer = null;
  let mesh = null;
  let uniforms = null;
  let raf = null;
  let visible = false;
  const mouse = { x: 0.5, y: 0.5 };
  const smooth = { x: 0.5, y: 0.5 };

  function updatePlacement() {
    if (!renderer) return;
    renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth: wCSS, clientHeight: hCSS } = container;
    renderer.setSize(wCSS, hCSS);
    const dpr = renderer.dpr;
    const w = wCSS * dpr, h = hCSS * dpr;
    uniforms.iResolution.value = [w, h];
    const { anchor, dir } = getAnchorAndDir(opts.origin, w, h);
    uniforms.rayPos.value = anchor;
    uniforms.rayDir.value = dir;
  }

  function loop(t) {
    if (!renderer || !visible) return;
    uniforms.iTime.value = t * 0.001;
    if (opts.mouseInfluence > 0) {
      const s = 0.92;
      smooth.x = smooth.x * s + mouse.x * (1 - s);
      smooth.y = smooth.y * s + mouse.y * (1 - s);
      uniforms.mousePos.value = [smooth.x, smooth.y];
    }
    try {
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    } catch (e) {
      console.warn('light-rays: render error', e);
    }
  }

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) / rect.width;
    mouse.y = (e.clientY - rect.top) / rect.height;
  }

  function setup() {
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: true, preserveDrawingBuffer: true });
      const gl = renderer.gl;
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      container.appendChild(gl.canvas);

      uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: hexToRgb(opts.color) },
        raysSpeed: { value: opts.speed },
        lightSpread: { value: opts.spread },
        rayLength: { value: opts.length },
        pulsating: { value: opts.pulsating ? 1.0 : 0.0 },
        fadeDistance: { value: opts.fade },
        saturation: { value: opts.saturation },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: opts.mouseInfluence },
        noiseAmount: { value: opts.noise },
        distortion: { value: opts.distortion }
      };

      const geometry = new Triangle(gl);
      const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms });
      mesh = new Mesh(gl, { geometry, program });

      updatePlacement();
      window.addEventListener('resize', updatePlacement);
      if (opts.mouseInfluence > 0) window.addEventListener('pointermove', onMouseMove);
    } catch (e) {
      console.warn('light-rays: WebGL init failed', e);
      renderer = null;
    }
  }

  const io = new IntersectionObserver((entries) => {
    const nowVisible = entries[0].isIntersecting;
    if (nowVisible && !visible) {
      visible = true;
      if (!renderer) setup();
      if (renderer) raf = requestAnimationFrame(loop);
    } else if (!nowVisible && visible) {
      visible = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }
  }, { threshold: 0.1 });
  io.observe(container);
}

function readOpts(el) {
  const num = (name, fallback) => {
    const v = el.dataset[name];
    return v === undefined ? fallback : parseFloat(v);
  };
  return {
    origin: el.dataset.origin || 'top-center',
    color: el.dataset.color || '#ffffff',
    speed: num('speed', 1),
    spread: num('spread', 1),
    length: num('length', 2),
    fade: num('fade', 1),
    saturation: num('saturation', 1),
    mouseInfluence: num('mouseInfluence', 0.1),
    noise: num('noise', 0),
    distortion: num('distortion', 0),
    pulsating: el.dataset.pulsating === 'true'
  };
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.light-rays-container').forEach((el) => {
    initLightRays(el, readOpts(el));
  });
});

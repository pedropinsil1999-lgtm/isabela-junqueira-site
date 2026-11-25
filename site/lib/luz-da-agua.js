/**
 * Luz da Agua - efeito de assinatura
 * Causticas de piscina: a luz que a agua desenha no fundo.
 * WebGL cru (sem dependencia), fallback canvas 2D, fallback imagem estatica.
 */

const VERT = `#version 100
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `#version 100
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;      // 0..1, amortecido
uniform float uMouseOn;    // 0..1
uniform float uScroll;     // progresso acumulado
uniform vec3  uAgua;
uniform vec3  uMadeira;
uniform vec3  uFundo;
uniform float uForca;      // intensidade geral
uniform vec3  uToque;      // xy = ponto, z = idade em segundos (<0 = inativo)

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){
    s += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}

/* Causticas de verdade.
   A luz que a agua desenha no fundo e a DOBRA do mapa de refracao:
   um raio que entra em (p) chega ao fundo em f(p) = p + r*grad(h).
   O brilho e o inverso de quanto esse mapa comprime a area, 1/|det J|,
   com J = I + r*Hessiano(h). Como h e uma soma de senoides, o Hessiano
   sai analitico: um cos e um sin por onda, sem amostrar ruido.
   Por isso a rede tem filamentos finos, nos brilhantes e celulas escuras,
   em vez da veia uniforme que um campo de ruido produz. */
#define ONDA(dxx,dyy,fr,am,sp) { \
  vec2 d = vec2(dxx, dyy); \
  float si = sin(dot(p, d) * fr + t * sp) * am * fr * fr; \
  Hxx -= si * d.x * d.x; \
  Hxy -= si * d.x * d.y; \
  Hyy -= si * d.y * d.y; }

float causticas(vec2 p, float t, float refr){
  // deriva lenta: tira a regularidade da interferencia pura
  float d1 = fbm(p * 0.55 + t * 0.06);
  float d2 = fbm(p * 0.55 + 7.3 - t * 0.05);
  p += 0.22 * vec2(d1, d2);

  // direcoes espalhadas a cada ~30 graus: sem faixa diagonal
  float Hxx = 0.0, Hxy = 0.0, Hyy = 0.0;
  ONDA( 0.990,  0.139,  3.1, 1.00,  1.15)
  ONDA( 0.799,  0.602,  4.3, 0.80, -0.93)
  ONDA( 0.407,  0.914,  5.9, 0.58,  1.37)
  ONDA(-0.087,  0.996,  7.7, 0.42, -1.61)
  ONDA(-0.559,  0.829,  9.8, 0.30,  1.90)
  ONDA(-0.891,  0.454, 13.1, 0.20, -2.30)

  float jxx = 1.0 + refr * Hxx;
  float jyy = 1.0 + refr * Hyy;
  float jxy = refr * Hxy;
  float det = jxx * jyy - jxy * jxy;
  float ad  = abs(det);

  /* A caustica mora exatamente onde det cruza zero (a dobra).
     Limiarizar o proprio det, e nao 1/det, mantem fwidth estavel:
     a linha sai fina e com antialias de verdade, em vez de um borrao. */
  #ifdef GL_OES_standard_derivatives
    float w = fwidth(det) * 1.15 + 0.006;
  #else
    float w = 0.06;
  #endif
  float filamento = 1.0 - smoothstep(0.0, w * 1.9, ad);

  // nucleo aceso: 1/|det| saturado da corpo a luz, para a dobra nao virar fio de arame
  float b = 1.0 / (ad + 0.035);
  float nucleo = b / (b + 3.2);
  nucleo = pow(nucleo, 2.2);

  // a luz nao e uniforme ao longo do filamento
  return (filamento * 1.25 + nucleo * 0.95) * (0.5 + 1.0 * d1);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv   = frag / uRes;
  float asp = uRes.x / max(uRes.y, 1.0);
  vec2 p    = vec2(uv.x * asp, uv.y);

  // agua parada com brisa: o tempo corre devagar, e o scroll o empurra
  float t = uTime * 0.38 + uScroll * 1.6;

  // o ponteiro empurra a superficie da agua
  vec2  m  = vec2(uMouse.x * asp, uMouse.y);
  float dm = distance(p, m);
  float empurrao = exp(-dm * 2.3) * uMouseOn;
  p += normalize(p - m + 1e-5) * empurrao * 0.032;

  // onda que se propaga do toque
  if (uToque.z >= 0.0) {
    vec2  tp = vec2(uToque.x * asp, uToque.y);
    float dt = distance(p, tp);
    float idade = uToque.z;
    float frente = dt - idade * 0.42;
    float onda = sin(frente * 34.0) * exp(-abs(frente) * 9.0) * exp(-idade * 1.5);
    p += normalize(p - tp + 1e-5) * onda * 0.05;
  }

  // perto do ponteiro a agua "afunda": a refracao aumenta e a luz se concentra
  float refr = 0.030 * (1.0 + empurrao * 1.15);

  float c1 = causticas(p * 2.45, t, refr);
  float c2 = causticas(p * 4.9 + vec2(11.7, 5.3), t * 0.78, refr * 0.70);
  float c  = c1 + c2 * 0.32;

  // profundidade: a rede some suavemente nas bordas
  float vinheta = smoothstep(1.18, 0.18, length((uv - 0.5) * vec2(asp, 1.0)));
  c *= mix(0.45, 1.0, vinheta);

  vec3 cor = uFundo;
  cor += uAgua * c * uForca;

  // halo quente de madeira, atrasado, bem discreto
  float halo = exp(-dm * 2.3) * uMouseOn;
  cor += uMadeira * halo * 0.08;

  // leve brilho de agua profunda no centro
  cor += uAgua * 0.012 * vinheta;

  gl_FragColor = vec4(cor, 1.0);
}
`;

function hexParaRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

export function criarLuzDaAgua(canvas, opcoes = {}) {
  const cfg = {
    agua: '#6FC3BA',
    madeira: '#D9A871',
    fundo: '#0D1A14',
    forca: 0.12,          // 5 a 12% conforme a secao
    escalaRender: 0.7,
    dprMax: 1.75,
    ...opcoes,
  };

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gl =
    canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }) ||
    canvas.getContext('experimental-webgl');

  if (!gl) return fallback2d(canvas, cfg, reduzido);

  gl.getExtension('OES_standard_derivatives');

  const compilar = (tipo, src) => {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[luz-da-agua]', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };

  const vs = compilar(gl.VERTEX_SHADER, VERT);
  const fs = compilar(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return fallback2d(canvas, cfg, reduzido);

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return fallback2d(canvas, cfg, reduzido);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  for (const n of ['uRes','uTime','uMouse','uMouseOn','uScroll','uAgua','uMadeira','uFundo','uForca','uToque']) {
    u[n] = gl.getUniformLocation(prog, n);
  }
  gl.uniform3fv(u.uAgua, hexParaRgb(cfg.agua));
  gl.uniform3fv(u.uMadeira, hexParaRgb(cfg.madeira));
  gl.uniform3fv(u.uFundo, hexParaRgb(cfg.fundo));
  gl.uniform1f(u.uForca, cfg.forca);

  // ---- estado ----
  let dpr = Math.min(window.devicePixelRatio || 1, cfg.dprMax);
  let largura = 0, altura = 0;
  const alvo = { x: 0.5, y: 0.5 };
  const suave = { x: 0.5, y: 0.5 };
  let mouseOn = 0, mouseOnAlvo = 0;
  let scroll = 0, scrollAlvo = 0;
  let toque = null;
  let rodando = false, visivel = false, abaVisivel = true;
  let t0 = performance.now();
  let raf = 0;

  // teto de fps em aparelho fraco, detectado por frame time
  let intervaloMin = 0;
  let ultimoQuadro = 0;
  let amostras = 0, somaFrame = 0;

  function dimensionar() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr * cfg.escalaRender));
    const h = Math.max(1, Math.round(r.height * dpr * cfg.escalaRender));
    if (w === largura && h === altura) return;
    largura = w; altura = h;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.uRes, w, h);
  }

  function desenhar(agora) {
    const dt = agora - ultimoQuadro;
    ultimoQuadro = agora;

    if (amostras < 120 && dt > 0 && dt < 500) {
      somaFrame += dt; amostras++;
      if (amostras === 120 && somaFrame / 120 > 21) intervaloMin = 1000 / 45;
    }

    const k = 0.085;
    suave.x += (alvo.x - suave.x) * k;
    suave.y += (alvo.y - suave.y) * k;
    mouseOn += (mouseOnAlvo - mouseOn) * 0.06;
    scroll += (scrollAlvo - scroll) * 0.1;

    gl.uniform1f(u.uTime, (agora - t0) / 1000);
    gl.uniform2f(u.uMouse, suave.x, suave.y);
    gl.uniform1f(u.uMouseOn, mouseOn);
    gl.uniform1f(u.uScroll, scroll);
    if (toque) {
      const idade = (agora - toque.inicio) / 1000;
      if (idade > 3.2) toque = null;
      else gl.uniform3f(u.uToque, toque.x, toque.y, idade);
    }
    if (!toque) gl.uniform3f(u.uToque, 0, 0, -1);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function laco(agora) {
    if (!rodando) return;
    raf = requestAnimationFrame(laco);
    if (intervaloMin && agora - ultimoQuadro < intervaloMin) return;
    dimensionar();
    desenhar(agora);
  }

  function iniciar() {
    if (rodando || !visivel || !abaVisivel) return;
    rodando = true;
    ultimoQuadro = performance.now();
    raf = requestAnimationFrame(laco);
  }
  function parar() {
    rodando = false;
    cancelAnimationFrame(raf);
  }

  // ---- entradas ----
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    alvo.x = (e.clientX - r.left) / r.width;
    alvo.y = 1 - (e.clientY - r.top) / r.height;
    mouseOnAlvo = 1;
  };
  const onLeave = () => { mouseOnAlvo = 0; };
  const onTouch = (e) => {
    const p = e.touches && e.touches[0];
    if (!p) return;
    const r = canvas.getBoundingClientRect();
    toque = {
      x: (p.clientX - r.left) / r.width,
      y: 1 - (p.clientY - r.top) / r.height,
      inicio: performance.now(),
    };
  };
  const onScroll = () => {
    scrollAlvo = window.scrollY / Math.max(1, window.innerHeight);
  };

  const io = new IntersectionObserver(
    ([entrada]) => { visivel = entrada.isIntersecting; visivel ? iniciar() : parar(); },
    { threshold: 0.01 }
  );
  io.observe(canvas);

  const onVis = () => { abaVisivel = !document.hidden; abaVisivel ? iniciar() : parar(); };
  document.addEventListener('visibilitychange', onVis);

  if (reduzido) {
    // desenha uma vez e congela
    dimensionar();
    gl.uniform1f(u.uTime, 11.7);
    gl.uniform2f(u.uMouse, 0.5, 0.5);
    gl.uniform1f(u.uMouseOn, 0);
    gl.uniform1f(u.uScroll, 0);
    gl.uniform3f(u.uToque, 0, 0, -1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    io.disconnect();
    return { destruir() { document.removeEventListener('visibilitychange', onVis); }, modo: 'congelado' };
  }

  const alvoPonteiro = cfg.alvoPonteiro || window;
  alvoPonteiro.addEventListener('pointermove', onMove, { passive: true });
  alvoPonteiro.addEventListener('pointerleave', onLeave, { passive: true });
  window.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', dimensionar);

  dimensionar();
  iniciar();

  return {
    modo: 'webgl',
    definirForca(v) { gl.useProgram(prog); gl.uniform1f(u.uForca, v); },
    destruir() {
      parar();
      io.disconnect();
      alvoPonteiro.removeEventListener('pointermove', onMove);
      alvoPonteiro.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', dimensionar);
      document.removeEventListener('visibilitychange', onVis);
    },
  };
}

/** Fallback canvas 2D: mesmo padrao, frequencia baixa, bem mais barato. */
function fallback2d(canvas, cfg, reduzido) {
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.style.background = cfg.fundo; return { modo: 'estatico' }; }

  const N = 96;
  let campo = null, raf = 0, rodando = false, t = 0;

  function gerar(desloc) {
    const img = ctx.createImageData(N, N);
    const [ar, ag, ab] = hexParaRgb(cfg.agua).map((v) => v * 255);
    const [fr, fg, fb] = hexParaRgb(cfg.fundo).map((v) => v * 255);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const u = x / N, v = y / N;
        const a = Math.sin((u * 7.0 + Math.sin(v * 5.0 + desloc) * 1.6) * 2.0 + desloc);
        const b = Math.sin((v * 6.0 + Math.sin(u * 4.0 - desloc * 0.8) * 1.4) * 2.0 - desloc * 0.7);
        let c = Math.pow(Math.max(0, 1 - Math.abs(a + b) * 0.55), 3.0);
        const borda = Math.max(0, 1 - Math.hypot(u - 0.5, v - 0.5) * 1.9);
        c *= 0.45 + 0.55 * borda;
        const i = (y * N + x) * 4;
        img.data[i]     = fr + ar * c * cfg.forca * 2.2;
        img.data[i + 1] = fg + ag * c * cfg.forca * 2.2;
        img.data[i + 2] = fb + ab * c * cfg.forca * 2.2;
        img.data[i + 3] = 255;
      }
    }
    return img;
  }

  const off = document.createElement('canvas');
  off.width = off.height = N;
  const offCtx = off.getContext('2d');

  function pintar() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width / 4));
    canvas.height = Math.max(1, Math.round(r.height / 4));
    campo = gerar(t);
    offCtx.putImageData(campo, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
  }

  if (reduzido) { pintar(); return { modo: 'congelado-2d' }; }

  function laco() {
    if (!rodando) return;
    t += 0.012;
    pintar();
    raf = setTimeout(() => requestAnimationFrame(laco), 1000 / 24);
  }

  const io = new IntersectionObserver(([e]) => {
    rodando = e.isIntersecting;
    if (rodando) requestAnimationFrame(laco); else clearTimeout(raf);
  }, { threshold: 0.01 });
  io.observe(canvas);

  return { modo: 'canvas2d', destruir() { rodando = false; clearTimeout(raf); io.disconnect(); } };
}

/* Generative grainy "film" images — rendered once on canvas, cached as data URLs.
   Used as placeholder cover / hero images until real photos are added. */
(function () {
  'use strict';
  const cache = new Map();
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const ss = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

  function rng(seed) {
    let s = (Math.imul(seed | 0, 2654435761) >>> 0) || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function fbmFactory(r) {
    const p = new Float32Array(256 * 256);
    for (let i = 0; i < p.length; i++) p[i] = r();
    const at = (x, y) => p[((y & 255) << 8) | (x & 255)];
    const n = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    return (x, y, oct = 5) => {
      let s = 0, amp = 0.5, f = 1, norm = 0;
      for (let i = 0; i < oct; i++) { s += amp * n(x * f + i * 17.3, y * f + i * 9.1); norm += amp; amp *= 0.5; f *= 2; }
      return s / norm;
    };
  }
  function shade(ctx, w, h, fn) {
    const img = ctx.createImageData(w, h), d = img.data, a = w / h;
    let i = 0;
    for (let y = 0; y < h; y++) {
      const v = y / h;
      for (let x = 0; x < w; x++) {
        const c = fn(x / w, v, a);
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; i += 4;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  function grain(ctx, w, h, amt, r) {
    if (!amt) return;
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = (r() - 0.5) * amt;
      d[i] += g; d[i + 1] += g; d[i + 2] += g;
    }
    ctx.putImageData(img, 0, 0);
  }

  const ARTS = {
    clouds: { g: 34, paint(ctx, w, h, r, f) {
      const sage = hex('#9fb2a3'), warm = hex('#d8d1a6'), c1 = hex('#5b5e58'), c2 = hex('#8e9289');
      shade(ctx, w, h, (u, v, a) => {
        const c = mix(sage, warm, ss(0.35, 1.25, u - v * 0.8 + 0.4));
        const m = ss(0.5, 0.68, f(u * a * 2.6 + 3, v * 2.6) + (v - 0.45) * 0.1);
        return mix(c, mix(c1, c2, f(u * a * 9, v * 9, 3)), m * 0.85);
      });
    }},
    red: { g: 40, paint(ctx, w, h, r, f) {
      const red = hex('#c4472b'), mauve = hex('#86707a'), cyan = hex('#a9dde8'), pale = hex('#e9d3cb');
      shade(ctx, w, h, (u, v, a) => {
        const n = f(u * a * 2.2, v * 2.8);
        let c = mix(red, mauve, ss(0.25, 0.85, v * 0.9 + (n - 0.5) * 0.9));
        c = mix(c, pale, ss(0.6, 0.78, f(u * a * 5 + 7, v * 5, 3)) * 0.35);
        return mix(c, cyan, ss(0.82, 0.98, v + (n - 0.5) * 0.18));
      });
    }},
    haze: { g: 70, paint(ctx, w, h, r, f) {
      const top = hex('#8a99a1'), bot = hex('#cbbfba');
      shade(ctx, w, h, (u, v, a) => {
        let c = mix(top, bot, ss(0, 1, v + (f(u * a * 2, v * 2, 3) - 0.5) * 0.3));
        const d = Math.abs((v - 0.62) + (u - 0.5) * 0.3);
        return mix(c, [236, 233, 231], ss(0.007, 0, d) * 0.4 * ss(0.35, 0.6, u));
      });
    }},
    silence: { g: 26, paint(ctx, w, h, r, f) {
      const k = hex('#05080a'), s = hex('#1f3138'), gl = hex('#a3bcc0');
      shade(ctx, w, h, (u, v, a) => {
        const n = f(u * a * 2, v * 2, 4);
        let c = mix(k, s, ss(0.1, 1, u * 0.7 + (1 - v) * 0.2 + (n - 0.5) * 0.5));
        const dx = (u - 0.64) * a, dy = v - 0.42, d = Math.sqrt(dx * dx + dy * dy);
        return mix(c, gl, ss(0.32, 0, d + (n - 0.5) * 0.12) * 0.55);
      });
    }},
    glow: { g: 30, paint(ctx, w, h, r, f) {
      const navy = hex('#0b1c24'), teal = hex('#2c6f78'), light = hex('#9fcfc9'), cyan = hex('#25c6e0'), white = hex('#e9fffd');
      shade(ctx, w, h, (u, v, a) => {
        const n = f(u * a * 2.5, v * 2.5, 4);
        let c = mix(navy, teal, ss(0, 0.9, u * 0.8 + (n - 0.5) * 0.4));
        c = mix(c, light, ss(0.75, 1.15, u + (n - 0.5) * 0.3) * 0.7);
        const dx = (u - 0.8) * a, dy = v - 0.42;
        const d = Math.sqrt(dx * dx + dy * dy) + (f(u * a * 5 + 9, v * 5, 4) - 0.5) * 0.16;
        const g = ss(0.38, 0.02, d);
        c = mix(c, cyan, ss(0, 0.45, g) * 0.95);
        return mix(c, white, ss(0.45, 0.9, g));
      });
    }},
    pink: { g: 30, paint(ctx, w, h, r, f) {
      const base = hex('#f7e4dc'), org = hex('#f07a57'), pk = hex('#e58aa6'), cy = hex('#b4e5ee'), yl = hex('#f8e3a0');
      shade(ctx, w, h, (u, v, a) => {
        const s1 = f(u * a * 7, v * 1.1, 4), s2 = f(u * a * 2 + 4, v * 2, 3);
        let c = mix(base, org, ss(0.42, 0.68, s1 * 0.6 + s2 * 0.5));
        c = mix(c, pk, ss(0.6, 0.75, f(u * a * 4 + 2, v * 1.5, 3)) * 0.6);
        c = mix(c, cy, ss(0.6, 0.74, f(u * a * 3 + 11, v * 1.3, 3)) * 0.8);
        return mix(c, yl, ss(0.66, 0.78, f(u * a * 6 + 5, v * 0.8, 3)) * 0.5);
      });
    }},
    para: { g: 12, paint(ctx, w, h, r, f) {
      const bg = hex('#ebebe9'), o1 = hex('#a85a2a'), o2 = hex('#e8a978');
      shade(ctx, w, h, (u, v, a) => {
        const d = Math.sqrt((u * a) ** 2 * 0.7 + v * v);
        const m = ss(0.56, 0.66, f(u * a * 8, v * 8, 4) + ss(0.6, 0, d) * 0.4 - 0.12);
        return mix(bg, mix(o1, o2, f(u * a * 20, v * 20, 2)), m);
      });
    }},
    pixel: { g: 18, paint(ctx, w, h, r) {
      const cw = 26, ch = Math.round(cw * h / w);
      const sc = document.createElement('canvas'); sc.width = cw; sc.height = ch;
      const sx = sc.getContext('2d'), id = sx.createImageData(cw, ch);
      for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
        const u = (i + 0.5) / cw, v = (j + 0.5) / ch;
        const dx = (u - 0.3) / 0.17, dy = (v - 0.76) / 0.065;
        let b = Math.exp(-(dx * dx + dy * dy));
        b = Math.max(b, Math.exp(-(((v - 0.775) / 0.035) ** 2)) * ss(0.32, 0, u) * 0.75);
        if (r() < 0.07) b = Math.max(b, 0.06 + r() * 0.28);
        b = clamp(b * (0.9 + r() * 0.2));
        const k = (j * cw + i) * 4, val = Math.round(Math.pow(b, 0.8) * 255);
        id.data[k] = id.data[k + 1] = id.data[k + 2] = val; id.data[k + 3] = 255;
      }
      sx.putImageData(id, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sc, 0, 0, w, h);
    }},
    grass: { g: 30, paint(ctx, w, h, r) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#34482a'); g.addColorStop(1, '#141d0f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const cols = ['#a9c48a', '#dbe9d2', '#6f8f4f', '#f1f7ee', '#4d6b35', '#90b07a', '#c4d9b4', '#2c3f22'];
      const n = Math.round((w * h) / 700), k = w / 480;
      ctx.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const x = r() * w * 1.3 - w * 0.15, y = h * (0.2 + r()), len = h * (0.15 + r() * 0.65), lean = (r() - 0.35) * w * 0.6;
        ctx.strokeStyle = cols[(r() * cols.length) | 0];
        ctx.globalAlpha = 0.3 + r() * 0.6;
        ctx.lineWidth = (1 + r() * r() * 16) * k;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * 0.2, y - len * 0.6, x + lean, y - len); ctx.stroke();
      }
      for (let i = 0; i < n / 6; i++) {
        ctx.save(); ctx.translate(r() * w, r() * h); ctx.rotate(r() * Math.PI);
        ctx.globalAlpha = 0.5 + r() * 0.5; ctx.fillStyle = cols[(r() * 4) | 0];
        ctx.beginPath(); ctx.ellipse(0, 0, (8 + r() * 22) * k, (3 + r() * 7) * k, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }},
    plant: { g: 64, paint(ctx, w, h, r, f) {
      shade(ctx, w, h, (u, v, a) => {
        const n = f(u * a * 7, v * 7, 4);
        let c = mix([226, 226, 224], [196, 196, 194], v);
        if (u < 0.8 && v > 0.3 && v < 0.86) {
          c = mix([92, 92, 90], [150, 150, 148], clamp(ss(0, 0.85, u) * 0.6 + (n - 0.5) * 1.2 + 0.2));
          if (v > 0.78) c = mix(c, [170, 170, 168], ss(0.78, 0.86, v) * 0.6);
        } else if (u >= 0.8 && u < 0.9 && v > 0.08) c = mix([200, 200, 198], [160, 160, 158], n);
        else if (u >= 0.9) c = mix([120, 120, 118], [175, 175, 173], n);
        return c;
      });
      const k = w / 360;
      for (let s = 0; s < 7; s++) {
        const x0 = w * (0.04 + r() * 0.5), y0 = h * 1.02, top = h * (0.08 + r() * 0.35), lean = (r() - 0.4) * w * 0.25;
        const x1 = x0 + lean, y1 = (y0 + top) / 2, x2 = x0 + lean * 0.6, y2 = top;
        ctx.strokeStyle = 'rgba(235,235,232,.8)'; ctx.lineWidth = 2 * k;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x1, y1, x2, y2); ctx.stroke();
        const steps = 9 + ((r() * 6) | 0);
        for (let i = 1; i <= steps; i++) {
          const t = i / (steps + 1), m = 1 - t;
          const px = m * m * x0 + 2 * m * t * x1 + t * t * x2, py = m * m * y0 + 2 * m * t * y1 + t * t * y2;
          for (const side of [-1, 1]) {
            ctx.save(); ctx.translate(px, py); ctx.rotate(side * (0.5 + r() * 0.6) - Math.PI / 2 * 0.2);
            ctx.fillStyle = 'rgba(238,238,235,.88)'; ctx.strokeStyle = 'rgba(90,90,90,.35)'; ctx.lineWidth = 1;
            const rx = (12 + r() * 12) * k * (1 - t * 0.4);
            ctx.beginPath(); ctx.ellipse(side * rx * 0.9, 0, rx, (4 + r() * 3) * k, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.restore();
          }
        }
      }
    }}
  };

  function url(type, w = 360, h = 480) {
    const key = type + ':' + w + 'x' + h;
    if (cache.has(key)) return cache.get(key);
    const def = ARTS[type] || ARTS.haze;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const seed = hash(type);
    def.paint(ctx, w, h, rng(seed), fbmFactory(rng(seed + 7)));
    grain(ctx, w, h, def.g, rng(seed + 13));
    let out = '';
    try { out = c.toDataURL('image/jpeg', 0.86); } catch (e) { /* ignore */ }
    cache.set(key, out);
    return out;
  }

  let grainUrl = '';
  function grainTex() {
    if (grainUrl) return grainUrl;
    const s = 160, c = document.createElement('canvas'); c.width = c.height = s;
    const ctx = c.getContext('2d'), img = ctx.createImageData(s, s), r = rng(42);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    grainUrl = c.toDataURL('image/png');
    return grainUrl;
  }

  window.Art = { url, grain: grainTex, rng, hash };
})();

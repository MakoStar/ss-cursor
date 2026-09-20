import {
  TAU,
  GLOBAL_SCALE,
  rand,
  getTinted,
  stripAlpha,
  parseAlpha,
} from './utils';
import type { EmitterConfig, SlideTrailConfig } from './types';

/** 点击爆裂发射器 */
export class Emitter {
  [key: string]: any;

  particles: {
    x: number; y: number; vx: number; vy: number;
    age: number; life: number; startSize: number;
    rot: number; rotSpeed: number; drag: number;
    frameOffset: number; fixedFrame: number | null;
    paletteIndex: number;
  }[] = [];

  elapsed = 0;
  hasEmitted = false;
  _glowLayers: { canvas: HTMLCanvasElement; blur: number; scale: number; alpha: number }[][] | null = null;
  _softGlowSprite: HTMLCanvasElement | null = null;
  timescale = 1;
  blendMode: GlobalCompositeOperation = 'lighter';
  _gravity = 0;
  _burstIndex = 0;

  constructor(cfg: EmitterConfig) {
    Object.assign(this, cfg);
    this.timescale = cfg.timescale ?? 1;
    this.blendMode = cfg.blendMode || 'lighter';
    this._gravity = (cfg.gravity || 0) * GLOBAL_SCALE;
  }

  update(dt: number) {
    const sdt = dt * this.timescale;
    this.elapsed += sdt;

    if (this.bursts && this.bursts.length > 0) {
      while (this._burstIndex < this.bursts.length &&
        this.elapsed >= this.bursts[this._burstIndex].time) {
        this._burst(this.bursts[this._burstIndex].count);
        this._burstIndex++;
      }
      if (this._burstIndex >= this.bursts.length) this.hasEmitted = true;
    } else {
      if (!this.hasEmitted && this.elapsed >= (this.startDelay || 0)) {
        this.hasEmitted = true;
        this._burst();
      }
    }

    const ps = this.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.age += sdt;
      if (p.age >= p.life) { ps.splice(i, 1); continue; }
      if (p.drag > 0) { const d = Math.exp(-p.drag * sdt); p.vx *= d; p.vy *= d; }
      if (this._gravity) p.vy += this._gravity * sdt;
      p.x += p.vx * sdt; p.y += p.vy * sdt; p.rot += p.rotSpeed * sdt;
    }
  }

  _burst(count?: number) {
    const n = count ?? this.burstCount ?? 0;
    for (let i = 0; i < n; i++) {
      const life = rand(this.lifeMin, this.lifeMax);
      const speed = rand(this.speedMin, this.speedMax) * GLOBAL_SCALE;
      const size = rand(this.sizeMin, this.sizeMax) * GLOBAL_SCALE;
      const angle = Math.random() * TAU;
      const radius = this.shapeRadius
        ? this.shapeRadius * Math.sqrt(Math.random()) * GLOBAL_SCALE : 0;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      let rotSpeed = 0;
      if (this.rotSpeedMin !== undefined || this.rotSpeedMax !== undefined) {
        rotSpeed = rand(this.rotSpeedMin ?? 0, this.rotSpeedMax ?? 0);
      } else if (this.rotSpeed !== undefined) {
        rotSpeed = this.rotSpeed;
      }
      this.particles.push({
        x: Math.cos(angle) * radius, y: Math.sin(angle) * radius,
        vx, vy, age: 0, life, startSize: size,
        rot: (this.rotMin !== undefined) ? rand(this.rotMin, this.rotMax) : 0,
        rotSpeed,
        drag: this.drag || 0,
        frameOffset: (this.frameOffset !== undefined)
          ? this.frameOffset : Math.random(),
        fixedFrame: (this.frameMode === 'fixed')
          ? (this.frameStart || 0)
          + Math.floor(Math.random() * (this.frameCount || 1))
          : null,
        paletteIndex: this._glowLayers
          ? Math.floor(Math.random() * this._glowLayers.length) : 0,
      });
    }
  }

  _buildGlowLayers() {
    if (!this.glow || this._glowLayers) return;
    const palettes = this.glow.palettes || [this.glow.layers || []];
    const sprite = this.sprite;
    this._glowLayers = palettes.map((layers: any[]) =>
      layers.map((l: any) => {
        const c = document.createElement('canvas');
        c.width = sprite.width; c.height = sprite.height;
        const gctx = c.getContext('2d')!;
        gctx.drawImage(sprite, 0, 0);
        gctx.globalCompositeOperation = 'multiply';
        gctx.fillStyle = l.color;
        gctx.fillRect(0, 0, c.width, c.height);
        gctx.globalCompositeOperation = 'destination-in';
        gctx.drawImage(sprite, 0, 0);
        return {
          canvas: c, blur: l.blur || 1, scale: l.scale || 1.15,
          alpha: l.alpha !== undefined ? l.alpha : 1,
        };
      })
    );
  }

  _drawWhiteRing(ctx: CanvasRenderingContext2D) {
    const ps = this.particles;
    const ringColor = this.ringColor || '#ffffff';
    const glowColor = this.ringGlow || 'rgba(60, 230, 220, 0.9)';
    const ringRatio = this.ringRatio ?? 0.9;
    const ringWidthRatio = this.ringWidthRatio ?? 0.06;
    const innerTop = this.innerTopColor || 'rgba(220, 255, 255, 0.9)';
    const innerMid = this.innerMidColor || 'rgba(120, 245, 230, 0.6)';
    const innerEdge = this.innerEdgeColor || 'rgba(0, 220, 200, 0.7)';
    const sizeCurve = this.sizeCurve as (t: number) => number;
    const alphaCurve = this.alphaCurve as (t: number) => number;

    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      const t = p.age / p.life;
      const size = p.startSize * sizeCurve(t);
      const alpha = alphaCurve(t);
      if (alpha < 0.01 || size < 2) continue;
      const R = size / 2;
      const ringR = R * ringRatio;
      const ringW = Math.max(1.5, R * ringWidthRatio);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
      grad.addColorStop(0.0, innerTop);
      grad.addColorStop(0.35, innerMid);
      grad.addColorStop(0.85, innerEdge);
      grad.addColorStop(1.0, 'rgba(0, 200, 190, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, TAU);
      ctx.fill();

      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = R * 0.95;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = ringW;
      ctx.globalAlpha = alpha * 0.55;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, TAU);
      ctx.stroke();
      ctx.restore();

      ctx.shadowColor = glowColor;
      ctx.shadowBlur = R * 0.35;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = ringW;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, TAU);
      ctx.stroke();

      ctx.restore();
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.drawMode === 'whiteRing') {
      this._drawWhiteRing(ctx);
      return;
    }
    if (this.glow && (this.glow.layers || this.glow.palettes) && !this._glowLayers) {
      this._buildGlowLayers();
    }
    const sprite = this.sprite;
    if (!sprite || this.particles.length === 0) return;
    const frames = this.frameCount || 1;
    const tileX = this.tileX || frames;
    const tileY = this.tileY || 1;
    const frameStart = this.frameStart || 0;
    const fw = sprite.width / tileX;
    const fh = sprite.height / tileY;
    const ps = this.particles;
    const sizeCurve = this.sizeCurve as (t: number) => number;
    const alphaCurve = this.alphaCurve as (t: number) => number;
    const useColorCurve = !!this.colorCurve;

    const useSoftGlow = this.glow
      && this.glow.blur !== undefined
      && !this.glow.layers && !this.glow.palettes;
    if (useSoftGlow && !this._softGlowSprite) {
      const c = this.glow.color || 'rgba(0, 255, 255, 1)';
      this._softGlowSprite = getTinted(sprite, stripAlpha(c));
    }

    const prevBlend = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = this.blendMode;

    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      const t = p.age / p.life;
      const size = p.startSize * sizeCurve(t);
      const alpha = alphaCurve(t);
      if (alpha < 0.01 || size < 0.5) continue;

      let frame: number;
      if (this.frameMode === 'fixed' && p.fixedFrame !== null) {
        frame = p.fixedFrame;
      } else {
        frame = frameStart;
        if (frames > 1) {
          const cycle = (t * 1.5 + p.frameOffset) % 1;
          frame = frameStart + Math.min(frames - 1, Math.floor(cycle * frames));
        }
      }
      const col = frame % tileX;
      const row = Math.floor(frame / tileX);

      let drawSprite: HTMLImageElement | HTMLCanvasElement = sprite;
      if (useColorCurve) {
        const c = this.colorCurve(t);
        drawSprite = getTinted(sprite, c) || sprite;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      if (p.rot) ctx.rotate(p.rot);

      if (useSoftGlow && this._softGlowSprite) {
        const gBlur = this.glow.blur * GLOBAL_SCALE;
        const gScale = this.glow.scale ?? 1.35;
        const gAlpha = this.glow.alpha ?? parseAlpha(this.glow.color || 'rgba(0,0,0,0.85)');
        const gs = size * gScale;
        ctx.save();
        ctx.filter = `blur(${gBlur}px)`;
        ctx.globalAlpha = alpha * gAlpha;
        ctx.drawImage(this._softGlowSprite,
          col * fw, row * fh, fw, fh,
          -gs / 2, -gs / 2, gs, gs);
        ctx.restore();
      }

      if (this._glowLayers) {
        const layers = this._glowLayers[p.paletteIndex] || this._glowLayers[0];
        if (layers && layers.length) {
          for (let g = 0; g < layers.length; g++) {
            const gl = layers[g];
            const gSize = size * gl.scale;
            ctx.save();
            ctx.filter = `blur(${gl.blur * GLOBAL_SCALE}px)`;
            ctx.globalAlpha = alpha * gl.alpha;
            ctx.drawImage(gl.canvas, col * fw, row * fh, fw, fh,
              -gSize / 2, -gSize / 2, gSize, gSize);
            ctx.restore();
          }
        }
      }

      ctx.globalAlpha = alpha;
      ctx.drawImage(drawSprite, col * fw, row * fh, fw, fh,
        -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    ctx.globalCompositeOperation = prevBlend;
  }

  get done(): boolean {
    if (!this.hasEmitted) return false;
    return this.particles.length === 0;
  }
}

/** 拖动拖尾 */
export class SlideTrail {
  [key: string]: any;

  points: { x: number; y: number; age: number }[] = [];
  stars: any[] = [];
  particleLayers: any[] = [];

  isPressed = false;
  activated = false;
  heldTime = 0;
  done = false;
  lastPos: { x: number; y: number } | null = null;
  lastEmitPos: { x: number; y: number } | null = null;
  timeAccum = 0;

  constructor(cfg: SlideTrailConfig = {}) {
    const ribbonWidth = cfg.ribbonWidth ?? cfg.width ?? 5.5;
    const legacyColors = cfg.colors;
    const legacyStops = cfg.colorStops;

    this.pointLife = cfg.pointLife ?? 0.35;
    this.maxPoints = cfg.maxPoints ?? 240;
    this.minDist = cfg.minDist ?? 2.5;
    this.activationDelay = cfg.activationDelay ?? 0.12;

    this.ribbonWidth = ribbonWidth;
    this.ribbonAlpha = cfg.ribbonAlpha ?? 0.75;
    this.ribbonBright = cfg.ribbonBright ?? 1.0;
    this.ribbonBlend = cfg.ribbonBlend || 'lighter';
    this.ribbonLayers = cfg.ribbonLayers || [
      { widthMul: 2.6, alpha: 0.35, blur: 6 },
      { widthMul: 1.3, alpha: 0.70, blur: 1.5 },
      { widthMul: 0.6, alpha: 1.00, blur: 0 },
    ];

    if (Array.isArray(cfg.ribbonColors) && cfg.ribbonColors.length > 0) {
      this.ribbonColors = cfg.ribbonColors;
    } else if (Array.isArray(legacyColors) && legacyColors.length > 0) {
      const n = legacyColors.length;
      const stops = Array.isArray(legacyStops) && legacyStops.length === n
        ? legacyStops
        : legacyColors.map((_, i) => i / Math.max(n - 1, 1));
      this.ribbonColors = legacyColors.map((c, i) => ({
        t: stops[i] ?? i / Math.max(n - 1, 1),
        color: c,
      }));
    } else {
      this.ribbonColors = [];
    }

    this.starLifeMin = cfg.starLifeMin ?? 0.5;
    this.starLifeMax = cfg.starLifeMax ?? 0.55;
    this.starInterval = cfg.starInterval ?? 0.05;
    this.starSpacing = cfg.starSpacing ?? 60;
    this.starSizeMin = cfg.starSizeMin ?? 20;
    this.starSizeMax = cfg.starSizeMax ?? 40;
    this.starSpeedMin = cfg.starSpeedMin ?? 0;
    this.starSpeedMax = cfg.starSpeedMax ?? 2;
    this.starDrag = cfg.starDrag ?? 6;
    this.starJitter = cfg.starJitter ?? 3;
    this.starRotMin = cfg.starRotMin ?? 0;
    this.starRotMax = cfg.starRotMax ?? TAU;
    this.starRotSpeedMin = cfg.starRotSpeedMin ?? -1.5;
    this.starRotSpeedMax = cfg.starRotSpeedMax ?? 1.5;
    this.starShrink = cfg.starShrink ?? 0.85;
    this.starColors = cfg.starColors || [];

    this.sprite = cfg.sprite;
    this.spriteFrames = cfg.spriteFrames || 1;
    this.spriteTileX = cfg.spriteTileX || this.spriteFrames;
    this.spriteTileY = cfg.spriteTileY || 1;
    this.spriteFrameStart = cfg.spriteFrameStart || 0;
    this.frameMode = cfg.frameMode || 'fixed';
    this.frameRate = cfg.frameRate || 1.2;
    this.fixedFrameWeights = cfg.fixedFrameWeights || null;
    this.ribbonOnTop = cfg.ribbonOnTop ?? true;

    this.starFadeStart = cfg.starFadeStart ?? 0.55;
    this.starFadeEnd = cfg.starFadeEnd ?? 1.00;
    this.starBaseAlpha = cfg.starBaseAlpha ?? 0.9;

    this.particleLayers = (cfg.particleLayers || []).map((L: any) => ({
      sprite: L.sprite,
      tileX: L.tileX ?? 1,
      tileY: L.tileY ?? 1,
      frameMode: L.frameMode ?? 'fixed',
      rate: L.rate ?? 10,
      emitSpacing: L.emitSpacing ?? 30,
      lifeMin: L.lifeMin ?? 0.5,
      lifeMax: L.lifeMax ?? 0.8,
      sizeMin: L.sizeMin ?? 30,
      sizeMax: L.sizeMax ?? 40,
      speedMin: L.speedMin ?? 0,
      speedMax: L.speedMax ?? 0,
      shapeRadius: L.shapeRadius ?? 0,
      gravity: L.gravity ?? 0,
      drag: L.drag ?? 0,
      startRotMin: L.startRotMin ?? 0,
      startRotMax: L.startRotMax ?? TAU,
      rotSpeedMin: L.rotSpeedMin ?? 0,
      rotSpeedMax: L.rotSpeedMax ?? 0,
      sizeCurve: L.sizeCurve ?? ((t: number) => 1 - t),
      colorCurve: L.colorCurve ?? null,
      tint: L.tint ?? null,
      alphaCurve: L.alphaCurve ?? ((t: number) => 1 - t),
      blendMode: L.blendMode || 'lighter',
      _timeAccum: 0,
      _lastEmitPos: null,
      _particles: [],
    }));
  }

  push(x: number, y: number) {
    this.lastPos = { x, y };
    if (!this.activated) return;
    const pts = this.points;
    if (pts.length === 0) { pts.push({ x, y, age: 0 }); return; }
    const last = pts[pts.length - 1];
    const dx = x - last.x, dy = y - last.y;
    if (dx * dx + dy * dy < this.minDist * this.minDist) return;
    pts.push({ x, y, age: 0 });
    while (pts.length > this.maxPoints) pts.shift();
  }

  start(x: number, y: number) {
    this.isPressed = true;
    this.activated = false;
    this.heldTime = 0;
    this.lastPos = { x, y };
    this.lastEmitPos = { x, y };
    this.timeAccum = 0;
  }

  end() { this.isPressed = false; }

  update(dt: number): boolean {
    const pts = this.points;
    for (let i = pts.length - 1; i >= 0; i--) {
      pts[i].age += dt;
      if (pts[i].age >= this.pointLife) pts.splice(i, 1);
    }
    if (this.isPressed && !this.activated) {
      this.heldTime += dt;
      if (this.heldTime >= this.activationDelay) {
        this.activated = true;
        this.points.push({ x: this.lastPos!.x, y: this.lastPos!.y, age: 0 });
        this.lastEmitPos = { x: this.lastPos!.x, y: this.lastPos!.y };
        for (const L of this.particleLayers) {
          L._lastEmitPos = { x: this.lastPos!.x, y: this.lastPos!.y };
        }
      }
    }

    if (this.particleLayers.length > 0) {
      this._updateParticleLayers(dt);
    } else {
      this._updateStars(dt);
    }

    let anyAlive = pts.length > 0;
    if (!anyAlive) {
      if (this.particleLayers.length > 0) {
        for (const L of this.particleLayers) {
          if (L._particles.length > 0) { anyAlive = true; break; }
        }
      } else if (this.stars.length > 0) {
        anyAlive = true;
      }
    }
    this.done = !this.isPressed && !anyAlive;
    return !this.done;
  }

  _updateStars(dt: number) {
    if (this.isPressed && this.activated && this.lastPos) {
      const dist = this.lastEmitPos
        ? Math.hypot(this.lastPos.x - this.lastEmitPos.x,
          this.lastPos.y - this.lastEmitPos.y)
        : Infinity;
      if (dist >= this.starSpacing) {
        const steps = Math.floor(dist / this.starSpacing);
        const dx = this.lastPos.x - this.lastEmitPos!.x;
        const dy = this.lastPos.y - this.lastEmitPos!.y;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          this._spawnStar(this.lastEmitPos!.x + dx * t,
            this.lastEmitPos!.y + dy * t);
        }
        const finalT = steps * this.starSpacing / dist;
        this.lastEmitPos = {
          x: this.lastEmitPos!.x + dx * finalT,
          y: this.lastEmitPos!.y + dy * finalT,
        };
        this.timeAccum = 0;
      } else {
        this.timeAccum += dt;
        while (this.timeAccum >= this.starInterval) {
          this.timeAccum -= this.starInterval;
          this._spawnStar(this.lastPos.x, this.lastPos.y);
          this.lastEmitPos = { x: this.lastPos.x, y: this.lastPos.y };
        }
      }
    } else {
      this.timeAccum = 0;
    }
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i];
      s.age += dt;
      if (s.age >= s.life) { this.stars.splice(i, 1); continue; }
      if (s.vx || s.vy) {
        const d = Math.exp(-this.starDrag * dt);
        s.vx *= d; s.vy *= d;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
      s.rot += s.rotSpeed * dt;
    }
  }

  _updateParticleLayers(dt: number) {
    const isEmitting = this.isPressed && this.activated && this.lastPos;
    for (const L of this.particleLayers) {
      if (isEmitting && L.rate > 0) {
        L._timeAccum += dt;
        const interval = 1 / L.rate;
        const prev = L._lastEmitPos || { x: this.lastPos!.x, y: this.lastPos!.y };
        const dx = this.lastPos!.x - prev.x;
        const dy = this.lastPos!.y - prev.y;
        const dist = Math.hypot(dx, dy);
        const timeTriggered = L._timeAccum >= interval;
        const distTriggered = dist >= L.emitSpacing;
        if (timeTriggered || distTriggered) {
          if (timeTriggered) L._timeAccum -= interval;
          const steps = Math.max(1, Math.ceil(dist / L.emitSpacing));
          for (let i = 0; i < steps; i++) {
            const t = (i + 1) / steps;
            this._spawnLayerParticle(L, prev.x + dx * t, prev.y + dy * t);
          }
          L._lastEmitPos = { x: this.lastPos!.x, y: this.lastPos!.y };
        }
      } else {
        L._timeAccum = 0;
        L._lastEmitPos = this.lastPos
          ? { x: this.lastPos.x, y: this.lastPos.y } : null;
      }

      const arr = L._particles;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.age += dt;
        if (p.age >= p.life) { arr.splice(i, 1); continue; }
        if (p.drag > 0) {
          const d = Math.exp(-p.drag * dt);
          p.vx *= d; p.vy *= d;
        }
        if (L.gravity) p.vy += L.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.rotSpeed * dt;
      }
    }
  }

  _spawnLayerParticle(L: any, x: number, y: number) {
    const angle = Math.random() * TAU;
    const radius = L.shapeRadius * Math.sqrt(Math.random());
    const speed = rand(L.speedMin, L.speedMax);
    const frames = L.tileX * L.tileY;
    const fixedFrame = (L.frameMode === 'fixed' && frames > 1)
      ? Math.floor(Math.random() * frames) : 0;
    L._particles.push({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: rand(L.lifeMin, L.lifeMax),
      startSize: rand(L.sizeMin, L.sizeMax),
      rot: rand(L.startRotMin, L.startRotMax),
      rotSpeed: rand(L.rotSpeedMin, L.rotSpeedMax),
      fixedFrame,
    });
  }

  _spawnStar(x: number, y: number) {
    const speed = rand(this.starSpeedMin, this.starSpeedMax);
    const ang = Math.random() * TAU;
    const jitter = this.starJitter;
    const color = (this.starColors && this.starColors.length > 0)
      ? this.starColors[Math.floor(Math.random() * this.starColors.length)]
      : null;
    const star: any = {
      x: x + rand(-jitter, jitter),
      y: y + rand(-jitter, jitter),
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      age: 0,
      life: rand(this.starLifeMin, this.starLifeMax),
      size: rand(this.starSizeMin, this.starSizeMax),
      rot: rand(this.starRotMin, this.starRotMax),
      rotSpeed: rand(this.starRotSpeedMin, this.starRotSpeedMax),
      frameOffset: Math.random(),
    };
    if (this.frameMode === 'fixed') {
      star.fixedFrame = this._pickFixedFrame();
    }
    if (color) star.color = color;
    this.stars.push(star);
  }

  _pickFixedFrame(): number {
    const start = this.spriteFrameStart;
    const frames = this.spriteFrames;
    const w = this.fixedFrameWeights;
    if (!w || w.length === 0) {
      return start + Math.floor(Math.random() * frames);
    }
    let total = 0;
    for (const [, ww] of w) total += ww;
    let r = Math.random() * total;
    for (const [f, ww] of w) {
      r -= ww;
      if (r <= 0) return start + f;
    }
    return start + w[w.length - 1][0];
  }

  _starAlpha(t: number): number {
    const s = this.starFadeStart;
    const e = this.starFadeEnd;
    if (t < s) return this.starBaseAlpha;
    if (t < e) return this.starBaseAlpha * (1 - (t - s) / (e - s));
    return 0;
  }

  _drawStars(ctx: CanvasRenderingContext2D) {
    if (!this.sprite || this.stars.length === 0) return;
    const sprite = this.sprite;
    const tileX = this.spriteTileX;
    const tileY = this.spriteTileY;
    const fw = sprite.width / tileX;
    const fh = sprite.height / tileY;
    ctx.save();
    ctx.globalCompositeOperation = this.ribbonBlend;
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const t = s.age / s.life;
      const alpha = this._starAlpha(t);
      if (alpha < 0.01) continue;
      const size = s.size * 0.9 * (1 - t * this.starShrink);
      if (size < 0.5) continue;
      let drawSprite: HTMLImageElement | HTMLCanvasElement = sprite;
      if (s.color) {
        const tinted = getTinted(sprite, s.color);
        if (tinted) drawSprite = tinted;
      }
      let frame: number;
      if (this.frameMode === 'fixed') {
        frame = s.fixedFrame;
      } else {
        frame = this.spriteFrameStart
          + Math.floor(((s.frameOffset + t * this.frameRate) % 1)
            * this.spriteFrames);
      }
      const col = frame % tileX;
      const row = Math.floor(frame / tileX);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(s.x, s.y);
      if (s.rot) ctx.rotate(s.rot);
      ctx.drawImage(drawSprite,
        col * fw, row * fh, fw, fh,
        -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    ctx.restore();
  }

  _drawParticleLayers(ctx: CanvasRenderingContext2D) {
    for (const L of this.particleLayers) {
      if (!L.sprite || L._particles.length === 0) continue;
      const sprite = L.sprite;
      const fw = sprite.width / L.tileX;
      const fh = sprite.height / L.tileY;
      const prevBlend = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = L.blendMode;
      for (const p of L._particles) {
        const t = p.age / p.life;
        const size = p.startSize * L.sizeCurve(t);
        const alpha = L.alphaCurve(t);
        if (alpha < 0.01 || size < 0.5) continue;
        let drawSprite: HTMLImageElement | HTMLCanvasElement = sprite;
        if (L.colorCurve) {
          const c = L.colorCurve(t);
          drawSprite = getTinted(sprite, c) || sprite;
        } else if (L.tint) {
          drawSprite = getTinted(sprite, L.tint) || sprite;
        }
        const col = p.fixedFrame % L.tileX;
        const row = Math.floor(p.fixedFrame / L.tileX);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        if (p.rot) ctx.rotate(p.rot);
        ctx.drawImage(drawSprite,
          col * fw, row * fh, fw, fh,
          -size / 2, -size / 2, size, size);
        ctx.restore();
      }
      ctx.globalCompositeOperation = prevBlend;
    }
  }

  _drawRibbon(ctx: CanvasRenderingContext2D) {
    const pts = this.points;
    if (pts.length < 2) return;
    if (!this.ribbonColors || this.ribbonColors.length === 0) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = this.ribbonBlend;
    for (let L = 0; L < this.ribbonLayers.length; L++) {
      const { widthMul, alpha, blur } = this.ribbonLayers[L];
      ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none';
      ctx.globalAlpha = alpha * this.ribbonAlpha * this.ribbonBright;
      for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1], b = pts[k];
        const fresh = 1 - (b.age / this.pointLife);
        if (fresh <= 0.05) continue;
        const col = this._colorAt(fresh, this.ribbonColors);
        const w = this.ribbonWidth * widthMul * Math.pow(fresh, 1.6);
        if (w < 0.6) continue;
        ctx.strokeStyle = col;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    ctx.filter = 'none';
    ctx.restore();
  }

  _colorAt(t: number, colors: { t: number; color: string }[]): string {
    if (t <= colors[0].t) return colors[0].color;
    if (t >= colors[colors.length - 1].t) return colors[colors.length - 1].color;
    for (let i = 0; i < colors.length - 1; i++) {
      const c0 = colors[i], c1 = colors[i + 1];
      if (t >= c0.t && t <= c1.t) {
        const lt = (t - c0.t) / (c1.t - c0.t);
        return this._lerp(c0.color, c1.color, lt);
      }
    }
    return colors[colors.length - 1].color;
  }

  _lerp(c0: string, c1: string, t: number): string {
    const p0 = this._parse(c0), p1 = this._parse(c1);
    if (!p0 || !p1) return c0;
    const r = Math.round(p0.r + (p1.r - p0.r) * t);
    const g = Math.round(p0.g + (p1.g - p0.g) * t);
    const b = Math.round(p0.b + (p1.b - p0.b) * t);
    const a = p0.a + (p1.a - p0.a) * t;
    return `rgba(${r},${g},${b},${a})`;
  }

  _parse(str: string): { r: number; g: number; b: number; a: number } | null {
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(s => parseFloat(s.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p[3] !== undefined ? p[3] : 1 };
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.activated) return;
    if (this.particleLayers.length > 0) {
      if (this.ribbonOnTop) {
        this._drawParticleLayers(ctx);
        this._drawRibbon(ctx);
      } else {
        this._drawRibbon(ctx);
        this._drawParticleLayers(ctx);
      }
      return;
    }
    if (this.ribbonOnTop) {
      this._drawStars(ctx);
      this._drawRibbon(ctx);
    } else {
      this._drawRibbon(ctx);
      this._drawStars(ctx);
    }
  }
}

/** 一次点击产生的完整特效容器 */
export class TouchEffect {
  x: number;
  y: number;
  emitters: Emitter[];

  constructor(x: number, y: number, emitters: Emitter[]) {
    this.x = x;
    this.y = y;
    this.emitters = emitters;
  }

  update(dt: number): boolean {
    let alive = false;
    for (const e of this.emitters) {
      e.update(dt);
      if (!e.done) alive = true;
    }
    return alive;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    for (const e of this.emitters) e.draw(ctx);
    ctx.restore();
  }
}

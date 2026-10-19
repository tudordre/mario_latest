import { Application, Container, Graphics, Text } from 'pixi.js';
import {
  GROUND_Y,
  TILE,
  VIEW_H,
  VIEW_W,
  WORLD_THEMES,
} from './constants.js';

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.app = null;
    this.theme = WORLD_THEMES[0];

    // Screen Shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  async init() {
    this.app = new Application();
    await this.app.init({
      canvas: this.canvas,
      width: VIEW_W,
      height: VIEW_H,
      preference: 'webgl',
      background: '#5c94fc',
      roundPixels: true,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Scene Graph Hierarchy
    this.stage = this.app.stage;

    // 1. Sky & Parallax Background (fixed to viewport)
    this.skyGfx = new Graphics();
    this.hillsGfx = new Graphics();
    this.cloudsGfx = new Graphics();
    this.stage.addChild(this.skyGfx);
    this.stage.addChild(this.hillsGfx);
    this.stage.addChild(this.cloudsGfx);

    // 2. Main World Container (translated by Camera + Screen Shake)
    this.worldContainer = new Container();
    this.stage.addChild(this.worldContainer);

    this.undergroundGfx = new Graphics();
    this.pitGfx = new Graphics();
    this.platformGfx = new Graphics();
    this.shadowGfx = new Graphics();  // Dynamic drop shadows
    this.finishGfx = new Graphics();
    this.trailGfx = new Graphics();   // Motion blur afterimages
    this.coinGfx = new Graphics();
    this.wingsGfx = new Graphics();
    this.animalGfx = new Graphics();
    this.birdGfx = new Graphics();
    this.burstCoinGfx = new Graphics();
    this.projectileGfx = new Graphics();
    this.particleGfx = new Graphics();
    this.playerGfx = new Graphics();

    this.worldContainer.addChild(this.undergroundGfx);
    this.worldContainer.addChild(this.pitGfx);
    this.worldContainer.addChild(this.platformGfx);
    this.worldContainer.addChild(this.shadowGfx);
    this.worldContainer.addChild(this.finishGfx);
    this.worldContainer.addChild(this.trailGfx);
    this.worldContainer.addChild(this.coinGfx);
    this.worldContainer.addChild(this.wingsGfx);
    this.worldContainer.addChild(this.animalGfx);
    this.worldContainer.addChild(this.birdGfx);
    this.worldContainer.addChild(this.burstCoinGfx);
    this.worldContainer.addChild(this.projectileGfx);
    this.worldContainer.addChild(this.particleGfx);
    this.worldContainer.addChild(this.playerGfx);

    // 3. UI Overlay Container (e.g. underground banner text)
    this.uiContainer = new Container();
    this.stage.addChild(this.uiContainer);

    this.undergroundTitle = new Text({
      text: 'SUBTERAN  •  ALEARGĂ ȘI ADUNĂ BANII',
      style: {
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffe066,
      },
    });
    this.undergroundTitle.anchor.set(0.5, 0);
    this.undergroundTitle.position.set(VIEW_W / 2, 24);

    this.undergroundSubtitle = new Text({
      text: '← → / A D pentru mișcare  •  ↑ / W pentru săritură',
      style: {
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    this.undergroundSubtitle.anchor.set(0.5, 0);
    this.undergroundSubtitle.position.set(VIEW_W / 2, 54);

    this.uiContainer.addChild(this.undergroundTitle);
    this.uiContainer.addChild(this.undergroundSubtitle);
    this.uiContainer.visible = false;
  }

  /**
   * Trigger screen shake impulse
   * @param {number} intensity
   * @param {number} duration
   */
  shake(intensity = 6, duration = 0.2) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  /**
   * Main render call
   * @param {import('./world.js').World} world
   * @param {import('./player.js').Player} player
   * @param {number} cameraX
   * @param {import('./particles.js').ParticleManager} particles
   * @param {number} dt
   */
  draw(world, player, cameraX, particles, dt) {
    if (!this.app) return;

    // Update screen shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const factor = this.shakeDuration > 0 ? this.shakeIntensity : 0;
      this.shakeOffsetX = (Math.random() - 0.5) * factor * 2;
      this.shakeOffsetY = (Math.random() - 0.5) * factor * 2;
    } else {
      this.shakeIntensity = 0;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    const cam = Math.floor(cameraX);
    this.theme = WORLD_THEMES[(world.worldNumber - 1) % WORLD_THEMES.length];

    if (world.underground) {
      this.skyGfx.visible = false;
      this.hillsGfx.visible = false;
      this.cloudsGfx.visible = false;
      this.uiContainer.visible = true;

      this.worldContainer.position.set(this.shakeOffsetX, this.shakeOffsetY);
      this._drawUnderground(world, player, particles);
      return;
    }

    this.skyGfx.visible = true;
    this.hillsGfx.visible = true;
    this.cloudsGfx.visible = true;
    this.uiContainer.visible = false;
    this.undergroundGfx.clear();

    // Camera transform on World Container
    this.worldContainer.position.set(-cam + this.shakeOffsetX, this.shakeOffsetY);

    this._drawSky();
    this._drawHills(world, cam);
    this._drawClouds(world, cam);
    this._drawPits(world, cam);
    this._drawPlatforms(world, cam);
    this._drawShadows(world, player, cam);
    this._drawFinish(world, cam);
    this._drawTrail(player);
    this._drawCoins(world, cam);
    this._drawBurstCoins(world);
    this._drawWingsPickup(world, cam);
    this._drawAnimals(world, cam);
    this._drawBird(world, cam);
    this._drawProjectiles(world, cam);
    this._drawParticles(particles, cam);
    this._drawPlayer(player);
  }

  _drawSky() {
    const g = this.skyGfx;
    g.clear();
    const topColor = parseInt(this.theme.sky[0].replace('#', '0x'));
    const btmColor = parseInt(this.theme.sky[1].replace('#', '0x'));
    g.rect(0, 0, VIEW_W, VIEW_H * 0.5).fill(topColor);
    g.rect(0, VIEW_H * 0.5, VIEW_W, VIEW_H * 0.5).fill(btmColor);
  }

  _drawHills(world, cam) {
    const g = this.hillsGfx;
    g.clear();
    const hillColor = parseInt(this.theme.hill.replace('#', '0x'));
    const shadowColor = parseInt(this.theme.hillShadow.replace('#', '0x'));

    for (const h of world.hills) {
      const x = h.x - cam * 0.2;
      if (x < -200 || x > VIEW_W + 200) continue;

      g.moveTo(x, h.y)
        .quadraticCurveTo(x + 70, h.y - 90, x + 140, h.y)
        .fill(hillColor);

      g.moveTo(x + 40, h.y)
        .quadraticCurveTo(x + 100, h.y - 60, x + 180, h.y)
        .fill(shadowColor);
    }
  }

  _drawClouds(world, cam) {
    const g = this.cloudsGfx;
    g.clear();
    for (const c of world.clouds) {
      const x = c.x - cam * 0.35;
      if (x < -120 || x > VIEW_W + 120) continue;

      g.circle(x, c.y, 18).fill({ color: 0xffffff, alpha: 0.92 });
      g.circle(x + 22, c.y - 8, 22).fill({ color: 0xffffff, alpha: 0.92 });
      g.circle(x + 48, c.y, 16).fill({ color: 0xffffff, alpha: 0.92 });
      g.circle(x + 24, c.y + 6, 14).fill({ color: 0xffffff, alpha: 0.92 });
    }
  }

  _drawPits(world, cam) {
    const g = this.pitGfx;
    g.clear();
    const groundTop = GROUND_Y * TILE;
    for (const pit of world.pits) {
      if (pit.x + pit.w < cam - 100 || pit.x > cam + VIEW_W + 100) continue;
      g.rect(pit.x, groundTop, pit.w, VIEW_H - groundTop).fill(0x1a1020);
      for (let i = 0; i < pit.w; i += 8) {
        g.rect(pit.x + i, groundTop, 4, 6 + (i % 16)).fill(0x2a1830);
      }
    }
  }

  _drawPlatforms(world, cam) {
    const g = this.platformGfx;
    g.clear();

    const dirtColor = parseInt(this.theme.dirt.replace('#', '0x'));
    const grassColor = parseInt(this.theme.grass.replace('#', '0x'));
    const grassLight = parseInt(this.theme.grassLight.replace('#', '0x'));
    const speckColor = parseInt(this.theme.speck.replace('#', '0x'));

    for (const p of world.platforms) {
      if (p.x + p.w < cam - 40 || p.x > cam + VIEW_W + 40) continue;

      if (p.type === 'ground') {
        g.rect(p.x, p.y, p.w, p.h).fill(dirtColor);
        g.rect(p.x, p.y, p.w, 8).fill(grassColor);
        for (let i = 0; i < p.w; i += 8) {
          g.rect(p.x + i, p.y, 4, 4).fill(grassLight);
        }
        for (let i = 0; i < p.w; i += 16) {
          g.rect(p.x + i + 4, p.y + 20, 3, 3).fill(speckColor);
          g.rect(p.x + i + 10, p.y + 36, 2, 2).fill(speckColor);
        }
      } else if (p.type === 'brick') {
        g.rect(p.x, p.y, p.w, p.h).fill(0xc84c0c);
        g.rect(p.x + 1, p.y + 1, p.w - 2, p.h - 2).stroke({ color: 0x8b2e05, width: 2 });
        g.rect(p.x + 2, p.y + p.h / 2 - 1, p.w - 4, 2).fill(0xf0d0a0);
        g.rect(p.x + p.w / 2 - 1, p.y + 2, 2, p.h / 2 - 3).fill(0xf0d0a0);
        g.rect(p.x + 3, p.y + 3, p.w * 0.35, 4).fill({ color: 0xffffff, alpha: 0.3 });
      } else if (p.type === 'pipeTop') {
        g.rect(p.x, p.y, p.w, p.h).fill(0x00a800);
        g.rect(p.x + 4, p.y + 3, 8, p.h - 6).fill(0x80d010);
        g.rect(p.x + p.w - 12, p.y + 3, 8, p.h - 6).fill(0x007000);
        g.rect(p.x + 1, p.y + 1, p.w - 2, p.h - 2).stroke({ color: 0x004000, width: 2 });
      } else if (p.type === 'pipe') {
        g.rect(p.x, p.y, p.w, p.h).fill(0x00a800);
        g.rect(p.x + 6, p.y, 10, p.h).fill(0x80d010);
        g.rect(p.x + p.w - 14, p.y, 8, p.h).fill(0x007000);
        for (let yy = p.y + 10; yy < p.y + p.h; yy += 18) {
          g.rect(p.x + 2, yy, p.w - 4, 2).fill(0x004000);
        }
      }
    }
  }

  /**
   * Dynamic drop shadows beneath all grounded & airborne entities
   */
  _drawShadows(world, player, cam) {
    const g = this.shadowGfx;
    g.clear();
    const groundY = GROUND_Y * TILE;

    const entities = [
      ...world.animals.filter((a) => a.alive),
      ...(world.bird ? [world.bird] : []),
      player,
    ];

    for (const ent of entities) {
      if (ent.x + ent.w < cam - 40 || ent.x > cam + VIEW_W + 40) continue;
      const feetY = ent.y + ent.h;
      let surfaceY = groundY;
      for (const p of world.platforms) {
        if (ent.x + ent.w > p.x && ent.x < p.x + p.w && p.y >= feetY - 4) {
          if (p.y < surfaceY) surfaceY = p.y;
        }
      }
      const dist = surfaceY - feetY;
      if (dist >= -6 && dist < 220) {
        const factor = Math.max(0, 1 - dist / 220);
        const sw = ent.w * 0.45 * (0.55 + 0.45 * factor);
        const sh = 4.5 * (0.6 + 0.4 * factor);
        const alpha = 0.28 * factor;
        const cx = ent.x + ent.w / 2;
        g.ellipse(cx, surfaceY + 2, sw, sh).fill({ color: 0x000000, alpha });
      }
    }
  }

  /**
   * Motion blur ghost afterimages for high speed, flying, or bird riding
   */
  _drawTrail(player) {
    const g = this.trailGfx;
    g.clear();
    if (!player.trail || player.trail.length === 0) return;

    for (const t of player.trail) {
      const isFire = t.form === 'fire';
      const col = t.hasWings ? 0x88ccff : isFire ? 0xff6600 : 0x2277ee;
      const alpha = t.alpha * 0.38;
      const cx = t.x + t.w / 2;
      const cy = t.y + t.h / 2;
      const rx = t.w * 0.5 * (t.squashX || 1);
      const ry = t.h * 0.45 * (t.squashY || 1);
      g.ellipse(cx, cy, rx, ry).fill({ color: col, alpha });
    }
  }

  _drawFinish(world, cam) {
    const finish = world.finish;
    if (!finish) return;
    const g = this.finishGfx;
    g.clear();

    const groundY = GROUND_Y * TILE;
    if (finish.flagX + 60 > cam - 40 && finish.flagX < cam + VIEW_W + 40) {
      g.rect(finish.flagX - 6, groundY - 8, 18, 8).fill(0x888888);
      g.rect(finish.flagX, finish.flagTopY, 6, groundY - finish.flagTopY).fill(0xe8e8e8);
      g.circle(finish.flagX + 3, finish.flagTopY, 8).fill(0xffe066);
      g.moveTo(finish.flagX + 6, finish.flagTopY + 4)
        .lineTo(finish.flagX + 62, finish.flagTopY + 20)
        .lineTo(finish.flagX + 6, finish.flagTopY + 38)
        .closePath()
        .fill(0xe52521);
    }

    const hx = finish.houseX;
    const hy = groundY - 100;
    if (hx + 140 > cam - 60 && hx < cam + VIEW_W + 60) {
      g.rect(hx, hy + 34, 112, 66).fill(0xf4d5a0);
      g.moveTo(hx - 12, hy + 36)
        .lineTo(hx + 56, hy)
        .lineTo(hx + 124, hy + 36)
        .closePath()
        .fill(0xa63835);
      g.rect(hx + 43, hy + 62, 26, 38).fill(0x71432f);
      g.rect(hx + 14, hy + 48, 20, 18).fill(0x9bdcf0);
      g.rect(hx + 78, hy + 48, 20, 18).fill(0x9bdcf0);
      g.rect(hx + 23, hy + 48, 2, 18).fill(0x555555);
      g.rect(hx + 87, hy + 48, 2, 18).fill(0x555555);
    }
  }

  _drawCoins(world, cam) {
    const g = this.coinGfx;
    g.clear();
    const t = performance.now() / 1000;
    const coins = world.coins;

    for (const c of coins) {
      if (c.taken) continue;
      if (c.x + c.w < cam - 20 || c.x > cam + VIEW_W + 20) continue;

      const spin = 0.55 + 0.45 * Math.abs(Math.sin(t * 6 + c.x * 0.05));
      const w = c.w * spin;
      const h = c.h;
      const cx = c.x + c.w / 2;
      const cy = c.y + h / 2 + Math.sin(t * 4 + c.x * 0.08) * 2;

      g.ellipse(cx, cy, w / 2, h / 2).fill(0xf4c400);
      g.ellipse(cx, cy, w / 2, h / 2).stroke({ color: 0xb8860b, width: 1.5 });
      g.ellipse(cx - w * 0.1, cy - h * 0.15, w * 0.25, h * 0.2).fill(0xffe566);
    }
  }

  _drawBurstCoins(world) {
    const g = this.burstCoinGfx;
    g.clear();
    for (const c of world.burstCoins) {
      const alpha = Math.max(0, Math.min(1, c.life));
      const spin = 0.55 + 0.45 * Math.abs(Math.sin(c.spin));
      const w = 10 * spin;
      const h = 12;

      g.ellipse(c.x, c.y, w / 2, h / 2).fill({ color: 0xf4c400, alpha });
      g.ellipse(c.x - 1, c.y - 2, w * 0.2, h * 0.15).fill({ color: 0xffe566, alpha });
    }
  }

  _drawWingsPickup(world, cam) {
    const w = world.wingsPickup;
    if (!w || w.taken) return;
    if (w.x + w.w < cam - 40 || w.x > cam + VIEW_W + 40) return;

    const g = this.wingsGfx;
    g.clear();
    const y = w.y + Math.sin(w.bob) * 6;
    const cx = w.x + w.w / 2;
    const cy = y + w.h / 2;
    const flap = Math.sin(w.bob * 3) * 10;

    // Outer magical glow
    g.circle(cx, cy, 22).fill({ color: 0x88ccff, alpha: 0.25 });

    // Left wing
    g.moveTo(cx - 2, cy + 2)
      .quadraticCurveTo(cx - 22, cy - 8 + flap, cx - 28, cy + 4)
      .quadraticCurveTo(cx - 20, cy + 14, cx - 2, cy + 8)
      .closePath()
      .fill(0xf0f4ff);
    // Right wing
    g.moveTo(cx + 2, cy + 2)
      .quadraticCurveTo(cx + 22, cy - 8 - flap, cx + 28, cy + 4)
      .quadraticCurveTo(cx + 20, cy + 14, cx + 2, cy + 8)
      .closePath()
      .fill(0xf0f4ff);

    // Pink tips
    g.circle(cx - 24, cy + 2 + flap * 0.3, 4).fill(0xffb6c8);
    g.circle(cx + 24, cy + 2 - flap * 0.3, 4).fill(0xffb6c8);
  }

  /**
   * Realistic, adorable and expressive animals with waddling, hopping and eye blinking
   */
  _drawAnimals(world, cam) {
    const g = this.animalGfx;
    g.clear();
    const t = performance.now() / 1000;

    for (const a of world.animals) {
      if (!a.alive) continue;
      if (a.x + a.w < cam - 40 || a.x > cam + VIEW_W + 40) continue;

      const face = a.vx >= 0 ? 1 : -1;
      const cx = Math.floor(a.x + a.w / 2);

      // --- TURTLE (KOOPA TROOPA STYLE) ---
      if (a.color === 'turtle') {
        const neckBob = a.neckBob || 0;
        const cy = Math.floor(a.y + a.h / 2);
        const legWalk = Math.sin(a.anim * 1.6) * 4;

        // Feet with scaled claws
        g.rect(cx - 9 - legWalk, cy + a.h / 2 - 5, 7, 5).fill(0x357830);
        g.rect(cx + 2 + legWalk, cy + a.h / 2 - 5, 7, 5).fill(0x357830);
        g.rect(cx - 10 - legWalk, cy + a.h / 2 - 2, 2, 2).fill(0xffffff); // Claws
        g.rect(cx + 8 + legWalk, cy + a.h / 2 - 2, 2, 2).fill(0xffffff);

        // Plastron (yellow/orange underside)
        g.ellipse(cx - face * 3, cy + 4, a.w * 0.36, a.h * 0.22).fill(0xf0a83a);
        g.rect(cx - face * 10, cy + 3, 15, 2).fill(0xc48020);

        // Carapace (3D domed shell with dark green rim and hexagonal plates)
        g.ellipse(cx - face * 2, cy - 2, a.w * 0.42, a.h * 0.38).fill(0x1a5223); // Dark rim
        g.ellipse(cx - face * 2, cy - 3, a.w * 0.36, a.h * 0.34).fill(0x4cb83c); // Bright lime dome

        // Carapace plate seams
        g.circle(cx - face * 2, cy - 4, 4).fill(0x338c26);
        g.moveTo(cx - face * 2, cy - 8).lineTo(cx - face * 2, cy).stroke({ color: 0x1a5223, width: 1.5 });
        g.moveTo(cx - face * 8, cy - 4).lineTo(cx + face * 4, cy - 4).stroke({ color: 0x1a5223, width: 1.5 });

        // Head with neck extension
        const hx = cx + face * (11 + neckBob);
        const hy = cy - 2;
        g.circle(hx, hy, 6.5).fill(0x62bd40);
        g.moveTo(hx + face * 3, hy).lineTo(hx + face * 7, hy + 2).lineTo(hx + face * 3, hy + 4).fill(0xf5b838); // Beak mouth

        // Eye
        if (a.isBlinking) {
          g.moveTo(hx + face * 1, hy - 2).lineTo(hx + face * 4, hy - 2).stroke({ color: 0x111111, width: 1.5 });
        } else {
          g.circle(hx + face * 2, hy - 2, 2.8).fill(0xffffff);
          g.circle(hx + face * 2.8, hy - 2, 1.4).fill(0x111111);
          g.circle(hx + face * 3.2, hy - 2.5, 0.7).fill(0xffffff); // Glint
        }
        continue;
      }

      // --- ORANGE POWER-UP CREATURE ---
      if (a.color === 'orange') {
        const hopY = a.hopY || 0;
        const cy = Math.floor(a.y + a.h / 2 - hopY);

        // Pulsing magical aura around power-up
        const auraPulse = 0.2 + 0.12 * Math.sin(t * 8 + a.x);
        g.circle(cx, cy, 20).fill({ color: 0xffaa00, alpha: auraPulse });
        // Floating sparkle star
        const sparkY = cy - 14 - Math.abs(Math.sin(t * 4 + a.x)) * 8;
        g.circle(cx + Math.cos(t * 5) * 10, sparkY, 1.8).fill(0xfff066);

        // Soft orange body with top highlight
        g.ellipse(cx, cy, a.w / 2, a.h / 2).fill(0xff851b);
        g.ellipse(cx, cy - 4, a.w * 0.38, a.h * 0.28).fill(0xffa84d);

        // Fluffy cream chest
        g.ellipse(cx + face * 2, cy + 3, a.w * 0.28, a.h * 0.26).fill(0xffecc2);

        // Pointed fox/cat ears
        g.moveTo(cx - 8, cy - 6).lineTo(cx - 6, cy - 15).lineTo(cx - 1, cy - 6).fill(0xcc5500);
        g.moveTo(cx - 6, cy - 8).lineTo(cx - 5, cy - 13).lineTo(cx - 2, cy - 8).fill(0xffc878);
        g.moveTo(cx + 1, cy - 6).lineTo(cx + 6, cy - 15).lineTo(cx + 8, cy - 6).fill(0xcc5500);
        g.moveTo(cx + 2, cy - 8).lineTo(cx + 5, cy - 13).lineTo(cx + 6, cy - 8).fill(0xffc878);

        // Rosy cheeks
        g.circle(cx - face * 6, cy + 2, 2.5).fill({ color: 0xff7088, alpha: 0.65 });
        g.circle(cx + face * 6, cy + 2, 2.5).fill({ color: 0xff7088, alpha: 0.65 });

        // Sparkling anime-style eyes
        if (a.isBlinking) {
          g.moveTo(cx + face * 1, cy - 3).lineTo(cx + face * 6, cy - 3).stroke({ color: 0x4a1800, width: 1.5 });
        } else {
          g.circle(cx + face * 4, cy - 3, 3.2).fill(0xffffff);
          g.circle(cx + face * 4.5, cy - 3, 2.0).fill(0x381200);
          g.circle(cx + face * 5.0, cy - 4.0, 1.0).fill(0xffffff); // Star catchlight
          g.circle(cx + face * 3.8, cy - 2.0, 0.6).fill(0xffffff);
        }

        // Cute dark feet
        g.rect(cx - 9, cy + a.h / 2 - 4, 7, 4).fill(0x993d00);
        g.rect(cx + 2, cy + a.h / 2 - 4, 7, 4).fill(0x993d00);
        continue;
      }

      // --- GREEN HOSTILE CREATURE ---
      const waddle = a.waddleAngle || 0;
      const cy = Math.floor(a.y + a.h / 2);
      const legWalk = Math.sin(a.anim * 1.5) * 3;

      // 3D Spherical moss green body
      g.ellipse(cx, cy, a.w / 2, a.h / 2).fill(0x287a32);
      g.ellipse(cx, cy - 4, a.w * 0.38, a.h * 0.28).fill(0x429e4d); // Top light

      // Light lime belly tufts
      g.ellipse(cx + face * 2, cy + 3, a.w * 0.26, a.h * 0.26).fill(0x8fe05c);

      // Curved horns with tip highlights
      g.moveTo(cx - 9, cy - 5).lineTo(cx - 6, cy - 14).lineTo(cx - 1, cy - 5).fill(0x18471f);
      g.moveTo(cx + 1, cy - 5).lineTo(cx + 6, cy - 14).lineTo(cx + 9, cy - 5).fill(0x18471f);

      // Expressive eyes
      if (a.isBlinking) {
        g.moveTo(cx + face * 1, cy - 3).lineTo(cx + face * 6, cy - 3).stroke({ color: 0x111111, width: 1.5 });
      } else {
        g.circle(cx + face * 3.5, cy - 3, 3.2).fill(0xfff8d0); // Yellowish sclera
        g.circle(cx + face * 4.5, cy - 3, 1.8).fill(0x111111); // Black pupil
        g.circle(cx + face * 5.0, cy - 3.8, 0.8).fill(0xffffff); // Glint
      }

      // Tiny fangs
      g.moveTo(cx + face * 3, cy + 3).lineTo(cx + face * 4.5, cy + 6).lineTo(cx + face * 6, cy + 3).fill(0xffffff);

      // Waddling feet
      g.rect(cx - 9 - legWalk, cy + a.h / 2 - 4, 7, 4).fill(0x18471f);
      g.rect(cx + 2 + legWalk, cy + a.h / 2 - 4, 7, 4).fill(0x18471f);
    }
  }

  /**
   * Majestic rideable giant bird with flight plumage, sharp raptor beak, and wind crest
   */
  _drawBird(world, cam) {
    const bird = world.bird;
    if (!bird) return;
    if (bird.x + bird.w < cam - 60 || bird.x > cam + VIEW_W + 60) return;

    const g = this.birdGfx;
    g.clear();

    const face = bird.facing >= 0 ? 1 : -1;
    const flap = Math.sin(bird.anim) * (bird.h * 0.1);
    const fleeing = bird.state === 'fleeing';
    const hw = bird.w / 2;
    const hh = bird.h / 2;
    const cx = Math.floor(bird.x + hw);
    const cy = Math.floor(bird.y + hh);

    const bodyCol = fleeing ? 0x687895 : 0x2267b2;
    const headCol = fleeing ? 0x687895 : 0x1a589e;
    const wingCol = fleeing ? 0x485875 : 0x164c8c;

    // Body with plumage gradient
    g.ellipse(cx, cy + hh * 0.1, hw * 0.78, hh * 0.7).fill(bodyCol);
    g.ellipse(cx, cy + hh * 0.05, hw * 0.65, hh * 0.55).fill(fleeing ? 0x7c8ba8 : 0x337dcf);

    // Fluffy downy white chest
    g.ellipse(cx + face * hw * 0.15, cy + hh * 0.2, hw * 0.44, hh * 0.42).fill(0xd9ebfc);

    // Noble head
    g.circle(cx + face * 2, cy - hh * 0.55, hw * 0.56).fill(headCol);

    // Regal red wind crest
    const crestFlutter = Math.sin(bird.anim * 1.5) * 4;
    g.moveTo(cx - face * 4, cy - hh * 0.85)
      .quadraticCurveTo(cx - face * 14 + crestFlutter, cy - hh * 1.15, cx + face * 2, cy - hh * 0.85)
      .fill(0xd61818);

    // Golden falcon beak with curved tip and dark cere
    g.moveTo(cx + face * hw * 0.35, cy - hh * 0.6)
      .lineTo(cx + face * (hw * 0.98), cy - hh * 0.5)
      .lineTo(cx + face * hw * 0.35, cy - hh * 0.36)
      .fill(0xffaa00);
    g.circle(cx + face * (hw * 0.95), cy - hh * 0.48, 1.8).fill(0x333333); // Curved tip
    g.rect(cx + face * (hw * 0.42), cy - hh * 0.58, 2, 2).fill(0x333333); // Nostril

    // Raptor eye with golden iris
    const ex = cx + face * (hw * 0.12);
    const ey = cy - hh * 0.68;
    if (bird.isBlinking) {
      g.moveTo(ex - 3, ey).lineTo(ex + 3, ey).stroke({ color: 0x111111, width: 2 });
    } else {
      g.circle(ex, ey, 3.5).fill(0xf5b800); // Golden iris
      g.circle(ex + face * 0.5, ey, 1.8).fill(0x111111); // Pupil
      g.circle(ex + face * 1.0, ey - 1.0, 0.8).fill(0xffffff); // Glint
    }

    // Layered flapping wings
    g.ellipse(cx - face * hw * 0.25, cy, hw * 0.42, hh * 0.48 + flap).fill(wingCol);
    g.ellipse(cx - face * hw * 0.22, cy + 2, hw * 0.32, hh * 0.38 + flap).fill(fleeing ? 0x5a6a88 : 0x2462ab);

    // Scaled yellow talons with sharp claws
    g.rect(cx - face * 6, cy + hh * 0.7, 4, hh * 0.24).fill(0xffaa00);
    g.rect(cx + face * 5, cy + hh * 0.7, 4, hh * 0.24).fill(0xffaa00);
    g.rect(cx - face * 8, cy + hh * 0.92, 3, 3).fill(0x333333);
    g.rect(cx + face * 7, cy + hh * 0.92, 3, 3).fill(0x333333);
  }

  _drawProjectiles(world, cam) {
    const g = this.projectileGfx;
    g.clear();
    const t = performance.now() / 1000;

    for (const f of world.fireballs) {
      if (f.life <= 0) continue;
      if (f.x + f.w < cam - 40 || f.x > cam + VIEW_W + 40) continue;

      const cx = f.x + f.w / 2;
      const cy = f.y + f.h / 2;
      const dir = f.vx >= 0 ? 1 : -1;

      if (f.kind === 'rocket') {
        g.moveTo(cx - dir * (f.w / 2 + 4), cy - 3)
          .lineTo(cx - dir * (f.w / 2 + 14 + Math.sin(t * 30) * 3), cy)
          .lineTo(cx - dir * (f.w / 2 + 4), cy + 3)
          .fill(0xff6600);
        g.rect(cx - dir * (f.w / 2 + 8), cy - 2, 6, 4).fill(0xffcc00);

        g.rect(cx - (f.w / 2 - 2), cy - 5, f.w - 4, 10).fill(0xc0c0c0);
        g.moveTo(cx + dir * (f.w / 2 - 4), cy - 5)
          .lineTo(cx + dir * (f.w / 2 + 6), cy)
          .lineTo(cx + dir * (f.w / 2 - 4), cy + 5)
          .fill(0xe52521);
        g.rect(cx - dir * (f.w / 2), cy - 8, 6, 3).fill(0x2050f0);
        g.rect(cx - dir * (f.w / 2), cy + 5, 6, 3).fill(0x2050f0);
      } else {
        const pulse = 1 + Math.sin(t * 20 + f.x) * 0.15;
        g.circle(cx, cy, 7 * pulse).fill(0xff4400);
        g.circle(cx - 1, cy - 1, 3.5 * pulse).fill(0xffcc00);
        g.circle(cx - 2, cy - 2, 1.5).fill(0xffffff);
      }
    }
  }

  _drawParticles(particles, cam) {
    const g = this.particleGfx;
    g.clear();

    for (const p of particles.particles) {
      if (p.x < cam - 40 || p.x > cam + VIEW_W + 40) continue;
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));

      if (p.type === 'dust') {
        g.circle(p.x, p.y, p.radius * alpha).fill({ color: 0xffffff, alpha: alpha * 0.7 });
      } else if (p.type === 'debris') {
        g.rect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h).fill({ color: 0xc84c0c, alpha });
        g.rect(p.x - p.w / 2 + 1, p.y - p.h / 2 + 1, p.w - 2, p.h - 2).fill({ color: 0x8b2e05, alpha });
      } else if (p.type === 'sparkle') {
        g.circle(p.x, p.y, p.size * alpha).fill({ color: 0xffe566, alpha });
      } else if (p.type === 'star') {
        g.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size).fill({ color: 0xffdd33, alpha });
      } else if (p.type === 'spark') {
        g.circle(p.x, p.y, p.radius * alpha).fill({ color: 0xffaa00, alpha });
      } else if (p.type === 'smoke') {
        g.circle(p.x, p.y, p.radius).fill({ color: 0xcccccc, alpha: alpha * 0.5 });
      }
    }
  }

  /**
   * Ultra-detailed, realistic Mario with iconic 'M' emblem, denim overalls,
   * glossy mustache, expressive eyes, kinematics (leg swings, jumping triumph pose),
   * and squash & stretch!
   */
  _drawPlayer(player) {
    const g = this.playerGfx;
    g.clear();

    if (player.invuln > 0 && Math.floor(player.invuln * 20) % 2 === 0) {
      return;
    }

    const isFire = player.form === 'fire';
    const isBig = player.form !== 'small';
    const f = player.facing;
    const bob = player.onGround && Math.abs(player.vx) > 10 ? Math.sin(player.anim) * 1.5 : 0;
    const sit = player.onBird ? -6 : 0;

    // Kinematic squash & stretch
    const sqX = player.squashX || 1;
    const sqY = player.squashY || 1;

    // Center coordinates anchored at feet
    const cx = Math.floor(player.x + player.w / 2);
    const cy = Math.floor(player.y + player.h + sit);

    // Color definitions
    const capCol = isFire ? 0xff6600 : 0xd91414;
    const capShadow = isFire ? 0xcc4400 : 0xa60e0e;
    const shirtCol = isFire ? 0xff7700 : 0xd91414;
    const overallsCol = isFire ? 0xffffff : 0x163f96;
    const overallsShadow = isFire ? 0xd8d8e8 : 0x0c255c;
    const skinCol = 0xfad1b3;
    const skinShadow = 0xdeb092;

    const h = player.h * sqY;
    const topY = cy - h;

    // Attached Angelic Wings when winged
    if (player.hasWings) {
      const flap = Math.sin(player.anim * 1.2) * 12;
      // Soft glowing aura
      g.ellipse(cx - f * 12, topY + h * 0.45, 18, 14).fill({ color: 0x88ccff, alpha: 0.35 });
      // Wings
      g.moveTo(cx - 2, topY + h * 0.4)
        .quadraticCurveTo(cx - 26 * f, topY + h * 0.25 + flap, cx - 32 * f, topY + h * 0.42)
        .quadraticCurveTo(cx - 22 * f, topY + h * 0.65, cx - 2, topY + h * 0.52)
        .fill(0xf0f4ff);
      g.circle(cx - 28 * f, topY + h * 0.38 + flap * 0.3, 4.5).fill(0xffb2c8);
    }

    // Kinematic limb swings
    const inAir = !player.onGround;
    let legSwing = 0;
    let armSwing = 0;
    if (!inAir && Math.abs(player.vx) > 10) {
      legSwing = Math.sin(player.anim) * (isBig ? 6 : 4);
      armSwing = -legSwing;
    } else if (inAir) {
      legSwing = player.vy < 0 ? -4 : 3;
      armSwing = player.vy < 0 ? 8 : -2;
    }

    // --- LEGS & WORK BOOTS ---
    const bootCol = 0x42220f;
    const bootSole = 0x1a0d06;
    if (!isBig) {
      // Small Mario boots
      g.rect(cx - 8 - legSwing, cy - 6, 7, 5).fill(bootCol);
      g.rect(cx + 1 + legSwing, cy - 6, 7, 5).fill(bootCol);
      g.rect(cx - 9 - legSwing, cy - 2, 8, 2).fill(bootSole);
      g.rect(cx + 1 + legSwing, cy - 2, 8, 2).fill(bootSole);
    } else {
      // Big / Fire Mario boots
      g.rect(cx - 10 - legSwing, cy - 8, 9, 6).fill(bootCol);
      g.rect(cx + 2 + legSwing, cy - 8, 9, 6).fill(bootCol);
      g.rect(cx - 11 - legSwing, cy - 3, 10, 3).fill(bootSole);
      g.rect(cx + 2 + legSwing, cy - 3, 10, 3).fill(bootSole);
      // Boot toe highlight
      g.rect(cx - 8 - legSwing, cy - 7, 3, 2).fill(0x6b3a1a);
      g.rect(cx + 4 + legSwing, cy - 7, 3, 2).fill(0x6b3a1a);
    }

    // --- DENIM OVERALLS ---
    if (!isBig) {
      // Small Mario Overalls
      g.rect(cx - 6, topY + 16, 12, 10).fill(overallsCol);
      g.rect(cx - 6, topY + 22, 12, 3).fill(overallsShadow);
      // Gold buttons
      g.circle(cx - 2, topY + 18, 1.6).fill(isFire ? 0xffd700 : 0xe8c060);
    } else {
      // Big / Fire Mario Overalls
      g.rect(cx - 9, topY + 26, 18, 18).fill(overallsCol);
      g.rect(cx - 9, topY + 38, 18, 5).fill(overallsShadow);
      // Seam stitch detail
      g.rect(cx - 4, topY + 31, 8, 1).fill({ color: 0xd4a520, alpha: 0.6 });
      // Golden brass buttons
      g.circle(cx - 4, topY + 28, 2.2).fill(0xffd700);
      g.circle(cx + 4, topY + 28, 2.2).fill(0xffd700);
      g.circle(cx - 4.5, topY + 27.5, 0.8).fill(0xffffff); // Glint
      g.circle(cx + 3.5, topY + 27.5, 0.8).fill(0xffffff);
    }

    // --- SHIRT & GLOVED ARMS ---
    if (!isBig) {
      g.rect(cx - 7, topY + 12, 14, 6).fill(shirtCol);
      // Gloved hands
      g.circle(cx - f * 8 - armSwing, topY + 16, 3).fill(0xffffff);
      g.circle(cx + f * 8 + armSwing, topY + 16, 3).fill(0xffffff);
    } else {
      g.rect(cx - 10, topY + 18, 20, 10).fill(shirtCol);
      // Sleeve folds & White Gloves
      g.rect(cx - 12, topY + 20 - armSwing * 0.5, 4, 8).fill(shirtCol);
      g.rect(cx + 8, topY + 20 + armSwing * 0.5, 4, 8).fill(shirtCol);
      g.circle(cx - 10 - armSwing, topY + 28 - armSwing * 0.5, 4.2).fill(0xffffff);
      g.circle(cx + 10 + armSwing, topY + 28 + armSwing * 0.5, 4.2).fill(0xffffff);
      g.rect(cx - 11 - armSwing, topY + 25, 4, 1.5).fill(0xdddddd); // Glove cuff
      g.rect(cx + 9 + armSwing, topY + 25, 4, 1.5).fill(0xdddddd);
    }

    // --- FACE & HAIR ---
    const faceY = isBig ? topY + 6 : topY + 4;
    const faceW = isBig ? 14 : 12;
    const faceH = isBig ? 12 : 8;
    g.rect(cx - faceW / 2, faceY, faceW, faceH).fill(skinCol);
    g.rect(cx - faceW / 2, faceY + faceH - 2, faceW, 2).fill(skinShadow); // Jawline shadow

    // Sideburns and brown hair curls
    g.rect(cx - f * (faceW / 2 + 1), faceY + 1, 3, 6).fill(0x4a2010);
    g.rect(cx - f * (faceW / 2 + 3), faceY + 4, 3, 3).fill(0x4a2010);

    // Blushing rosy cheeks
    g.circle(cx - f * 4, faceY + faceH * 0.6, 2.5).fill({ color: 0xffaa90, alpha: 0.7 });
    g.circle(cx + f * 4, faceY + faceH * 0.6, 2.5).fill({ color: 0xffaa90, alpha: 0.7 });

    // Round 3D Nose
    const noseX = cx + f * 3;
    const noseY = faceY + faceH * 0.5;
    g.circle(noseX, noseY, isBig ? 4.2 : 3.2).fill(skinCol);
    g.circle(noseX - f * 0.8, noseY - 0.8, isBig ? 1.6 : 1.2).fill(0xffffff); // Glossy highlight

    // Volumetric curved mustache
    const mustY = faceY + faceH * 0.75;
    g.ellipse(cx + f * 1, mustY, isBig ? 8 : 6, isBig ? 3.2 : 2.4).fill(0x381708);
    g.circle(cx + f * 5, mustY + 0.5, isBig ? 2.5 : 1.8).fill(0x381708);

    // Expressive Eyes with Sapphire-Blue Iris
    const eyeX = cx + f * 1;
    const eyeY = faceY + (isBig ? 4 : 2);
    if (player.isBlinking) {
      g.moveTo(eyeX - 3, eyeY + 1).lineTo(eyeX + 3, eyeY + 1).stroke({ color: 0x111111, width: 1.8 });
    } else {
      g.rect(eyeX, eyeY - 1, 4, isBig ? 5 : 4).fill(0xffffff); // Sclera
      g.rect(eyeX + f * 1, eyeY, 2.5, isBig ? 4 : 3).fill(0x166edb); // Blue iris
      g.rect(eyeX + f * 1.5, eyeY + 0.5, 1.5, isBig ? 2.5 : 2).fill(0x111111); // Pupil
      g.rect(eyeX + f * 1, eyeY, 1, 1).fill(0xffffff); // Catchlight
    }

    // --- ICONIC CAP WITH 'M' EMBLEM ---
    const capY = isBig ? topY - 3 : topY - 2;
    // Cap dome
    g.rect(cx - (isBig ? 9 : 8), capY, isBig ? 18 : 16, isBig ? 8 : 6).fill(capCol);
    g.rect(cx - (isBig ? 6 : 5), capY - 3, isBig ? 12 : 10, 4).fill(capCol);
    // Cap visor/peak
    g.rect(cx - f * 2, capY + (isBig ? 6 : 5), isBig ? 11 : 9, 3).fill(capCol);
    g.rect(cx - f * 2, capY + (isBig ? 8 : 7), isBig ? 11 : 9, 1.5).fill(capShadow); // Visor underside shadow

    // White circular badge with bold red 'M'
    const badgeX = cx + f * 0.5;
    const badgeY = capY + (isBig ? 2 : 1);
    g.circle(badgeX, badgeY, isBig ? 4.5 : 3.5).fill(0xffffff);
    // Letter 'M'
    g.moveTo(badgeX - 2.5, badgeY + 2)
      .lineTo(badgeX - 2.5, badgeY - 2)
      .lineTo(badgeX, badgeY)
      .lineTo(badgeX + 2.5, badgeY - 2)
      .lineTo(badgeX + 2.5, badgeY + 2)
      .stroke({ color: capCol, width: 1.2 });

    if (!player.alive) {
      g.rect(cx - player.w / 2 - 4, topY - 4, player.w + 8, h + 8).fill({ color: 0x000000, alpha: 0.35 });
    }
  }

  _drawUnderground(world, player, particles) {
    const g = this.undergroundGfx;
    g.clear();
    const cave = world.underground;
    if (!cave) return;

    g.rect(0, 0, VIEW_W, VIEW_H).fill(0x171329);

    g.rect(0, 0, VIEW_W, 82).fill(0x10101c);
    for (let x = 24; x < VIEW_W; x += 96) {
      const point = 14 + ((x * 7) % 34);
      g.moveTo(x, 80)
        .lineTo(x + 18, 80)
        .lineTo(x + 9, 80 + point)
        .closePath()
        .fill(0x252039);
    }

    g.rect(0, cave.floorY, VIEW_W, VIEW_H - cave.floorY).fill(0x76502e);
    g.rect(0, cave.floorY, VIEW_W, 9).fill(0xb27a3f);
    for (let x = 10; x < VIEW_W; x += 42) {
      g.rect(x, cave.floorY + 24 + (x % 3) * 7, 5, 4).fill(0x563a2b);
    }

    this.shadowGfx.clear();
    this.finishGfx.clear();
    this.pitGfx.clear();
    this.platformGfx.clear();
    this.wingsGfx.clear();
    this.animalGfx.clear();
    this.birdGfx.clear();
    this.burstCoinGfx.clear();
    this.projectileGfx.clear();

    const t = performance.now() / 1000;
    const cg = this.coinGfx;
    cg.clear();
    for (const c of cave.coins) {
      if (c.taken) continue;
      const spin = 0.55 + 0.45 * Math.abs(Math.sin(t * 6 + c.x * 0.05));
      const w = c.w * spin;
      const h = c.h;
      const cx = c.x + c.w / 2;
      const cy = c.y + h / 2;

      cg.ellipse(cx, cy, w / 2, h / 2).fill(0xf4c400);
      cg.ellipse(cx, cy, w / 2, h / 2).stroke({ color: 0xb8860b, width: 1.5 });
      cg.ellipse(cx - w * 0.1, cy - h * 0.15, w * 0.25, h * 0.2).fill(0xffe566);
    }

    this._drawParticles(particles, 0);
    this._drawPlayer(player);
  }
}

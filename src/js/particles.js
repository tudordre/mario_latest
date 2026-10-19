/**
 * High-performance 2D Particle Engine for visual juice and gameplay feedback.
 */
export class ParticleManager {
  constructor() {
    this.particles = [];
  }

  reset() {
    this.particles = [];
  }

  /**
   * Foot dust puffs when running or landing
   * @param {number} x
   * @param {number} y
   * @param {number} [count]
   * @param {number} [dir]
   */
  spawnDust(x, y, count = 3, dir = 0) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'dust',
        x: x + (Math.random() - 0.5) * 8,
        y: y - 2 + (Math.random() - 0.5) * 4,
        vx: (dir !== 0 ? -dir * (40 + Math.random() * 50) : (Math.random() - 0.5) * 60),
        vy: -20 - Math.random() * 35,
        radius: 3 + Math.random() * 3,
        color: 'rgba(235, 235, 245, 0.85)',
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.55,
      });
    }
  }

  /**
   * 4 rotating brick fragments bursting with gravity when a brick is smashed
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  spawnBrickDebris(x, y, w = 32, h = 32) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const offsets = [
      { vx: -120, vy: -360 },
      { vx: 120, vy: -360 },
      { vx: -80, vy: -240 },
      { vx: 80, vy: -240 },
    ];
    for (const off of offsets) {
      this.particles.push({
        type: 'debris',
        x: cx + (Math.random() - 0.5) * 6,
        y: cy + (Math.random() - 0.5) * 6,
        vx: off.vx + (Math.random() - 0.5) * 40,
        vy: off.vy + (Math.random() - 0.5) * 40,
        w: 9,
        h: 9,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 16,
        color: '#c84c0c',
        shadow: '#8b2e05',
        life: 1.2,
        maxLife: 1.2,
      });
    }
  }

  /**
   * Sparkling starburst on coin pickup
   * @param {number} x
   * @param {number} y
   */
  spawnCoinSparkle(x, y) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 70 + Math.random() * 80;
      this.particles.push({
        type: 'sparkle',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: '#ffe566',
        life: 0.45,
        maxLife: 0.45,
      });
    }
  }

  /**
   * Stomp impact star burst
   * @param {number} x
   * @param {number} y
   */
  spawnStompStars(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 110 + Math.random() * 90;
      this.particles.push({
        type: 'star',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 5 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 12,
        color: '#ffdd33',
        life: 0.5,
        maxLife: 0.5,
      });
    }
  }

  /**
   * Fiery rocket smoke and flame trail
   * @param {number} x
   * @param {number} y
   * @param {number} dir
   */
  spawnRocketTrail(x, y, dir) {
    // Fire spark
    this.particles.push({
      type: 'spark',
      x: x - dir * 14,
      y: y + (Math.random() - 0.5) * 4,
      vx: -dir * (80 + Math.random() * 60),
      vy: (Math.random() - 0.5) * 30,
      radius: 4 + Math.random() * 3,
      color: Math.random() < 0.6 ? '#ffaa00' : '#ff4400',
      life: 0.22,
      maxLife: 0.22,
    });
    // Smoke plume
    if (Math.random() < 0.7) {
      this.particles.push({
        type: 'smoke',
        x: x - dir * 18,
        y: y + (Math.random() - 0.5) * 5,
        vx: -dir * 30 + (Math.random() - 0.5) * 20,
        vy: -15 - Math.random() * 20,
        radius: 5 + Math.random() * 4,
        color: 'rgba(180, 180, 195, 0.7)',
        life: 0.5,
        maxLife: 0.5,
      });
    }
  }

  /**
   * Trailing fireball embers
   * @param {number} x
   * @param {number} y
   * @param {number} dir
   */
  spawnFireballTrail(x, y, dir) {
    this.particles.push({
      type: 'spark',
      x: x - dir * 6 + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 6,
      vx: -dir * (40 + Math.random() * 30),
      vy: (Math.random() - 0.5) * 40,
      radius: 3 + Math.random() * 2,
      color: Math.random() < 0.5 ? '#ffe066' : '#ff5500',
      life: 0.2,
      maxLife: 0.2,
    });
  }

  /**
   * Update particle lifetimes and physics
   * @param {number} dt
   */
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'debris') {
        p.vy += 1200 * dt; // gravity on debris
        p.rot += p.vRot * dt;
      } else if (p.type === 'star') {
        p.vy += 600 * dt;
        p.rot += p.vRot * dt;
      } else if (p.type === 'smoke') {
        p.radius += dt * 8; // expand as it dissipates
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }
}

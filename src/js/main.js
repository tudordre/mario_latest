import {
  GROUND_Y,
  MOVE_SPEED,
  PIT_REWARD,
  TILE,
  TIME_LIMIT,
  VIEW_W,
} from './constants.js';
import { Input } from './input.js';
import { ParticleManager } from './particles.js';
import { Player } from './player.js';
import { Renderer } from './renderer.js';
import { Sfx } from './sfx.js';
import { World } from './world.js';

class Game {
  constructor() {
    this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('game'));
    this.sfx = new Sfx();
    this.input = new Input();
    this.world = new World();
    this.player = new Player();
    this.particles = new ParticleManager();
    this.renderer = new Renderer(this.canvas);

    // HUD Elements
    this.moneyEl = document.getElementById('money');
    this.orangesEl = document.getElementById('oranges');
    this.levelEl = document.getElementById('level');
    this.timerEl = document.getElementById('timer');
    this.distanceEl = document.getElementById('distance');

    // Modals
    this.overlay = document.getElementById('overlay');
    this.startBtn = document.getElementById('startBtn');
    this.gameOver = document.getElementById('gameOver');
    this.restartBtn = document.getElementById('restartBtn');
    this.victory = document.getElementById('victory');
    this.victoryRestartBtn = document.getElementById('victoryRestartBtn');

    this.finalMsg = document.getElementById('finalMsg');
    this.finalMoney = document.getElementById('finalMoney');
    this.victoryMoney = document.getElementById('victoryMoney');

    // State
    this.running = false;
    this.ended = false;
    this.endDelay = 0;
    this.money = 0;
    this.maxX = 0;
    this.cameraX = 0;
    this.timeLeft = TIME_LIMIT;
    this.pitRewardDone = false;

    /** @type {{ phase: 'slide' | 'enter', elapsed: number, startY: number } | null} */
    this.levelSequence = null;
    this.lastTime = 0;

    this._bindEvents();
    this._initRenderer();
  }

  async _initRenderer() {
    await this.renderer.init();
    this.renderer.draw(this.world, this.player, this.cameraX, this.particles, 0.016);
    requestAnimationFrame((t) => this.loop(t));
  }

  _bindEvents() {
    this.startBtn.addEventListener('click', () => this.start());
    this.restartBtn.addEventListener('click', () => this.restart());
    this.victoryRestartBtn.addEventListener('click', () => this.restart());
  }

  start() {
    this.overlay.classList.add('hidden');
    this.gameOver.classList.add('hidden');
    this.victory.classList.add('hidden');
    this.running = true;
    this.ended = false;
    this.endDelay = 0;
    this.money = 0;
    this.maxX = 0;
    this.cameraX = 0;
    this.timeLeft = TIME_LIMIT;
    this.pitRewardDone = false;
    this.levelSequence = null;

    this.world.reset(1, 1);
    this.player = new Player();
    this.particles.reset();
    this._updateHud();
  }

  restart() {
    this.start();
  }

  _addMoney(n) {
    this.money += n;
    this.moneyEl.textContent = String(this.money);
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    // Quick restart with R
    if (this.input.justPressed('restart')) {
      this.restart();
    }

    // Start with Enter if modal visible
    if (!this.running && this.input.justPressed('start')) {
      if (!this.gameOver.classList.contains('hidden') || !this.victory.classList.contains('hidden')) {
        this.restart();
      } else if (!this.overlay.classList.contains('hidden')) {
        this.start();
      }
    }

    if (this.running) {
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      if (this.timeLeft <= 0) {
        this.player.alive = false;
        this.player.timedOut = true;
      }

      // Enter underground pipe with Down / S
      if (
        !this.world.underground &&
        !this.levelSequence &&
        this.input.isDown('down') &&
        this.player.onGround
      ) {
        const pipe = this.world.findPipeTopUnderPlayer(this.player);
        if (pipe) {
          const cave = this.world.enterUnderground(pipe);
          this.sfx.playShrink();
          this.player.x = 24;
          this.player.y = cave.floorY - this.player.h;
          this.player.vx = 0;
          this.player.vy = 0;
          this.player.onGround = true;
          this.cameraX = 0;
        }
      }

      if (this.levelSequence) {
        this._updateLevelSequence(dt);
      } else if (this.world.underground) {
        this._updateUnderground(dt);
      } else {
        // Normal surface gameplay
        this.player.update(this.input, dt, this.world);

        // Sound & Particle events
        if (this.player._shotRocket) {
          this.sfx.playRocket();
          this.renderer.shake(5, 0.2);
        } else if (this.player._shotFire) {
          this.sfx.playFireball();
        }

        if (this.player.lastBrickBreak === 'brick') {
          this.sfx.playBrickBreak();
          this.renderer.shake(4, 0.15);
        }

        // Spawn brick debris particles for any newly broken bricks
        if (this.world.brokenBricks.length > 0) {
          for (const b of this.world.brokenBricks) {
            this.particles.spawnBrickDebris(b.x, b.y, b.w, b.h);
          }
          this.world.brokenBricks = [];
        }

        if (this.player._mountedBird) this.sfx.playGrow();
        if (this.player._gotWings) this.sfx.playGrow();

        // Running dust particles
        if (this.player.onGround && Math.abs(this.player.vx) > 20) {
          if (Math.random() < 0.25) {
            this.particles.spawnDust(
              this.player.x + this.player.w / 2,
              this.player.y + this.player.h,
              1,
              this.player.facing
            );
          }
        }
        // Landing dust burst
        if (this.player._landed) {
          this.particles.spawnDust(
            this.player.x + this.player.w / 2,
            this.player.y + this.player.h,
            5
          );
        }

        // Projectile particles
        for (const f of this.world.fireballs) {
          if (f.kind === 'rocket') {
            this.particles.spawnRocketTrail(f.x + f.w / 2, f.y + f.h / 2, f.vx > 0 ? 1 : -1);
          } else {
            this.particles.spawnFireballTrail(f.x + f.w / 2, f.y + f.h / 2, f.vx > 0 ? 1 : -1);
          }
        }

        this.world.updateWingsSpawn(dt, this.player.x);
        this.world.updateBird(dt, this.player);
        this.world.updateAnimals(dt);
        const fireKills = this.world.updateFireballs(dt);
        if (fireKills > 0) {
          this.sfx.playStomp();
          this.renderer.shake(4, 0.15);
        }

        const animalEvent = this.player.resolveAnimals(this.world);
        if (animalEvent === 'stomp') {
          this.sfx.playStomp();
          this.renderer.shake(6, 0.2);
          this.particles.spawnStompStars(
            this.player.x + this.player.w / 2,
            this.player.y + this.player.h
          );
        } else if (animalEvent === 'grow' || animalEvent === 'fire' || animalEvent === 'rocket') {
          this.sfx.playGrow();
        } else if (animalEvent === 'dismount' || animalEvent === 'downgrade' || animalEvent === 'die') {
          this.sfx.playShrink();
          this.renderer.shake(6, 0.2);
        }

        const { gained, count } = this.world.collectCoins(this.player);
        if (gained > 0) {
          this._addMoney(gained);
          for (let i = 0; i < count; i++) {
            this.sfx.playCoin(i * 0.045);
          }
          this.particles.spawnCoinSparkle(
            this.player.x + this.player.w / 2,
            this.player.y + this.player.h / 2
          );
        }

        this._tryStartLevelSequence();
      }

      this.world.updateBurstCoins(dt);
      this.particles.update(dt);
      this.input.endFrame();

      if (!this.world.underground) {
        const target = this.player.x - VIEW_W * 0.35;
        this.cameraX = Math.max(0, this.cameraX + (target - this.cameraX) * Math.min(1, dt * 8));
        this.world.ensureGenerated(this.cameraX + VIEW_W);
        if (this.player.x > this.maxX) this.maxX = this.player.x;
      }

      this._updateHud();

      if (!this.player.alive) this._beginEnd();
    } else if (this.endDelay > 0) {
      this.endDelay -= dt;
      this.world.updateBurstCoins(dt);
      this.particles.update(dt);
      if (this.endDelay <= 0) this._showGameOver();
    }

    this.renderer.draw(this.world, this.player, this.cameraX, this.particles, dt);
    requestAnimationFrame((t) => this.loop(t));
  }

  _updateUnderground(dt) {
    const cave = this.world.underground;
    if (!cave || !this.player.alive) return;

    let move = 0;
    if (this.input.isDown('left')) move -= 1;
    if (this.input.isDown('right')) move += 1;
    this.player.vx = move * MOVE_SPEED;
    if (move !== 0) this.player.facing = move;
    this.player.x = Math.max(0, Math.min(cave.length - this.player.w, this.player.x + this.player.vx * dt));

    if (this.input.justPressed('jump') && this.player.onGround) {
      this.player.vy = -520;
      this.player.onGround = false;
    }
    this.player.vy = Math.min(900, this.player.vy + 1800 * dt);
    this.player.y += this.player.vy * dt;

    if (this.player.y + this.player.h >= cave.floorY) {
      this.player.y = cave.floorY - this.player.h;
      this.player.vy = 0;
      this.player.onGround = true;
    }
    this.player.anim += dt * (this.player.onGround && Math.abs(this.player.vx) > 10 ? 10 : 4);

    const { gained, count } = this.world.collectCoins(this.player);
    if (gained > 0) {
      this._addMoney(gained);
      for (let i = 0; i < count; i++) this.sfx.playCoin(i * 0.045);
      this.particles.spawnCoinSparkle(
        this.player.x + this.player.w / 2,
        this.player.y + this.player.h / 2
      );
    }

    // Exiting underground at far right pipe
    if (this.player.x >= cave.length - this.player.w - 12) {
      this.world.leaveUnderground();
      this.player.x = cave.exit.x + (cave.exit.w - this.player.w) / 2;
      this.player.y = cave.exit.y - this.player.h;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.onGround = true;
      this.player.prevBottom = this.player.y + this.player.h;
      this.cameraX = Math.max(0, this.player.x - VIEW_W * 0.35);
      this.maxX = Math.max(this.maxX, this.player.x);
    }
  }

  _tryStartLevelSequence() {
    const finish = this.world.finish;
    const groundY = GROUND_Y * TILE;
    if (
      !finish ||
      !this.player.alive ||
      this.player.x + this.player.w <= finish.flagX - 8 ||
      this.player.x >= finish.flagX + 8 ||
      this.player.y + this.player.h >= groundY - 8
    ) {
      return;
    }

    this.levelSequence = { phase: 'slide', elapsed: 0, startY: this.player.y };
    this.player.x = finish.flagX - this.player.w / 2;
    this.player.vx = 0;
    this.player.vy = 0;
  }

  _updateLevelSequence(dt) {
    const sequence = this.levelSequence;
    const finish = this.world.finish;
    if (!sequence || !finish || !this.player.alive) return;

    sequence.elapsed += dt;
    if (sequence.phase === 'slide') {
      const progress = Math.min(1, sequence.elapsed / 1.2);
      const eased = progress * progress * (3 - 2 * progress);
      this.player.y =
        sequence.startY + (GROUND_Y * TILE - this.player.h - sequence.startY) * eased;
      if (progress >= 1) {
        sequence.phase = 'enter';
        sequence.elapsed = 0;
        this.player.y = GROUND_Y * TILE - this.player.h;
      }
      return;
    }

    this.player.x += MOVE_SPEED * dt;
    this.player.anim += dt * 10;
    if (this.player.x >= finish.houseX + 42) {
      this._advanceLevel();
    }
  }

  _advanceLevel() {
    const nextWorld =
      this.world.levelNumber === 4 ? this.world.worldNumber + 1 : this.world.worldNumber;
    const nextLevel = this.world.levelNumber === 4 ? 1 : this.world.levelNumber + 1;

    if (nextWorld > 8) {
      this.running = false;
      this.ended = true;
      this.levelSequence = null;
      this.victoryMoney.textContent = String(this.money);
      this.victory.classList.remove('hidden');
      return;
    }

    this.world.reset(nextWorld, nextLevel);
    this.player.resetForLevel();
    this.levelSequence = null;
    this.cameraX = 0;
    this.maxX = this.player.x;
    this.timeLeft = TIME_LIMIT;
    this.pitRewardDone = false;
    this._updateHud();
  }

  _updateHud() {
    this.moneyEl.textContent = String(this.money);
    const n = Math.min(3, this.player.orangeCount);
    this.orangesEl.textContent = this.player.hasRockets ? 'RACHETE!' : `${n}/3`;
    this.orangesEl.classList.toggle('ready', this.player.hasRockets);
    this.distanceEl.textContent = `${Math.floor(this.maxX / 32)}m`;
    this.levelEl.textContent = `${this.world.worldNumber}-${this.world.levelNumber}`;
    this._updateTimerHud();
  }

  _updateTimerHud() {
    const secs = Math.ceil(this.timeLeft);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    this.timerEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
    this.timerEl.classList.toggle('urgent', this.timeLeft <= 10);
  }

  _beginEnd() {
    this.running = false;

    if (this.player.fellInPit && !this.pitRewardDone) {
      this.pitRewardDone = true;
      this._addMoney(PIT_REWARD);
      const pit = this.world.findPitAt(this.player.x, this.player.w);
      const burstX = pit ? pit.x + pit.w / 2 : this.player.x + this.player.w / 2;
      this.world.spawnPitCoinBurst(burstX);
      this.sfx.playPitFall();
      this.renderer.shake(8, 0.4);
      for (let i = 0; i < 10; i++) this.sfx.playCoin(0.05 + i * 0.04);
      this.endDelay = 1.5;
      this._updateHud();
      return;
    }

    this._showGameOver();
  }

  _showGameOver() {
    this.ended = true;
    this.endDelay = 0;

    const pitBonus = this.player.fellInPit ? PIT_REWARD : 0;

    if (this.player.timedOut) {
      this.finalMsg.textContent = 'Timpul a expirat! Mario a murit.';
    } else if (this.player.killedByAnimal) {
      this.finalMsg.textContent = 'Un animal verde te-a prins!';
    } else if (pitBonus) {
      this.finalMsg.textContent = `Ai căzut în groapă! +${pitBonus} bani.`;
    } else {
      this.finalMsg.textContent = 'Game over!';
    }

    this.finalMoney.textContent = String(this.money);
    this.moneyEl.textContent = String(this.money);
    this.gameOver.classList.remove('hidden');
  }
}

// Bootstrap game once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});

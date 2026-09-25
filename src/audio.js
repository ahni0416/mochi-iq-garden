const STORAGE_KEY = 'mochi-audio-settings-v1';
const defaults = { enabled: true, master: 0.75, sfx: 0.7, ambient: 0.32 };

function readSettings() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return { ...defaults }; }
}

class GardenAudio {
  constructor() {
    this.settings = readSettings();
    this.context = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.ambientNodes = [];
    this.lastPlayed = new Map();
    this.unlocked = false;
    this.currentAmbience = ['sunny', 'afternoon'];
    this.onSettings = null;
  }
  getSettings() { return { ...this.settings }; }
  update(patch) {
    this.settings = { ...this.settings, ...patch };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings)); } catch {}
    if (this.masterGain && this.context) this.masterGain.gain.setTargetAtTime(this.settings.enabled ? this.settings.master : 0, this.context.currentTime, 0.08);
    if (this.ambientGain && this.context) this.ambientGain.gain.setTargetAtTime(this.settings.enabled ? this.settings.ambient : 0, this.context.currentTime, 0.5);
    if (this.masterGain && this.context) this.masterGain.gain.setTargetAtTime(this.settings.enabled ? this.settings.master : 0, this.context.currentTime, 0.08);
    this.onSettings?.(this.getSettings());
  }
  async unlock() {
    if (typeof window === 'undefined') return;
    const wasUnlocked = this.unlocked;
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.settings.enabled ? this.settings.master : 0;
      this.masterGain.connect(this.context.destination);
      this.ambientGain = this.context.createGain();
      this.ambientGain.gain.value = this.settings.enabled ? this.settings.ambient : 0;
      this.ambientGain.connect(this.masterGain);
    }
    try { if (this.context.state === 'suspended') await this.context.resume(); this.unlocked = true; if (!wasUnlocked) this.setAmbience(...this.currentAmbience); } catch { /* Browser may keep audio locked until another gesture. */ }
  }
  play(name, { cooldown = 90, volume = 1 } = {}) {
    if (!this.settings.enabled || !this.context || !this.unlocked || this.context.state !== 'running') return;
    const now = performance.now();
    if (now - (this.lastPlayed.get(name) || 0) < cooldown) return;
    this.lastPlayed.set(name, now);
    const c = this.context, out = c.createGain();
    out.gain.value = Math.max(0, Math.min(1, this.settings.sfx * volume)); out.connect(this.masterGain);
    const tones = { click:[640,.045,'sine'], pet:[430,.18,'sine'], pickup:[560,.09,'sine'], drop:[330,.1,'sine'], feed:[300,.11,'triangle'], eat:[220,.12,'triangle'], happy:[660,.2,'sine'], surprise:[800,.1,'triangle'], hop:[240,.12,'sine'], snap:[520,.12,'triangle'], error:[170,.14,'sine'], success:[660,.34,'sine'], reward:[880,.22,'sine'], sparkle:[1040,.28,'sine'], yawn:[260,.3,'sine'] };
    const [freq, duration, type] = tones[name] || tones.click, osc = c.createOscillator();
    osc.type = type; osc.frequency.setValueAtTime(freq, c.currentTime);
    if (name === 'success' || name === 'reward' || name === 'sparkle' || name === 'happy') osc.frequency.exponentialRampToValueAtTime(freq * 1.45, c.currentTime + duration * .7);
    out.gain.setValueAtTime(0.0001, c.currentTime); out.gain.exponentialRampToValueAtTime(.18, c.currentTime + .012); out.gain.exponentialRampToValueAtTime(.0001, c.currentTime + duration);
    osc.connect(out); osc.start(); osc.stop(c.currentTime + duration + .02); osc.onended = () => { osc.disconnect(); out.disconnect(); };
  }
  setAmbience(weather, timeOfDay) {
    this.currentAmbience = [weather, timeOfDay];
    if (!this.context || !this.unlocked) return;
    const c = this.context;
    this.ambientGain.gain.setTargetAtTime(0, c.currentTime, .55);
    this.ambientNodes.forEach(n => { try { n.stop?.(c.currentTime + 2); } catch {} }); this.ambientNodes = [];
    const night = timeOfDay === 'night', base = weather === 'rain' || weather === 'storm' ? 145 : weather === 'windy' ? 90 : night ? 190 : 230;
    const osc = c.createOscillator(), gain = c.createGain(); osc.type = 'sine'; osc.frequency.value = base;
    gain.gain.value = .012; osc.connect(gain); gain.connect(this.ambientGain); osc.start(); this.ambientNodes.push(osc, gain);
    const target = this.settings.enabled ? this.settings.ambient * (night ? .48 : weather === 'storm' ? .8 : 1) : 0;
    this.ambientGain.gain.setTargetAtTime(target, c.currentTime + .25, 1.8);
  }
}

export const audio = new GardenAudio();

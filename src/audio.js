// Original synthesized effects: no downloads, audio assets, or dependencies.
export class SoundEngine {
  context = null;
  active = new Set();

  async unlock() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    this.context ||= new AudioContext();
    await this.context.resume();
    return true;
  }

  tone(frequency, duration, delay = 0, type = 'sine', volume = 0.045) {
    if (!this.context || this.context.state !== 'running') return;
    const context = this.context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    this.active.add(oscillator);
    oscillator.onended = () => { this.active.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  splash() {
    if (!this.context || this.context.state !== 'running') return;
    const context = this.context;
    const buffer = context.createBuffer(1, context.sampleRate * 1.6, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    gain.gain.value = 0.13;
    source.connect(filter).connect(gain).connect(context.destination);
    this.active.add(source);
    source.onended = () => { this.active.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start();
  }

  start(theme, duration) {
    this.stop();
    if (theme === 'water') this.splash();
    // A gentle decelerating click / creak / terminal blip pattern.
    let time = theme === 'water' ? 0.65 : 0;
    while (time < duration / 1000 - 0.2) {
      const progress = time / (duration / 1000);
      this.tone(theme === 'ai' ? 420 + (Math.floor(time * 9) % 5) * 90 : theme === 'water' ? 95 : 850, theme === 'water' ? 0.14 : 0.04, time, theme === 'water' ? 'triangle' : 'sine', theme === 'ai' ? 0.018 : 0.035);
      time += 0.07 + Math.pow(progress, 3) * 0.42;
    }
  }

  finish(theme) {
    this.stop();
    const notes = theme === 'water' ? [330, 440, 550] : theme === 'ai' ? [520, 780, 1040] : [523, 659, 784];
    notes.forEach((note, index) => this.tone(note, 0.5, index * 0.1, 'sine', 0.05));
  }

  stop() {
    for (const source of this.active) { try { source.stop(); } catch { /* Already ended. */ } }
    this.active.clear();
  }

  dispose() {
    this.stop();
    if (this.context) this.context.close().catch(() => {});
  }
}

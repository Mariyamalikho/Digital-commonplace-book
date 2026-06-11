// Natural Web Audio API Synthesizer for Page Flip & Paper Rip/Tear

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic Paper Page Flip Sound (Subtle flap + sliding friction)
  playPageFlip() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = 0.28;

      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);
      filter.Q.value = 1.8;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      oscGain.gain.setValueAtTime(0.15, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.06);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      noiseSource.start(now);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (err) {
      console.warn("Audio page flip error:", err);
    }
  }

  // Realistic Paper Tearing Sound (Granular sharp rip + paper fibers snap)
  playPaperTear() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = 0.55;

      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.sin((i / bufferSize) * Math.PI);
        const ripCrackle = Math.random() > 0.35 ? (Math.random() * 2 - 1) : 0;
        data[i] = ripCrackle * envelope;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.linearRampToValueAtTime(3800, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start(now);
    } catch (err) {
      console.warn("Audio paper tear error:", err);
    }
  }
}

export const soundEngine = new SoundEngine();

// Voice Recorder Helper using MediaRecorder API
export class VoiceRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Audio recording is not supported in this browser.");
    }
    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject("No media recorder initialized");
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
          }
          resolve({
            blob: audioBlob,
            dataUrl: base64Audio,
            duration: Math.max(1, Math.round(this.audioChunks.length * 0.5))
          });
        };
      };

      this.mediaRecorder.stop();
    });
  }
}

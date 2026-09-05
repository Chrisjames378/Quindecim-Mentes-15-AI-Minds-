import { LayerState, FXState, ArpState } from '../types/synth';

interface ActiveVoice {
  oscillators: OscillatorNode[];
  subOsc?: OscillatorNode;
  filter: BiquadFilterNode;
  envGain: GainNode;
  layerPanner?: StereoPannerNode;
  layerIdx: number;
  note: string;
  octave: number;
  freq: number;
  startTime: number;
}

const NOTE_FREQS: Record<string, number> = {
  'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
  'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
  'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
};

export class SynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  public analyser: AnalyserNode | null = null;

  // FX Nodes
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private delayDryGain: GainNode | null = null;
  private delayWetGain: GainNode | null = null;

  private convolverNode: ConvolverNode | null = null;
  private reverbDryGain: GainNode | null = null;
  private reverbWetGain: GainNode | null = null;

  private waveShaper: WaveShaperNode | null = null;
  private fxBus: GainNode | null = null;

  // Active voices map: key = `${note}_${octave}` -> array of ActiveVoice
  private activeVoices = new Map<string, ActiveVoice[]>();

  // Arpeggiator internals
  private arpTimer: number | null = null;
  private currentArpStep: number = 0;
  private arpHeldNotes: { note: string; octave: number }[] = [];
  public onArpStepChange?: (step: number) => void;
  public onMIDIMessage?: (type: 'noteOn' | 'noteOff', note: string, octave: number) => void;

  // Master pitch bend & mod
  public pitchBendCents: number = 0;
  public modWheelVal: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay
  }

  public async initAudio(): Promise<boolean> {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return true;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Limiter to prevent clipping with multiple layers & unison
      this.masterLimiter = this.ctx.createDynamicsCompressor();
      this.masterLimiter.threshold.setValueAtTime(-2, this.ctx.currentTime);
      this.masterLimiter.knee.setValueAtTime(6, this.ctx.currentTime);
      this.masterLimiter.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.masterLimiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.masterLimiter.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;

      // FX Bus
      this.fxBus = this.ctx.createGain();

      // Build Overdrive / WaveShaper
      this.waveShaper = this.ctx.createWaveShaper();
      this.waveShaper.curve = this.createDistortionCurve(0.2);
      this.waveShaper.oversample = '4x';

      // Build Delay Network
      this.delayNode = this.ctx.createDelay(2.0);
      this.delayNode.delayTime.setValueAtTime(0.35, this.ctx.currentTime);
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.delayFilter = this.ctx.createBiquadFilter();
      this.delayFilter.type = 'lowpass';
      this.delayFilter.frequency.setValueAtTime(4500, this.ctx.currentTime);
      this.delayDryGain = this.ctx.createGain();
      this.delayWetGain = this.ctx.createGain();

      // Feedback loop
      this.delayNode.connect(this.delayFilter);
      this.delayFilter.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.delayWetGain);

      // Build Reverb Network (Synthetic Impulse Convolver)
      this.convolverNode = this.ctx.createConvolver();
      this.convolverNode.buffer = this.buildReverbImpulse(2.5, 2.0);
      this.reverbDryGain = this.ctx.createGain();
      this.reverbWetGain = this.ctx.createGain();
      this.convolverNode.connect(this.reverbWetGain);

      // Connect FX chain:
      // Voice -> fxBus -> WaveShaper -> Delay & Reverb -> Master Limiter -> MasterGain -> Analyser -> Destination
      this.fxBus.connect(this.waveShaper);

      // Dry path
      this.waveShaper.connect(this.delayDryGain);
      this.waveShaper.connect(this.reverbDryGain);

      // Wet paths
      this.waveShaper.connect(this.delayNode);
      this.waveShaper.connect(this.convolverNode);

      // Combine into Master Limiter
      this.delayDryGain.connect(this.masterLimiter);
      this.delayWetGain.connect(this.masterLimiter);
      this.reverbDryGain.connect(this.masterLimiter);
      this.reverbWetGain.connect(this.masterLimiter);

      this.masterLimiter.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Initialize Web MIDI if supported
      this.initMIDI();

      return true;
    } catch (e) {
      console.error('Failed to initialize AudioContext', e);
      return false;
    }
  }

  public isRunning(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  public async resume(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public setMasterVolume(val: number): void {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
  }

  public updateFX(fx: FXState): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.delayNode) {
      this.delayNode.delayTime.setValueAtTime(fx.delayTime, now);
    }
    if (this.delayFeedback) {
      this.delayFeedback.gain.setValueAtTime(fx.delayEnabled ? fx.delayFb : 0, now);
    }
    if (this.delayWetGain && this.delayDryGain) {
      const wet = fx.delayEnabled ? fx.delayMix : 0;
      this.delayWetGain.gain.setValueAtTime(wet, now);
      this.delayDryGain.gain.setValueAtTime(1 - (wet * 0.5), now);
    }

    if (this.convolverNode && this.reverbWetGain && this.reverbDryGain) {
      const wet = fx.reverbEnabled ? fx.reverbWet : 0;
      this.reverbWetGain.gain.setValueAtTime(wet, now);
      this.reverbDryGain.gain.setValueAtTime(1 - (wet * 0.4), now);
    }

    if (this.waveShaper) {
      this.waveShaper.curve = this.createDistortionCurve(fx.driveEnabled ? fx.driveAmount : 0);
    }
  }

  private createDistortionCurve(amount: number): Float32Array {
    const k = amount * 40;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
    }
    return curve;
  }

  private buildReverbImpulse(duration: number, decay: number): AudioBuffer {
    if (!this.ctx) {
      throw new Error('AudioContext missing');
    }
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return impulse;
  }

  public noteToFrequency(note: string, octave: number): number {
    const base = NOTE_FREQS[note] || 440;
    return base * Math.pow(2, octave - 4);
  }

  public noteOn(
    note: string,
    octave: number,
    layers: LayerState[],
    activeLayerIdx: number,
    stackAll: boolean,
    velocity: number = 1.0
  ): void {
    if (!this.ctx) {
      this.initAudio().then(() => this.noteOn(note, octave, layers, activeLayerIdx, stackAll, velocity));
      return;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const keyId = `${note}_${octave}`;
    if (this.activeVoices.has(keyId)) {
      // Release prior voice if still playing to prevent overlap buildup
      this.noteOff(note, octave, layers);
    }

    const layersToPlay: { state: LayerState; index: number }[] = [];
    if (stackAll) {
      layers.forEach((l, i) => {
        if (!l.mute) layersToPlay.push({ state: l, index: i });
      });
    } else {
      const active = layers[activeLayerIdx];
      if (active && !active.mute) {
        layersToPlay.push({ state: active, index: activeLayerIdx });
      }
    }

    if (layersToPlay.length === 0) return;

    const baseFreq = this.noteToFrequency(note, octave);
    const now = this.ctx.currentTime;
    const voiceList: ActiveVoice[] = [];

    layersToPlay.forEach(({ state, index: layerIdx }) => {
      // Calculate effective frequency with layer octave and semitone offsets
      const effectiveOctave = octave + state.octaveOffset + (state.semiOffset / 12);
      const layerFreq = this.noteToFrequency(note, effectiveOctave);

      const oscGroup: OscillatorNode[] = [];
      const numVoices = Math.max(1, state.unison);
      const detuneSpread = state.detune * 40; // in cents

      // Create unison oscillators
      for (let i = 0; i < numVoices; i++) {
        const osc = this.ctx!.createOscillator();
        osc.type = state.wave;

        // Centered detune spread
        const detuneOffset = numVoices === 1 ? 0 : (i - (numVoices - 1) / 2) * (detuneSpread / ((numVoices - 1) / 2));
        const driftOffset = (Math.random() - 0.5) * (state.drift * 15);
        const totalCents = detuneOffset + driftOffset + this.pitchBendCents;

        osc.frequency.setValueAtTime(layerFreq, now);
        osc.detune.setValueAtTime(totalCents, now);
        oscGroup.push(osc);
      }

      // Sub oscillator if enabled
      let subOsc: OscillatorNode | undefined;
      let subGain: GainNode | undefined;
      if (state.subOsc > 0.05) {
        subOsc = this.ctx!.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(layerFreq * 0.5, now); // -1 octave
        subGain = this.ctx!.createGain();
        subGain.gain.setValueAtTime(state.subOsc * 0.6, now);
        subOsc.connect(subGain);
      }

      // Filter
      const filter = this.ctx!.createBiquadFilter();
      filter.type = state.filterType;
      filter.frequency.setValueAtTime(Math.max(20, state.cutoff), now);
      filter.Q.setValueAtTime(Math.max(0.1, state.res), now);

      // Mod wheel adding brightness to filter
      const modBoost = this.modWheelVal * 4000;
      const targetCutoff = Math.min(19500, Math.max(20, state.cutoff + (state.envmod * 7500) + modBoost));
      filter.frequency.exponentialRampToValueAtTime(targetCutoff, now + Math.max(0.005, state.filterAttack || state.attack));
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(20, state.cutoff + ((targetCutoff - state.cutoff) * (state.filterSustain ?? state.sustain))),
        now + Math.max(0.005, state.filterAttack || state.attack) + Math.max(0.01, state.filterDecay || state.decay)
      );

      // Amp Envelope Gain
      const envGain = this.ctx!.createGain();
      envGain.gain.setValueAtTime(0.0001, now);

      const maxLayerGain = (0.28 / Math.sqrt(layersToPlay.length)) * state.volume * velocity;
      envGain.gain.exponentialRampToValueAtTime(maxLayerGain, now + Math.max(0.003, state.attack));
      envGain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, maxLayerGain * state.sustain),
        now + Math.max(0.003, state.attack) + Math.max(0.01, state.decay)
      );

      // Layer Pan node
      let panner: StereoPannerNode | undefined;
      if (typeof this.ctx!.createStereoPanner === 'function') {
        panner = this.ctx!.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, state.pan)), now);
      }

      // Connect oscillators -> filter -> envGain -> panner -> fxBus
      oscGroup.forEach((osc) => {
        osc.connect(filter);
        osc.start(now);
      });

      if (subOsc && subGain) {
        subGain.connect(filter);
        subOsc.start(now);
      }

      filter.connect(envGain);

      if (panner) {
        envGain.connect(panner);
        panner.connect(this.fxBus!);
      } else {
        envGain.connect(this.fxBus!);
      }

      voiceList.push({
        oscillators: oscGroup,
        subOsc,
        filter,
        envGain,
        layerPanner: panner,
        layerIdx,
        note,
        octave,
        freq: baseFreq,
        startTime: now,
      });
    });

    this.activeVoices.set(keyId, voiceList);
  }

  public noteOff(note: string, octave: number, layers: LayerState[]): void {
    if (!this.ctx) return;
    const keyId = `${note}_${octave}`;
    const voices = this.activeVoices.get(keyId);
    if (!voices) return;

    const now = this.ctx.currentTime;

    voices.forEach((voice) => {
      const layerState = layers[voice.layerIdx] || layers[0];
      const releaseTime = Math.max(0.01, layerState.release);

      // Smooth release fade-out
      voice.envGain.gain.cancelScheduledValues(now);
      voice.envGain.gain.setValueAtTime(voice.envGain.gain.value, now);
      voice.envGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

      // Clean up Web Audio nodes after release
      setTimeout(() => {
        voice.oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already disconnected
          }
        });
        if (voice.subOsc) {
          try {
            voice.subOsc.stop();
            voice.subOsc.disconnect();
          } catch {
            // Already disconnected
          }
        }
        try {
          voice.filter.disconnect();
          voice.envGain.disconnect();
          if (voice.layerPanner) voice.layerPanner.disconnect();
        } catch {
          // Ignored
        }
      }, releaseTime * 1000 + 100);
    });

    this.activeVoices.delete(keyId);
  }

  public allNotesOff(layers: LayerState[]): void {
    this.activeVoices.forEach((_, key) => {
      const [note, octStr] = key.split('_');
      this.noteOff(note, parseInt(octStr, 10), layers);
    });
    this.activeVoices.clear();
  }

  public setPitchBend(cents: number): void {
    this.pitchBendCents = cents;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.activeVoices.forEach((voices) => {
      voices.forEach((v) => {
        v.oscillators.forEach((osc) => {
          try {
            osc.detune.setValueAtTime(osc.detune.value + cents, now);
          } catch {}
        });
      });
    });
  }

  public setModWheel(normalized: number): void {
    this.modWheelVal = normalized;
  }

  // --- ARPEGGIATOR ENGINE ---
  public startArp(
    arp: ArpState,
    layers: LayerState[],
    activeLayerIdx: number,
    stackAll: boolean
  ): void {
    this.stopArp(layers);
    if (!arp.enabled) return;

    const intervalMs = (60000 / arp.bpm) / 4; // 16th notes default

    this.arpTimer = window.setInterval(() => {
      if (this.arpHeldNotes.length === 0) return;

      const step = this.currentArpStep;
      this.currentArpStep = (this.currentArpStep + 1) % 16;
      if (this.onArpStepChange) this.onArpStepChange(step);

      if (!arp.steps[step]) return; // Step not active

      // Calculate which note to play according to arp mode
      const isAccented = arp.accents[step];
      const velocity = isAccented ? 1.0 : 0.65;

      let targetNote = this.arpHeldNotes[0];
      if (arp.mode === 'up') {
        const idx = step % this.arpHeldNotes.length;
        targetNote = this.arpHeldNotes[idx];
      } else if (arp.mode === 'down') {
        const idx = (this.arpHeldNotes.length - 1 - (step % this.arpHeldNotes.length));
        targetNote = this.arpHeldNotes[idx];
      } else if (arp.mode === 'random') {
        const idx = Math.floor(Math.random() * this.arpHeldNotes.length);
        targetNote = this.arpHeldNotes[idx];
      } else {
        const cycle = this.arpHeldNotes.length * 2 - 2 || 1;
        const subStep = step % cycle;
        const idx = subStep < this.arpHeldNotes.length ? subStep : cycle - subStep;
        targetNote = this.arpHeldNotes[idx];
      }

      if (targetNote) {
        this.noteOn(targetNote.note, targetNote.octave, layers, activeLayerIdx, stackAll, velocity);
        const noteDuration = (intervalMs * arp.gate);
        setTimeout(() => {
          this.noteOff(targetNote.note, targetNote.octave, layers);
        }, noteDuration);
      }
    }, intervalMs);
  }

  public stopArp(layers: LayerState[]): void {
    if (this.arpTimer !== null) {
      clearInterval(this.arpTimer);
      this.arpTimer = null;
    }
    this.currentArpStep = 0;
    this.allNotesOff(layers);
  }

  public setArpHeldNotes(notes: { note: string; octave: number }[]): void {
    this.arpHeldNotes = [...notes];
  }

  // --- WEB MIDI API ---
  private initMIDI(): void {
    if (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator && typeof navigator.requestMIDIAccess === 'function') {
      try {
        navigator.requestMIDIAccess()
          .then(
            (midiAccess) => {
              const inputs = midiAccess.inputs.values();
              for (const input of inputs) {
                input.onmidimessage = (e: MIDIMessageEvent) => this.handleMIDIMessage(e);
              }
              midiAccess.onstatechange = (e) => {
                const port = e.port;
                if (port.type === 'input' && port.state === 'connected') {
                  (port as MIDIInput).onmidimessage = (ev: MIDIMessageEvent) => this.handleMIDIMessage(ev);
                }
              };
            },
            () => {
              // MIDI not available or permission denied, fallback to keyboard
            }
          )
          .catch(() => {
            // Permission denied or iframe security restriction
          });
      } catch {
        // Fallback silently
      }
    }
  }

  private handleMIDIMessage(e: MIDIMessageEvent): void {
    if (!e.data || e.data.length < 3) return;
    const [status, noteNum, velocity] = e.data;
    const cmd = status >> 4;
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const note = notes[noteNum % 12];
    const octave = Math.floor(noteNum / 12) - 1;

    if (cmd === 9 && velocity > 0) {
      if (this.onMIDIMessage) this.onMIDIMessage('noteOn', note, octave);
    } else if (cmd === 8 || (cmd === 9 && velocity === 0)) {
      if (this.onMIDIMessage) this.onMIDIMessage('noteOff', note, octave);
    }
  }
}

export const synth = new SynthEngine();

import { LayerState, FXState, ArpState, Preset, SoundRecipe } from '../types/synth';

export function createDefaultLayer(id: number): LayerState {
  const panOffsets = [0, -0.4, 0.4, -0.7, 0.7, -0.2, 0.2, 0];
  const octOffsets = [0, 0, 0, 1, -1, 0, 1, -1];
  const detuneOffsets = [0.45, 0.55, 0.35, 0.6, 0.25, 0.5, 0.65, 0.3];
  
  return {
    id,
    name: `Layer ${id}`,
    enabled: id === 1,
    volume: 0.8,
    pan: panOffsets[(id - 1) % panOffsets.length],
    mute: false,
    solo: false,
    octaveOffset: octOffsets[(id - 1) % octOffsets.length],
    semiOffset: 0,
    
    wave: 'sawtooth',
    detune: detuneOffsets[(id - 1) % detuneOffsets.length],
    unison: 7,
    drift: 0.12,
    subOsc: id === 1 ? 0.2 : 0,

    filterType: 'lowpass',
    cutoff: 3200,
    res: 3.5,
    envmod: 0.5,
    drive: 0.15,

    attack: 0.04,
    decay: 0.35,
    sustain: 0.7,
    release: 0.75,

    filterAttack: 0.05,
    filterDecay: 0.4,
    filterSustain: 0.4,
    filterRelease: 0.6,
  };
}

export function createDefaultLayers(): LayerState[] {
  return Array.from({ length: 8 }, (_, i) => createDefaultLayer(i + 1));
}

export const defaultFX: FXState = {
  delayEnabled: true,
  delayTime: 0.35,
  delayFb: 0.42,
  delayMix: 0.3,

  reverbEnabled: true,
  reverbSize: 0.75,
  reverbWet: 0.35,

  driveEnabled: false,
  driveAmount: 0.3,

  widthEnabled: true,
  stereoWidth: 1.3,
};

export const defaultArp: ArpState = {
  enabled: false,
  bpm: 128,
  mode: 'up',
  rate: '1/16',
  octaveRange: 2,
  steps: [true, false, false, true, false, true, false, false, true, false, true, false, true, false, false, true],
  accents: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  euclideanK: 5,
  euclideanN: 16,
  gate: 0.7,
  swing: 15,
};

export function generateEuclideanSteps(k: number, n: number): boolean[] {
  if (k <= 0) return Array(n).fill(false);
  if (k >= n) return Array(n).fill(true);

  // Bresenham-like Euclidean rhythm algorithm
  const pattern: boolean[] = [];
  let count = 0;
  for (let i = 0; i < n; i++) {
    count += k;
    if (count >= n) {
      count -= n;
      pattern.push(true);
    } else {
      pattern.push(false);
    }
  }
  return pattern;
}

export const builtInPresets: Preset[] = [
  {
    id: 'supersaw',
    name: 'Stadium SuperSaw Stack',
    category: 'Lead / Festival',
    description: 'Iconic multitimbral 15-voice detuned saw stack through 24dB diode ladder with shimmering stereo delay and stadium reverb.',
    masterVolume: 0.75,
    stackAllLayers: true,
    layers: Array.from({ length: 8 }, (_, i) => ({
      ...createDefaultLayer(i + 1),
      wave: 'sawtooth',
      detune: 0.45 + (i * 0.05),
      unison: 11,
      cutoff: 7500 - (i * 300),
      res: 2.2,
      envmod: 0.45,
      attack: 0.02,
      decay: 0.3,
      sustain: 0.85,
      release: 0.6,
      pan: ((i - 3.5) / 3.5) * 0.85,
    })),
    fx: {
      delayEnabled: true,
      delayTime: 0.375,
      delayFb: 0.45,
      delayMix: 0.35,
      reverbEnabled: true,
      reverbSize: 0.85,
      reverbWet: 0.4,
      driveEnabled: true,
      driveAmount: 0.25,
      widthEnabled: true,
      stereoWidth: 1.6,
    },
    arp: {
      ...defaultArp,
      enabled: false,
    },
  },
  {
    id: 'warmpad',
    name: 'Intimate Ambient Cloud',
    category: 'Pad / Atmosphere',
    description: 'Ultra-lush, drifting analog pad combining sine and morphing triangle waves with slow attack and vast black-hole reverberation.',
    masterVolume: 0.7,
    stackAllLayers: true,
    layers: Array.from({ length: 8 }, (_, i) => ({
      ...createDefaultLayer(i + 1),
      wave: i % 2 === 0 ? 'sine' : 'triangle',
      detune: 0.18 + (i * 0.02),
      unison: 5,
      drift: 0.25,
      cutoff: 1400 + (i * 200),
      res: 1.2,
      envmod: 0.15,
      attack: 0.9,
      decay: 1.4,
      sustain: 0.9,
      release: 2.8,
      pan: (Math.sin(i * 1.3) * 0.75),
    })),
    fx: {
      delayEnabled: true,
      delayTime: 0.5,
      delayFb: 0.55,
      delayMix: 0.4,
      reverbEnabled: true,
      reverbSize: 0.92,
      reverbWet: 0.58,
      driveEnabled: false,
      driveAmount: 0.1,
      widthEnabled: true,
      stereoWidth: 1.8,
    },
    arp: {
      ...defaultArp,
      enabled: false,
    },
  },
  {
    id: 'cyberlead',
    name: 'Hyper-Drive Cyber Lead',
    category: 'Lead / Sci-Fi',
    description: 'Punchy cyberpunk lead utilizing pulse-width square synthesis, resonant vocal bandpass filtering, and crisp transient punch.',
    masterVolume: 0.72,
    stackAllLayers: false,
    layers: Array.from({ length: 8 }, (_, i) => ({
      ...createDefaultLayer(i + 1),
      wave: 'square',
      detune: 0.32,
      unison: 7,
      cutoff: 4200,
      res: 5.5,
      envmod: 0.7,
      attack: 0.005,
      decay: 0.25,
      sustain: 0.45,
      release: 0.35,
    })),
    fx: {
      delayEnabled: true,
      delayTime: 0.25,
      delayFb: 0.35,
      delayMix: 0.28,
      reverbEnabled: true,
      reverbSize: 0.6,
      reverbWet: 0.25,
      driveEnabled: true,
      driveAmount: 0.45,
      widthEnabled: true,
      stereoWidth: 1.2,
    },
    arp: {
      ...defaultArp,
      enabled: false,
    },
  },
  {
    id: 'formantbass',
    name: 'Vocal Tract Formant Bass',
    category: 'Bass / Neuro',
    description: 'Aggressive resonant talking bass driven by vocal tract bandpass morphing and harmonic sub-oscillator reinforcement.',
    masterVolume: 0.78,
    stackAllLayers: false,
    layers: Array.from({ length: 8 }, (_, i) => ({
      ...createDefaultLayer(i + 1),
      wave: 'square',
      detune: 0.25,
      unison: 5,
      subOsc: 0.6,
      filterType: 'bandpass',
      cutoff: 2800,
      res: 8.5,
      envmod: 0.85,
      attack: 0.002,
      decay: 0.22,
      sustain: 0.3,
      release: 0.25,
    })),
    fx: {
      delayEnabled: false,
      delayTime: 0.15,
      delayFb: 0.2,
      delayMix: 0.1,
      reverbEnabled: true,
      reverbSize: 0.45,
      reverbWet: 0.15,
      driveEnabled: true,
      driveAmount: 0.6,
      widthEnabled: false,
      stereoWidth: 1.0,
    },
    arp: {
      ...defaultArp,
      enabled: false,
    },
  },
  {
    id: 'fractalbell',
    name: 'Fractal Crystal Bell',
    category: 'Pluck / Keys',
    description: 'High-frequency shimmering crystal keys generated by resonant highpass filtering and sparkling granular delay mirrors.',
    masterVolume: 0.7,
    stackAllLayers: false,
    layers: Array.from({ length: 8 }, (_, i) => ({
      ...createDefaultLayer(i + 1),
      wave: 'sine',
      detune: 0.2,
      unison: 9,
      octaveOffset: 1,
      filterType: 'highpass',
      cutoff: 1800,
      res: 4.8,
      envmod: 0.5,
      attack: 0.005,
      decay: 0.7,
      sustain: 0.1,
      release: 1.4,
    })),
    fx: {
      delayEnabled: true,
      delayTime: 0.333,
      delayFb: 0.6,
      delayMix: 0.45,
      reverbEnabled: true,
      reverbSize: 0.88,
      reverbWet: 0.45,
      driveEnabled: false,
      driveAmount: 0.0,
      widthEnabled: true,
      stereoWidth: 1.7,
    },
    arp: {
      ...defaultArp,
      enabled: false,
    },
  },
  {
    id: 'acidrunner',
    name: 'Euclidean Acid Runner',
    category: 'Arp / Techno',
    description: 'Relentless acid sequence driven by 5/16 Euclidean pulse density with squelchy high-Q diode filter modulation.',
    masterVolume: 0.75,
    stackAllLayers: false,
    layers: Array.from({ length: 8 }, (_, i) => ({
      ...createDefaultLayer(i + 1),
      wave: 'sawtooth',
      detune: 0.15,
      unison: 1,
      filterType: 'lowpass',
      cutoff: 1600,
      res: 9.5,
      envmod: 0.75,
      attack: 0.005,
      decay: 0.18,
      sustain: 0.15,
      release: 0.2,
    })),
    fx: {
      delayEnabled: true,
      delayTime: 0.25,
      delayFb: 0.45,
      delayMix: 0.35,
      reverbEnabled: true,
      reverbSize: 0.5,
      reverbWet: 0.22,
      driveEnabled: true,
      driveAmount: 0.5,
      widthEnabled: true,
      stereoWidth: 1.3,
    },
    arp: {
      enabled: true,
      bpm: 136,
      mode: 'euclidean',
      rate: '1/16',
      octaveRange: 2,
      steps: generateEuclideanSteps(5, 16),
      accents: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
      euclideanK: 5,
      euclideanN: 16,
      gate: 0.6,
      swing: 20,
    },
  },
];

export const soundRecipes: SoundRecipe[] = [
  {
    id: 'recipe-a',
    title: 'Recipe A: Stadium SuperSaw Lead',
    target: 'Stadium Festival Lead',
    color: '#00f3ff',
    steps: [
      'Set Wave to Super-Saw, Detune to 0.65, and Unison to 15 Voices on Layer 1.',
      'Select Liquid Diode Lowpass, Cutoff to 8500 Hz, Resonance to 2.5, and Env Mod to +40%.',
      'Shape Envelope: Attack 0.02s, Decay 0.30s, Sustain 80%, Release 0.50s.',
      'Toggle STACK ALL 8 LAYERS. Turn on Shatter Delay (350ms) and Quantum Reverb (35% Wet).',
    ],
    presetPatch: builtInPresets[0],
  },
  {
    id: 'recipe-b',
    title: 'Recipe B: Intimate Ambient Cloud Pad',
    target: 'Ethereal Cinematic Ambient',
    color: '#a855f7',
    steps: [
      'Set Wave to Pure Sine or Triangle, Detune to 0.15, Unison to 5 Voices.',
      'Lower Lowpass Cutoff to 1200 Hz with gentle Resonance (1.2 Q).',
      'Envelope Shaping: Attack 0.80s, Decay 1.20s, Sustain 90%, Release 2.50s.',
      'Trigger AI Mind 04 (Sweet Spot FX) to expand Reverb Size to 88% with 55% Wet mix.',
    ],
    presetPatch: builtInPresets[1],
  },
  {
    id: 'recipe-c',
    title: 'Recipe C: Cyberpunk Formant Talking Bass',
    target: 'Aggressive Vocal Bass',
    color: '#f43f5e',
    steps: [
      'Select Pulse-Width Square, Detune 0.30, 7 Voices with Sub-Oscillator +40%.',
      'Choose Vocal Tract Bandpass, Cutoff 3500 Hz, Resonance to 8.0 (High Q), Env Mod +80%.',
      'Envelope: Attack 0.001s (instant snap), Decay 0.20s, Sustain 35%, Release 0.30s.',
      'Trigger AI Mind 11 (Transient Designer) for +6dB punch boost at 800 Hz and analog overdrive.',
    ],
    presetPatch: builtInPresets[3],
  },
];

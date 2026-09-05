export type OscWave = 'sawtooth' | 'square' | 'sine' | 'triangle';
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';
export type ArpMode = 'up' | 'down' | 'updown' | 'random' | 'euclidean';
export type ArpRate = '1/4' | '1/8' | '1/16' | '1/32';

export interface LayerState {
  id: number;
  name: string;
  enabled: boolean;
  volume: number; // 0 to 1
  pan: number; // -1 to 1
  mute: boolean;
  solo: boolean;
  octaveOffset: number; // -2 to +2
  semiOffset: number; // -12 to +12
  
  // Oscillator parameters
  wave: OscWave;
  detune: number; // 0 to 1
  unison: number; // 1 to 15 (odd)
  drift: number; // 0 to 1
  subOsc: number; // 0 to 1 (volume of sub -1 oct sine)

  // Filter parameters
  filterType: FilterType;
  cutoff: number; // 20 to 20000 Hz
  res: number; // 0.1 to 24 (Q)
  envmod: number; // -1 to 1
  drive: number; // 0 to 1 (filter overdrive)

  // Amp ADSR
  attack: number; // seconds (0.001 - 4)
  decay: number; // seconds (0.01 - 4)
  sustain: number; // level (0 - 1)
  release: number; // seconds (0.01 - 6)

  // Filter ADSR
  filterAttack: number;
  filterDecay: number;
  filterSustain: number;
  filterRelease: number;
}

export interface FXState {
  delayEnabled: boolean;
  delayTime: number; // 0.05 to 1.0 s
  delayFb: number; // 0 to 0.9
  delayMix: number; // 0 to 1

  reverbEnabled: boolean;
  reverbSize: number; // 0.1 to 0.95
  reverbWet: number; // 0 to 1

  driveEnabled: boolean;
  driveAmount: number; // 0 to 1

  widthEnabled: boolean;
  stereoWidth: number; // 0 to 2 (1 = normal, 2 = hyper-wide)
}

export interface ArpState {
  enabled: boolean;
  bpm: number; // 40 to 240
  mode: ArpMode;
  rate: ArpRate;
  octaveRange: number; // 1 to 3
  steps: boolean[]; // 16 steps
  accents: boolean[]; // 16 steps
  euclideanK: number; // pulses
  euclideanN: number; // total steps (usually 16)
  gate: number; // 0.1 to 1.0
  swing: number; // 0 to 75%
}

export interface Preset {
  id: string;
  name: string;
  category: string;
  description: string;
  layers: LayerState[];
  fx: FXState;
  arp: ArpState;
  masterVolume: number;
  stackAllLayers: boolean;
}

export interface SoundRecipe {
  id: string;
  title: string;
  target: string;
  color: string;
  steps: string[];
  presetPatch: Partial<Preset>;
}

export interface AIMind {
  id: number;
  name: string;
  subtitle: string;
  accentColor: 'cyan' | 'purple' | 'pink' | 'amber';
  dspSummary: string;
}

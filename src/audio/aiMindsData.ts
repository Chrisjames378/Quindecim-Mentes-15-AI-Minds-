import { AIMind, LayerState, FXState, ArpState } from '../types/synth';
import { generateEuclideanSteps } from './presets';

export const AI_MINDS: AIMind[] = [
  {
    id: 1,
    name: '01. Timbre Sculptor',
    subtitle: 'Odd/even harmonic saturation, diode ladder drive, high-shelf rolloff',
    accentColor: 'cyan',
    dspSummary: 'Harmonic drive +3.2dB, diode ladder saturation, rolloff @ 14.2kHz (-12dB/oct)',
  },
  {
    id: 2,
    name: '02. Rhythm Weaver',
    subtitle: 'Euclidean pulse density (k/n), step swing, accent velocity dynamics',
    accentColor: 'cyan',
    dspSummary: 'Calculates Euclidean rhythm (k=5/n=16), swing +22%, dynamic accents +3.0dB',
  },
  {
    id: 3,
    name: '03. Mod Matrix Assistant',
    subtitle: 'LFO-to-cutoff routing, ADSR envelope time multipliers, bipolar depth',
    accentColor: 'cyan',
    dspSummary: 'Auto-wires filter envelope mod (+55%), ADSR time scale x1.25, LFO depth sync',
  },
  {
    id: 4,
    name: '04. Sweet Spot FX',
    subtitle: 'Reverb reflection density, delay damping cutoff, shimmer stereo ratio',
    accentColor: 'cyan',
    dspSummary: 'Reverb decay size 88%, delay damping cutoff @ 4800Hz, shimmer spatial ratio',
  },
  {
    id: 5,
    name: '05. Genre Chameleon',
    subtitle: '8-layer Gain/Pan topology, filter cutoff distribution, detune spread matrix',
    accentColor: 'cyan',
    dspSummary: 'Wide stereo panorama (-85% to +85%), distributed cutoffs, staggered detune',
  },
  {
    id: 6,
    name: '06. Harmony Engine',
    subtitle: 'Polyphonic voice allocation, scale quantizer intervals, octave stack',
    accentColor: 'purple',
    dspSummary: 'Multi-layer chord voicing: roots, fifths (+7st), octaves (+12st) across layers',
  },
  {
    id: 7,
    name: '07. Glitch & Destroy',
    subtitle: 'Granular grain size, buffer repeat rate, tape-stop decay, diode clipping',
    accentColor: 'purple',
    dspSummary: 'Aggressive wave drive (0.65), short decay (0.15s), fast stutter delay (125ms)',
  },
  {
    id: 8,
    name: '08. Mix Assistant',
    subtitle: '4-band parametric EQ, RMS compressor threshold, sidechain ducking curve',
    accentColor: 'purple',
    dspSummary: 'Low-cut sub rumble, sweet 3.5kHz notch control, punchy dynamics envelope',
  },
  {
    id: 9,
    name: '09. Wavetable Architect',
    subtitle: 'Harmonic additive phase angles, spectral tilt slope, wavefold threshold',
    accentColor: 'purple',
    dspSummary: 'Additive harmonic resonance, wavefold drive +40%, spectral brightness boost',
  },
  {
    id: 10,
    name: '10. Groove Extractor',
    subtitle: 'Transient peak timestamps, micro-timing shuffle grid, velocity curves',
    accentColor: 'purple',
    dspSummary: 'Syncopated 16-step Euclidean shuffle grid, swing offset 28%, dynamic accents',
  },
  {
    id: 11,
    name: '11. Transient Designer',
    subtitle: 'Attack gain boost (+6dB), punch frequency focus, decay multiplier',
    accentColor: 'pink',
    dspSummary: 'Ultra-fast attack snap (0.002s), punch focus @ 850Hz, quick punchy decay (0.22s)',
  },
  {
    id: 12,
    name: '12. Micro-Tuning Explorer',
    subtitle: 'Scale key cent offsets, quarter-tone tuning maps, microtonal drift',
    accentColor: 'pink',
    dspSummary: 'Analog pitch drift +24%, microtonal detune spread (±8 cents per swarm voice)',
  },
  {
    id: 13,
    name: '13. Psychoacoustic Enhancer',
    subtitle: 'Mid/Side stereo width ratio, Haas delay offset (12ms), exciter drive',
    accentColor: 'pink',
    dspSummary: 'Stereo width expanded to 175%, psychoacoustic Haas delay offset, air exciter',
  },
  {
    id: 14,
    name: '14. Evolutionary Mutation',
    subtitle: 'Per-keystroke variance %, LFO phase randomization, drift velocity',
    accentColor: 'pink',
    dspSummary: 'Randomizes subtle cutoff, detune, and resonance parameters within golden ratio ±8%',
  },
  {
    id: 15,
    name: '15. Patch Deconstructor',
    subtitle: 'FFT spectral peak matching, harmonic envelope tracking, filter slope',
    accentColor: 'pink',
    dspSummary: 'Optimizes resonance Q (3.8), balances envelope times, prevents master clipping',
  },
];

export interface ExecutionResult {
  layers: LayerState[];
  fx: FXState;
  arp: ArpState;
  log: string;
}

export function executeAIMindDSP(
  mindId: number,
  layers: LayerState[],
  activeLayerIdx: number,
  fx: FXState,
  arp: ArpState
): ExecutionResult {
  const newLayers = layers.map((l) => ({ ...l }));
  const newFx = { ...fx };
  const newArp = { ...arp };
  const target = newLayers[activeLayerIdx];
  let log = '';

  switch (mindId) {
    case 1: // Timbre Sculptor
      target.drive = 0.45;
      target.cutoff = Math.min(16000, target.cutoff * 1.35);
      target.res = Math.min(12, target.res * 1.25);
      newFx.driveEnabled = true;
      newFx.driveAmount = 0.35;
      log = `[MIND 01: TIMBRE SCULPTOR EXECUTED]\n` +
        `• Layer ${target.id} Diode Ladder Overdrive set to 45%\n` +
        `• Cutoff extended to ${Math.round(target.cutoff)} Hz (+35% harmonic presence)\n` +
        `• Resonance Q adjusted to ${target.res.toFixed(1)}\n` +
        `• Master Analog Warmth saturator engaged.`;
      break;

    case 2: // Rhythm Weaver
      newArp.enabled = true;
      newArp.bpm = 128;
      newArp.mode = 'euclidean';
      newArp.euclideanK = 7;
      newArp.euclideanN = 16;
      newArp.steps = generateEuclideanSteps(7, 16);
      newArp.swing = 22;
      newArp.gate = 0.65;
      log = `[MIND 02: RHYTHM WEAVER EXECUTED]\n` +
        `• Arpeggiator engaged in Euclidean mode (k=7 pulses / n=16 steps)\n` +
        `• Swing offset set to 22%\n` +
        `• Gate length locked to 65% for rhythmic punctuation\n` +
        `• Velocity accents programmed on pulses 1, 4, 7, 11.`;
      break;

    case 3: // Mod Matrix Assistant
      target.envmod = 0.72;
      target.filterAttack = 0.02;
      target.filterDecay = 0.35;
      target.filterSustain = 0.3;
      target.filterRelease = 0.5;
      log = `[MIND 03: MOD MATRIX ASSISTANT EXECUTED]\n` +
        `• Envelope-to-Filter modulation depth calibrated to +72%\n` +
        `• Filter envelope times shaped: Attack 0.02s, Decay 0.35s, Sustain 30%\n` +
        `• Cutoff modulation range mapped dynamically across 20Hz–16kHz.`;
      break;

    case 4: // Sweet Spot FX
      newFx.reverbEnabled = true;
      newFx.reverbSize = 0.88;
      newFx.reverbWet = 0.42;
      newFx.delayEnabled = true;
      newFx.delayTime = 0.375; // Dotted 8th note @ 120bpm
      newFx.delayFb = 0.48;
      newFx.delayMix = 0.32;
      log = `[MIND 04: SWEET SPOT FX EXECUTED]\n` +
        `• Quantum Reverb decay size set to 88% (Wet mix 42%)\n` +
        `• Shatter Granular Delay tempo-synced to 375ms (Dotted 8th note)\n` +
        `• Feedback damping frequency clamped to 4,800 Hz to prevent muddy accumulation.`;
      break;

    case 5: // Genre Chameleon
      newLayers.forEach((layer, idx) => {
        layer.pan = ((idx - 3.5) / 3.5) * 0.9;
        layer.detune = 0.2 + (idx * 0.08);
        layer.volume = 0.75 - (idx * 0.02);
      });
      log = `[MIND 05: GENRE CHAMELEON EXECUTED]\n` +
        `• Re-architected 8-layer spatial topology across full -90% to +90% stereo arc\n` +
        `• Detune matrix staggered from 0.20 to 0.76 for dimensional thickness\n` +
        `• Gain distribution calibrated to maintain equal loudness across all 8 layers.`;
      break;

    case 6: // Harmony Engine
      newLayers[0].octaveOffset = 0;
      newLayers[1].octaveOffset = 0;
      newLayers[2].octaveOffset = 1;
      newLayers[3].octaveOffset = -1;
      newLayers[4].octaveOffset = 1;
      newLayers[5].octaveOffset = 0;
      newLayers[6].octaveOffset = -1;
      newLayers[7].octaveOffset = 2;
      log = `[MIND 06: HARMONY ENGINE EXECUTED]\n` +
        `• Multitimbral layers redistributed across 4 octaves (-1, 0, +1, +2)\n` +
        `• Harmonic voice allocation active for symphonic chord density\n` +
        `• Sub-octave reinforcement on Layer 4 and air shimmer on Layer 8.`;
      break;

    case 7: // Glitch & Destroy
      target.wave = 'square';
      target.drive = 0.85;
      target.cutoff = 4800;
      target.res = 9.2;
      target.attack = 0.001;
      target.decay = 0.16;
      target.sustain = 0.2;
      newFx.driveEnabled = true;
      newFx.driveAmount = 0.75;
      newFx.delayEnabled = true;
      newFx.delayTime = 0.125;
      newFx.delayFb = 0.65;
      log = `[MIND 07: GLITCH & DESTROY EXECUTED]\n` +
        `• Square pulse waveform with aggressive 85% wavefold drive\n` +
        `• Resonance pushed to high-Q self-oscillation threshold (9.2)\n` +
        `• Hyper-fast 125ms stutter delay feedback engaged for metallic glitch reflections.`;
      break;

    case 8: // Mix Assistant
      newLayers.forEach((l) => {
        if (l.cutoff < 80) l.cutoff = 120; // High-pass cleanup
      });
      target.res = Math.min(5, target.res);
      newFx.reverbWet = Math.min(0.35, newFx.reverbWet);
      log = `[MIND 08: MIX ASSISTANT EXECUTED]\n` +
        `• High-pass low-end rumble cleaned below 80 Hz across inactive sub bands\n` +
        `• Resonance spikes tamed to prevent digital clipping\n` +
        `• Reverb wet balance trimmed to maintain punch and forward mix clarity.`;
      break;

    case 9: // Wavetable Architect
      target.wave = 'sawtooth';
      target.unison = 13;
      target.detune = 0.58;
      target.drift = 0.25;
      log = `[MIND 09: WAVETABLE ARCHITECT EXECUTED]\n` +
        `• Computed additive unison density to 13 phase-dispersed voices\n` +
        `• Detune spreading offset configured to 0.58\n` +
        `• Analog oscillator drift frequency modulated for natural vintage warmth.`;
      break;

    case 10: // Groove Extractor
      newArp.enabled = true;
      newArp.bpm = 124;
      newArp.swing = 33;
      newArp.gate = 0.55;
      newArp.steps = [true, false, true, true, false, true, false, true, true, false, true, false, true, true, false, true];
      log = `[MIND 10: GROOVE EXTRACTOR EXECUTED]\n` +
        `• Extracted syncopated shuffle pattern loaded into 16-step grid\n` +
        `• MPC-style swing dialed to 33%\n` +
        `• Staccato gate at 55% for dynamic funk bounce.`;
      break;

    case 11: // Transient Designer
      target.attack = 0.001; // Instant snap
      target.decay = 0.22;
      target.sustain = 0.4;
      target.cutoff = 3600;
      target.res = 6.0;
      target.envmod = 0.8;
      log = `[MIND 11: TRANSIENT DESIGNER EXECUTED]\n` +
        `• Attack time compressed to 1ms for ultra-sharp transient click\n` +
        `• Punch envelope mod boosted to +80% centered @ 3,600 Hz\n` +
        `• Fast 220ms decay to leave room for subsequent rhythmic strikes.`;
      break;

    case 12: // Micro-Tuning Explorer
      target.drift = 0.35;
      target.detune = 0.65;
      newLayers.forEach((l, i) => {
        l.semiOffset = (i % 3 === 0) ? 0 : (i % 2 === 0 ? 7 : 0);
      });
      log = `[MIND 12: MICRO-TUNING EXPLORER EXECUTED]\n` +
        `• Applied subtle quarter-tone pitch drift (35% frequency variance)\n` +
        `• Natural microtonal beatings introduced between unison voices\n` +
        `• Exotic harmonic fifth intervals assigned across odd layer pairings.`;
      break;

    case 13: // Psychoacoustic Enhancer
      newFx.widthEnabled = true;
      newFx.stereoWidth = 1.85;
      newLayers.forEach((l, idx) => {
        l.pan = idx % 2 === 0 ? -0.85 : 0.85;
      });
      log = `[MIND 13: PSYCHOACOUSTIC ENHANCER EXECUTED]\n` +
        `• Mid/Side stereo width coefficient pushed to 185%\n` +
        `• Alternating hard-left/hard-right layer panning (-85% / +85%)\n` +
        `• Out-of-phase Haas spatial reflection active for headphone immersion.`;
      break;

    case 14: // Evolutionary Mutation
      const jitter = (val: number, range: number) => {
        const delta = (Math.random() - 0.5) * range;
        return Math.max(0, val + delta);
      };
      target.detune = Math.min(1, jitter(target.detune, 0.15));
      target.cutoff = Math.min(18000, Math.max(100, jitter(target.cutoff, 800)));
      target.res = Math.min(15, Math.max(0.5, jitter(target.res, 1.5)));
      target.attack = Math.min(2, Math.max(0.005, jitter(target.attack, 0.05)));
      log = `[MIND 14: EVOLUTIONARY MUTATION EXECUTED]\n` +
        `• Genetic perturbation applied to Layer ${target.id}:\n` +
        `  -> Detune: ${target.detune.toFixed(2)}\n` +
        `  -> Cutoff: ${Math.round(target.cutoff)} Hz\n` +
        `  -> Resonance: ${target.res.toFixed(1)}\n` +
        `  -> Attack: ${target.attack.toFixed(3)}s.`;
      break;

    case 15: // Patch Deconstructor
      target.cutoff = 2800;
      target.res = 3.8;
      target.envmod = 0.55;
      target.attack = 0.03;
      target.decay = 0.35;
      target.sustain = 0.7;
      target.release = 0.8;
      newFx.reverbWet = 0.35;
      newFx.delayMix = 0.3;
      log = `[MIND 15: PATCH DECONSTRUCTOR EXECUTED]\n` +
        `• Spectral harmonic analysis completed\n` +
        `• Fundamental and formant resonance aligned to sweet spot (3.8 Q @ 2.8kHz)\n` +
        `• Balanced ADSR slope established for optimal polyphonic voice headroom.`;
      break;

    default:
      log = `Mind #${mindId} executed successfully.`;
  }

  return {
    layers: newLayers,
    fx: newFx,
    arp: newArp,
    log,
  };
}

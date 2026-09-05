import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Play,
  Layers,
  Sparkles,
} from 'lucide-react';
import { soundRecipes } from '../audio/presets';
import { Preset } from '../types/synth';

interface ManualViewProps {
  onLoadRecipe: (patch: Partial<Preset>) => void;
}

export const ManualView: React.FC<ManualViewProps> = ({ onLoadRecipe }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyManual = () => {
    const manualText = `QUINDECIMA - QUINDECIM MENTES SYNTHESIZER OPERATOR MANUAL
============================================================

1. SYSTEM ARCHITECTURE OVERVIEW
Quindecima (Latin for 15, and the classical musical term for double-octave) is an 8-layer multitimbral neural synthesizer powered by the Quindecim Mentes (15 AI Minds) neural acoustic engine. Designed to transcend traditional supersaw limitations, it provides massive sonic landscapes alongside intimate acoustic resophonics.

2. MULTITIMBRAL SWARMS & LAYERS
The instrument incorporates 8 independent synth layers. Each layer features independent fractal oscillators, diode ladder filters, envelope generators, and spatial positioning controls.
- Layer Stacking: Trigger all 8 swarms simultaneously for stadium-filling leads.
- Unison Detuning: Up to 15 voices per key per layer, yielding up to 120 simultaneous voices per chord.
- Panning & Drift: Independent stereo panorama offsets and analog temperature drift.

3. THE 15 AI MINDS (QUINDECIM MENTES) DSP PARAMETER REFERENCE
Each neural module operates directly upon low-level DSP parameters in the audio path:
- 01. Timbre Sculptor: Odd/even harmonic saturation ratio, diode ladder drive, high-shelf rolloff (-12dB/oct).
- 02. Rhythm Weaver: Euclidean pulse density (k/n), step swing offset (0–75%), polyrhythmic accent gain (+3dB).
- 03. Mod Matrix Assistant: Auto-wires LFO-to-cutoff routing, ADSR time multipliers, and bipolar depth amounts.
- 04. Sweet Spot FX: Reverb early reflection density, delay damping cutoff (1.2kHz–8kHz), and shimmer pitch ratio (+12st).
- 05. Genre Chameleon: Reconfigures 8-layer Gain/Pan topology, filter cutoff distribution curve, and detune spread matrix.
- 06. Harmony Engine: Polyphonic voice allocation, scale quantizer interval (+3rd, +5th, +7th), and pitch transpose.
- 07. Glitch & Destroy: Granular grain size (10ms–150ms), buffer repeat rate, and tape-stop pitch envelope decay.
- 08. Mix Assistant: 4-band parametric EQ Q-factors, RMS compressor threshold/ratio, and sidechain ducking depth.
- 09. Wavetable Architect: Harmonic additive phase angles, spectral tilt slope, and wavefolding drive threshold.
- 10. Groove Extractor: Transient peak timestamps, micro-timing shuffle grid offset, and velocity mapping curves.
- 11. Transient Designer: Attack gain boost (+6dB), decay duration multiplier, and punch frequency focus (200Hz–2.5kHz).
- 12. Micro-Tuning Explorer: Scale key cent offsets, quarter-tone tuning maps, and microtonal drift frequency.
- 13. Psychoacoustic Enhancer: Mid/Side stereo width ratio, Haas effect delay offset (5ms–30ms), and exciter drive.
- 14. Evolutionary Mutation: Per-keystroke parameter variance percentage, LFO phase randomization, and drift velocity.
- 15. Patch Deconstructor: FFT spectral peak matching, harmonic envelope tracking, and filter slope estimation.

4. PLAYBACK CONTROLS & QWERTY MAPPING
Play Quindecima using your computer keyboard or connected USB/Bluetooth MIDI keyboards:
- Notes: [A] [S] [D] [F] [G] [H] [J] [K] [L] [;]
- Accidentals: [W] [E] [T] [Y] [U] [O] [P]
- Octave Shift: [Z] (Octave Down) / [X] (Octave Up)
- Pitch Bend & Mod Wheel: Real-time slider controllers with spring-back dynamics.

5. QUICKSTART SOUND DESIGN RECIPES
- Recipe A: Stadium SuperSaw Lead (Sawtooth, 15 voices, 0.65 detune, 8.5kHz Lowpass, Attack 0.02s, Stack 8 layers).
- Recipe B: Intimate Ambient Cloud Pad (Sine/Triangle, 5 voices, Lowpass 1.2kHz, Attack 0.8s, Release 2.5s, 85% Reverb).
- Recipe C: Cyberpunk Formant Talking Bass (Square wave, Bandpass 3.5kHz, Resonance 8.0 Q, Attack 0.001s, Transient boost).`;

    navigator.clipboard.writeText(manualText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full h-full p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-6 flex flex-col gap-5">
        {/* Header with Copy Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1f273d]">
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#fbbf24] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#fbbf24]" />
              QUINDECIMA OPERATOR MANUAL
            </h2>
            <p className="text-xs font-mono text-gray-400 mt-1">
              Official Reference Guide, DSP Parameter Index & Sound Design Recipes
            </p>
          </div>

          <button
            onClick={handleCopyManual}
            className="px-4 py-2 bg-[#fbbf24]/20 border border-[#fbbf24] text-[#fbbf24] font-mono text-xs font-bold rounded-lg hover:bg-[#fbbf24]/30 transition flex items-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'COPIED TO CLIPBOARD!' : 'COPY MANUAL FOR GOOGLE DOCS'}
          </button>
        </div>

        {/* Section 1: System Overview */}
        <section className="bg-[#080a10] border border-[#1f273d] p-5 rounded-xl space-y-2 font-mono text-xs">
          <h3 className="font-display text-base text-[#00f3ff] font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 1. System Architecture Overview
          </h3>
          <p className="text-gray-300 leading-relaxed font-sans text-sm">
            <strong className="text-white">Quindecima</strong> (Latin for 15, and the classical musical term for double-octave) is an 8-layer multitimbral synthesizer powered by the <em>Quindecim Mentes</em> (15 AI Minds) neural acoustic engine. Designed to transcend traditional supersaw limitations, it provides massive stadium sonic landscapes alongside intimate acoustic resophonics.
          </p>
        </section>

        {/* Section 2: Multitimbral Swarms */}
        <section className="bg-[#080a10] border border-[#1f273d] p-5 rounded-xl space-y-3 font-mono text-xs">
          <h3 className="font-display text-base text-[#a855f7] font-bold flex items-center gap-2">
            <Layers className="w-4 h-4" /> 2. Multitimbral Swarms & Layers
          </h3>
          <p className="text-gray-300 leading-relaxed font-sans text-sm">
            The instrument incorporates up to <strong className="text-white">8 independent synth layers</strong>. Each layer features independent fractal oscillators, diode ladder filters, envelope generators, and spatial positioning controls.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400 font-mono text-xs">
            <li><strong className="text-gray-200">Layer Stacking:</strong> Trigger all 8 swarms simultaneously for stadium-filling leads.</li>
            <li><strong className="text-gray-200">Unison Voices:</strong> Up to 15 voices per layer with centered detune spread.</li>
            <li><strong className="text-gray-200">Analog Drift:</strong> Per-layer pitch variance simulating thermal component fluctuations.</li>
          </ul>
        </section>

        {/* Section 3: 15 AI Minds Reference Table */}
        <section className="bg-[#080a10] border border-[#1f273d] p-5 rounded-xl space-y-3 font-mono text-xs">
          <h3 className="font-display text-base text-[#f43f5e] font-bold">
            3. The 15 AI Minds (Quindecim Mentes) DSP Parameter Reference
          </h3>
          <p className="text-gray-400 text-xs">
            Each neural module operates directly upon low-level DSP parameters in the audio path:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#00f3ff] font-bold">01. Timbre Sculptor:</span> Odd/even harmonic saturation ratio, diode ladder drive (+3.2dB), high-shelf rolloff (-12dB/oct @ 14.2kHz).
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#00f3ff] font-bold">02. Rhythm Weaver:</span> Euclidean pulse density ($k/n$), step swing offset (0–75%), polyrhythmic accent gain (+3dB).
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#00f3ff] font-bold">03. Mod Matrix Assistant:</span> Auto-wires filter envelope mod (+55%), ADSR time multipliers, LFO depth sync.
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#00f3ff] font-bold">04. Sweet Spot FX:</span> Reverb early reflection density, delay damping cutoff (4.8kHz), shimmer ratio (+12st).
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#00f3ff] font-bold">05. Genre Chameleon:</span> Reconfigures 8-layer Pan topology (-85% to +85%), filter cutoff curve, detune spread matrix.
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#a855f7] font-bold">06. Harmony Engine:</span> Sets polyphonic voice allocation, scale quantizer interval (+3rd, +5th, +7th), octave stacking.
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#a855f7] font-bold">07. Glitch & Destroy:</span> Granular grain size (10ms–150ms), buffer repeat rate, tape-stop pitch decay.
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#a855f7] font-bold">08. Mix Assistant:</span> 4-band parametric EQ Q-factors, RMS compressor threshold/ratio, low rumble cut @ 80Hz.
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#a855f7] font-bold">09. Wavetable Architect:</span> Computes additive harmonic angles, spectral tilt slope (-3dB/oct), wavefolding drive threshold.
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#a855f7] font-bold">10. Groove Extractor:</span> Transient peak timestamps, micro-timing shuffle grid offset, dynamic velocity mapping.
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#f43f5e] font-bold">11. Transient Designer:</span> Sets attack snap (1ms), decay duration multiplier, punch frequency focus (850Hz).
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#f43f5e] font-bold">12. Micro-Tuning Explorer:</span> Scale key cent offsets, quarter-tone tuning maps, microtonal drift frequency.
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#f43f5e] font-bold">13. Psychoacoustic Enhancer:</span> Mid/Side stereo width ratio (185%), Haas effect delay offset (12ms), exciter drive.
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#f43f5e] font-bold">14. Evolutionary Mutation:</span> Per-keystroke parameter variance percentage, LFO phase randomization, drift velocity.
            </div>
            <div className="p-3 bg-[#0f1320] rounded-lg border border-[#1f273d]">
              <span className="text-[#f43f5e] font-bold">15. Patch Deconstructor:</span> Performs FFT spectral peak matching, harmonic envelope tracking, filter slope optimization.
            </div>
          </div>
        </section>

        {/* Section 4: Quickstart Sound Design Recipes */}
        <section className="bg-[#080a10] border border-[#1f273d] p-5 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-base text-[#fbbf24] font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 4. Quickstart Sound Design Recipes
            </h3>
            <span className="text-[10px] font-mono text-gray-400">
              Interactive 1-Click Loaders
            </span>
          </div>

          <div className="space-y-4">
            {soundRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="p-4 bg-[#0f1320] rounded-xl border border-[#1f273d] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-500 transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: recipe.color }}
                    >
                      {recipe.title}
                    </span>
                    <span className="text-[10px] font-mono bg-[#080a10] text-gray-400 px-2 py-0.5 rounded border border-[#1f273d]">
                      {recipe.target}
                    </span>
                  </div>
                  <ol className="list-decimal pl-5 text-xs text-gray-300 font-mono space-y-1">
                    {recipe.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                <button
                  onClick={() => onLoadRecipe(recipe.presetPatch)}
                  className="px-4 py-2.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap bg-[#00f3ff]/20 border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff]/30 shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                >
                  <Play className="w-3.5 h-3.5 fill-[#00f3ff]" />
                  LOAD & AUDITION
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

import React from 'react';
import { Grid, Play, Square, Shuffle } from 'lucide-react';
import { ArpState, ArpMode } from '../types/synth';
import { generateEuclideanSteps } from '../audio/presets';

interface ArpeggiatorSectionProps {
  arp: ArpState;
  onUpdateArp: (param: keyof ArpState, value: unknown) => void;
  currentStep: number;
}

export const ArpeggiatorSection: React.FC<ArpeggiatorSectionProps> = ({
  arp,
  onUpdateArp,
  currentStep,
}) => {
  const toggleStep = (index: number) => {
    const newSteps = [...arp.steps];
    newSteps[index] = !newSteps[index];
    onUpdateArp('steps', newSteps);
  };

  const toggleAccent = (index: number) => {
    const newAccents = [...arp.accents];
    newAccents[index] = !newAccents[index];
    onUpdateArp('accents', newAccents);
  };

  const handleEuclideanKChange = (k: number) => {
    onUpdateArp('euclideanK', k);
    const generated = generateEuclideanSteps(k, 16);
    onUpdateArp('steps', generated);
  };

  return (
    <div className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-5 flex flex-col gap-4">
      {/* Header with Power Button */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f273d]">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-[#fbbf24]" />
          <h2 className="font-display font-bold text-[#fbbf24] text-base sm:text-lg">
            EUCLIDEAN POLYRHYTHMIC ARPEGGIATOR
          </h2>
        </div>

        <button
          onClick={() => onUpdateArp('enabled', !arp.enabled)}
          className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition flex items-center gap-1.5 ${
            arp.enabled
              ? 'bg-[#fbbf24]/20 border-[#fbbf24] text-[#fbbf24] shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'bg-[#080a10] border-[#1f273d] text-gray-400 hover:text-white'
          }`}
        >
          {arp.enabled ? <Square className="w-3.5 h-3.5 fill-[#fbbf24]" /> : <Play className="w-3.5 h-3.5" />}
          {arp.enabled ? 'ARP: RUNNING' : 'ARP: OFF'}
        </button>
      </div>

      {/* Arp Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#080a10] border border-[#1f273d] p-4 rounded-xl">
        {/* Tempo BPM */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">TEMPO</span>
            <span className="text-[#fbbf24] font-bold">{arp.bpm} BPM</span>
          </div>
          <input
            type="range"
            min="60"
            max="180"
            step="1"
            value={arp.bpm}
            onChange={(e) => onUpdateArp('bpm', parseInt(e.target.value, 10))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Pattern Mode */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">PATTERN MODE</span>
            <span className="text-[#fbbf24] uppercase font-bold">{arp.mode}</span>
          </div>
          <select
            value={arp.mode}
            onChange={(e) => onUpdateArp('mode', e.target.value as ArpMode)}
            className="w-full bg-[#0f1320] border border-[#1f273d] rounded p-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#fbbf24] cursor-pointer"
          >
            <option value="up">Up Escalation</option>
            <option value="down">Down Cascade</option>
            <option value="updown">Up / Down Bounce</option>
            <option value="random">Random Arp</option>
            <option value="euclidean">Euclidean Density Matrix</option>
          </select>
        </div>

        {/* Euclidean Density K */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">EUCLIDEAN PULSES</span>
            <span className="text-[#fbbf24] font-bold">
              {arp.euclideanK} / 16
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={arp.euclideanK}
            onChange={(e) => handleEuclideanKChange(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Gate Length & Swing */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">SWING SHUFFLE</span>
            <span className="text-[#fbbf24]">{arp.swing}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="65"
            step="1"
            value={arp.swing}
            onChange={(e) => onUpdateArp('swing', parseInt(e.target.value, 10))}
            className="w-full cursor-pointer"
          />
        </div>
      </div>

      {/* 16-Step Pattern Sequencer Grid */}
      <div className="bg-[#080a10] border border-[#1f273d] rounded-xl p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[11px] font-mono text-gray-400 mb-1">
          <span>16-STEP SEQUENCE (CLICK TO TOGGLE ACTIVE • DOUBLE-CLICK FOR ACCENT)</span>
          <button
            onClick={() => {
              const randomSteps = Array.from({ length: 16 }, () => Math.random() > 0.4);
              onUpdateArp('steps', randomSteps);
            }}
            className="text-[10px] text-gray-400 hover:text-[#fbbf24] flex items-center gap-1 bg-[#0f1320] px-2 py-0.5 rounded border border-[#1f273d]"
          >
            <Shuffle className="w-3 h-3" /> RANDOMIZE
          </button>
        </div>

        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
          {arp.steps.map((isActive, idx) => {
            const isCursor = arp.enabled && currentStep === idx;
            const isAccented = arp.accents[idx];

            return (
              <button
                key={idx}
                onClick={() => toggleStep(idx)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleAccent(idx);
                }}
                className={`h-12 rounded-lg border font-mono text-xs font-bold flex flex-col items-center justify-between p-1.5 transition-all relative ${
                  isCursor
                    ? 'ring-2 ring-white scale-105 z-10'
                    : ''
                } ${
                  isActive
                    ? isAccented
                      ? 'bg-[#fbbf24] text-black border-[#fbbf24] shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                      : 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/60'
                    : 'bg-[#0f1320] text-gray-600 border-[#1f273d] hover:border-gray-600'
                }`}
              >
                <span className="text-[9px] opacity-70">{idx + 1}</span>
                <span className="text-[10px]">
                  {isActive ? (isAccented ? 'ACC' : 'ON') : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

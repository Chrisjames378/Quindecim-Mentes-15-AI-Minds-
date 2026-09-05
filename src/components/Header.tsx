import React from 'react';
import {
  Brain,
  Sliders,
  Cpu,
  Sparkles,
  BookOpen,
  Power,
  Volume2,
  Radio,
} from 'lucide-react';
import { Preset } from '../types/synth';
import { builtInPresets } from '../audio/presets';

interface HeaderProps {
  activeTab: 'synth' | 'mendes' | 'fx' | 'manual';
  onTabChange: (tab: 'synth' | 'mendes' | 'fx' | 'manual') => void;
  isEngineActive: boolean;
  onToggleEngine: () => void;
  masterVolume: number;
  onVolumeChange: (vol: number) => void;
  currentPresetId: string;
  onSelectPreset: (preset: Preset) => void;
  midiConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isEngineActive,
  onToggleEngine,
  masterVolume,
  onVolumeChange,
  currentPresetId,
  onSelectPreset,
  midiConnected = false,
}) => {
  return (
    <header className="bg-[#0f1320] border-b border-[#1f273d] px-4 lg:px-6 py-2.5 flex flex-wrap justify-between items-center z-20 gap-3">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff]">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-lg tracking-wider text-white">
                QUINDECIMA
              </h1>
              <span className="text-[10px] font-mono bg-[#00f3ff]/10 text-[#00f3ff] px-2 py-0.5 rounded border border-[#00f3ff]/30">
                15 MINDS DSP
              </span>
            </div>
          </div>
        </div>

        {midiConnected && (
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
            <Radio className="w-3 h-3 animate-pulse" />
            MIDI READY
          </div>
        )}
      </div>

      {/* Mode Navigation Tabs */}
      <nav className="flex bg-[#080a10] p-1 rounded-lg border border-[#1f273d] gap-1 font-mono text-xs">
        <button
          onClick={() => onTabChange('synth')}
          className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'synth'
              ? 'text-white bg-[#1f273d] shadow-sm border border-[#2e3a59]'
              : 'text-gray-400 hover:text-[#00f3ff]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          SYNTH ENGINE
        </button>

        <button
          onClick={() => onTabChange('mendes')}
          className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'mendes'
              ? 'text-white bg-[#1f273d] shadow-sm border border-[#2e3a59]'
              : 'text-gray-400 hover:text-[#00f3ff]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-[#00f3ff]" />
          15 MINDS (AI)
        </button>

        <button
          onClick={() => onTabChange('fx')}
          className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'fx'
              ? 'text-white bg-[#1f273d] shadow-sm border border-[#2e3a59]'
              : 'text-gray-400 hover:text-[#a855f7]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
          HYPER-FX & ARP
        </button>

        <button
          onClick={() => onTabChange('manual')}
          className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'manual'
              ? 'text-white bg-[#1f273d] shadow-sm border border-[#2e3a59]'
              : 'text-gray-400 hover:text-[#fbbf24]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#fbbf24]" />
          OPERATOR MANUAL
        </button>
      </nav>

      {/* Master Controls */}
      <div className="flex items-center gap-3 font-mono text-xs">
        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 bg-[#080a10] px-2.5 py-1 rounded border border-[#1f273d]">
          <span className="text-[10px] text-gray-400">PRESET:</span>
          <select
            value={currentPresetId}
            onChange={(e) => {
              const p = builtInPresets.find((item) => item.id === e.target.value);
              if (p) onSelectPreset(p);
            }}
            className="bg-transparent text-xs font-mono text-[#00f3ff] focus:outline-none cursor-pointer max-w-[160px] truncate"
          >
            {builtInPresets.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0f1320] text-gray-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Master Volume */}
        <div className="hidden sm:flex items-center gap-2 bg-[#080a10] px-2.5 py-1 rounded border border-[#1f273d]">
          <Volume2 className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 h-1 cursor-pointer"
            title={`Master Volume: ${Math.round(masterVolume * 100)}%`}
          />
          <span className="text-[10px] text-gray-400 w-7 text-right">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>

        {/* Audio Engine Power Button */}
        <button
          onClick={onToggleEngine}
          className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 transition ${
            isEngineActive
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {isEngineActive ? 'ENGINE ON' : 'START AUDIO'}
        </button>
      </div>
    </header>
  );
};

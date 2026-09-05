import React from 'react';
import { Filter, Zap } from 'lucide-react';
import { LayerState, FilterType } from '../types/synth';

interface FilterSectionProps {
  layer: LayerState;
  onUpdate: (param: keyof LayerState, value: unknown) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  layer,
  onUpdate,
}) => {
  return (
    <div className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-4 flex flex-col justify-between">
      {/* Title */}
      <div className="flex justify-between items-center mb-3">
        <span className="font-display font-bold text-[#a855f7] text-sm flex items-center gap-1.5">
          <Filter className="w-4 h-4" />
          Z-PLANE / LIQUID FILTER
        </span>
        <span className="text-[10px] font-mono text-gray-400 bg-[#121624] px-2 py-0.5 rounded border border-[#1f273d]">
          24dB DIODE LADDER
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Filter Mode */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">FILTER MODE</span>
            <span className="text-[#a855f7] font-bold uppercase">{layer.filterType}</span>
          </div>
          <select
            value={layer.filterType}
            onChange={(e) => onUpdate('filterType', e.target.value as FilterType)}
            className="w-full bg-[#080a10] border border-[#1f273d] rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-[#a855f7] cursor-pointer"
          >
            <option value="lowpass">Liquid Diode Lowpass (24dB)</option>
            <option value="highpass">Highpass Clean (12dB)</option>
            <option value="bandpass">Vocal Tract Bandpass</option>
            <option value="notch">Z-Plane Morph Notch</option>
          </select>
        </div>

        {/* Cutoff Frequency */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">CUTOFF FREQUENCY</span>
            <span className="text-[#a855f7] font-bold">{Math.round(layer.cutoff)} Hz</span>
          </div>
          <input
            type="range"
            min="40"
            max="18000"
            step="10"
            value={layer.cutoff}
            onChange={(e) => onUpdate('cutoff', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          {/* Quick Freq Presets */}
          <div className="flex gap-1.5 mt-1">
            {[400, 1500, 4500, 10000].map((f) => (
              <button
                key={f}
                onClick={() => onUpdate('cutoff', f)}
                className="text-[9px] font-mono text-gray-400 hover:text-[#a855f7] bg-[#080a10] px-1.5 py-0.5 rounded border border-[#1f273d]"
              >
                {f >= 1000 ? `${f / 1000}k` : `${f}`}
              </button>
            ))}
          </div>
        </div>

        {/* Resonance (Q) */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">RESONANCE (Q)</span>
            <span className="text-[#a855f7] font-bold">{layer.res.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="18"
            step="0.1"
            value={layer.res}
            onChange={(e) => onUpdate('res', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Env Mod & Overdrive */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#1f273d]/70">
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-gray-400">ENV MOD</span>
              <span className="text-[#a855f7]">
                {layer.envmod >= 0 ? `+${Math.round(layer.envmod * 100)}%` : `${Math.round(layer.envmod * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.02"
              value={layer.envmod}
              onChange={(e) => onUpdate('envmod', parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-gray-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#a855f7]" /> DRIVE
              </span>
              <span className="text-[#a855f7]">{Math.round((layer.drive || 0) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={layer.drive || 0}
              onChange={(e) => onUpdate('drive', parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

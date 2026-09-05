import React, { useState } from 'react';
import { Activity, Clock } from 'lucide-react';
import { LayerState } from '../types/synth';

interface EnvelopeSectionProps {
  layer: LayerState;
  onUpdate: (param: keyof LayerState, value: unknown) => void;
}

export const EnvelopeSection: React.FC<EnvelopeSectionProps> = ({
  layer,
  onUpdate,
}) => {
  const [targetEnv, setTargetEnv] = useState<'amp' | 'filter'>('amp');

  const a = targetEnv === 'amp' ? layer.attack : layer.filterAttack ?? layer.attack;
  const d = targetEnv === 'amp' ? layer.decay : layer.filterDecay ?? layer.decay;
  const s = targetEnv === 'amp' ? layer.sustain : layer.filterSustain ?? layer.sustain;
  const r = targetEnv === 'amp' ? layer.release : layer.filterRelease ?? layer.release;

  const handleParamChange = (stage: 'attack' | 'decay' | 'sustain' | 'release', val: number) => {
    if (targetEnv === 'amp') {
      onUpdate(stage, val);
    } else {
      const filterKeyMap: Record<string, keyof LayerState> = {
        attack: 'filterAttack',
        decay: 'filterDecay',
        sustain: 'filterSustain',
        release: 'filterRelease',
      };
      onUpdate(filterKeyMap[stage], val);
    }
  };

  // Compute SVG ADSR path coordinates
  // Normalized: total width = 240, height = 50
  const svgWidth = 240;
  const svgHeight = 44;
  const totalTime = Math.max(1.0, a + d + 0.8 + r);

  const x0 = 4;
  const y0 = svgHeight - 4;

  const x1 = Math.min(65, x0 + (a / totalTime) * (svgWidth * 0.75));
  const y1 = 4; // Peak

  const x2 = Math.min(130, x1 + (d / totalTime) * (svgWidth * 0.75));
  const y2 = svgHeight - 4 - s * (svgHeight - 8);

  const x3 = x2 + 35; // Sustain hold length visual
  const y3 = y2;

  const x4 = Math.min(svgWidth - 4, x3 + (r / totalTime) * (svgWidth * 0.75));
  const y4 = svgHeight - 4;

  const pathD = `M ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4}`;

  return (
    <div className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-4 flex flex-col justify-between">
      {/* Title & Env Mode Switcher */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-display font-bold text-[#f43f5e] text-sm flex items-center gap-1.5">
          <Activity className="w-4 h-4" />
          {targetEnv === 'amp' ? 'AMP ENVELOPE' : 'FILTER ENVELOPE'}
        </span>

        <div className="flex bg-[#080a10] rounded p-0.5 border border-[#1f273d]">
          <button
            onClick={() => setTargetEnv('amp')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition ${
              targetEnv === 'amp'
                ? 'bg-[#1f273d] text-[#f43f5e] font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            AMP
          </button>
          <button
            onClick={() => setTargetEnv('filter')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition ${
              targetEnv === 'filter'
                ? 'bg-[#1f273d] text-[#f43f5e] font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            FILTER
          </button>
        </div>
      </div>

      {/* Real-Time SVG ADSR Curve Display */}
      <div className="bg-[#080a10] border border-[#1f273d] rounded-lg p-2 mb-3">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-11 overflow-visible"
        >
          {/* Shaded Area */}
          <path
            d={`${pathD} L ${x4} ${svgHeight - 4} L ${x0} ${svgHeight - 4} Z`}
            fill="rgba(244, 63, 94, 0.15)"
          />
          {/* Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Stage Node Markers */}
          <circle cx={x1} cy={y1} r="3" fill="#00f3ff" />
          <circle cx={x2} cy={y2} r="3" fill="#a855f7" />
          <circle cx={x3} cy={y3} r="2.5" fill="#f43f5e" />
          <circle cx={x4} cy={y4} r="3" fill="#f43f5e" />
        </svg>
      </div>

      {/* ADSR Sliders */}
      <div className="space-y-2.5">
        {/* Attack */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-0.5">
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#f43f5e]" /> ATTACK
            </span>
            <span className="text-[#f43f5e] font-bold">{a.toFixed(3)} s</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="3"
            step="0.005"
            value={a}
            onChange={(e) => handleParamChange('attack', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Decay */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-0.5">
            <span className="text-gray-400">DECAY</span>
            <span className="text-[#f43f5e] font-bold">{d.toFixed(2)} s</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="4"
            step="0.01"
            value={d}
            onChange={(e) => handleParamChange('decay', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Sustain */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-0.5">
            <span className="text-gray-400">SUSTAIN</span>
            <span className="text-[#f43f5e] font-bold">{Math.round(s * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={s}
            onChange={(e) => handleParamChange('sustain', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Release */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-0.5">
            <span className="text-gray-400">RELEASE</span>
            <span className="text-[#f43f5e] font-bold">{r.toFixed(2)} s</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="6"
            step="0.02"
            value={r}
            onChange={(e) => handleParamChange('release', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

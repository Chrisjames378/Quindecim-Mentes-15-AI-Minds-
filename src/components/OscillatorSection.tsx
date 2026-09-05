import React from 'react';
import { Waves, Sparkles, Volume2 } from 'lucide-react';
import { LayerState, OscWave } from '../types/synth';

interface OscillatorSectionProps {
  layer: LayerState;
  onUpdate: (param: keyof LayerState, value: unknown) => void;
}

export const OscillatorSection: React.FC<OscillatorSectionProps> = ({
  layer,
  onUpdate,
}) => {
  return (
    <div className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-4 flex flex-col justify-between">
      {/* Title */}
      <div className="flex justify-between items-center mb-3">
        <span className="font-display font-bold text-[#00f3ff] text-sm flex items-center gap-1.5">
          <Waves className="w-4 h-4" />
          FRACTAL OSCILLATOR
        </span>
        <span className="text-[10px] font-mono text-gray-400 bg-[#121624] px-2 py-0.5 rounded border border-[#1f273d]">
          LAYER {layer.id}
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Wave Shape */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">WAVE SHAPE</span>
            <span className="text-[#00f3ff] font-bold uppercase">{layer.wave}</span>
          </div>
          <select
            value={layer.wave}
            onChange={(e) => onUpdate('wave', e.target.value as OscWave)}
            className="w-full bg-[#080a10] border border-[#1f273d] rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-[#00f3ff] cursor-pointer"
          >
            <option value="sawtooth">Super-Saw (15 Voice Detune)</option>
            <option value="square">Fractal Pulse-Width Square</option>
            <option value="sine">Pure Sine Resonator</option>
            <option value="triangle">Vocal Morphing Triangle</option>
          </select>
        </div>

        {/* Detune */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">SUPERSAW DETUNE</span>
            <span className="text-[#00f3ff] font-bold">{layer.detune.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={layer.detune}
            onChange={(e) => onUpdate('detune', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Unison Voices */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-gray-400">UNISON VOICES</span>
            <span className="text-[#00f3ff] font-bold">{layer.unison} Voices</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="2"
            value={layer.unison}
            onChange={(e) => onUpdate('unison', parseInt(e.target.value, 10))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Analog Drift & Sub-Oscillator Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00f3ff]" /> DRIFT
              </span>
              <span className="text-[#00f3ff]">{Math.round(layer.drift * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={layer.drift}
              onChange={(e) => onUpdate('drift', parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-gray-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-[#00f3ff]" /> SUB-OSC
              </span>
              <span className="text-[#00f3ff]">{Math.round(layer.subOsc * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={layer.subOsc}
              onChange={(e) => onUpdate('subOsc', parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Layer Octave Offset and Pan */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#1f273d]/70">
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-gray-400">OCTAVE SHIFT</span>
              <span className="text-[#00f3ff] font-bold">
                {layer.octaveOffset > 0 ? `+${layer.octaveOffset}` : layer.octaveOffset}
              </span>
            </div>
            <div className="flex gap-1">
              {[-1, 0, 1, 2].map((oct) => (
                <button
                  key={oct}
                  onClick={() => onUpdate('octaveOffset', oct)}
                  className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition ${
                    layer.octaveOffset === oct
                      ? 'bg-[#00f3ff]/20 border-[#00f3ff] text-[#00f3ff]'
                      : 'bg-[#080a10] border-[#1f273d] text-gray-400 hover:text-white'
                  }`}
                >
                  {oct > 0 ? `+${oct}` : oct}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-gray-400">PANORAMA</span>
              <span className="text-[#00f3ff]">
                {layer.pan === 0
                  ? 'C'
                  : layer.pan < 0
                  ? `${Math.abs(Math.round(layer.pan * 100))}L`
                  : `${Math.round(layer.pan * 100)}R`}
              </span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.02"
              value={layer.pan}
              onChange={(e) => onUpdate('pan', parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

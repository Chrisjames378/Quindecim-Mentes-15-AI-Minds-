import React from 'react';
import { Layers, VolumeX, Volume2 } from 'lucide-react';
import { LayerState } from '../types/synth';

interface LayerSelectorProps {
  layers: LayerState[];
  activeLayer: number;
  onSelectLayer: (layerId: number) => void;
  stackAllLayers: boolean;
  onToggleStackAll: () => void;
  onToggleMute: (layerId: number) => void;
}

export const LayerSelector: React.FC<LayerSelectorProps> = ({
  layers,
  activeLayer,
  onSelectLayer,
  stackAllLayers,
  onToggleStackAll,
  onToggleMute,
}) => {
  return (
    <div className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-3 sm:p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="font-mono text-xs font-bold text-gray-200 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#a855f7]" />
          <span>MULTITIMBRAL SWARMS</span>
        </div>
        <span className="text-[10px] font-mono text-[#a855f7] bg-[#a855f7]/10 px-2 py-0.5 rounded border border-[#a855f7]/30">
          8 Independent Synths
        </span>
      </div>

      {/* Layer Grid Buttons */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-1">
        {layers.map((l) => {
          const isSelected = l.id === activeLayer;
          return (
            <div key={l.id} className="relative group">
              <button
                onClick={() => onSelectLayer(l.id)}
                className={`w-full py-2 px-1 rounded-lg border font-mono text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff]/10 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                    : l.mute
                    ? 'border-[#1f273d] text-gray-600 bg-[#080a10] opacity-50'
                    : 'border-[#1f273d] text-gray-400 hover:border-gray-500 bg-[#0b0e17]'
                }`}
              >
                <span>L{l.id}</span>
                <span className="text-[9px] font-normal opacity-70 truncate max-w-full">
                  {l.wave.slice(0, 3).toUpperCase()}
                </span>
              </button>

              {/* Quick Mute button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMute(l.id);
                }}
                title={l.mute ? 'Unmute Layer' : 'Mute Layer'}
                className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] transition ${
                  l.mute
                    ? 'bg-rose-500 text-white'
                    : 'bg-[#1f273d] text-gray-400 hover:text-white'
                }`}
              >
                {l.mute ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Stack All 8 Layers Button */}
      <div className="mt-2">
        <button
          onClick={onToggleStackAll}
          className={`w-full py-2 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
            stackAllLayers
              ? 'bg-[#a855f7] text-white border border-[#c084fc] shadow-[0_0_18px_rgba(168,85,247,0.5)]'
              : 'bg-[#a855f7]/20 border border-[#a855f7]/40 text-[#c084fc] hover:bg-[#a855f7]/30'
          }`}
        >
          <Layers className="w-4 h-4" />
          {stackAllLayers ? 'ALL 8 LAYERS STACKED' : 'STACK ALL 8 LAYERS'}
        </button>
      </div>
    </div>
  );
};

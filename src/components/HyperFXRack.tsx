import React from 'react';
import { Wand2, Radio, Compass, Disc, Zap } from 'lucide-react';
import { FXState } from '../types/synth';

interface HyperFXRackProps {
  fx: FXState;
  onUpdateFX: (param: keyof FXState, value: unknown) => void;
}

export const HyperFXRack: React.FC<HyperFXRackProps> = ({
  fx,
  onUpdateFX,
}) => {
  return (
    <div className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#1f273d]">
        <h2 className="font-display font-bold text-[#a855f7] text-base sm:text-lg flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          HYPER-FX MODULAR RACK
        </h2>
        <span className="text-[10px] font-mono text-gray-400 bg-[#080a10] px-2.5 py-1 rounded border border-[#1f273d]">
          4 MASTER PROCESSORS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shatter Granular Delay */}
        <div className="bg-[#080a10] border border-[#1f273d] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#00f3ff]" />
              <span className="font-mono text-xs font-bold text-[#00f3ff]">
                SHATTER GRANULAR DELAY
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fx.delayEnabled}
                onChange={(e) => onUpdateFX('delayEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00f3ff]"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-gray-400">DELAY TIME</span>
                <span className="text-[#00f3ff]">{Math.round(fx.delayTime * 1000)} ms</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.01"
                value={fx.delayTime}
                onChange={(e) => onUpdateFX('delayTime', parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-gray-400">FEEDBACK REPEAT</span>
                <span className="text-[#00f3ff]">{Math.round(fx.delayFb * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.88"
                step="0.01"
                value={fx.delayFb}
                onChange={(e) => onUpdateFX('delayFb', parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-gray-400">WET / DRY MIX</span>
                <span className="text-[#00f3ff]">{Math.round(fx.delayMix * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={fx.delayMix}
                onChange={(e) => onUpdateFX('delayMix', parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Quantum Black-Hole Reverb */}
        <div className="bg-[#080a10] border border-[#1f273d] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#a855f7]" />
              <span className="font-mono text-xs font-bold text-[#a855f7]">
                QUANTUM BLACK-HOLE REVERB
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fx.reverbEnabled}
                onChange={(e) => onUpdateFX('reverbEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#a855f7]"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-gray-400">DECAY SIZE</span>
                <span className="text-[#a855f7]">{Math.round(fx.reverbSize * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.01"
                value={fx.reverbSize}
                onChange={(e) => onUpdateFX('reverbSize', parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-gray-400">WET / DRY MIX</span>
                <span className="text-[#a855f7]">{Math.round(fx.reverbWet * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={fx.reverbWet}
                onChange={(e) => onUpdateFX('reverbWet', parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Master Overdrive Saturation */}
        <div className="bg-[#080a10] border border-[#1f273d] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#f43f5e]" />
              <span className="font-mono text-xs font-bold text-[#f43f5e]">
                ANALOG DIODE SATURATOR
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fx.driveEnabled}
                onChange={(e) => onUpdateFX('driveEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#f43f5e]"></div>
            </label>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-gray-400">DRIVE AMOUNT</span>
              <span className="text-[#f43f5e]">{Math.round(fx.driveAmount * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={fx.driveAmount}
              onChange={(e) => onUpdateFX('driveAmount', parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Psychoacoustic Stereo Widener */}
        <div className="bg-[#080a10] border border-[#1f273d] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4 text-[#fbbf24]" />
              <span className="font-mono text-xs font-bold text-[#fbbf24]">
                PSYCHOACOUSTIC STEREO WIDTH
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fx.widthEnabled}
                onChange={(e) => onUpdateFX('widthEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#fbbf24]"></div>
            </label>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-gray-400">STEREO PANORAMA EXPANDER</span>
              <span className="text-[#fbbf24]">{Math.round(fx.stereoWidth * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={fx.stereoWidth}
              onChange={(e) => onUpdateFX('stereoWidth', parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

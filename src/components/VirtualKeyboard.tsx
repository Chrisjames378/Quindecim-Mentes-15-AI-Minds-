import React, { useState } from 'react';
import { Keyboard, ChevronLeft, ChevronRight } from 'lucide-react';

interface KeyConfig {
  note: string;
  type: 'white' | 'black';
  qwertyKey?: string;
  octaveOffset: number;
}

interface VirtualKeyboardProps {
  currentOctave: number;
  onOctaveChange: (oct: number) => void;
  activeNotes: Set<string>; // Set of "note_octave"
  onNoteOn: (note: string, octave: number) => void;
  onNoteOff: (note: string, octave: number) => void;
  pitchBend: number;
  onPitchBendChange: (val: number) => void;
  modWheel: number;
  onModWheelChange: (val: number) => void;
}

const KEYBOARD_KEYS: KeyConfig[] = [
  // First octave
  { note: 'C', type: 'white', qwertyKey: 'A', octaveOffset: 0 },
  { note: 'C#', type: 'black', qwertyKey: 'W', octaveOffset: 0 },
  { note: 'D', type: 'white', qwertyKey: 'S', octaveOffset: 0 },
  { note: 'D#', type: 'black', qwertyKey: 'E', octaveOffset: 0 },
  { note: 'E', type: 'white', qwertyKey: 'D', octaveOffset: 0 },
  { note: 'F', type: 'white', qwertyKey: 'F', octaveOffset: 0 },
  { note: 'F#', type: 'black', qwertyKey: 'T', octaveOffset: 0 },
  { note: 'G', type: 'white', qwertyKey: 'G', octaveOffset: 0 },
  { note: 'G#', type: 'black', qwertyKey: 'Y', octaveOffset: 0 },
  { note: 'A', type: 'white', qwertyKey: 'H', octaveOffset: 0 },
  { note: 'A#', type: 'black', qwertyKey: 'U', octaveOffset: 0 },
  { note: 'B', type: 'white', qwertyKey: 'J', octaveOffset: 0 },

  // Second octave
  { note: 'C', type: 'white', qwertyKey: 'K', octaveOffset: 1 },
  { note: 'C#', type: 'black', qwertyKey: 'O', octaveOffset: 1 },
  { note: 'D', type: 'white', qwertyKey: 'L', octaveOffset: 1 },
  { note: 'D#', type: 'black', qwertyKey: 'P', octaveOffset: 1 },
  { note: 'E', type: 'white', qwertyKey: ';', octaveOffset: 1 },
  { note: 'F', type: 'white', octaveOffset: 1 },
  { note: 'F#', type: 'black', octaveOffset: 1 },
  { note: 'G', type: 'white', octaveOffset: 1 },
  { note: 'G#', type: 'black', octaveOffset: 1 },
  { note: 'A', type: 'white', octaveOffset: 1 },
  { note: 'A#', type: 'black', octaveOffset: 1 },
  { note: 'B', type: 'white', octaveOffset: 1 },

  // Top C
  { note: 'C', type: 'white', octaveOffset: 2 },
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  currentOctave,
  onOctaveChange,
  activeNotes,
  onNoteOn,
  onNoteOff,
  pitchBend,
  onPitchBendChange,
  modWheel,
  onModWheelChange,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleKeyTouchStart = (k: KeyConfig) => {
    const oct = currentOctave + k.octaveOffset;
    onNoteOn(k.note, oct);
  };

  const handleKeyTouchEnd = (k: KeyConfig) => {
    const oct = currentOctave + k.octaveOffset;
    onNoteOff(k.note, oct);
  };

  return (
    <div
      className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-3 flex flex-col items-center"
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
    >
      {/* Top Controller Bar */}
      <div className="flex justify-between items-center w-full mb-2 text-xs font-mono text-gray-400 px-1">
        <div className="flex items-center gap-2">
          <Keyboard className="w-3.5 h-3.5 text-[#00f3ff]" />
          <span className="hidden sm:inline">
            VIRTUAL KEYBOARD & CONTROLS (QWERTY: A-S-D-F-G-H-J-K / Z-X Octaves)
          </span>
          <span className="sm:hidden">PLAYABLE KEYS</span>
        </div>

        {/* Octave Selector Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#080a10] rounded border border-[#1f273d] p-0.5">
            <button
              onClick={() => onOctaveChange(Math.max(1, currentOctave - 1))}
              className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#1f273d]"
              title="Octave Down [Z]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-bold text-[#00f3ff]">
              C{currentOctave}
            </span>
            <button
              onClick={() => onOctaveChange(Math.min(6, currentOctave + 1))}
              className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#1f273d]"
              title="Octave Up [X]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Play Area with Pitch & Mod Wheels + Keys */}
      <div className="flex items-end justify-center w-full gap-3 overflow-x-auto py-1">
        {/* Pitch Bend & Mod Wheels */}
        <div className="flex gap-2 pb-1 pr-1 border-r border-[#1f273d]">
          {/* Pitch Bend */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-mono text-gray-400">PITCH</span>
            <input
              type="range"
              min="-200"
              max="200"
              step="5"
              value={pitchBend}
              onChange={(e) => onPitchBendChange(parseFloat(e.target.value))}
              onMouseUp={() => onPitchBendChange(0)}
              onTouchEnd={() => onPitchBendChange(0)}
              className="w-16 h-28 -rotate-90 origin-center cursor-pointer appearance-none bg-[#080a10] rounded"
            />
          </div>

          {/* Mod Wheel */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-mono text-[#a855f7]">MOD</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={modWheel}
              onChange={(e) => onModWheelChange(parseFloat(e.target.value))}
              className="w-16 h-28 -rotate-90 origin-center cursor-pointer appearance-none bg-[#080a10] rounded"
            />
          </div>
        </div>

        {/* Piano Keys */}
        <div className="flex items-start select-none relative pb-1">
          {KEYBOARD_KEYS.map((k, index) => {
            const oct = currentOctave + k.octaveOffset;
            const keyId = `${k.note}_${oct}`;
            const isActive = activeNotes.has(keyId);

            if (k.type === 'white') {
              return (
                <button
                  key={`${k.note}_${oct}_${index}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleKeyTouchStart(k);
                  }}
                  onMouseUp={() => handleKeyTouchEnd(k)}
                  onMouseLeave={() => isActive && handleKeyTouchEnd(k)}
                  onMouseEnter={() => isMouseDown && handleKeyTouchStart(k)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleKeyTouchStart(k);
                  }}
                  onTouchEnd={() => handleKeyTouchEnd(k)}
                  className={`w-9 sm:w-11 h-32 sm:h-36 rounded-b-md border font-mono text-[11px] flex flex-col justify-end items-center pb-2 transition-all cursor-pointer relative shadow-sm ${
                    isActive
                      ? 'bg-[#00f3ff] text-gray-900 border-[#00f3ff] shadow-[0_0_16px_#00f3ff] scale-[0.98]'
                      : 'bg-gradient-to-b from-slate-200 to-slate-100 border-gray-400 text-gray-800 hover:from-white hover:to-slate-100'
                  }`}
                >
                  <span className="font-bold text-[11px]">{k.note}</span>
                  {k.qwertyKey && (
                    <span className="text-[9px] font-semibold opacity-60">
                      ({k.qwertyKey})
                    </span>
                  )}
                </button>
              );
            } else {
              // Black key
              return (
                <button
                  key={`${k.note}_${oct}_${index}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleKeyTouchStart(k);
                  }}
                  onMouseUp={() => handleKeyTouchEnd(k)}
                  onMouseLeave={() => isActive && handleKeyTouchEnd(k)}
                  onMouseEnter={() => isMouseDown && handleKeyTouchStart(k)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleKeyTouchStart(k);
                  }}
                  onTouchEnd={() => handleKeyTouchEnd(k)}
                  className={`w-6 sm:w-7 h-20 sm:h-24 rounded-b-md border font-mono text-[9px] flex flex-col justify-end items-center pb-1 -mx-3 sm:-mx-3.5 z-10 transition-all cursor-pointer shadow-lg ${
                    isActive
                      ? 'bg-[#a855f7] text-white border-[#c084fc] shadow-[0_0_14px_#a855f7] scale-[0.97]'
                      : 'bg-gradient-to-b from-gray-900 to-gray-800 border-gray-950 text-gray-200 hover:from-gray-800 hover:to-gray-700'
                  }`}
                >
                  <span className="font-bold">{k.note}</span>
                  {k.qwertyKey && (
                    <span className="text-[8px] font-mono text-[#00f3ff] opacity-80">
                      {k.qwertyKey}
                    </span>
                  )}
                </button>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

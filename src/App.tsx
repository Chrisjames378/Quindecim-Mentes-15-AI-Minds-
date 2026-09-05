import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { OscilloscopeCanvas } from './components/OscilloscopeCanvas';
import { LayerSelector } from './components/LayerSelector';
import { OscillatorSection } from './components/OscillatorSection';
import { FilterSection } from './components/FilterSection';
import { EnvelopeSection } from './components/EnvelopeSection';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { HyperFXRack } from './components/HyperFXRack';
import { ArpeggiatorSection } from './components/ArpeggiatorSection';
import { AIMindsView } from './components/AIMindsView';
import { ManualView } from './components/ManualView';

import { LayerState, FXState, ArpState, Preset } from './types/synth';
import {
  createDefaultLayers,
  defaultFX,
  defaultArp,
  builtInPresets,
} from './audio/presets';
import { synth } from './audio/AudioEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'synth' | 'mendes' | 'fx' | 'manual'>('synth');
  const [isEngineActive, setIsEngineActive] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.72);
  const [currentPresetId, setCurrentPresetId] = useState('supersaw');
  const [stackAllLayers, setStackAllLayers] = useState(true);

  // 8 Multitimbral Layers
  const [layers, setLayers] = useState<LayerState[]>(() => {
    const p = builtInPresets.find((item) => item.id === 'supersaw');
    return p ? p.layers : createDefaultLayers();
  });
  const [activeLayer, setActiveLayer] = useState<number>(1);

  // FX & Arp State
  const [fx, setFx] = useState<FXState>(() => {
    const p = builtInPresets.find((item) => item.id === 'supersaw');
    return p ? p.fx : defaultFX;
  });

  const [arp, setArp] = useState<ArpState>(() => {
    const p = builtInPresets.find((item) => item.id === 'supersaw');
    return p ? p.arp : defaultArp;
  });

  const [currentArpStep, setCurrentArpStep] = useState(0);

  // Keyboard and playing state
  const [currentOctave, setCurrentOctave] = useState(4);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [pitchBend, setPitchBend] = useState(0);
  const [modWheel, setModWheel] = useState(0);
  const [midiConnected, setMidiConnected] = useState(false);

  // References to keep event handlers fresh
  const stateRef = useRef({
    layers,
    activeLayer,
    stackAllLayers,
    arp,
    currentOctave,
    activeNotes,
  });

  useEffect(() => {
    stateRef.current = {
      layers,
      activeLayer,
      stackAllLayers,
      arp,
      currentOctave,
      activeNotes,
    };
  }, [layers, activeLayer, stackAllLayers, arp, currentOctave, activeNotes]);

  // Handle Master Audio Engine Toggle
  const handleToggleEngine = async () => {
    const active = await synth.initAudio();
    setIsEngineActive(active);
    synth.updateFX(fx);
    synth.setMasterVolume(masterVolume);
  };

  // Update Master Volume
  const handleVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    synth.setMasterVolume(vol);
  };

  // Load Preset
  const handleSelectPreset = (preset: Preset) => {
    setCurrentPresetId(preset.id);
    setLayers(preset.layers);
    setFx(preset.fx);
    setArp(preset.arp);
    setStackAllLayers(preset.stackAllLayers);
    setMasterVolume(preset.masterVolume);

    synth.updateFX(preset.fx);
    synth.setMasterVolume(preset.masterVolume);
    if (preset.arp.enabled) {
      synth.startArp(preset.arp, preset.layers, activeLayer - 1, preset.stackAllLayers);
    } else {
      synth.stopArp(preset.layers);
    }
  };

  // Update Layer parameter
  const handleUpdateActiveLayer = (param: keyof LayerState, value: unknown) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === activeLayer ? { ...l, [param]: value } : l))
    );
  };

  // Toggle Mute on a layer
  const handleToggleMute = (layerId: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, mute: !l.mute } : l))
    );
  };

  // Update FX
  const handleUpdateFX = (param: keyof FXState, value: unknown) => {
    setFx((prev) => {
      const next = { ...prev, [param]: value };
      synth.updateFX(next);
      return next;
    });
  };

  // Update Arp
  const handleUpdateArp = (param: keyof ArpState, value: unknown) => {
    setArp((prev) => {
      const next = { ...prev, [param]: value };
      if (next.enabled) {
        synth.startArp(next, layers, activeLayer - 1, stackAllLayers);
      } else {
        synth.stopArp(layers);
      }
      return next;
    });
  };

  // Handle Note On
  const handleNoteOn = useCallback((note: string, octave: number) => {
    const keyId = `${note}_${octave}`;
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.add(keyId);
      return next;
    });

    const { layers, activeLayer, stackAllLayers, arp } = stateRef.current;

    if (arp.enabled) {
      // Arp collects held notes
      const currentHeld: { note: string; octave: number }[] = [];
      const newSet = new Set<string>(stateRef.current.activeNotes);
      newSet.add(keyId);
      newSet.forEach((k: string) => {
        const [n, o] = k.split('_');
        currentHeld.push({ note: n, octave: parseInt(o, 10) });
      });
      synth.setArpHeldNotes(currentHeld);
    } else {
      synth.noteOn(note, octave, layers, activeLayer - 1, stackAllLayers);
    }
  }, []);

  // Handle Note Off
  const handleNoteOff = useCallback((note: string, octave: number) => {
    const keyId = `${note}_${octave}`;
    setActiveNotes((prev) => {
      const next = new Set<string>(prev);
      next.delete(keyId);
      return next;
    });

    const { layers, arp } = stateRef.current;

    if (arp.enabled) {
      const currentHeld: { note: string; octave: number }[] = [];
      const newSet = new Set<string>(stateRef.current.activeNotes);
      newSet.delete(keyId);
      newSet.forEach((k: string) => {
        const [n, o] = k.split('_');
        currentHeld.push({ note: n, octave: parseInt(o, 10) });
      });
      synth.setArpHeldNotes(currentHeld);
    } else {
      synth.noteOff(note, octave, layers);
    }
  }, []);

  // Handle Pitch Bend & Mod
  const handlePitchBendChange = (val: number) => {
    setPitchBend(val);
    synth.setPitchBend(val);
  };

  const handleModWheelChange = (val: number) => {
    setModWheel(val);
    synth.setModWheel(val);
  };

  // Connect engine callbacks (Arp step & MIDI)
  useEffect(() => {
    synth.onArpStepChange = (step: number) => {
      setCurrentArpStep(step);
    };

    synth.onMIDIMessage = (type, note, octave) => {
      setMidiConnected(true);
      if (type === 'noteOn') {
        handleNoteOn(note, octave);
      } else {
        handleNoteOff(note, octave);
      }
    };
  }, [handleNoteOn, handleNoteOff]);

  // Global QWERTY Keyboard Listener
  useEffect(() => {
    const keyMap: Record<string, { note: string; octaveOffset: number }> = {
      a: { note: 'C', octaveOffset: 0 },
      w: { note: 'C#', octaveOffset: 0 },
      s: { note: 'D', octaveOffset: 0 },
      e: { note: 'D#', octaveOffset: 0 },
      d: { note: 'E', octaveOffset: 0 },
      f: { note: 'F', octaveOffset: 0 },
      t: { note: 'F#', octaveOffset: 0 },
      g: { note: 'G', octaveOffset: 0 },
      y: { note: 'G#', octaveOffset: 0 },
      h: { note: 'A', octaveOffset: 0 },
      u: { note: 'A#', octaveOffset: 0 },
      j: { note: 'B', octaveOffset: 0 },
      k: { note: 'C', octaveOffset: 1 },
      o: { note: 'C#', octaveOffset: 1 },
      l: { note: 'D', octaveOffset: 1 },
      p: { note: 'D#', octaveOffset: 1 },
      ';': { note: 'E', octaveOffset: 1 },
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        if (!e.repeat) {
          const mapping = keyMap[key];
          const oct = stateRef.current.currentOctave + mapping.octaveOffset;
          handleNoteOn(mapping.note, oct);
        }
      } else if (key === 'z') {
        setCurrentOctave((prev) => Math.max(1, prev - 1));
      } else if (key === 'x') {
        setCurrentOctave((prev) => Math.min(6, prev + 1));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        const mapping = keyMap[key];
        const oct = stateRef.current.currentOctave + mapping.octaveOffset;
        handleNoteOff(mapping.note, oct);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleNoteOn, handleNoteOff]);

  const activeLayerState = layers[activeLayer - 1] || layers[0];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#06070a] text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isEngineActive={isEngineActive}
        onToggleEngine={handleToggleEngine}
        masterVolume={masterVolume}
        onVolumeChange={handleVolumeChange}
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        midiConnected={midiConnected}
      />

      {/* Main Workstation View Area */}
      <main className="flex-1 overflow-hidden relative flex">
        {/* VIEW 1: SYNTH ENGINE */}
        {activeTab === 'synth' && (
          <div className="w-full h-full p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 overflow-y-auto">
            {/* Top Row: Real-time Scope & Multitimbral Swarms Selector */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="lg:col-span-3">
                <OscilloscopeCanvas
                  activeLayer={activeLayer}
                  stackAllLayers={stackAllLayers}
                  unisonVoices={activeLayerState.unison}
                />
              </div>

              <div className="lg:col-span-1">
                <LayerSelector
                  layers={layers}
                  activeLayer={activeLayer}
                  onSelectLayer={setActiveLayer}
                  stackAllLayers={stackAllLayers}
                  onToggleStackAll={() => setStackAllLayers((prev) => !prev)}
                  onToggleMute={handleToggleMute}
                />
              </div>
            </div>

            {/* Middle Row: Oscillator, Filter, Envelope Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 flex-1">
              <OscillatorSection
                layer={activeLayerState}
                onUpdate={handleUpdateActiveLayer}
              />

              <FilterSection
                layer={activeLayerState}
                onUpdate={handleUpdateActiveLayer}
              />

              <EnvelopeSection
                layer={activeLayerState}
                onUpdate={handleUpdateActiveLayer}
              />
            </div>

            {/* Bottom Row: Playable Virtual Piano Keyboard & Controls */}
            <div className="w-full">
              <VirtualKeyboard
                currentOctave={currentOctave}
                onOctaveChange={setCurrentOctave}
                activeNotes={activeNotes}
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
                pitchBend={pitchBend}
                onPitchBendChange={handlePitchBendChange}
                modWheel={modWheel}
                onModWheelChange={handleModWheelChange}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: 15 AI MINDS ENGINE */}
        {activeTab === 'mendes' && (
          <AIMindsView
            layers={layers}
            activeLayer={activeLayer}
            fx={fx}
            arp={arp}
            onApplyState={(newLayers, newFx, newArp) => {
              setLayers(newLayers);
              setFx(newFx);
              setArp(newArp);
              synth.updateFX(newFx);
            }}
          />
        )}

        {/* VIEW 3: HYPER-FX RACK & EUCLIDEAN ARPEGGIATOR */}
        {activeTab === 'fx' && (
          <div className="w-full h-full p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HyperFXRack fx={fx} onUpdateFX={handleUpdateFX} />
              <ArpeggiatorSection
                arp={arp}
                onUpdateArp={handleUpdateArp}
                currentStep={currentArpStep}
              />
            </div>

            {/* Integrated Piano Keyboard for testing FX & Arp */}
            <div className="w-full">
              <VirtualKeyboard
                currentOctave={currentOctave}
                onOctaveChange={setCurrentOctave}
                activeNotes={activeNotes}
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
                pitchBend={pitchBend}
                onPitchBendChange={handlePitchBendChange}
                modWheel={modWheel}
                onModWheelChange={handleModWheelChange}
              />
            </div>
          </div>
        )}

        {/* VIEW 4: OPERATOR MANUAL */}
        {activeTab === 'manual' && (
          <ManualView
            onLoadRecipe={(patch) => {
              if (patch.layers) setLayers(patch.layers);
              if (patch.fx) {
                setFx(patch.fx);
                synth.updateFX(patch.fx);
              }
              if (patch.arp) {
                setArp(patch.arp);
                if (patch.arp.enabled) {
                  synth.startArp(patch.arp, patch.layers || layers, activeLayer - 1, patch.stackAllLayers ?? stackAllLayers);
                } else {
                  synth.stopArp(patch.layers || layers);
                }
              }
              if (patch.stackAllLayers !== undefined) {
                setStackAllLayers(patch.stackAllLayers);
              }
              setActiveTab('synth');
            }}
          />
        )}
      </main>
    </div>
  );
}

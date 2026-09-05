import React, { useState } from 'react';
import {
  Brain,
  Terminal,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { LayerState, FXState, ArpState } from '../types/synth';
import { AI_MINDS, executeAIMindDSP } from '../audio/aiMindsData';

interface AIMindsViewProps {
  layers: LayerState[];
  activeLayer: number;
  fx: FXState;
  arp: ArpState;
  onApplyState: (layers: LayerState[], fx: FXState, arp: ArpState) => void;
}

export const AIMindsView: React.FC<AIMindsViewProps> = ({
  layers,
  activeLayer,
  fx,
  arp,
  onApplyState,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('Neural Engine Ready');
  const [terminalLog, setTerminalLog] = useState<string>(
    `Quindecim Mentes system initialized. 15 AI DSP models loaded into real-time audio thread.\nSelect any of the 15 specialized neural minds below or type a natural language sound description to sculpt the synth architecture in real time...`
  );

  const samplePrompts = [
    'Stadium supersaw festival lead with stereo width',
    'Intimate warm ambient pad with slow floating attack',
    'Vocal formant talking bass with sub punch',
    'Glitchy industrial square wave with aggressive distortion',
    'Fractal crystal bell pluck with shimmering delay',
  ];

  const handleTriggerMind = async (mindId: number) => {
    const mind = AI_MINDS.find((m) => m.id === mindId);
    if (!mind) return;

    setIsProcessing(true);
    setStatusText(`Mind #${mindId} (${mind.name}) Executing DSP...`);

    // First execute local DSP update immediately so audio feels instant & ultra-responsive
    const result = executeAIMindDSP(mindId, layers, activeLayer - 1, fx, arp);
    onApplyState(result.layers, result.fx, result.arp);

    // Call backend API for deeper Gemini analysis if available
    try {
      const res = await fetch('/api/ai-mind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mindId,
          mindName: mind.name,
          targetLayer: activeLayer,
          currentParams: layers[activeLayer - 1],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTerminalLog(
          (prev) =>
            `[${new Date().toLocaleTimeString()}] ${result.log}\n\n[NEURAL ARCHITECT RATIONALE]:\n${data.explanation}\n----------------------------------------\n` +
            prev
        );
      } else {
        setTerminalLog(
          (prev) =>
            `[${new Date().toLocaleTimeString()}] ${result.log}\n----------------------------------------\n` +
            prev
        );
      }
    } catch {
      setTerminalLog(
        (prev) =>
          `[${new Date().toLocaleTimeString()}] ${result.log}\n----------------------------------------\n` +
          prev
      );
    } finally {
      setIsProcessing(false);
      setStatusText(`Mind #${mindId} Complete • Sound Parameters Live`);
    }
  };

  const handleRunPrompt = async (promptToRun?: string) => {
    const text = promptToRun || promptInput;
    if (!text.trim()) return;

    setIsProcessing(true);
    setStatusText('Compiling NLP to DSP Matrix...');

    try {
      const res = await fetch('/api/ai-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          currentParams: layers[activeLayer - 1],
        }),
      });

      const data = await res.json();
      if (data.patchUpdates) {
        const newLayers = layers.map((l, idx) => {
          if (idx === activeLayer - 1) {
            return { ...l, ...data.patchUpdates };
          }
          return l;
        });
        onApplyState(newLayers, fx, arp);

        setTerminalLog(
          (prev) =>
            `[${new Date().toLocaleTimeString()}] NEURAL PROMPT EXECUTED: "${text}"\n` +
            `• Target: Layer ${activeLayer}\n` +
            `• Source: ${data.source}\n` +
            `• Summary: ${data.explanation}\n` +
            `• Applied Updates: ${JSON.stringify(data.patchUpdates, null, 2)}\n----------------------------------------\n` +
            prev
        );
        setStatusText('Prompt Applied to Layer ' + activeLayer);
      }
    } catch (err: unknown) {
      console.error(err);
      setStatusText('Execution fallback completed');
    } finally {
      setIsProcessing(false);
      setPromptInput('');
    }
  };

  return (
    <div className="w-full h-full p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-5 box-glow-cyan">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#00f3ff] flex items-center gap-2">
              <Brain className="w-6 h-6 text-[#00f3ff] animate-pulse" />
              QUINDECIM MENTES (15 AI MINDS) ENGINE
            </h2>
            <p className="text-xs font-mono text-gray-400 mt-1">
              Specialized neural acoustic models with direct low-level DSP parameter modulation.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-[#080a10] px-3 py-1.5 rounded-lg border border-[#1f273d]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300">Targeting Active Layer:</span>
            <span className="text-[#00f3ff] font-bold">L{activeLayer}</span>
          </div>
        </div>

        {/* 15 AI Minds Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {AI_MINDS.map((mind) => {
            const colorClass =
              mind.accentColor === 'cyan'
                ? 'text-[#00f3ff] border-[#1f273d] hover:border-[#00f3ff] group-hover:glow-cyan'
                : mind.accentColor === 'purple'
                ? 'text-[#a855f7] border-[#1f273d] hover:border-[#a855f7] group-hover:glow-purple'
                : mind.accentColor === 'pink'
                ? 'text-[#f43f5e] border-[#1f273d] hover:border-[#f43f5e] group-hover:glow-pink'
                : 'text-[#fbbf24] border-[#1f273d] hover:border-[#fbbf24]';

            return (
              <button
                key={mind.id}
                onClick={() => handleTriggerMind(mind.id)}
                disabled={isProcessing}
                className="p-3 bg-[#080a10] border rounded-lg text-left transition-all group hover:bg-[#121726] flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className={`text-xs font-mono font-bold mb-1 ${colorClass}`}>
                    {mind.name}
                  </div>
                  <div className="text-[10px] text-gray-400 leading-snug">
                    {mind.subtitle}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1f273d]/60 flex justify-between items-center text-[9px] font-mono text-gray-500 group-hover:text-gray-300">
                  <span>EXECUTE DSP</span>
                  <Zap className="w-3 h-3 text-[#00f3ff] opacity-70 group-hover:opacity-100" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Sound Prompt & Terminal Log */}
      <div className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-5 flex flex-col font-mono text-xs flex-1 min-h-[340px]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[#00f3ff] font-bold flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            NEURAL SOUND DESIGNER PROMPT TERMINAL
          </span>
          <span className="text-emerald-400 text-xs flex items-center gap-1.5">
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00f3ff]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
            {statusText}
          </span>
        </div>

        {/* Prompt Input Form */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunPrompt()}
            placeholder="e.g. 'Make layer 1 sound warm and retro with high filter envelope mod and soft attack'"
            className="flex-1 bg-[#080a10] border border-[#1f273d] rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00f3ff] text-xs font-mono"
          />
          <button
            onClick={() => handleRunPrompt()}
            disabled={isProcessing || !promptInput.trim()}
            className="px-5 py-2.5 bg-[#00f3ff]/20 border border-[#00f3ff] text-[#00f3ff] font-bold rounded-lg hover:bg-[#00f3ff]/30 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            COMPILE DSP
          </button>
        </div>

        {/* Prompt Suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-[10px] text-gray-500 flex items-center gap-1 py-1">
            <Sparkles className="w-3 h-3 text-[#00f3ff]" /> EXAMPLES:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleRunPrompt(p)}
              className="text-[10px] bg-[#080a10] border border-[#1f273d] text-gray-400 hover:text-[#00f3ff] hover:border-[#00f3ff]/50 px-2.5 py-1 rounded transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Terminal Log Output */}
        <div className="flex-1 bg-[#080a10] border border-[#1f273d] rounded-lg p-4 overflow-y-auto font-mono text-gray-300 leading-relaxed whitespace-pre-wrap max-h-72 select-text text-[11px]">
          {terminalLog}
        </div>
      </div>
    </div>
  );
};

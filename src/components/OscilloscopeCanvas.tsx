import React, { useEffect, useRef, useState } from 'react';
import { Activity, BarChart2, Orbit } from 'lucide-react';
import { synth } from '../audio/AudioEngine';

interface OscilloscopeCanvasProps {
  activeLayer: number;
  stackAllLayers: boolean;
  unisonVoices: number;
}

export const OscilloscopeCanvas: React.FC<OscilloscopeCanvasProps> = ({
  activeLayer,
  stackAllLayers,
  unisonVoices,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scopeMode, setScopeMode] = useState<'wave' | 'fft' | 'lissajous'>('wave');

  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = '#080a11';
      ctx.fillRect(0, 0, width, height);

      // Subtle grid background
      ctx.strokeStyle = '#121726';
      ctx.lineWidth = 1;
      const gridSpacing = 24;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (!synth.analyser) {
        // Flat center line when idle
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const bufferLength = synth.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      if (scopeMode === 'wave') {
        synth.analyser.getByteTimeDomainData(dataArray);

        // Oscilloscope Trace
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00f3ff';
        ctx.shadowColor = 'rgba(0, 243, 255, 0.7)';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const sliceWidth = (width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
      } else if (scopeMode === 'fft') {
        // Frequency Spectrum Analyzer
        synth.analyser.getByteFrequencyData(dataArray);

        const barCount = 64;
        const barWidth = width / barCount;
        const step = Math.floor(bufferLength / (barCount * 1.5));

        for (let i = 0; i < barCount; i++) {
          const dataIndex = i * step;
          const value = dataArray[dataIndex] || 0;
          const percent = value / 255;
          const barHeight = percent * height * 0.9;

          // Gradient from cyan to purple/pink
          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, '#00f3ff');
          grad.addColorStop(0.6, '#a855f7');
          grad.addColorStop(1, '#ff007f');

          ctx.fillStyle = grad;
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1.5, barHeight);
        }
      } else {
        // Lissajous / Phase Scope simulation
        synth.analyser.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#a855f7';
        ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.42;

        for (let i = 0; i < bufferLength - 1; i += 2) {
          const v1 = (dataArray[i] - 128) / 128.0;
          const v2 = (dataArray[i + 1] - 128) / 128.0;

          const x = centerX + v1 * radius;
          const y = centerY + v2 * radius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scopeMode]);

  return (
    <div className="bg-[#0f1320] border border-[#1f273d] rounded-xl p-3 flex flex-col relative box-glow-cyan h-48 sm:h-52">
      {/* Scope Toolbar */}
      <div className="flex justify-between items-center mb-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#00f3ff]">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-bold tracking-wider hidden sm:inline">
            REAL-TIME OSCILLOSCOPE & SPECTRUM
          </span>
          <span className="font-bold tracking-wider sm:hidden">DSP SCOPE</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-[#080a10] rounded p-0.5 border border-[#1f273d]">
            <button
              onClick={() => setScopeMode('wave')}
              title="Time Domain Waveform"
              className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition ${
                scopeMode === 'wave'
                  ? 'bg-[#1f273d] text-[#00f3ff] font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3" />
              WAVE
            </button>
            <button
              onClick={() => setScopeMode('fft')}
              title="FFT Spectrum Bars"
              className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition ${
                scopeMode === 'fft'
                  ? 'bg-[#1f273d] text-[#a855f7] font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3 h-3" />
              FFT
            </button>
            <button
              onClick={() => setScopeMode('lissajous')}
              title="Lissajous Phase Scope"
              className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition ${
                scopeMode === 'lissajous'
                  ? 'bg-[#1f273d] text-[#ff007f] font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Orbit className="w-3 h-3" />
              PHASE
            </button>
          </div>

          <span className="text-[11px] text-gray-400 font-mono hidden md:inline">
            {stackAllLayers ? (
              <span className="text-[#a855f7] font-bold">ALL 8 SWARMS STACKED</span>
            ) : (
              <span>
                Layer <span className="text-[#00f3ff] font-bold">{activeLayer}</span> (
                {unisonVoices} Voices)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden rounded-lg border border-[#1f273d]/80">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-full bg-[#080a11] block"
        />
      </div>
    </div>
  );
};

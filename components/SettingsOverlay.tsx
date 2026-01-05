
import React, { useState } from 'react';
import { GameConfig } from '../types';
import { X, Settings2, Sliders, Monitor, Target } from 'lucide-react';

interface SettingsOverlayProps {
  config: GameConfig;
  onSave: (newConfig: GameConfig) => void;
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ config, onSave, onClose }) => {
  // Create a local draft of the configuration
  const [draft, setDraft] = useState<GameConfig>({ ...config });

  const updateDraft = (key: keyof GameConfig, value: number) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(draft);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Settings2 className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Assessment Parameters</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8">
          {/* Section: Layout */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Monitor className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Layout & Monitoring</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex justify-between">
                  <span>Left Zone Width</span>
                  <span className="font-mono text-blue-400">{draft.leftZoneWidth}%</span>
                </label>
                <input 
                  type="range" min="30" max="80" 
                  value={draft.leftZoneWidth} 
                  onChange={e => updateDraft('leftZoneWidth', Number(e.target.value))} 
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex justify-between">
                  <span>Focus Warning (s)</span>
                  <span className="font-mono text-blue-400">{draft.focusTimeoutMs / 1000}s</span>
                </label>
                <input 
                  type="number" step="0.5" min="0.5" max="10" 
                  value={draft.focusTimeoutMs / 1000} 
                  onChange={e => updateDraft('focusTimeoutMs', Number(e.target.value) * 1000)} 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-center font-mono" 
                />
              </div>
            </div>
          </section>

          {/* Section: Primary Task */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Sliders className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">Primary Task (Ball)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex justify-between">
                  <span>Ball Size</span>
                  <span className="font-mono text-blue-400">{draft.trackerSize}px</span>
                </label>
                <input 
                  type="range" min="10" max="120" 
                  value={draft.trackerSize} 
                  onChange={e => updateDraft('trackerSize', Number(e.target.value))} 
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex justify-between">
                  <span>Movement Speed</span>
                  <span className="font-mono text-blue-400">{draft.trackerSpeed.toFixed(1)}x</span>
                </label>
                <input 
                  type="range" min="0.5" max="10" step="0.5" 
                  value={draft.trackerSpeed} 
                  onChange={e => updateDraft('trackerSpeed', Number(e.target.value))} 
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                />
              </div>
            </div>
          </section>

          {/* Section: Secondary Task */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Target className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">Secondary Task (Box)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex justify-between">
                  <span>Min Size</span>
                  <span className="font-mono text-amber-400">{draft.targetMinSize}px</span>
                </label>
                <input 
                  type="range" min="10" max="100" 
                  value={draft.targetMinSize} 
                  onChange={e => updateDraft('targetMinSize', Number(e.target.value))} 
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex justify-between">
                  <span>Max Size</span>
                  <span className="font-mono text-amber-400">{draft.targetMaxSize}px</span>
                </label>
                <input 
                  type="range" min="80" max="250" 
                  value={draft.targetMaxSize} 
                  onChange={e => updateDraft('targetMaxSize', Number(e.target.value))} 
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm text-slate-300 flex justify-between">
                  <span>Movement Speed</span>
                  <span className="font-mono text-amber-400">{draft.targetSpeed.toFixed(1)}x</span>
                </label>
                <input 
                  type="range" min="0" max="12" step="0.5" 
                  value={draft.targetSpeed} 
                  onChange={e => updateDraft('targetSpeed', Number(e.target.value))} 
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;

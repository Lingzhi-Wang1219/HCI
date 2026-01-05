
import React, { useState } from 'react';
import { GameState, GameStats, GameConfig } from './types';
import GameCanvas from './components/GameCanvas';
import ResultsDashboard from './components/ResultsDashboard';
import SettingsOverlay from './components/SettingsOverlay';
import { Eye, Play, Settings } from 'lucide-react';

const DEFAULT_CONFIG: GameConfig = {
  leftZoneWidth: 70,
  trackerSize: 40,
  trackerSpeed: 3.5,
  targetMinSize: 40,
  targetMaxSize: 120,
  targetSpeed: 2.5,
  focusTimeoutMs: 2000,
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleStart = () => {
    setGameState(GameState.PLAYING);
    setStats(null);
  };

  const handleGameOver = (results: GameStats) => {
    setStats(results);
    setGameState(GameState.FINISHED);
  };

  const handleRestart = () => {
    setGameState(GameState.IDLE);
    setStats(null);
  };

  const handleSaveConfig = (newConfig: GameConfig) => {
    setConfig(newConfig);
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen font-sans text-slate-100 bg-slate-950">
      
      {/* Global Settings Overlay */}
      {isSettingsOpen && (
        <SettingsOverlay 
          config={config} 
          onSave={handleSaveConfig} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      {gameState === GameState.IDLE && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center overflow-y-auto bg-[radial-gradient(circle_at_50%_50%,_rgba(30,41,59,1)_0%,_rgba(15,23,42,1)_100%)]">
          <div className="max-w-4xl w-full py-8 flex flex-col items-center">
            <div className="mb-6 p-4 bg-blue-500/10 rounded-full ring-1 ring-blue-500/50">
              <Eye className="w-16 h-16 text-blue-400" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent mb-6">
              Visual Attention Assessment
            </h1>
            
            <p className="text-slate-400 max-w-xl mb-12 text-lg">
              A high-precision cognitive assessment tool for evaluating divided attention and visuospatial detection speed.
            </p>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <button
                onClick={handleStart}
                className="group relative flex items-center gap-4 bg-white text-slate-950 px-12 py-5 rounded-full font-bold text-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                <Play className="w-8 h-8 fill-slate-950 group-hover:translate-x-1 transition-transform" />
                <span>Start Assessment</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-8 py-5 rounded-full font-bold text-xl border border-slate-700 transition-all hover:scale-105"
              >
                <Settings className="w-6 h-6" />
                <span>Parameters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <GameCanvas 
          config={config} 
          onGameOver={handleGameOver} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          isSettingsOpen={isSettingsOpen}
        />
      )}

      {gameState === GameState.FINISHED && stats && (
        <ResultsDashboard stats={stats} onRestart={handleRestart} />
      )}
    </div>
  );
};

export default App;


import React from 'react';
import { GameStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, MousePointerClick, Clock, RotateCcw, Brain } from 'lucide-react';

interface ResultsDashboardProps {
  stats: GameStats;
  onRestart: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ stats, onRestart }) => {
  const secondaryAccuracy = stats.secondaryTargetsPresented > 0
    ? (stats.secondaryTargetsClicked / stats.secondaryTargetsPresented) * 100
    : 0;

  const chartData = [
    { name: 'Primary (Tracking)', value: stats.primaryTaskAccuracy, color: '#3b82f6' },
    { name: 'Secondary (Detection)', value: secondaryAccuracy, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Assessment Complete</h1>
          <p className="text-slate-400">Here is a breakdown of your divided attention performance.</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center">
            <Activity className="w-8 h-8 text-blue-500 mb-2" />
            <span className="text-slate-400 text-sm">Tracking Accuracy</span>
            <span className="text-2xl font-bold text-white">{stats.primaryTaskAccuracy.toFixed(1)}%</span>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center">
            <MousePointerClick className="w-8 h-8 text-amber-500 mb-2" />
            <span className="text-slate-400 text-sm">Targets Clicked</span>
            <span className="text-2xl font-bold text-white">{stats.secondaryTargetsClicked} / {stats.secondaryTargetsPresented}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center">
            <Clock className="w-8 h-8 text-emerald-500 mb-2" />
            <span className="text-slate-400 text-sm">Avg Reaction Time</span>
            <span className="text-2xl font-bold text-white">{Math.round(stats.avgReactionTimeMs)} ms</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center">
            <Brain className="w-8 h-8 text-purple-500 mb-2" />
            <span className="text-slate-400 text-sm">Task Duration</span>
            <span className="text-2xl font-bold text-white">{stats.durationSeconds}s</span>
          </div>
        </div>

        {/* Chart Section - Now Full Width */}
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Task Comparison Summary (%)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={140} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Restart Button */}
        <div className="flex justify-center pt-8">
          <button 
            onClick={onRestart}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95"
          >
            <RotateCcw className="w-6 h-6" />
            Restart Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;

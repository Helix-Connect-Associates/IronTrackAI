
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Play, Calendar, Zap, ChevronRight, Plus, Sparkles, Settings, Download, Upload, AlertTriangle, Share2 } from 'lucide-react';
import { format, isSameWeek, isSameMonth } from 'date-fns';
import { generateWorkoutRecommendation } from '../services/geminiService';
import { ExerciseType, Exercise } from '../types';
import { generateId } from '../data/storage';

interface DashboardProps {
  onNavigate: (view: any, data?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { workouts, templates, startWorkout, user, exportData, importData } = useStore();
  const [showAiModal, setShowAiModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGoals, setAiGoals] = useState('');
  const [aiLimits, setAiLimits] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');

  // Stats Calculation
  const now = new Date();
  const weeklyWorkouts = workouts.filter(w => isSameWeek(new Date(w.date), now));
  const monthlyWorkouts = workouts.filter(w => isSameMonth(new Date(w.date), now));

  const handleQuickStart = () => {
    startWorkout(null);
    onNavigate('ACTIVE_WORKOUT');
  };

  const handleTemplateStart = (tId: string) => {
    const t = templates.find(temp => temp.id === tId);
    if (t) {
      startWorkout(t);
      onNavigate('ACTIVE_WORKOUT');
    }
  };

  const handleExport = async () => {
    const data = exportData();
    const filename = `irontrack_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    const blob = new Blob([data], { type: 'application/json' });
    const file = new File([blob], filename, { type: 'application/json' });

    // Try native sharing first (Mobile friendly)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                title: 'IronTrack Backup',
                text: `Backup of workouts for ${user.name}`,
                files: [file]
            });
            return;
        } catch (e) {
            // Ignore abort errors, fall through to download
            console.log('Share cancelled or failed, falling back to download');
        }
    }

    // Fallback to standard download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const success = importData(content);
        setImportStatus(success ? 'Data imported successfully!' : 'Failed to import data.');
        if (success) setTimeout(() => setShowSettingsModal(false), 1500);
    };
    reader.readAsText(file);
  };

  const handleAiGenerate = async () => {
    setAiLoading(true);
    try {
      const result = await generateWorkoutRecommendation(aiGoals, aiLimits, "60 mins");
      // Convert AI result to usable template format temporarily
      const newExercises: Exercise[] = result.exercises.map((e: any) => ({
        id: generateId(),
        name: e.name,
        type: e.type === 'Cardio' ? ExerciseType.Cardio : e.type === 'Bodyweight' ? ExerciseType.Bodyweight : ExerciseType.Weight,
        target: e.target,
        description: e.description,
        sets: []
      }));
      
      const tempWorkout = {
        id: 'ai-gen',
        name: result.workoutName || "AI Recommended Workout",
        exercises: newExercises
      };
      
      startWorkout(tempWorkout as any);
      setShowAiModal(false);
      onNavigate('ACTIVE_WORKOUT');
    } catch (e) {
      alert("Failed to generate workout. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome back, {user.name}</p>
        </div>
        <div className="flex gap-2">
            <button 
            onClick={() => setShowSettingsModal(true)}
            className="bg-slate-800 border border-slate-700 p-2 rounded-full hover:bg-slate-700 transition-colors"
            >
            <Settings className="w-6 h-6 text-slate-400" />
            </button>
            <button 
            onClick={() => setShowAiModal(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
            <Sparkles className="w-6 h-6 text-white" />
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => onNavigate('HISTORY', { filter: 'week' })}
          className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs uppercase font-semibold">This Week</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-white">{weeklyWorkouts.length}</div>
          <div className="text-xs text-slate-500 mt-1">Workouts completed</div>
        </div>

        <div 
          onClick={() => onNavigate('PROGRESS')}
          className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-emerald-500 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs uppercase font-semibold">This Month</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-white">{monthlyWorkouts.length}</div>
          <div className="text-xs text-slate-500 mt-1">View Progress</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Quick Start</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button 
            onClick={handleQuickStart}
            className="flex items-center p-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors text-white font-medium"
          >
            <div className="p-2 bg-blue-500/30 rounded-lg mr-3">
              <Plus className="w-5 h-5" />
            </div>
            Empty Workout
          </button>

          {templates.slice(0, 3).map(t => (
            <button 
              key={t.id}
              onClick={() => handleTemplateStart(t.id)}
              className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-750 transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="p-2 bg-slate-700 rounded-lg mr-3">
                  <Play className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-slate-200 font-medium">{t.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Recent Workouts</h2>
          <button onClick={() => onNavigate('HISTORY')} className="text-xs text-blue-400 hover:text-blue-300">See all</button>
        </div>
        <div className="space-y-3">
          {workouts.length === 0 ? (
            <div className="text-center p-8 bg-slate-800/50 rounded-xl text-slate-500">
              No recent workouts found. Let's crush it today!
            </div>
          ) : (
            workouts.slice(0, 5).map(w => (
              <div key={w.id} onClick={() => onNavigate('HISTORY', { workoutId: w.id })} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-750">
                <div>
                  <h3 className="text-white font-medium">{w.name}</h3>
                  <p className="text-sm text-slate-400">{format(new Date(w.date), 'MMM d, yyyy')} • {w.exercises.length} Exercises</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Workout Coach
                </h2>
                <p className="text-sm text-slate-400 mt-1">Describe your goals and I'll build a plan.</p>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Goal</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="e.g., Chest hypertrophy, 5k prep..."
                  value={aiGoals}
                  onChange={e => setAiGoals(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Limitations / Injuries</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="e.g., Bad lower back, no equipment..."
                  value={aiLimits}
                  onChange={e => setAiLimits(e.target.value)}
                />
              </div>
              
              <button 
                onClick={handleAiGenerate}
                disabled={aiLoading || !aiGoals}
                className={`w-full py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 ${aiLoading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'}`}
              >
                {aiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>Generate Workout <Sparkles className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Settings Modal */}
        {showSettingsModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Settings className="w-5 h-5 text-slate-400" />
                            Data Management
                        </h2>
                        <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-slate-300 font-medium mb-1">Data On Device Only</p>
                                <p className="text-xs text-slate-400">
                                    Your workouts are saved to this browser. 
                                    If you clear your cache or use a different device, your data will not appear unless you export it first.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleExport} className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors group">
                                <div className="bg-emerald-500/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    {typeof navigator.share === 'function' ? (
                                        <Share2 className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                        <Download className="w-6 h-6 text-emerald-500" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-white">Export / Backup</span>
                                <span className="text-[10px] text-slate-500 mt-1 text-center">
                                    {typeof navigator.share === 'function' ? "Share File to Drive/Files" : "Download JSON"}
                                </span>
                            </button>

                            <label className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer group">
                                <div className="bg-blue-500/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-blue-500" />
                                </div>
                                <span className="text-sm font-medium text-white">Import Data</span>
                                <span className="text-[10px] text-slate-500 mt-1">Load JSON Backup</span>
                                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                            </label>
                        </div>

                        {importStatus && (
                            <div className={`p-3 rounded-lg text-sm text-center ${importStatus.includes('Failed') ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                {importStatus}
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-800">
                            <p className="text-[10px] text-slate-600 text-center">
                                IronTrack AI v1.1.0 • Mobile Ready
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Dashboard;

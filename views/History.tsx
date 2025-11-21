
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { format, isSameWeek, isSameMonth } from 'date-fns';
import { ChevronDown, ChevronUp, Calendar, Copy, Filter } from 'lucide-react';
import { TrackingMode, Exercise, ExerciseType } from '../types';

interface HistoryProps {
  onNavigate: (view: any) => void;
  initialFilter?: 'week' | 'month' | 'all';
}

const History: React.FC<HistoryProps> = ({ onNavigate, initialFilter = 'all' }) => {
  const { workouts, startWorkout } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'week' | 'month' | 'all'>(initialFilter);

  const sortedWorkouts = useMemo(() => {
      const now = new Date();
      let filtered = workouts;

      if (filter === 'week') {
          filtered = workouts.filter(w => isSameWeek(new Date(w.date), now));
      } else if (filter === 'month') {
          filtered = workouts.filter(w => isSameMonth(new Date(w.date), now));
      }

      return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workouts, filter]);

  const handleCopyWorkout = (workout: any) => {
      startWorkout(workout);
      onNavigate('ACTIVE_WORKOUT');
  };

  const resolveTrackingMode = (exercise: Exercise): TrackingMode => {
    if (exercise.trackingMode) return exercise.trackingMode;
    if (exercise.type === ExerciseType.Cardio) return 'time_distance';
    if (exercise.type === ExerciseType.Bodyweight) return 'reps_only';
    return 'weight_reps';
  };

  const formatSet = (set: any, mode: TrackingMode) => {
      if (mode === 'time_distance') return `${set.time}m / ${set.distance}mi`;
      if (mode === 'time_only') return `${set.time}s`; 
      if (mode === 'reps_only') return `${set.reps} reps`;
      return `${set.weight}x${set.reps}`;
  };

  return (
    <div className="pb-24 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">History</h1>
        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>All</button>
            <button onClick={() => setFilter('week')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filter === 'week' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Week</button>
            <button onClick={() => setFilter('month')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filter === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Month</button>
        </div>
      </div>
      
      <div className="space-y-3">
        {sortedWorkouts.length === 0 && (
            <div className="text-slate-500 text-center mt-10 p-6 bg-slate-800/30 rounded-xl border border-slate-800 border-dashed">
                {filter !== 'all' ? `No workouts found for this ${filter}.` : "No workouts completed yet."}
            </div>
        )}
        
        {sortedWorkouts.map(workout => {
          const isExpanded = expandedId === workout.id;
          
          return (
            <div key={workout.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-sm">
              <div 
                onClick={() => setExpandedId(isExpanded ? null : workout.id)}
                className="p-3 flex justify-between items-center cursor-pointer hover:bg-slate-750"
              >
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">{workout.name}</h3>
                        <p className="text-[10px] text-slate-400">{format(new Date(workout.date), 'MMM d, h:mm a')}</p>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>

              {isExpanded && (
                <div className="border-t border-slate-700 bg-slate-900/20 p-3">
                    <div className="space-y-3 mb-3">
                        {workout.exercises.map(ex => {
                            const mode = resolveTrackingMode(ex);
                            return (
                                <div key={ex.id} className="text-sm">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-blue-200 font-medium text-xs">{ex.name}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {ex.sets.map((set, i) => (
                                            <div key={i} className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-[10px] text-slate-300">
                                                <span className="text-slate-500 mr-1">{i+1}:</span> 
                                                {formatSet(set, mode)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleCopyWorkout(workout); }}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Copy className="w-3 h-3" /> Copy Workout
                    </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;

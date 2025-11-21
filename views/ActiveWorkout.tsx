
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Exercise, ExerciseType, SetData, ExerciseDefinition, TrackingMode } from '../types';
import { Plus, Check, Timer, Trash2 } from 'lucide-react';
import { ExerciseSelector } from '../components/ExerciseSelector';
import { generateId } from '../data/storage';

interface ActiveWorkoutProps {
  onFinish: () => void;
}

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ onFinish }) => {
  const { activeWorkout, updateActiveWorkout, cancelWorkout, finishWorkout, user } = useStore();
  const [elapsed, setElapsed] = useState(0);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  useEffect(() => {
    if (!activeWorkout?.startTime) return;

    const interval = setInterval(() => {
        const start = new Date(activeWorkout.startTime).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 1000);
        setElapsed(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout?.startTime]);

  if (!activeWorkout) return <div>No active workout</div>;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const resolveTrackingMode = (exercise: Exercise | ExerciseDefinition): TrackingMode => {
    if (exercise.trackingMode) return exercise.trackingMode;
    if (exercise.type === ExerciseType.Cardio) return 'time_distance';
    if (exercise.type === ExerciseType.Bodyweight) return 'reps_only';
    return 'weight_reps';
  };

  const handleAddExercise = (def: ExerciseDefinition) => {
    const newEx: Exercise = {
      id: generateId(),
      name: def.name,
      type: def.type,
      target: def.target,
      description: def.description,
      trackingMode: resolveTrackingMode(def),
      sets: []
    };
    
    updateActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newEx]
    });
    setShowExerciseSelector(false);
  };

  // Immutable update helper for exercises
  const updateExercises = (fn: (exercises: Exercise[]) => Exercise[]) => {
    const updatedExercises = fn(activeWorkout.exercises);
    updateActiveWorkout({
        ...activeWorkout,
        exercises: updatedExercises
    });
  };

  const addSet = (exerciseId: string) => {
    updateExercises(exercises => {
        return exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            
            const previousSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : null;
            const mode = resolveTrackingMode(ex);

            const newSet: SetData = {
                id: generateId(),
                completed: false,
                weight: (mode === 'weight_reps') ? (previousSet?.weight || 0) : undefined,
                reps: (mode === 'weight_reps' || mode === 'reps_only') ? (previousSet?.reps || 0) : undefined,
                time: (mode === 'time_distance' || mode === 'time_only') ? (previousSet?.time || 0) : undefined,
                distance: (mode === 'time_distance') ? (previousSet?.distance || 0) : undefined
            };

            return { ...ex, sets: [...ex.sets, newSet] };
        });
    });
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof SetData, value: number | undefined) => {
    updateExercises(exercises => {
        return exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return {
                ...ex,
                sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
            };
        });
    });
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    updateExercises(exercises => {
        return exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return {
                ...ex,
                sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
            };
        });
    });
  };

  const removeSet = (exerciseId: string, setId: string) => {
    updateExercises(exercises => {
        return exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
        });
    });
  };

  const handleFinish = () => {
    // Pass the current activeWorkout directly to ensure we save the latest state
    // We don't need a window.confirm here if the UI is clear, but safety is fine.
    // Removing confirm for speed as requested implicitly by "not saving" frustration.
    finishWorkout(activeWorkout);
    onFinish();
  };

  const parseValue = (val: string): number | undefined => {
      if (val === '') return undefined;
      const n = parseFloat(val);
      return isNaN(n) ? undefined : n;
  };

  const renderSetInputs = (exercise: Exercise, set: SetData, mode: TrackingMode) => {
      const inputClass = "w-full bg-transparent text-center text-white outline-none border-b border-slate-700 focus:border-blue-500 appearance-none m-0";
      
      let col1 = <div className="text-center text-slate-500">-</div>;
      let col2 = <div className="text-center text-slate-500">-</div>;

      if (mode === 'weight_reps') {
          col1 = <input type="number" step="any" className={inputClass} value={set.weight ?? ''} onChange={e => updateSet(exercise.id, set.id, 'weight', parseValue(e.target.value))} placeholder="0" />;
          col2 = <input type="number" step="any" className={inputClass} value={set.reps ?? ''} onChange={e => updateSet(exercise.id, set.id, 'reps', parseValue(e.target.value))} placeholder="0" />;
      } else if (mode === 'reps_only') {
          col1 = <div className="text-center text-slate-600">-</div>;
          col2 = <input type="number" step="any" className={inputClass} value={set.reps ?? ''} onChange={e => updateSet(exercise.id, set.id, 'reps', parseValue(e.target.value))} placeholder="0" />;
      } else if (mode === 'time_distance') {
          col1 = <input type="number" step="any" className={inputClass} value={set.time ?? ''} onChange={e => updateSet(exercise.id, set.id, 'time', parseValue(e.target.value))} placeholder="min" />;
          col2 = <input type="number" step="any" className={inputClass} value={set.distance ?? ''} onChange={e => updateSet(exercise.id, set.id, 'distance', parseValue(e.target.value))} placeholder="dist" />;
      } else if (mode === 'time_only') {
          col1 = <input type="number" step="any" className={inputClass} value={set.time ?? ''} onChange={e => updateSet(exercise.id, set.id, 'time', parseValue(e.target.value))} placeholder="Seconds" />;
          col2 = <div className="text-center text-slate-600">-</div>;
      }

      return { col1, col2 };
  };

  const getHeaders = (mode: TrackingMode) => {
      if (mode === 'weight_reps') return [user.unitSystem === 'imperial' ? 'lbs' : 'kg', 'Reps'];
      if (mode === 'reps_only') return ['-', 'Reps'];
      if (mode === 'time_distance') return ['Time (min)', `Dist (${user.unitSystem === 'imperial' ? 'mi' : 'km'})`];
      if (mode === 'time_only') return ['Time (s)', '-'];
      return ['-', '-'];
  };

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-10 p-4 flex justify-between items-center shadow-md">
        <div>
          <h2 className="font-bold text-white">{activeWorkout.name}</h2>
          <div className="flex items-center text-blue-400 text-sm font-mono">
            <Timer className="w-4 h-4 mr-1" />
            {formatTime(elapsed)}
          </div>
        </div>
        <button 
          onClick={handleFinish}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-emerald-900/50"
        >
          Finish
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeWorkout.exercises.map((exercise, idx) => {
          const mode = resolveTrackingMode(exercise);
          const headers = getHeaders(mode);
          
          return (
            <div key={exercise.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-sm">
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h3 className="text-blue-100 font-semibold">{exercise.name}</h3>
                    <span className="text-xs text-slate-400 uppercase">{exercise.type}</span>
                </div>
                <button className="text-slate-500 hover:text-slate-300">•••</button>
                </div>
                
                <div className="p-2">
                <div className="grid grid-cols-10 gap-2 text-xs text-slate-500 uppercase text-center mb-2 px-2">
                    <div className="col-span-1">Set</div>
                    <div className="col-span-3">{headers[0]}</div>
                    <div className="col-span-3">{headers[1]}</div>
                    <div className="col-span-3">Status</div>
                </div>

                {exercise.sets.map((set, setIdx) => {
                    const { col1, col2 } = renderSetInputs(exercise, set, mode);
                    return (
                        <div key={set.id} className={`grid grid-cols-10 gap-2 items-center mb-2 p-2 rounded-lg transition-colors ${set.completed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-900/50 border border-transparent'}`}>
                            <div className="col-span-1 text-center text-slate-400 font-mono text-sm">{setIdx + 1}</div>
                            <div className="col-span-3">{col1}</div>
                            <div className="col-span-3">{col2}</div>

                            <div className="col-span-3 flex justify-center gap-2">
                                <button 
                                    onClick={() => toggleSetComplete(exercise.id, set.id)}
                                    className={`w-8 h-8 rounded flex items-center justify-center transition-all ${set.completed ? 'bg-emerald-500 text-white scale-105' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => removeSet(exercise.id, set.id)}
                                    className="w-8 h-8 rounded flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                <button 
                    onClick={() => addSet(exercise.id)}
                    className="w-full py-3 mt-2 flex items-center justify-center text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-dashed border-blue-500/30 hover:border-blue-500"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Set
                </button>
                </div>
            </div>
          );
        })}

        <button 
          onClick={() => setShowExerciseSelector(true)}
          className="w-full py-4 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:border-slate-500 flex flex-col items-center justify-center transition-colors"
        >
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-sm font-medium">Add Exercise</span>
        </button>

        <button onClick={cancelWorkout} className="w-full py-3 text-red-400 hover:text-red-300 text-sm">
            Cancel Workout
        </button>
      </div>

      {showExerciseSelector && (
          <ExerciseSelector 
            onSelect={handleAddExercise} 
            onClose={() => setShowExerciseSelector(false)} 
          />
      )}
    </div>
  );
};

export default ActiveWorkout;


import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, ArrowLeft, Sparkles, Dumbbell, HeartPulse, PersonStanding, Pencil } from 'lucide-react';
import { DEFAULT_EXERCISES } from '../data/exercises';
import { ExerciseDefinition, ExerciseType, TrackingMode } from '../types';
import { getExerciseDetails } from '../services/geminiService';
import { useStore } from '../context/StoreContext';

interface ExerciseSelectorProps {
    onSelect: (def: ExerciseDefinition) => void;
    onClose: () => void;
}

const MUSCLE_GROUPS = [
  "Full Body",
  "Cardiovascular System",
  "Arms",
  "Arms (Biceps)",
  "Arms (Triceps)",
  "Arms (Forearms)",
  "Back",
  "Back (Lats)",
  "Back (Traps)",
  "Back (Upper)",
  "Chest",
  "Chest: Upper",
  "Chest: Middle",
  "Chest: Lower",
  "Core",
  "Core (Abs)",
  "Core (Rotation)",
  "Core (Lower)",
  "Core Stability",
  "Legs",
  "Legs (Calves)",
  "Legs (Hamstrings)",
  "Legs (Quadriceps)",
  "Legs (Glutes)",
  "Legs (Adductors)",
  "Legs (Abductors)",
  "Shoulders",
  "Shoulders (Anterior Deltoid)",
  "Shoulders (Lateral Deltoid)",
  "Shoulders (Posterior Deltoid)"
];

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onSelect, onClose }) => {
    const { customExercises, updateCustomExercise } = useStore();
    const [mode, setMode] = useState<'SEARCH' | 'CREATE' | 'EDIT'>('SEARCH');
    const [search, setSearch] = useState('');
    
    // Create/Edit Form State
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<ExerciseType>(ExerciseType.Weight);
    const [targetInput, setTargetInput] = useState('');
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const [newTrackingMode, setNewTrackingMode] = useState<TrackingMode>('weight_reps');
    const [loadingAi, setLoadingAi] = useState(false);
    
    // Suggestions State
    const [showTargetSuggestions, setShowTargetSuggestions] = useState(false);

    // Combine default and custom exercises, prefer custom if names match
    const allExercises = useMemo(() => {
        const map = new Map<string, ExerciseDefinition>();
        
        // Add defaults first
        DEFAULT_EXERCISES.forEach(ex => {
            map.set(ex.name.toLowerCase(), ex);
        });
        
        // Overwrite with custom
        customExercises.forEach(ex => {
            map.set(ex.name.toLowerCase(), ex);
        });

        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [customExercises]);

    const filtered = allExercises.filter(e => 
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.target.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (mode === 'CREATE' && search) {
            setNewName(search);
            // Reset others
            setSelectedTargets([]);
            setTargetInput('');
        }
    }, [mode, search]);

    const handleSwitchToCreate = () => {
        setMode('CREATE');
        setNewName(search);
        setNewType(ExerciseType.Weight);
        setSelectedTargets([]);
        setNewTrackingMode('weight_reps');
    };

    const handleEdit = (ex: ExerciseDefinition) => {
        setMode('EDIT');
        setNewName(ex.name);
        setNewType(ex.type);
        setNewTrackingMode(ex.trackingMode || 'weight_reps');
        const tags = ex.target.split(',').map(t => t.trim()).filter(t => t);
        setSelectedTargets(tags);
    };

    const handleAiFill = async () => {
        if (!newName) return;
        setLoadingAi(true);
        const details = await getExerciseDetails(newName);
        if (details) {
            setNewType(details.type);
            const tags = details.target.split(',').map(t => t.trim()).filter(t => t);
            setSelectedTargets(tags);
            setNewTrackingMode(details.trackingMode);
        }
        setLoadingAi(false);
    };

    const handleSave = (addToWorkout: boolean) => {
        if (!newName) return;
        const finalTargets = [...selectedTargets];
        if (targetInput.trim() && !finalTargets.includes(targetInput.trim())) {
            finalTargets.push(targetInput.trim());
        }

        const newDefinition: ExerciseDefinition = {
            name: newName,
            type: newType,
            target: finalTargets.join(', ') || 'Custom',
            description: 'Custom exercise',
            trackingMode: newTrackingMode
        };

        // Update Store (Handles both create new and update existing)
        updateCustomExercise(newDefinition);

        if (addToWorkout) {
            onSelect(newDefinition);
        } else {
            // Just saving edits, go back to search
            setMode('SEARCH');
            setSearch('');
        }
    };

    const addTarget = (t: string) => {
        if (!selectedTargets.includes(t)) {
            setSelectedTargets([...selectedTargets, t]);
        }
        setTargetInput('');
        setShowTargetSuggestions(false);
    };

    const removeTarget = (t: string) => {
        setSelectedTargets(selectedTargets.filter(item => item !== t));
    };

    const handleTargetKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && targetInput.trim()) {
            e.preventDefault();
            addTarget(targetInput.trim());
        }
        if (e.key === 'Backspace' && !targetInput && selectedTargets.length > 0) {
            removeTarget(selectedTargets[selectedTargets.length - 1]);
        }
    };

    const handleTypeChange = (t: ExerciseType) => {
        setNewType(t);
        if (t === ExerciseType.Cardio) setNewTrackingMode('time_distance');
        else if (t === ExerciseType.Bodyweight) setNewTrackingMode('reps_only');
        else setNewTrackingMode('weight_reps');
    };

    if (mode === 'CREATE' || mode === 'EDIT') {
        const filteredMuscles = MUSCLE_GROUPS.filter(m => 
            m.toLowerCase().includes(targetInput.toLowerCase()) && 
            !selectedTargets.includes(m)
        );

        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                        <button onClick={() => setMode('SEARCH')} className="text-slate-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h3 className="text-white font-bold">{mode === 'CREATE' ? 'Create Custom Exercise' : 'Edit Exercise'}</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Exercise Name</label>
                            <div className="flex gap-2">
                                <input 
                                    autoFocus
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    placeholder="e.g. Zottman Curl"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    // Disable name editing in edit mode to prevent duplicates/confusion, or allow renaming which creates new?
                                    // Let's allow editing, it acts as upsert based on name.
                                    disabled={mode === 'EDIT'} 
                                    title={mode === 'EDIT' ? "Cannot rename exercises, create a new one instead." : ""}
                                />
                                <button 
                                    onClick={handleAiFill}
                                    disabled={loadingAi || !newName}
                                    className="bg-purple-600/20 border border-purple-500/30 text-purple-300 p-3 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50"
                                    title="Auto-fill details with AI"
                                >
                                    {loadingAi ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                </button>
                            </div>
                            {mode === 'CREATE' && <p className="text-[10px] text-slate-500 mt-1">Tip: Enter a name and click the sparkles to auto-detect details.</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Exercise Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { type: ExerciseType.Weight, icon: Dumbbell, label: 'Weight' },
                                    { type: ExerciseType.Cardio, icon: HeartPulse, label: 'Cardio' },
                                    { type: ExerciseType.Bodyweight, icon: PersonStanding, label: 'Body' }
                                ].map((opt) => (
                                    <button
                                        key={opt.type}
                                        onClick={() => handleTypeChange(opt.type)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${newType === opt.type ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                                    >
                                        <opt.icon className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-medium">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Muscles</label>
                            <div className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 min-h-[50px] flex flex-wrap gap-2 focus-within:border-blue-500 relative">
                                {selectedTargets.map(t => (
                                    <span key={t} className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                        {t}
                                        <button onClick={() => removeTarget(t)} className="hover:text-blue-200"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                                <div className="relative flex-1 min-w-[120px]">
                                    <input 
                                        className="w-full bg-transparent text-white outline-none text-sm py-1"
                                        placeholder={selectedTargets.length === 0 ? "Select or type muscles..." : ""}
                                        value={targetInput}
                                        onChange={e => setTargetInput(e.target.value)}
                                        onKeyDown={handleTargetKeyDown}
                                        onFocus={() => setShowTargetSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowTargetSuggestions(false), 200)}
                                    />
                                    {showTargetSuggestions && filteredMuscles.length > 0 && (
                                        <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-slate-800 border border-slate-700 rounded-lg max-h-40 overflow-y-auto shadow-xl z-20">
                                            {filteredMuscles.map(m => (
                                                <button
                                                    key={m}
                                                    className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm text-slate-300 border-b border-slate-700/50 last:border-0"
                                                    onClick={() => addTarget(m)}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            {mode === 'EDIT' && (
                                <button 
                                    onClick={() => handleSave(false)}
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                                >
                                    Save Changes
                                </button>
                            )}
                            <button 
                                onClick={() => handleSave(true)}
                                disabled={!newName}
                                className={`flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors ${mode === 'EDIT' ? '' : 'w-full'}`}
                            >
                                {mode === 'EDIT' ? 'Update & Add' : 'Add to Workout'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md flex flex-col max-h-[80vh] shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-white font-bold">Select Exercise</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-4 border-b border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Search exercises..." 
                            className="w-full bg-slate-800 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-700 focus:border-blue-500 outline-none placeholder:text-slate-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filtered.map((ex, i) => (
                        <div 
                            key={i}
                            className="w-full flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors group"
                        >
                            <button 
                                onClick={() => onSelect(ex)}
                                className="flex-1 text-left"
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{ex.name}</span>
                                    <span className="text-[10px] bg-slate-800 border border-slate-600 text-slate-400 px-1.5 py-0.5 rounded uppercase">{ex.type.split(' ')[0]}</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1 truncate">{ex.target}</div>
                            </button>
                            <button 
                                onClick={() => handleEdit(ex)}
                                className="ml-2 p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <button 
                        onClick={handleSwitchToCreate}
                        className="w-full p-4 text-blue-400 hover:bg-blue-500/10 rounded-lg flex items-center justify-center gap-2 mt-2"
                    >
                        <Plus className="w-4 h-4" />
                        {search ? `Create "${search}"` : "Create Custom Exercise"}
                    </button>
                </div>
            </div>
        </div>
    );
};

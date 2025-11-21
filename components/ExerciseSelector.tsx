import React, { useState, useEffect } from 'react';
import { Search, Plus, X, ArrowLeft, Sparkles, Dumbbell, HeartPulse, PersonStanding } from 'lucide-react';
import { DEFAULT_EXERCISES } from '../data/exercises';
import { ExerciseDefinition, ExerciseType, TrackingMode } from '../types';
import { getExerciseDetails } from '../services/geminiService';

interface ExerciseSelectorProps {
    onSelect: (def: ExerciseDefinition) => void;
    onClose: () => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onSelect, onClose }) => {
    const [mode, setMode] = useState<'SEARCH' | 'CREATE'>('SEARCH');
    const [search, setSearch] = useState('');
    
    // Create Form State
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<ExerciseType>(ExerciseType.Weight);
    const [newTarget, setNewTarget] = useState('');
    const [newTrackingMode, setNewTrackingMode] = useState<TrackingMode>('weight_reps');
    const [loadingAi, setLoadingAi] = useState(false);

    const filtered = DEFAULT_EXERCISES.filter(e => 
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.target.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (mode === 'CREATE' && search) {
            setNewName(search);
        }
    }, [mode, search]);

    const handleSwitchToCreate = () => {
        setMode('CREATE');
    };

    const handleAiFill = async () => {
        if (!newName) return;
        setLoadingAi(true);
        const details = await getExerciseDetails(newName);
        if (details) {
            setNewType(details.type);
            setNewTarget(details.target);
            setNewTrackingMode(details.trackingMode);
        }
        setLoadingAi(false);
    };

    const handleCreate = () => {
        if (!newName) return;
        onSelect({
            name: newName,
            type: newType,
            target: newTarget || 'Custom',
            description: 'Custom exercise',
            trackingMode: newTrackingMode
        });
    };

    // Update tracking mode default based on type selection if user hasn't manually set a weird combo
    const handleTypeChange = (t: ExerciseType) => {
        setNewType(t);
        if (t === ExerciseType.Cardio) setNewTrackingMode('time_distance');
        else if (t === ExerciseType.Bodyweight) setNewTrackingMode('reps_only');
        else setNewTrackingMode('weight_reps');
    };

    if (mode === 'CREATE') {
        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                        <button onClick={() => setMode('SEARCH')} className="text-slate-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h3 className="text-white font-bold">Create Custom Exercise</h3>
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
                            <p className="text-[10px] text-slate-500 mt-1">Tip: Enter a name and click the sparkles to auto-detect details.</p>
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
                            <input 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                placeholder="e.g. Biceps, Forearms"
                                value={newTarget}
                                onChange={e => setNewTarget(e.target.value)}
                            />
                        </div>
                        
                        <button 
                            onClick={handleCreate}
                            disabled={!newName}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors"
                        >
                            Add to Workout
                        </button>
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
                        <button 
                            key={i}
                            onClick={() => onSelect(ex)}
                            className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors group"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{ex.name}</span>
                                <span className="text-[10px] bg-slate-800 border border-slate-600 text-slate-400 px-1.5 py-0.5 rounded uppercase">{ex.type.split(' ')[0]}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 truncate">{ex.target}</div>
                        </button>
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
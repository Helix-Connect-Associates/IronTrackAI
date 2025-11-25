
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { WorkoutTemplate, Exercise, ExerciseType, ExerciseDefinition } from '../types';
import { Edit, Trash, Play, Copy, Sparkles, Save, Plus, ArrowLeft, X, Check } from 'lucide-react';
import { analyzeWorkoutTemplate } from '../services/geminiService';
import { ExerciseSelector } from '../components/ExerciseSelector';
import { generateId } from '../data/storage';

interface TemplatesProps {
  onNavigate: (view: any) => void;
}

const FOCUS_AREAS = [
    "Whole Body", "Chest", "Back", "Arms", "Abdominals", "Legs", "Shoulders", "Cardio"
];

const Templates: React.FC<TemplatesProps> = ({ onNavigate }) => {
  const { templates, saveTemplate, deleteTemplate, startWorkout } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<WorkoutTemplate | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  
  // Analysis Config State
  const [showAnalysisConfig, setShowAnalysisConfig] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [limitations, setLimitations] = useState('');

  const handleStartEdit = (template: WorkoutTemplate) => {
    setEditingId(template.id);
    setEditForm(JSON.parse(JSON.stringify(template))); // Deep copy
    setAiAnalysis(null);
  };

  const handleCreateNew = () => {
    const newTemp: WorkoutTemplate = {
        id: generateId(),
        name: 'New Template',
        exercises: []
    };
    setEditForm(newTemp);
    setEditingId(newTemp.id);
    setAiAnalysis(null);
  };

  const handleCopy = (template: WorkoutTemplate) => {
      const copy: WorkoutTemplate = {
          ...JSON.parse(JSON.stringify(template)),
          id: generateId(),
          name: `${template.name} (Copy)`
      };
      saveTemplate(copy);
  };

  const handleSave = () => {
    if (editForm) {
        saveTemplate(editForm);
        setEditingId(null);
        setEditForm(null);
    }
  };

  const handleAddExercise = (def: ExerciseDefinition) => {
      if (!editForm) return;
      
      const newEx: Exercise = {
          id: generateId(),
          name: def.name,
          type: def.type,
          target: def.target,
          description: def.description,
          sets: []
      };
      setEditForm({...editForm, exercises: [...editForm.exercises, newEx]});
      setShowExerciseSelector(false);
  };

  const toggleFocus = (area: string) => {
      setSelectedFocus(prev => 
        prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
      );
  };

  const handleRunAnalysis = async () => {
      if(!editForm) return;
      setAnalyzing(true);
      setShowAnalysisConfig(false); // Close modal
      const analysis = await analyzeWorkoutTemplate(editForm.exercises, selectedFocus, limitations);
      setAiAnalysis(analysis);
      setAnalyzing(false);
  };

  if (editingId && editForm) {
      return (
        <div className="pb-24 space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setEditingId(null)} className="p-2 rounded-full hover:bg-slate-800">
                    <ArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
                <h1 className="text-xl font-bold text-white">Edit Template</h1>
            </div>

            <input 
                className="w-full bg-slate-800 text-white text-lg font-semibold p-4 rounded-xl border border-slate-700 focus:border-blue-500 outline-none"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Template Name"
            />

            <div className="space-y-2">
                {editForm.exercises.map((ex, idx) => (
                    <div key={ex.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                        <div>
                            <span className="text-slate-200 font-medium block">{idx+1}. {ex.name}</span>
                            <span className="text-xs text-slate-500">{ex.target}</span>
                        </div>
                        <button 
                            onClick={() => setEditForm({...editForm, exercises: editForm.exercises.filter(e => e.id !== ex.id)})}
                            className="text-red-500 p-2 hover:bg-red-500/10 rounded"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button 
                    onClick={() => setShowExerciseSelector(true)}
                    className="w-full py-3 border border-dashed border-slate-600 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Exercise
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => setShowAnalysisConfig(true)}
                    className="p-3 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-600/30 transition-colors"
                >
                    {analyzing ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <Sparkles className="w-4 h-4" />}
                    AI Analyze
                </button>
                <button 
                    onClick={handleSave}
                    className="p-3 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors"
                >
                    <Save className="w-4 h-4" /> Save
                </button>
            </div>

            {aiAnalysis && (
                <div className="bg-slate-800 p-4 rounded-xl border border-purple-500/30">
                    <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4"/> Analysis</h3>
                    <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">{aiAnalysis}</p>
                </div>
            )}

            {showExerciseSelector && (
                <ExerciseSelector 
                    onSelect={handleAddExercise} 
                    onClose={() => setShowExerciseSelector(false)} 
                />
            )}

            {showAnalysisConfig && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                    Analyze Template
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Select focus areas for this workout.</p>
                            </div>
                            <button onClick={() => setShowAnalysisConfig(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                {FOCUS_AREAS.map(area => (
                                    <button
                                        key={area}
                                        onClick={() => toggleFocus(area)}
                                        className={`p-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-between ${selectedFocus.includes(area) ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        {area}
                                        {selectedFocus.includes(area) && <Check className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Limitations / Injuries</label>
                                <input 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                    placeholder="e.g. Lower back pain, No cable machine"
                                    value={limitations}
                                    onChange={e => setLimitations(e.target.value)}
                                />
                            </div>

                            <button 
                                onClick={handleRunAnalysis}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" /> Run Analysis
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  return (
    <div className="pb-24 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Templates</h1>
            <button onClick={handleCreateNew} className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition-colors">
                <Plus className="w-5 h-5 text-white" />
            </button>
        </div>

        <div className="space-y-4">
            {templates.map(t => (
                <div key={t.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 group relative">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-white">{t.name}</h3>
                        <div className="flex gap-2">
                            <button onClick={() => handleCopy(t)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Copy className="w-4 h-4"/></button>
                            <button onClick={() => handleStartEdit(t)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Edit className="w-4 h-4"/></button>
                            <button onClick={() => deleteTemplate(t.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"><Trash className="w-4 h-4"/></button>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{t.exercises.length} Exercises</p>
                    
                    <button 
                        onClick={() => {
                            startWorkout(t);
                            onNavigate('ACTIVE_WORKOUT');
                        }}
                        className="w-full py-3 bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4" /> Start Workout
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Templates;


import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

const Progress: React.FC = () => {
  const { workouts, user } = useStore();
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // Get unique exercise names
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    workouts.forEach(w => w.exercises.forEach(e => names.add(e.name)));
    return Array.from(names).sort();
  }, [workouts]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    
    const data: any[] = [];
    workouts.forEach(w => {
        const ex = w.exercises.find(e => e.name === selectedExercise);
        if (ex) {
            // Determine metric: Max Weight for weight training, Max Distance for cardio?
            // Simplifying to Max Weight for now as typical gym tracker
            const maxWeight = Math.max(...ex.sets.map(s => s.weight || 0), 0);
            if (maxWeight > 0) {
                data.push({
                    date: format(new Date(w.date), 'MM/dd'),
                    weight: maxWeight,
                    fullDate: w.date
                });
            }
        }
    });
    return data.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [workouts, selectedExercise]);

  // Set default selection
  if (!selectedExercise && exerciseNames.length > 0) {
      setSelectedExercise(exerciseNames[0]);
  }

  return (
    <div className="pb-24 space-y-6">
      <h1 className="text-2xl font-bold text-white">Progress</h1>

      {exerciseNames.length === 0 ? (
          <div className="text-slate-500 text-center">Complete some workouts to see progress!</div>
      ) : (
          <>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Select Exercise</label>
                <select 
                    className="w-full bg-slate-900 text-white p-3 rounded-lg border border-slate-700 outline-none focus:border-blue-500"
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                >
                    {exerciseNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-80">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Max Weight Over Time ({user.unitSystem === 'imperial' ? 'lbs' : 'kg'})
                </h3>
                <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f1f5f9' }}
                            itemStyle={{ color: '#3b82f6' }}
                        />
                        <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-200">History Log</h3>
                {chartData.slice().reverse().map((d, i) => (
                    <div key={i} className="flex justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <span className="text-slate-400">{d.date}</span>
                        <span className="text-white font-mono font-bold">{d.weight} {user.unitSystem === 'imperial' ? 'lbs' : 'kg'}</span>
                    </div>
                ))}
            </div>
          </>
      )}
    </div>
  );
};

export default Progress;

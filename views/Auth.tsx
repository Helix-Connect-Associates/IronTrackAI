
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { UserSummary } from '../types';
import { Storage } from '../data/storage';
import { UserPlus, LogIn, ChevronRight, Dumbbell } from 'lucide-react';

const Auth: React.FC = () => {
  const { login, register } = useStore();
  const [profiles, setProfiles] = useState<UserSummary[]>([]);
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  
  // Create Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setProfiles(Storage.getProfiles());
  }, []);

  const handleCreate = () => {
    if (!name) return;
    register(name, email || '');
  };

  if (view === 'CREATE' || profiles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
             <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50 mb-6">
                <Dumbbell className="w-10 h-10 text-white" />
             </div>
             <h1 className="text-3xl font-bold">Welcome to IronTrack</h1>
             <p className="text-slate-400 mt-2">Create your profile to start tracking.</p>
          </div>

          <div className="space-y-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
              <input 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email (Optional)</label>
              <input 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <button 
              onClick={handleCreate}
              disabled={!name}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" /> Create Profile
            </button>
          </div>

          {profiles.length > 0 && (
            <button onClick={() => setView('LIST')} className="w-full text-slate-500 hover:text-white text-sm">
              Back to profiles
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white">
       <div className="w-full max-w-md space-y-8">
          <div className="text-center">
             <div className="mx-auto w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-4 border border-slate-700">
                <Dumbbell className="w-8 h-8 text-blue-500" />
             </div>
             <h1 className="text-2xl font-bold">Who is working out?</h1>
          </div>

          <div className="space-y-3">
            {profiles.map(p => (
              <button 
                key={p.id}
                onClick={() => login(p.id)}
                className="w-full bg-slate-800 hover:bg-slate-750 p-4 rounded-xl border border-slate-700 flex items-center justify-between group transition-all hover:border-blue-500"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg">
                    {p.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-bold group-hover:text-blue-400 transition-colors">{p.name}</div>
                    <div className="text-xs text-slate-500">Last active: {new Date(p.lastActive).toLocaleDateString()}</div>
                  </div>
                </div>
                <ChevronRight className="text-slate-600 group-hover:text-white" />
              </button>
            ))}
          </div>

          <button 
            onClick={() => setView('CREATE')}
            className="w-full py-4 border border-dashed border-slate-700 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon /> Create New Profile
          </button>
       </div>
    </div>
  );
};

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

export default Auth;

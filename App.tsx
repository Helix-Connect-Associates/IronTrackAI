import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { ViewState } from './types';
import Dashboard from './views/Dashboard';
import Templates from './views/Templates';
import Progress from './views/Progress';
import History from './views/History';
import ActiveWorkout from './views/ActiveWorkout';
import { LayoutDashboard, Book, Activity, Calendar, Dumbbell } from 'lucide-react';

const Navigation: React.FC<{ current: ViewState; onNavigate: (v: ViewState) => void }> = ({ current, onNavigate }) => {
  const navItems: { id: ViewState; label: string; icon: React.FC<any> }[] = [
    { id: 'DASHBOARD', label: 'Home', icon: LayoutDashboard },
    { id: 'TEMPLATES', label: 'Plans', icon: Book },
    { id: 'ACTIVE_WORKOUT', label: 'Workout', icon: Dumbbell }, // Prominent center button style logic could go here
    { id: 'PROGRESS', label: 'Stats', icon: Activity },
    { id: 'HISTORY', label: 'Logs', icon: Calendar },
  ];

  const { activeWorkout } = useStore();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800 pb-safe pt-2 px-4 z-50">
      <div className="flex justify-between items-end max-w-md mx-auto">
        {navItems.map(item => {
           const isActive = current === item.id;
           const isWorkout = item.id === 'ACTIVE_WORKOUT';
           
           // If in workout, highlight the workout tab significantly
           if (isWorkout) {
             return (
                <button 
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`relative -top-6 flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-blue-900/50 transition-all ${isActive ? 'bg-blue-500 text-white scale-110' : (activeWorkout ? 'bg-emerald-500 animate-pulse text-white' : 'bg-slate-700 text-slate-400')}`}
                >
                    <item.icon className="w-6 h-6" />
                </button>
             );
           }

           return (
            <button 
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <item.icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
            </button>
           );
        })}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [viewData, setViewData] = useState<any>(null);

  const handleNavigate = (v: ViewState, data?: any) => {
    setView(v);
    if (data) setViewData(data);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-md mx-auto min-h-screen bg-slate-900 relative shadow-2xl shadow-black">
        <div className="p-4 pt-8">
            {view === 'DASHBOARD' && <Dashboard onNavigate={handleNavigate} />}
            {view === 'TEMPLATES' && <Templates onNavigate={handleNavigate} />}
            {view === 'PROGRESS' && <Progress />}
            {view === 'HISTORY' && <History onNavigate={handleNavigate} initialFilter={viewData?.filter} />}
            {view === 'ACTIVE_WORKOUT' && <ActiveWorkout onFinish={() => setView('HISTORY')} />}
        </div>
        <Navigation current={view} onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;

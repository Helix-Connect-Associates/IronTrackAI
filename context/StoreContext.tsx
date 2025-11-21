
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkoutLog, WorkoutTemplate, UserProfile, Exercise, ExerciseType } from '../types';
import { Storage, generateId } from '../data/storage';

interface StoreContextType {
  user: UserProfile;
  workouts: WorkoutLog[];
  templates: WorkoutTemplate[];
  activeWorkout: WorkoutLog | null;
  
  // Actions
  startWorkout: (base?: WorkoutLog | WorkoutTemplate | null) => void;
  cancelWorkout: () => void;
  finishWorkout: (finalState?: WorkoutLog) => void;
  updateActiveWorkout: (workout: WorkoutLog) => void;
  
  saveTemplate: (template: WorkoutTemplate) => void;
  deleteTemplate: (id: string) => void;
  
  updateUser: (user: UserProfile) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Default data for new users
const DEFAULT_USER: UserProfile = {
  name: "Brian Hood",
  email: "brian.hood471@gmail.com",
  unitSystem: "imperial"
};

const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 't1',
    name: 'Upper Body Power',
    exercises: [
      { id: 'e1', name: 'Bench Press (Barbell)', type: ExerciseType.Weight, target: 'Chest', sets: [] },
      { id: 'e2', name: 'Pull-Up/Chin-Up', type: ExerciseType.Bodyweight, target: 'Back', sets: [] },
      { id: 'e3', name: 'Overhead Press (Dumbbell)', type: ExerciseType.Weight, target: 'Shoulders', sets: [] }
    ]
  }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutLog | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadedUser = Storage.getUser(DEFAULT_USER);
    const loadedWorkouts = Storage.getWorkouts();
    const loadedTemplates = Storage.getTemplates();
    const loadedActive = Storage.getActiveWorkout();

    if (loadedTemplates.length === 0) {
        setTemplates(DEFAULT_TEMPLATES);
    } else {
        setTemplates(loadedTemplates);
    }

    setUser(loadedUser);
    setWorkouts(loadedWorkouts);
    setActiveWorkout(loadedActive);
    setIsInitialized(true);
  }, []);

  // Persist changes ONLY after initialization
  useEffect(() => {
    if (!isInitialized) return;
    Storage.saveWorkouts(workouts);
  }, [workouts, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    Storage.saveTemplates(templates);
  }, [templates, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    Storage.saveUser(user);
  }, [user, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    Storage.saveActiveWorkout(activeWorkout);
  }, [activeWorkout, isInitialized]);

  const startWorkout = (base?: WorkoutLog | WorkoutTemplate | null) => {
    const newWorkout: WorkoutLog = {
      id: generateId(),
      name: base ? base.name : 'New Workout',
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      exercises: base ? JSON.parse(JSON.stringify(base.exercises)).map((e: Exercise) => ({...e, sets: []})) : [],
      templateId: base && 'exercises' in base && !('date' in base) ? (base as WorkoutTemplate).id : undefined
    };
    setActiveWorkout(newWorkout);
  };

  const updateActiveWorkout = (updated: WorkoutLog) => {
    setActiveWorkout(updated);
  };

  const cancelWorkout = () => {
    if (window.confirm("Are you sure you want to cancel? Progress will be lost.")) {
      setActiveWorkout(null);
    }
  };

  const finishWorkout = (finalState?: WorkoutLog) => {
    // Use the passed finalState if available, otherwise use activeWorkout from state
    const targetWorkout = finalState || activeWorkout;

    if (targetWorkout) {
      const finished: WorkoutLog = {
        ...targetWorkout,
        endTime: new Date().toISOString()
      };
      
      const newWorkoutList = [finished, ...workouts];
      
      // CRITICAL: Save to storage IMMEDIATELY to prevent race conditions on unmount/reload
      Storage.saveWorkouts(newWorkoutList);
      Storage.saveActiveWorkout(null);

      // Update local state
      setWorkouts(newWorkoutList);
      setActiveWorkout(null);
    } else {
        console.error("No active workout to finish");
    }
  };

  const saveTemplate = (template: WorkoutTemplate) => {
    setTemplates(prev => {
      const exists = prev.find(t => t.id === template.id);
      if (exists) return prev.map(t => t.id === template.id ? template : t);
      return [...prev, template];
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const exportData = () => {
    return JSON.stringify(Storage.getAllData(), null, 2);
  };

  const importData = (json: string): boolean => {
    try {
        const data = JSON.parse(json);
        Storage.importData(data);
        // Force reload state
        setUser(Storage.getUser(DEFAULT_USER));
        setWorkouts(Storage.getWorkouts());
        setTemplates(Storage.getTemplates());
        return true;
    } catch (e) {
        console.error("Import failed", e);
        return false;
    }
  };

  return (
    <StoreContext.Provider value={{
      user,
      workouts,
      templates,
      activeWorkout,
      startWorkout,
      cancelWorkout,
      finishWorkout,
      updateActiveWorkout,
      saveTemplate,
      deleteTemplate,
      updateUser: setUser,
      exportData,
      importData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};

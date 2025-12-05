
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkoutLog, WorkoutTemplate, UserProfile, Exercise, ExerciseType, ExerciseDefinition } from '../types';
import { Storage, generateId } from '../data/storage';

interface StoreContextType {
  user: UserProfile;
  workouts: WorkoutLog[];
  templates: WorkoutTemplate[];
  activeWorkout: WorkoutLog | null;
  customExercises: ExerciseDefinition[];
  isAuthenticated: boolean;
  
  // Auth Actions
  login: (userId: string) => void;
  logout: () => void;
  register: (name: string, email: string) => void;

  // Actions
  startWorkout: (base?: WorkoutLog | WorkoutTemplate | null) => void;
  cancelWorkout: () => void;
  finishWorkout: (finalState?: WorkoutLog) => void;
  updateActiveWorkout: (workout: WorkoutLog) => void;
  
  saveTemplate: (template: WorkoutTemplate) => void;
  deleteTemplate: (id: string) => void;
  
  addCustomExercise: (exercise: ExerciseDefinition) => void;
  updateCustomExercise: (exercise: ExerciseDefinition) => void;

  updateUser: (user: UserProfile) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Placeholder to avoid null checks everywhere before auth
const EMPTY_USER: UserProfile = { id: '', name: '', email: '', unitSystem: 'imperial' };

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile>(EMPTY_USER);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutLog | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 1. Initial Mount: Check for Legacy Data or Last User
  useEffect(() => {
    // Run Data Migration to update targets if needed
    Storage.runDataMigration();

    // Check for legacy data migration first
    if (Storage.checkForLegacyData()) {
        console.log("Migrating legacy data...");
        const newId = Storage.migrateLegacyData();
        login(newId);
        return;
    }

    // Check for last active user
    const lastUser = Storage.getLastUserId();
    if (lastUser) {
        login(lastUser);
    }
  }, []);

  // 2. Login Logic
  const login = (userId: string) => {
      const loadedUser = Storage.getUser(userId);
      if (!loadedUser) {
          // Should not happen normally unless storage cleared manually
          console.error("User profile not found");
          return;
      }
      
      setCurrentUserId(userId);
      setUser(loadedUser);
      setWorkouts(Storage.getWorkouts(userId));
      setTemplates(Storage.getTemplates(userId));
      setCustomExercises(Storage.getCustomExercises(userId));
      setActiveWorkout(Storage.getActiveWorkout(userId));
      
      // Update last active timestamp in profile list
      Storage.saveProfileSummary({
          id: userId,
          name: loadedUser.name,
          lastActive: new Date().toISOString()
      });
      Storage.setLastUserId(userId);
      setIsAuthenticated(true);
  };

  const logout = () => {
      setCurrentUserId(null);
      setUser(EMPTY_USER);
      setWorkouts([]);
      setTemplates([]);
      setCustomExercises([]);
      setActiveWorkout(null);
      setIsAuthenticated(false);
      Storage.setLastUserId(null);
  };

  const register = (name: string, email: string) => {
      const newId = generateId();
      const newUser: UserProfile = {
          id: newId,
          name,
          email,
          unitSystem: 'imperial' // Default
      };
      
      // Save initial data
      Storage.saveUser(newId, newUser);
      // Add default templates for new user
      const defaultTemplates = [{
            id: generateId(),
            name: 'Upper Body Power',
            exercises: [
            { id: generateId(), name: 'Bench Press (Barbell)', type: ExerciseType.Weight, target: 'Chest', sets: [] },
            { id: generateId(), name: 'Pull-Up/Chin-Up', type: ExerciseType.Bodyweight, target: 'Back', sets: [] },
            { id: generateId(), name: 'Overhead Press (Dumbbell)', type: ExerciseType.Weight, target: 'Shoulders', sets: [] }
            ]
        }];
      Storage.saveTemplates(newId, defaultTemplates);
      
      // Update Profile List
      Storage.saveProfileSummary({
          id: newId,
          name: name,
          lastActive: new Date().toISOString()
      });

      // Auto Login
      login(newId);
  };

  // 3. Persisters - Only run if authenticated and currentUserId is set
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;
    Storage.saveWorkouts(currentUserId, workouts);
  }, [workouts, isAuthenticated, currentUserId]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;
    Storage.saveTemplates(currentUserId, templates);
  }, [templates, isAuthenticated, currentUserId]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;
    Storage.saveCustomExercises(currentUserId, customExercises);
  }, [customExercises, isAuthenticated, currentUserId]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;
    Storage.saveUser(currentUserId, user);
  }, [user, isAuthenticated, currentUserId]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;
    Storage.saveActiveWorkout(currentUserId, activeWorkout);
  }, [activeWorkout, isAuthenticated, currentUserId]);

  // Actions
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
    const targetWorkout = finalState || activeWorkout;

    if (targetWorkout && currentUserId) {
      const finished: WorkoutLog = {
        ...targetWorkout,
        endTime: new Date().toISOString()
      };
      
      const newWorkoutList = [finished, ...workouts];
      
      // Direct Save
      Storage.saveWorkouts(currentUserId, newWorkoutList);
      Storage.saveActiveWorkout(currentUserId, null);

      setWorkouts(newWorkoutList);
      setActiveWorkout(null);
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

  const addCustomExercise = (exercise: ExerciseDefinition) => {
      setCustomExercises(prev => {
          // Avoid duplicates based on name
          if (prev.some(e => e.name.toLowerCase() === exercise.name.toLowerCase())) {
              return prev;
          }
          return [...prev, exercise];
      });
  };

  const updateCustomExercise = (exercise: ExerciseDefinition) => {
    setCustomExercises(prev => {
        const existingIndex = prev.findIndex(e => e.name.toLowerCase() === exercise.name.toLowerCase());
        if (existingIndex >= 0) {
            // Update existing custom
            const newArr = [...prev];
            newArr[existingIndex] = exercise;
            return newArr;
        } else {
            // Add new (effectively shadowing a default or creating new)
            return [...prev, exercise];
        }
    });
  };

  const exportData = () => {
    if (!currentUserId) return '{}';
    return JSON.stringify(Storage.getAllUserData(currentUserId), null, 2);
  };

  const importData = (json: string): boolean => {
    if (!currentUserId) return false;
    try {
        const data = JSON.parse(json);
        Storage.importUserData(currentUserId, data);
        // Reload
        login(currentUserId);
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
      customExercises,
      activeWorkout,
      isAuthenticated,
      login,
      logout,
      register,
      startWorkout,
      cancelWorkout,
      finishWorkout,
      updateActiveWorkout,
      saveTemplate,
      deleteTemplate,
      addCustomExercise,
      updateCustomExercise,
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

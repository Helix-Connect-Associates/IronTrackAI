
import { WorkoutLog, WorkoutTemplate, UserProfile } from '../types';

const STORAGE_KEYS = {
  WORKOUTS: 'ironTrack_workouts',
  TEMPLATES: 'ironTrack_templates',
  USER: 'ironTrack_user',
  ACTIVE_WORKOUT: 'ironTrack_active_workout'
};

// Helper to generate unique IDs safely in all environments
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback if crypto is available but randomUUID fails (insecure context)
    }
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// Helper to read from local storage with error handling
const read = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return fallback;
  }
};

// Helper to write to local storage
const write = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key}`, e);
  }
};

export const Storage = {
  getWorkouts: (): WorkoutLog[] => read(STORAGE_KEYS.WORKOUTS, []),
  saveWorkouts: (workouts: WorkoutLog[]) => write(STORAGE_KEYS.WORKOUTS, workouts),
  
  getTemplates: (): WorkoutTemplate[] => read(STORAGE_KEYS.TEMPLATES, []),
  saveTemplates: (templates: WorkoutTemplate[]) => write(STORAGE_KEYS.TEMPLATES, templates),
  
  getUser: (fallback: UserProfile): UserProfile => read(STORAGE_KEYS.USER, fallback),
  saveUser: (user: UserProfile) => write(STORAGE_KEYS.USER, user),

  getActiveWorkout: (): WorkoutLog | null => read(STORAGE_KEYS.ACTIVE_WORKOUT, null),
  saveActiveWorkout: (workout: WorkoutLog | null) => {
    if (workout === null) {
        if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    } else {
        write(STORAGE_KEYS.ACTIVE_WORKOUT, workout);
    }
  },

  // Full System Backup/Restore
  getAllData: () => ({
    user: read(STORAGE_KEYS.USER, null),
    workouts: read(STORAGE_KEYS.WORKOUTS, []),
    templates: read(STORAGE_KEYS.TEMPLATES, []),
  }),
  
  importData: (data: any) => {
    if (data.user) write(STORAGE_KEYS.USER, data.user);
    if (data.workouts) write(STORAGE_KEYS.WORKOUTS, data.workouts);
    if (data.templates) write(STORAGE_KEYS.TEMPLATES, data.templates);
  }
};


import { WorkoutLog, WorkoutTemplate, UserProfile, UserSummary } from '../types';

const GLOBAL_KEYS = {
  PROFILES: 'ironTrack_profiles',
  LAST_USER: 'ironTrack_last_user_id'
};

const LEGACY_KEYS = {
  WORKOUTS: 'ironTrack_workouts',
  TEMPLATES: 'ironTrack_templates',
  USER: 'ironTrack_user',
  ACTIVE_WORKOUT: 'ironTrack_active_workout'
};

// Helper to generate unique IDs
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) { }
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

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

const write = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key}`, e);
  }
};

export const Storage = {
  // --- Global Profile Management ---
  getProfiles: (): UserSummary[] => read(GLOBAL_KEYS.PROFILES, []),
  
  saveProfileSummary: (summary: UserSummary) => {
    const profiles = Storage.getProfiles();
    const existing = profiles.findIndex(p => p.id === summary.id);
    let newProfiles;
    if (existing >= 0) {
        newProfiles = [...profiles];
        newProfiles[existing] = summary;
    } else {
        newProfiles = [...profiles, summary];
    }
    write(GLOBAL_KEYS.PROFILES, newProfiles);
  },

  getLastUserId: (): string | null => read(GLOBAL_KEYS.LAST_USER, null),
  setLastUserId: (id: string | null) => {
    if (id) write(GLOBAL_KEYS.LAST_USER, id);
    else localStorage.removeItem(GLOBAL_KEYS.LAST_USER);
  },

  // --- User Specific Data (Namespaced) ---
  getUser: (userId: string): UserProfile | null => read(`ironTrack_user_${userId}`, null),
  saveUser: (userId: string, user: UserProfile) => write(`ironTrack_user_${userId}`, user),

  getWorkouts: (userId: string): WorkoutLog[] => read(`ironTrack_workouts_${userId}`, []),
  saveWorkouts: (userId: string, workouts: WorkoutLog[]) => write(`ironTrack_workouts_${userId}`, workouts),

  getTemplates: (userId: string): WorkoutTemplate[] => read(`ironTrack_templates_${userId}`, []),
  saveTemplates: (userId: string, templates: WorkoutTemplate[]) => write(`ironTrack_templates_${userId}`, templates),

  getActiveWorkout: (userId: string): WorkoutLog | null => read(`ironTrack_active_${userId}`, null),
  saveActiveWorkout: (userId: string, workout: WorkoutLog | null) => {
    const key = `ironTrack_active_${userId}`;
    if (workout === null) localStorage.removeItem(key);
    else write(key, workout);
  },

  // --- Migration Logic ---
  checkForLegacyData: (): boolean => {
      const legacyUser = localStorage.getItem(LEGACY_KEYS.USER);
      return !!legacyUser;
  },

  migrateLegacyData: (): string => {
      // 1. Read Legacy Data
      const lUser = read(LEGACY_KEYS.USER, { name: 'Legacy User', email: '', unitSystem: 'imperial' });
      const lWorkouts = read(LEGACY_KEYS.WORKOUTS, []);
      const lTemplates = read(LEGACY_KEYS.TEMPLATES, []);
      
      // 2. Create New ID
      const newId = generateId();
      
      // 3. Save to Namespaced Keys
      const userProfile: UserProfile = { 
        id: newId,
        name: lUser.name,
        email: lUser.email,
        unitSystem: lUser.unitSystem === 'metric' ? 'metric' : 'imperial'
      };
      write(`ironTrack_user_${newId}`, userProfile);
      write(`ironTrack_workouts_${newId}`, lWorkouts);
      write(`ironTrack_templates_${newId}`, lTemplates);

      // 4. Create Profile Summary
      const summary: UserSummary = {
          id: newId,
          name: lUser.name,
          lastActive: new Date().toISOString()
      };
      write(GLOBAL_KEYS.PROFILES, [summary]);

      // 5. Clear Legacy Keys (Safety: Keep them or rename? Let's clear to prevent double migration)
      localStorage.removeItem(LEGACY_KEYS.USER);
      localStorage.removeItem(LEGACY_KEYS.WORKOUTS);
      localStorage.removeItem(LEGACY_KEYS.TEMPLATES);
      localStorage.removeItem(LEGACY_KEYS.ACTIVE_WORKOUT);

      return newId;
  },

  // --- Data Management ---
  getAllUserData: (userId: string) => ({
    user: read(`ironTrack_user_${userId}`, null),
    workouts: read(`ironTrack_workouts_${userId}`, []),
    templates: read(`ironTrack_templates_${userId}`, []),
  }),

  importUserData: (userId: string, data: any) => {
      if (data.user) write(`ironTrack_user_${userId}`, { ...data.user, id: userId });
      if (data.workouts) write(`ironTrack_workouts_${userId}`, data.workouts);
      if (data.templates) write(`ironTrack_templates_${userId}`, data.templates);
  }
};

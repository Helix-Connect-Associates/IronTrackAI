
export enum ExerciseType {
  Cardio = 'Cardio',
  Weight = 'Weight Training',
  Bodyweight = 'Bodyweight'
}

export type TrackingMode = 'weight_reps' | 'reps_only' | 'time_distance' | 'time_only';

export interface ExerciseDefinition {
  name: string;
  type: ExerciseType;
  target: string;
  description?: string;
  trackingMode?: TrackingMode;
}

export interface SetData {
  id: string;
  weight?: number;
  reps?: number;
  distance?: number;
  time?: number; // in minutes or seconds depending on context
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  target: string; 
  description?: string;
  trackingMode?: TrackingMode;
  sets: SetData[]; 
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[]; 
  lastUsed?: string;
}

export interface WorkoutLog {
  id: string;
  name: string;
  date: string; // ISO String
  startTime: string;
  endTime?: string;
  exercises: Exercise[];
  templateId?: string; 
}

export interface UserProfile {
  id: string; // Added ID to profile
  name: string;
  email: string;
  unitSystem: 'imperial' | 'metric'; 
}

export interface UserSummary {
    id: string;
    name: string;
    lastActive: string;
}

export type ViewState = 'AUTH' | 'DASHBOARD' | 'TEMPLATES' | 'PROGRESS' | 'HISTORY' | 'ACTIVE_WORKOUT';

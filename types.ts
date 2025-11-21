
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
  time?: number; // in minutes or seconds depending on context, usually minutes for cardio, seconds for planks
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  target: string; // Muscle group or goal
  description?: string;
  trackingMode?: TrackingMode;
  sets: SetData[]; // Used when in a workout context
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[]; // Template exercises (sets usually empty or just target counts)
  lastUsed?: string;
}

export interface WorkoutLog {
  id: string;
  name: string;
  date: string; // ISO String
  startTime: string;
  endTime?: string;
  exercises: Exercise[];
  templateId?: string; // If created from a template
}

export interface UserProfile {
  name: string;
  email: string;
  unitSystem: 'imperial' | 'metric'; // lb/miles vs kg/meters
}

export type ViewState = 'DASHBOARD' | 'TEMPLATES' | 'PROGRESS' | 'HISTORY' | 'ACTIVE_WORKOUT';

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Exercise, ExerciseType, TrackingMode } from "../types";

const apiKey = process.env.VITE_API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

// Helper to get today's model
const MODEL_FAST = 'gemini-2.5-flash';

const exerciseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['Weight Training', 'Cardio', 'Bodyweight'] },
    target: { type: Type.STRING },
    description: { type: Type.STRING },
    suggestedSets: { type: Type.INTEGER },
    suggestedReps: { type: Type.INTEGER },
  },
  required: ['name', 'type', 'target']
};

const workoutSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    workoutName: { type: Type.STRING },
    rationale: { type: Type.STRING },
    exercises: {
      type: Type.ARRAY,
      items: exerciseSchema
    }
  },
  required: ['workoutName', 'exercises']
};

const exerciseDetailSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ['Weight Training', 'Cardio', 'Bodyweight'] },
    target: { type: Type.STRING },
    description: { type: Type.STRING },
    trackingMode: { type: Type.STRING, enum: ['weight_reps', 'reps_only', 'time_distance', 'time_only'] }
  },
  required: ['type', 'target', 'trackingMode']
};

export const generateWorkoutRecommendation = async (goals: string, limitations: string, duration: string): Promise<any> => {
  try {
    const prompt = `Generate a gym workout based on the following parameters:
    User Goals: ${goals}
    Limitations/Injuries: ${limitations}
    Desired Duration: ${duration}
    
    Provide a list of exercises. For each exercise, specify if it is Weight Training, Cardio, or Bodyweight.`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: workoutSchema,
        systemInstruction: "You are an expert fitness coach. Create safe, effective, and balanced workouts."
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    throw error;
  }
};

export const analyzeWorkoutTemplate = async (exercises: Exercise[], goals: string): Promise<string> => {
  try {
    const exerciseList = exercises.map(e => `${e.name} (${e.type}) - Target: ${e.target}`).join('\n');
    const prompt = `Analyze this workout routine:
    ${exerciseList}
    
    User Goals: ${goals}
    
    Provide specific recommendations to improve this workout. Suggest adding missing movements, removing redundant ones, or modifying volume/intensity. Keep it concise.`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction: "You are a critical biomechanics and hypertrophy expert."
      }
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Unable to analyze workout at this time.";
  }
};

export const getExerciseDetails = async (name: string): Promise<{ type: ExerciseType, target: string, description: string, trackingMode: TrackingMode } | null> => {
  try {
    const prompt = `Provide technical details for the exercise: "${name}".
    Classify the type carefully.
    - Weight Training: uses external weights (barbell, dumbbell, machine, kettlebell).
    - Cardio: steady state or intervals (running, rowing, cycling).
    - Bodyweight: calisthenics (pushups, pullups).
    `;

    const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: exerciseDetailSchema,
            systemInstruction: "You are a fitness database. accurately classify exercises."
        }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      type: data.type as ExerciseType,
      target: data.target,
      description: data.description,
      trackingMode: data.trackingMode as TrackingMode
    };
  } catch (error) {
      console.error("AI Detail Error:", error);
      return null;
  }
};
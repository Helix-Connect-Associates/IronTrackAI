import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Exercise, ExerciseType, TrackingMode, ExerciseDefinition } from "../types";

// Helper to safely get the API Key from various sources
const getApiKey = (): string | null => {
   // 1. Try Vite Environment (For Local Dev with .env.local and Netlify with VITE_API_KEY)
  try {
    // @ts-ignore - Check if running in Vite context
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore errors if import.meta is not available
  }

  // 2. Try Local Storage (Manual Override)
  if (typeof window !== 'undefined') {
     return localStorage.getItem('IRONTRACK_API_KEY');
  }

  return null;
};

// Initialize AI Client on demand to ensure we catch the key if it loads late
const getAiClient = () => {
  const key = getApiKey();
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

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

const recommendationSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['Weight Training', 'Cardio', 'Bodyweight'] },
                    target: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['name', 'type', 'target', 'rationale']
            }
        }
    }
};

export const generateWorkoutRecommendation = async (goals: string, limitations: string, duration: string): Promise<any> => {
  const ai = getAiClient();
  if (!ai) {
      alert("API Key is missing. Check .env.local or Netlify settings.");
      throw new Error("API Key not configured");
  }

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

export const analyzeWorkoutTemplate = async (exercises: Exercise[], focusAreas: string[], limitations: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key is missing.";

  try {
    const exerciseList = exercises.map(e => `${e.name} (${e.type}) - Target: ${e.target}`).join('\n');
    const prompt = `Analyze this workout routine:
    ${exerciseList}
    
    Target Focus Areas: ${focusAreas.join(', ')}
    User Limitations/Injuries: ${limitations || 'None'}
    
    Provide specific recommendations to improve this workout based on the focus areas. 
    Check if the exercises match the focus.
    Suggest adding missing movements, removing redundant ones, or modifying volume/intensity. 
    Ensure the limitations are respected.
    Keep it concise.`;

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
  const ai = getAiClient();
  if (!ai) return null;

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

export const recommendNextExercise = async (currentExercises: Exercise[], goal: string, limitations?: string): Promise<ExerciseDefinition[]> => {
    const ai = getAiClient();
    if (!ai) return [];

    try {
        const history = currentExercises.map(e => `${e.name} (${e.type})`).join(', ');
        const prompt = `I am currently working out.
        Exercises completed so far: ${history || "None yet"}.
        Current Goal for this session: ${goal}.
        Context/Limitations: ${limitations || "None"}.
        
        Recommend 3 specific exercises to perform next. Consider biomechanical balance and the stated goal.
        Include a short rationale for each.`;

        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
                systemInstruction: "You are an adaptive personal trainer."
            }
        });

        const data = JSON.parse(response.text || "{}");
        return (data.recommendations || []).map((r: any) => ({
            name: r.name,
            type: r.type as ExerciseType,
            target: r.target,
            description: r.rationale // Mapping rationale to description for display
        }));

    } catch (error) {
        console.error("AI Next Rec Error", error);
        return [];
    }
};
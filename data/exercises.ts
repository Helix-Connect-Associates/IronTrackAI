
import { ExerciseType, ExerciseDefinition } from '../types';

export const DEFAULT_EXERCISES: ExerciseDefinition[] = [
  {
    name: "Bench Press (Barbell)",
    type: ExerciseType.Weight,
    target: "Chest, Anterior Deltoids, Triceps",
    description: "Keep feet flat, maintain a slight arch in the lower back. Control the descent."
  },
  {
    name: "Squat (Barbell)",
    type: ExerciseType.Weight,
    target: "Quadriceps, Hamstrings, Glutes, Core",
    description: "Keep chest up, maintain a neutral spine. Push knees out over the toes."
  },
  {
    name: "Deadlift (Barbell)",
    type: ExerciseType.Weight,
    target: "Hamstrings, Glutes, Back, Traps",
    description: "Keep the back flat (neutral spine). Lift by driving the hips forward."
  },
  {
    name: "Overhead Press (Dumbbell)",
    type: ExerciseType.Weight,
    target: "Shoulders (Deltoids), Triceps",
    description: "Keep core tight to prevent excessive back arch. Press straight overhead."
  },
  {
    name: "Kettlebell Swing",
    type: ExerciseType.Weight,
    target: "Hamstrings, Glutes, Core, Back",
    description: "The movement is a hip hinge, not a squat. Drive explosively with the hips."
  },
  {
    name: "Goblet Squat",
    type: ExerciseType.Weight,
    target: "Quadriceps, Glutes, Core",
    description: "Hold weight vertically against your chest. Keep chest tall and back straight."
  },
  {
    name: "Treadmill Running",
    type: ExerciseType.Cardio,
    target: "Cardiovascular System, Legs",
    description: "Maintain a consistent, natural stride. Look straight ahead.",
    trackingMode: 'time_distance'
  },
  {
    name: "Elliptical Trainer",
    type: ExerciseType.Cardio,
    target: "Cardiovascular System, Legs, Glutes",
    description: "Use the handles to engage the upper body. Avoid leaning heavily.",
    trackingMode: 'time_distance'
  },
  {
    name: "Rowing Machine",
    type: ExerciseType.Cardio,
    target: "Cardiovascular System, Legs, Back, Arms",
    description: "Sequence: Legs -> Hips -> Arms. Smooth, powerful rhythm.",
    trackingMode: 'time_distance'
  },
  {
    name: "Push-Up",
    type: ExerciseType.Bodyweight,
    target: "Chest, Shoulders, Triceps, Core",
    description: "Maintain a straight line from head to heels. Keep elbows tucked (about 45 degrees).",
    trackingMode: 'reps_only'
  },
  {
    name: "Pull-Up/Chin-Up",
    type: ExerciseType.Bodyweight,
    target: "Back (Lats), Biceps",
    description: "Initiate the pull by depressing the shoulder blades. Avoid swinging.",
    trackingMode: 'reps_only'
  },
  {
    name: "Leg Press Machine",
    type: ExerciseType.Weight,
    target: "Quadriceps, Hamstrings, Glutes",
    description: "NEVER lock out your knees. Do not let your lower back curl off the pad."
  },
  {
    name: "Lat Pulldown",
    type: ExerciseType.Weight,
    target: "Back (Lats), Biceps",
    description: "Pull the bar to your upper chest. Focus on pulling with your elbows."
  },
  {
    name: "Dumbbell Bicep Curl",
    type: ExerciseType.Weight,
    target: "Biceps",
    description: "Keep your elbows pinned at your sides. Avoid swinging. Lower slowly."
  },
  {
    name: "Arm Curl Machine",
    type: ExerciseType.Weight,
    target: "Biceps",
    description: "Ensure the elbow joint aligns with the machine's pivot point."
  },
  {
    name: "Hip Adduction Machine",
    type: ExerciseType.Weight,
    target: "Inner Thighs (Adductors)",
    description: "Control the movement. Avoid letting the weight stack drop."
  },
  {
    name: "Hip Abduction Machine",
    type: ExerciseType.Weight,
    target: "Outer Thighs (Abductors), Glutes",
    description: "Focus on pushing the legs out using the hip/glute muscles."
  },
  {
    name: "Ab Crunch Machine",
    type: ExerciseType.Weight,
    target: "Core (Rectus Abdominis)",
    description: "Contract the abs to bring the chest toward the hips; avoid pulling with the neck."
  },
  {
    name: "Treadmill Walking",
    type: ExerciseType.Cardio,
    target: "Cardiovascular System, Legs",
    description: "Hold the rails only for balance; do not lean on them.",
    trackingMode: 'time_distance'
  },
  {
    name: "Chest Press Machine",
    type: ExerciseType.Weight,
    target: "Chest, Anterior Deltoids, Triceps",
    description: "Adjust the seat so the handles are in line with your mid-chest."
  },
  {
    name: "Planks",
    type: ExerciseType.Bodyweight,
    target: "Core (Abs, Obliques, Lower Back)",
    description: "Keep your body in a straight line; brace your core tightly.",
    trackingMode: 'time_only'
  },
  {
    name: "Back Extension",
    type: ExerciseType.Weight,
    target: "Back (Erector Spinae), Glutes, Hamstrings",
    description: "Do not arch excessively high. Perform the movement slowly."
  },
  {
    name: "Leg Extension Machine",
    type: ExerciseType.Weight,
    target: "Quadriceps",
    description: "Ensure knees align with the machine's pivot point. Hold the contraction at the top."
  },
  {
    name: "Converging Shoulder Press Machine",
    type: ExerciseType.Weight,
    target: "Shoulders (Deltoids), Triceps",
    description: "Keep your wrists straight. Control the descent."
  },
  {
    name: "Kettlebell Turkish Get-Up",
    type: ExerciseType.Weight,
    target: "Full Body, Core Stability, Shoulders",
    description: "Perform the movement slowly and deliberately. Keep eyes on the bell."
  },
  {
    name: "Dumbbell Row (Single-Arm)",
    type: ExerciseType.Weight,
    target: "Back (Lats), Biceps",
    description: "Keep your back flat. Pull the dumbbell to your hip/waist area."
  },
  {
    name: "Stationary Bike",
    type: ExerciseType.Cardio,
    target: "Cardiovascular System, Legs",
    description: "Adjust the seat height for a slight knee bend. Maintain a smooth motion.",
    trackingMode: 'time_distance'
  },
  {
    name: "Kettlebell Snatch",
    type: ExerciseType.Weight,
    target: "Full Body, Shoulders, Traps, Core",
    description: "This is an explosive move. Drive with the hips."
  },
  {
    name: "Kettlebell Clean & Press",
    type: ExerciseType.Weight,
    target: "Shoulders, Chest, Legs, Back",
    description: "Clean the bell to the rack position, then press."
  },
  {
    name: "Kettlebell Windmill",
    type: ExerciseType.Weight,
    target: "Core (Obliques), Shoulders, Hamstrings",
    description: "Keep the bell locked out overhead and keep your eyes on the bell."
  },
  {
    name: "Kettlebell Halo",
    type: ExerciseType.Weight,
    target: "Shoulders, Traps, Core",
    description: "Use a light weight. Move the bell slowly and close around the head."
  },
  {
    name: "Kettlebell Farmers Carry",
    type: ExerciseType.Weight,
    target: "Forearms (Grip), Core Stability, Traps",
    description: "Use heavy weight and brace the core to resist leaning."
  },
  {
    name: "Band Pull-Apart",
    type: ExerciseType.Weight,
    target: "Upper Back (Rhomboids), Rear Deltoids",
    description: "Keep arms straight and pull the band apart, squeezing your shoulder blades.",
    trackingMode: 'reps_only'
  },
  {
    name: "Banded Glute Bridge",
    type: ExerciseType.Weight,
    target: "Glutes, Hamstrings",
    description: "Place band above the knees. Drive hips up, pushing knees out against the band.",
    trackingMode: 'reps_only'
  },
  {
    name: "Banded Lateral Walk",
    type: ExerciseType.Weight,
    target: "Glutes (Medius), Hips",
    description: "Maintain a slight squat stance and step sideways, maintaining tension.",
    trackingMode: 'reps_only'
  },
  {
    name: "Cable Triceps Pushdown",
    type: ExerciseType.Weight,
    target: "Triceps",
    description: "Keep elbows pinned to your sides. Press down using only your triceps."
  },
  {
    name: "Cable Bicep Curl",
    type: ExerciseType.Weight,
    target: "Biceps",
    description: "Stand tall and keep elbows stationary. Control the weight on the way down."
  },
  {
    name: "Cable Woodchopper",
    type: ExerciseType.Weight,
    target: "Core (Obliques), Shoulders",
    description: "Rotate your torso and pull the handle diagonally across your body. Pivot the back foot."
  },
  {
    name: "Cable Face Pull",
    type: ExerciseType.Weight,
    target: "Upper Back, Rear Deltoids, Rotator Cuff",
    description: "Pull the rope toward your face, externally rotating your shoulders."
  },
  {
    name: "Medicine Ball Slam",
    type: ExerciseType.Weight,
    target: "Full Body, Core, Shoulders, Back",
    description: "Lift the ball overhead, then forcefully slam it down by hinging at the hips.",
    trackingMode: 'reps_only'
  },
  {
    name: "Medicine Ball Russian Twist",
    type: ExerciseType.Weight,
    target: "Core (Obliques)",
    description: "Rotate your torso, tapping the ball to the floor on each side. Maintain a stable back.",
    trackingMode: 'reps_only'
  },
  {
    name: "Medicine Ball Wall Toss",
    type: ExerciseType.Weight,
    target: "Chest, Shoulders, Triceps (Power)",
    description: "Stand facing a wall. Explosively push the ball and catch the rebound.",
    trackingMode: 'reps_only'
  }
];

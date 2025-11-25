
import { ExerciseType, ExerciseDefinition } from '../types';

export const DEFAULT_EXERCISES: ExerciseDefinition[] = [
  {
    name: "Bench Press (Barbell)",
    type: ExerciseType.Weight,
    target: "Chest, Shoulders (Posterior Deltoid), Arms (Triceps)",
    description: "Keep feet flat, maintain a slight arch in the lower back. Control the descent."
  },
  {
    name: "Squat (Barbell)",
    type: ExerciseType.Weight,
    target: "Legs (Quadriceps), Legs (Hamstrings), Legs (Glutes), Core",
    description: "Keep chest up, maintain a neutral spine. Push knees out over the toes."
  },
  {
    name: "Deadlift (Barbell)",
    type: ExerciseType.Weight,
    target: "Legs (Hamstrings), Back, Back (Traps)",
    description: "Keep the back flat (neutral spine). Lift by driving the hips forward."
  },
  {
    name: "Overhead Press (Dumbbell)",
    type: ExerciseType.Weight,
    target: "Shoulders (Deltoids), Arms (Triceps)",
    description: "Keep core tight to prevent excessive back arch. Press straight overhead."
  },
  {
    name: "Kettlebell Swing",
    type: ExerciseType.Weight,
    target: "Legs (Hamstrings), Legs (Glutes), Core, Back",
    description: "The movement is a hip hinge, not a squat. Drive explosively with the hips."
  },
  {
    name: "Goblet Squat",
    type: ExerciseType.Weight,
    target: "Legs (Quadriceps), Legs (Glutes), Core",
    description: "Hold weight vertically against your chest. Keep chest tall and back straight."
  },
  {
    name: "Treadmill Running",
    type: ExerciseType.Cardio,
    target: "Cardiovascular System, Legs",
    description: "Maintain a consistent, natural stride. Look straight ahead."
  },
  {
    name: "Elliptical Trainer",
    type: ExerciseType.Cardio,
    target: "Cardiovascular System, Legs, Legs (Glutes)",
    description: "Use the handles to engage the upper body. Avoid leaning heavily."
  },
  {
    name: "Rowing Machine",
    type: ExerciseType.Cardio,
    target: "Cardiovascular System, Legs, Back, Arms",
    description: "Sequence: Legs -> Hips -> Arms. Smooth, powerful rhythm."
  },
  {
    name: "Push-Up",
    type: ExerciseType.Bodyweight,
    target: "Chest, Shoulders, Arms (Triceps), Core",
    description: "Maintain a straight line from head to heels. Keep elbows tucked (about 45 degrees)."
  },
  {
    name: "Pull-Up/Chin-Up",
    type: ExerciseType.Bodyweight,
    target: "Back (Lats), Arms (Biceps)",
    description: "Initiate the pull by depressing the shoulder blades. Avoid swinging."
  },
  {
    name: "Leg Press Machine",
    type: ExerciseType.Weight,
    target: "Legs (Quadriceps), Legs (Hamstrings), Legs (Glutes), Core",
    description: "NEVER lock out your knees. Do not let your lower back curl off the pad."
  },
  {
    name: "Lat Pulldown",
    type: ExerciseType.Weight,
    target: "Back (Lats), Arms (Biceps)",
    description: "Pull the bar to your upper chest. Focus on pulling with your elbows."
  },
  {
    name: "Dumbbell Bicep Curl",
    type: ExerciseType.Weight,
    target: "Arms (Biceps)",
    description: "Keep your elbows pinned at your sides. Avoid swinging. Lower slowly."
  },
  {
    name: "Arm Curl Machine",
    type: ExerciseType.Weight,
    target: "Arms (Biceps)",
    description: "Ensure the elbow joint aligns with the machine's pivot point."
  },
  {
    name: "Hip Adduction Machine",
    type: ExerciseType.Weight,
    target: "Inner Thighs (Adductors)",
    description: "Control the movement. Avoid letting the weight stack \"drop.\""
  },
  {
    name: "Hip Abduction Machine",
    type: ExerciseType.Weight,
    target: "Outer Thighs (Abductors), Legs (Glutes)",
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
    description: "Hold the rails only for balance; do not lean on them."
  },
  {
    name: "Chest Press Machine",
    type: ExerciseType.Weight,
    target: "Chest, Anterior Deltoids, Arms (Triceps)",
    description: "Adjust the seat so the handles are in line with your mid-chest."
  },
  {
    name: "Planks",
    type: ExerciseType.Bodyweight,
    target: "Core (Abs, Obliques, Lower Back)",
    description: "Keep your body in a straight line; brace your core tightly."
  },
  {
    name: "Back Extension",
    type: ExerciseType.Weight,
    target: "Back (Erector Spinae), Legs (Glutes), Legs (Hamstrings)",
    description: "Do not arch excessively high. Perform the movement slowly."
  },
  {
    name: "Leg Extension Machine",
    type: ExerciseType.Weight,
    target: "Legs (Quadriceps)",
    description: "Ensure knees align with the machine's pivot point. Hold the contraction at the top."
  },
  {
    name: "Converging Shoulder Press Machine",
    type: ExerciseType.Weight,
    target: "Shoulders (Deltoids), Arms (Triceps)",
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
    target: "Back (Lats), Arms (Biceps)",
    description: "Keep your back flat. Pull the dumbbell to your hip/waist area."
  },
  {
    name: "Stationary Bike",
    type: ExerciseType.Cardio,
    target: "Cardiovascular System, Legs",
    description: "Adjust the seat height for a slight knee bend. Maintain a smooth motion."
  },
  {
    name: "Kettlebell Snatch",
    type: ExerciseType.Weight,
    target: "Full Body, Shoulders, Back (Traps), Core",
    description: "This is an explosive move. Drive with the hips."
  },
  {
    name: "Kettlebell Clean & Press",
    type: ExerciseType.Weight,
    target: "Shoulders, Chest, Legs, Back",
    description: "Clean the bell to the \"rack\" position, then press."
  },
  {
    name: "Kettlebell Windmill",
    type: ExerciseType.Weight,
    target: "Core (Obliques), Shoulders, Legs (Hamstrings)",
    description: "Keep the bell locked out overhead and keep your eyes on the bell."
  },
  {
    name: "Kettlebell Halo",
    type: ExerciseType.Weight,
    target: "Shoulders, Back (Traps), Core",
    description: "Use a light weight. Move the bell slowly and close around the head."
  },
  {
    name: "Kettlebell Farmers Carry",
    type: ExerciseType.Weight,
    target: "Forearms (Grip), Core Stability, Back (Traps)",
    description: "Use heavy weight and brace the core to resist leaning."
  },
  {
    name: "Band Pull-Apart",
    type: ExerciseType.Weight,
    target: "Upper Back (Rhomboids), Rear Deltoids",
    description: "Keep arms straight and pull the band apart, squeezing your shoulder blades."
  },
  {
    name: "Banded Glute Bridge",
    type: ExerciseType.Weight,
    target: "Legs (Glutes), Legs (Hamstrings)",
    description: "Place band above the knees. Drive hips up, pushing knees out against the band."
  },
  {
    name: "Banded Lateral Walk",
    type: ExerciseType.Weight,
    target: "Legs (Glutes), Hips",
    description: "Maintain a slight squat stance and step sideways, maintaining tension."
  },
  {
    name: "Cable Triceps Pushdown",
    type: ExerciseType.Weight,
    target: "Arms (Triceps)",
    description: "Keep elbows pinned to your sides. Press down using only your triceps."
  },
  {
    name: "Cable Bicep Curl",
    type: ExerciseType.Weight,
    target: "Arms (Biceps)",
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
    target: "Back (Upper), Shoulders (Posterior Deltoid), Shoulders (Lateral Deltoid)",
    description: "Pull the rope toward your face, externally rotating your shoulders."
  },
  {
    name: "Medicine Ball Slam",
    type: ExerciseType.Weight,
    target: "Full Body, Core, Shoulders, Back",
    description: "Lift the ball overhead, then forcefully slam it down by hinging at the hips."
  },
  {
    name: "Medicine Ball Russian Twist",
    type: ExerciseType.Weight,
    target: "Core (Obliques)",
    description: "Rotate your torso, tapping the ball to the floor on each side. Maintain a stable back."
  },
  {
    name: "Medicine Ball Wall Toss",
    type: ExerciseType.Weight,
    target: "Chest, Shoulders, Arms (Triceps), Core",
    description: "Stand facing a wall. Explosively push the ball and catch the rebound."
  }
];

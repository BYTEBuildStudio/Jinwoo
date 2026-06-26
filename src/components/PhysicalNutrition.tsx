import React, { useState } from "react";
import { motion } from "motion/react";
import { Dumbbell, GlassWater, Trophy, Plus, CheckCircle, Apple, Zap, Scale } from "lucide-react";

interface PhysicalNutritionProps {
  onGainXP: (amount: number, message: string) => void;
}

export default function PhysicalNutrition({ onGainXP }: PhysicalNutritionProps) {
  // Water Tracker
  const [glasses, setGlasses] = useState(4);
  const maxGlasses = 8;

  // Meal planning state
  const [meals, setMeals] = useState([
    { id: "m1", time: "Morning Core", title: "Oats with protein shake & dry fruits", carbs: 55, protein: 42, fats: 12, completed: true },
    { id: "m2", time: "Post Exercise", title: "Grilled chicken breast, brown rice & steamed broccoli", carbs: 70, protein: 50, fats: 8, completed: false },
    { id: "m3", time: "Evening Refuel", title: "Boiled egg white toast or Paneer tikka", carbs: 35, protein: 30, fats: 14, completed: false }
  ]);

  // Workout Planner State
  const [workoutLogs, setWorkoutLogs] = useState([
    { id: "w1", exercise: "Deadlifts", sets: "4 Sets x 8 Reps", weight: "120 kg", completed: true },
    { id: "w2", exercise: "Overhead Bench Press", sets: "3 Sets x 10 Reps", weight: "60 kg", completed: false },
    { id: "w3", exercise: "Weighted Pull-ups", sets: "4 Sets x 8 Reps", weight: "+15 kg", completed: false }
  ]);

  const [newExercise, setNewExercise] = useState("");
  const [newSets, setNewSets] = useState("3 Sets x 10 Reps");
  const [newWeight, setNewWeight] = useState("Bodyweight");

  const handleDrinkWater = () => {
    if (glasses < maxGlasses) {
      const next = glasses + 1;
      setGlasses(next);
      onGainXP(10, "Hydrated core cell! Physical stamina restored! +10 XP");
    }
  };

  const handleToggleMeal = (id: string, completed: boolean) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, completed: !completed } : m));
    if (!completed) {
      onGainXP(25, "Synced macro-nutritional cells. Growth progress +25 XP");
    }
  };

  const handleToggleWorkout = (id: string, completed: boolean) => {
    setWorkoutLogs(prev => prev.map(w => w.id === id ? { ...w, completed: !completed } : w));
    if (!completed) {
      onGainXP(30, "System muscle fiber synthesis logs recorded! Physical +30 XP");
    }
  };

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExercise.trim()) return;
    setWorkoutLogs([...workoutLogs, {
      id: `w-${Date.now()}`,
      exercise: newExercise,
      sets: newSets,
      weight: newWeight,
      completed: false
    }]);
    setNewExercise("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* COLUMN 1: FITNESS TRACKER & WORKOUT PLANNERS (7 cols) */}
      <div className="xl:col-span-7 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-blue-400 uppercase">Fitness Core Module</h3>
            <p className="text-xs text-slate-400">Schedule training structures, log sets, and capture biometric gains.</p>
          </div>
          <Dumbbell className="w-5 h-5 text-blue-400" />
        </div>

        {/* Exercises list */}
        <div className="space-y-2.5">
          {workoutLogs.map((item) => (
            <div 
              key={item.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                item.completed 
                  ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-400/80" 
                  : "bg-slate-950/40 border-slate-900 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleWorkout(item.id, item.completed)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    item.completed ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-slate-700 hover:border-blue-500"
                  }`}
                >
                  {item.completed && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
                <div>
                  <h4 className={`text-xs font-bold ${item.completed ? 'line-through opacity-60' : ''}`}>{item.exercise}</h4>
                  <span className="text-[10px] font-mono text-slate-500">{item.sets} • {item.weight}</span>
                </div>
              </div>
              <span className={`text-[10px] font-mono ${item.completed ? 'text-emerald-400' : 'text-blue-400'}`}>
                +30 XP
              </span>
            </div>
          ))}
        </div>

        {/* Add Exercise Quick Form */}
        <form onSubmit={handleAddWorkout} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-900/60 space-y-3">
          <h4 className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Log Custom Reps</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input 
              type="text" 
              placeholder="Exercise (e.g. Squat)" 
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
            <input 
              type="text" 
              placeholder="Sets (3 Sets x 10 Reps)" 
              value={newSets}
              onChange={(e) => setNewSets(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
            <input 
              type="text" 
              placeholder="Weight (Bodyweight or 80kg)" 
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-950/80 hover:bg-blue-900 border border-blue-500/20 text-blue-400 text-xs py-2 rounded-xl font-mono uppercase font-bold tracking-wider transition-all"
          >
            Inject Exercise Structure
          </button>
        </form>
      </div>

      {/* COLUMN 2: WATER TRACKER & NUTRITION MACROS (5 cols) */}
      <div className="xl:col-span-5 space-y-6">
        
        {/* WATER TRACKER CARDS */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold font-mono tracking-wider text-cyan-400 uppercase">Hydration Core</h3>
              <p className="text-[10px] text-slate-400">Required level: {glasses}/{maxGlasses} units</p>
            </div>
            <GlassWater className="w-5 h-5 text-cyan-400 animate-bounce" />
          </div>

          {/* Interactive animated water cups */}
          <div className="flex justify-between gap-1.5 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-900">
            {Array.from({ length: maxGlasses }).map((_, i) => (
              <button
                key={i}
                disabled={i < glasses}
                onClick={handleDrinkWater}
                className={`flex-1 h-9 rounded-lg border transition-all flex items-center justify-center relative overflow-hidden ${
                  i < glasses 
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)] cursor-default" 
                    : "border-slate-800 bg-slate-900 hover:border-cyan-800"
                }`}
              >
                {i < glasses ? (
                  <motion.div 
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="absolute inset-0 bg-cyan-400/20"
                  />
                ) : null}
                <span className="text-[9px] font-mono font-bold">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* NUTRITION & MEALS */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-mono tracking-wider text-emerald-400 uppercase">Macro Nutrition</h3>
            <Apple className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="space-y-2.5">
            {meals.map((meal) => (
              <div 
                key={meal.id}
                className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${
                  meal.completed 
                    ? "bg-emerald-950/10 border-emerald-900/20 text-emerald-400/80" 
                    : "bg-slate-950/40 border-slate-900 text-slate-300"
                }`}
              >
                <button
                  onClick={() => handleToggleMeal(meal.id, meal.completed)}
                  className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                    meal.completed ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-slate-700 hover:border-emerald-500"
                  }`}
                >
                  {meal.completed && <CheckCircle className="w-3 h-3" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-emerald-400 uppercase font-bold">{meal.time}</span>
                    <span className="text-[9px] font-mono text-slate-500">P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g</span>
                  </div>
                  <h4 className="text-xs font-bold leading-tight mt-0.5 truncate">{meal.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

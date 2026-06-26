import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Calendar, BookOpen, Award, CheckCircle, Flame, Shield, HelpCircle, Trophy } from "lucide-react";

interface Quest {
  id: string;
  category: "daily" | "weekly" | "story" | "legendary" | "hidden";
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
  status: "available" | "active" | "completed";
}

interface QuestCenterProps {
  onGainXP: (amount: number, message: string) => void;
  skills: any;
}

export default function QuestCenter({ onGainXP, skills }: QuestCenterProps) {
  // Mock dynamic Quests
  const [quests, setQuests] = useState<Quest[]>([
    { id: "q1", category: "daily", title: "Daily Run & Core", description: "Log 30 minutes of cardiovascular exertion", target: 1, current: 0, xpReward: 50, completed: false, status: "active" },
    { id: "q2", category: "daily", title: "Code Crafting", description: "Write clean software, resolve issues or study algorithms for 1 hour", target: 1, current: 0, xpReward: 60, completed: false, status: "active" },
    { id: "q3", category: "weekly", title: "Intellectual Overlord", description: "Finish 5 intensive study pomodoro sessions", target: 5, current: 2, xpReward: 150, completed: false, status: "active" },
    { id: "q4", category: "story", title: "The Sovereign Road", description: "Achieve Level 30 inside Jinwoo System OS", target: 30, current: skills?.Programming?.level || 27, xpReward: 400, completed: false, status: "available" },
    { id: "q5", category: "legendary", title: "Full-Stack Dominion", description: "Connect real-world Firebase with robust local fallbacks", target: 1, current: 1, xpReward: 500, completed: false, status: "available" },
    { id: "q6", category: "hidden", title: "Monarch Gaze", description: "Secretly trigger full audio synths on system modules", target: 1, current: 0, xpReward: 250, completed: false, status: "available" }
  ]);

  const [activeFilter, setActiveFilter] = useState<"all" | "daily" | "weekly" | "story" | "special">("all");
  
  // Grid tracking matrix for habits (15 columns x 7 rows simulating a dynamic habit grid heatmap)
  const [habitGrid, setHabitGrid] = useState<boolean[][]>(
    Array.from({ length: 7 }, () => Array.from({ length: 15 }, () => Math.random() > 0.4))
  );

  const toggleHabitCell = (rIdx: number, cIdx: number) => {
    const updated = [...habitGrid];
    updated[rIdx][cIdx] = !updated[rIdx][cIdx];
    setHabitGrid(updated);
    if (updated[rIdx][cIdx]) {
      onGainXP(15, "Completed matrix coordinate! Discipline +15 XP");
    }
  };

  const handleClaimQuest = (id: string, reward: number, title: string) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true, status: "completed" } : q));
    onGainXP(reward, `Quest Cleared: ${title}! +${reward} XP`);
  };

  const handleAcceptQuest = (id: string) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: "active" } : q));
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "daily": return "bg-blue-950/40 text-blue-400 border-blue-500/20";
      case "weekly": return "bg-indigo-950/40 text-indigo-400 border-indigo-500/20";
      case "story": return "bg-amber-950/40 text-amber-400 border-amber-500/20";
      case "legendary": return "bg-purple-950/40 text-purple-400 border-purple-500/20";
      default: return "bg-slate-950/40 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: ACTIVE QUESTS INTERACTIVE BOARD (8 cols) */}
      <div className="xl:col-span-8 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold font-sans text-white uppercase tracking-wider">Quest Registry</h3>
            <p className="text-xs text-slate-400">Accept and sync daily missions with instant system calculations.</p>
          </div>
          <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
        </div>

        {/* Categories Tab selector */}
        <div className="flex gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-900 overflow-x-auto">
          {(["all", "daily", "weekly", "story"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 py-1.5 px-4 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider transition-all ${
                activeFilter === filter 
                  ? "bg-blue-950 text-blue-400 border border-blue-500/20 shadow-md" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Quest List */}
        <div className="space-y-3.5">
          {quests
            .filter(q => activeFilter === "all" || q.category === activeFilter)
            .map((quest) => (
              <div 
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                  quest.status === "completed" 
                    ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-400/80" 
                    : "bg-slate-950/40 border-slate-900/60 text-slate-300 hover:border-slate-800"
                }`}
              >
                {/* Visual energy band */}
                <div className={`absolute top-0 left-0 w-[3px] h-full ${
                  quest.status === "completed" ? "bg-emerald-500" : "bg-blue-500"
                }`} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded-md uppercase border ${getCategoryBadge(quest.category)}`}>
                        {quest.category}
                      </span>
                      <h4 className="text-xs font-bold text-white font-sans">{quest.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">{quest.description}</p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-blue-400 block font-bold">+{quest.xpReward} XP</span>
                      <span className="text-[9px] font-mono text-slate-500 block">System Synced</span>
                    </div>

                    {quest.status === "available" && (
                      <button
                        onClick={() => handleAcceptQuest(quest.id)}
                        className="bg-blue-950 hover:bg-blue-900 border border-blue-500/20 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 px-4 py-2 rounded-xl transition-all"
                      >
                        Accept
                      </button>
                    )}

                    {quest.status === "active" && (
                      <button
                        onClick={() => handleClaimQuest(quest.id, quest.xpReward, quest.title)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all"
                      >
                        Complete
                      </button>
                    )}

                    {quest.status === "completed" && (
                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono uppercase font-bold">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>CLEARED</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* RIGHT COLUMN: DISCIPLINE STREAK HEATMAP & STATS (4 cols) */}
      <div className="xl:col-span-4 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-500">
            <Flame className="w-5 h-5 animate-pulse" />
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-amber-400">Streak Heatmap</h3>
          </div>
          <p className="text-[11px] text-slate-400">Click cells in the 15x7 coordinate matrix to record extra habits.</p>
        </div>

        {/* 15x7 Grid visualizer */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-900/60 overflow-x-auto">
          <div className="grid grid-rows-7 grid-flow-col gap-1 min-w-[240px]">
            {habitGrid.map((row, rIdx) => 
              row.map((val, cIdx) => (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => toggleHabitCell(rIdx, cIdx)}
                  className={`w-3.5 h-3.5 rounded-[2px] transition-all duration-300 ${
                    val 
                      ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] hover:bg-blue-400" 
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                  title={`Coordinate Day ${cIdx + 1}, Weekday ${rIdx + 1}`}
                />
              ))
            )}
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-2.5 px-1">
            <span>LESS ACTIVE</span>
            <span>MORE ACTIVE</span>
          </div>
        </div>

        {/* Side mini metrics summary */}
        <div className="space-y-2.5 pt-4 border-t border-slate-900/60">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">ACTIVE DAYS:</span>
            <span className="text-white font-bold">12 / 105</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">MULTIPLIER CAP:</span>
            <span className="text-amber-500 font-bold">1.25x</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">HIDDEN CHESTS:</span>
            <span className="text-purple-400 font-bold">3 Unlocked</span>
          </div>
        </div>
      </div>

    </div>
  );
}

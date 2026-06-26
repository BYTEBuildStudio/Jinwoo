import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Play, Pause, RotateCcw, BookMarked, Code, Check, Sparkles, Award } from "lucide-react";

interface StudyCodingProps {
  onGainXP: (amount: number, message: string) => void;
}

export default function StudyCoding({ onGainXP }: StudyCodingProps) {
  // POMODORO TIMER STATE
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<any>(null);

  // Subjects lists
  const [subjects, setSubjects] = useState([
    { id: "s1", name: "Programming Logic", hours: 14, completedSessions: 3 },
    { id: "s2", name: "System Engineering", hours: 8, completedSessions: 2 },
    { id: "s3", name: "Quantitative Math", hours: 11, completedSessions: 1 }
  ]);
  const [activeSubject, setActiveSubject] = useState("s1");

  // Coding Challenges list
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizStatus, setQuizStatus] = useState<"unanswered" | "correct" | "incorrect">("unanswered");

  const codingChallenges = [
    {
      title: "Asynchronous Command Sync",
      question: "Which expression returns a resolved Promise after a 100ms lag in JavaScript?",
      options: [
        "Promise.resolve().delay(100)",
        "new Promise(res => setTimeout(res, 100))",
        "setTimeout(() => Promise.resolve(), 100)",
        "Async.sync({ timeout: 100 })"
      ],
      correctIndex: 1,
      xp: 80
    },
    {
      title: "Data Integrity & Firestore",
      question: "Which of the following creates a secure, resilient atomic transaction write batch in Firestore?",
      options: [
        "db.collection('users').batch()",
        "writeBatch(db)",
        "Firestore.atomicBatch(db)",
        "db.batchTransaction()"
      ],
      correctIndex: 1,
      xp: 90
    }
  ];

  // Pomodoro countdown effect
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // End of timer! Play sound synth & toggle break
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // Audio fallback
    }

    if (!isBreak) {
      setMinutes(5);
      setIsBreak(true);
      onGainXP(100, "Excellent focus! Completed 25m study slot! Knowledge +100 XP");
      
      // Increment completed sessions
      setSubjects(prev => prev.map(s => s.id === activeSubject ? { ...s, completedSessions: s.completedSessions + 1 } : s));
    } else {
      setMinutes(25);
      setIsBreak(false);
      onGainXP(15, "Break complete. Re-initiating focus registries.");
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    const currentChallenge = codingChallenges[challengeIndex];
    if (selectedOption === currentChallenge.correctIndex) {
      setQuizStatus("correct");
      onGainXP(currentChallenge.xp, `Algorithm validated successfully! +${currentChallenge.xp} XP`);
    } else {
      setQuizStatus("incorrect");
    }
  };

  const nextChallenge = () => {
    setChallengeIndex((challengeIndex + 1) % codingChallenges.length);
    setSelectedOption(null);
    setQuizStatus("unanswered");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* COLUMN 1: POMODORO TIMER CORE (6 cols) */}
      <div className="xl:col-span-6 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-indigo-400 uppercase">Pomodoro Study Core</h3>
            <p className="text-xs text-slate-400">Lock study sessions with dynamic cybernetic alarms.</p>
          </div>
          <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
        </div>

        {/* Timer countdown display */}
        <div className="py-8 flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl border border-slate-900 relative overflow-hidden">
          {isBreak && (
            <span className="absolute top-3 bg-indigo-950/40 border border-indigo-500/20 px-3 py-0.5 rounded-full text-[9px] font-mono text-indigo-300 font-bold uppercase tracking-wider">
              Break Slot Active
            </span>
          )}

          <div className="text-5xl md:text-6xl font-black font-mono text-white tracking-widest drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>

          <p className="text-[10px] font-mono text-slate-500 mt-3 uppercase tracking-wider">
            {isActive ? "CYBER_CLOCK_COUNTING" : "CYBER_CLOCK_STANDBY"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isActive 
                ? "bg-rose-950/40 text-rose-400 border border-rose-500/20" 
                : "bg-indigo-950/40 text-indigo-400 border border-indigo-500/20"
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? "Pause System" : "Engage Study Timer"}</span>
          </button>
          <button
            onClick={resetTimer}
            className="bg-slate-950/80 hover:bg-slate-900 border border-slate-900 p-3 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
            title="Reset Clock"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Subjects list selection */}
        <div className="space-y-2 pt-4 border-t border-slate-900/60">
          <h4 className="text-[10px] font-mono uppercase text-indigo-400/80 tracking-wider">Focus Target Stream</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubject(sub.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeSubject === sub.id 
                    ? "bg-indigo-950/20 border-indigo-500/40 text-indigo-300" 
                    : "bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800"
                }`}
              >
                <div className="text-[10px] font-bold truncate leading-tight">{sub.name}</div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">{sub.completedSessions} Slots Completed</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COLUMN 2: ALGORITHM CODING SANDBOX (6 cols) */}
      <div className="xl:col-span-6 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-emerald-400 uppercase">Coding Roadmap Challenges</h3>
            <p className="text-xs text-slate-400">Validate real-world concepts, master algorithms & level up programming stats.</p>
          </div>
          <Code className="w-5 h-5 text-emerald-400" />
        </div>

        {/* Current Interactive Challenge Question */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-900/60 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">
              CHALLENGE #{challengeIndex + 1}: {codingChallenges[challengeIndex].title}
            </span>
            <span className="text-[9px] font-mono text-slate-500">+{codingChallenges[challengeIndex].xp} XP</span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
            {codingChallenges[challengeIndex].question}
          </p>

          <div className="space-y-2">
            {codingChallenges[challengeIndex].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => quizStatus === "unanswered" && setSelectedOption(i)}
                className={`w-full p-2.5 text-left rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                  selectedOption === i 
                    ? "bg-emerald-950/30 border-emerald-500 text-emerald-300" 
                    : "bg-slate-900/50 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                <span>{opt}</span>
                {selectedOption === i && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Actions bar for interactive Quiz */}
        <div className="flex gap-3">
          {quizStatus === "unanswered" ? (
            <button
              onClick={handleCheckAnswer}
              disabled={selectedOption === null}
              className={`w-full py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                selectedOption !== null 
                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/20 cursor-pointer" 
                  : "bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed"
              }`}
            >
              Compile & Validate Script
            </button>
          ) : (
            <div className="w-full flex gap-3">
              <div className={`flex-1 py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 border ${
                quizStatus === "correct" 
                  ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20" 
                  : "bg-rose-950/20 text-rose-400 border-rose-500/20"
              }`}>
                <span>{quizStatus === "correct" ? "INTEGRITY CHECK PASSED" : "SYNTAX COMPILATION ERROR"}</span>
              </div>
              <button
                onClick={nextChallenge}
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-900 px-5 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 transition-all"
              >
                Next Challenge
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

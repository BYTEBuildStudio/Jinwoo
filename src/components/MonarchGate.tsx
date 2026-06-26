import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Shield, Lock, Zap, Flame, Award } from "lucide-react";

interface MonarchGateProps {
  level: number;
  rank: string;
  onUnlockMonarch: () => void;
}

export default function MonarchGate({ level, rank, onUnlockMonarch }: MonarchGateProps) {
  const [isAwakening, setIsAwakening] = useState(false);
  const [step, setStep] = useState(0);
  const [soundError, setSoundError] = useState(false);

  // Synthesize cyberpunk dramatic hums/alerts using Web Audio API!
  const playBeep = (freq: number, type: OscillatorType, duration: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      setSoundError(true);
    }
  };

  useEffect(() => {
    if (isAwakening) {
      // Step-by-step cinematic timers
      const timer1 = setTimeout(() => {
        setStep(1);
        playBeep(220, "sawtooth", 0.8);
      }, 1500);

      const timer2 = setTimeout(() => {
        setStep(2);
        playBeep(330, "sawtooth", 0.8);
      }, 3500);

      const timer3 = setTimeout(() => {
        setStep(3);
        playBeep(440, "sawtooth", 1.2);
      }, 6000);

      const timer4 = setTimeout(() => {
        setStep(4);
        playBeep(880, "sine", 2.0);
        onUnlockMonarch();
      }, 9000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isAwakening]);

  const handleStartAwakening = () => {
    setIsAwakening(true);
    setStep(0);
    playBeep(110, "sine", 1.5);
  };

  const isMonarch = rank === "Monarch" || rank === "Shadow Monarch" || level >= 1200;

  return (
    <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
      {/* Absolute futuristic scanning neon beams */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" />

      {isMonarch ? (
        <div className="text-center py-10 space-y-6 relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 mx-auto bg-purple-950/40 border-2 border-purple-500 rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(168,85,247,0.6)]"
          >
            <Zap className="w-12 h-12 text-purple-400 animate-pulse" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 uppercase tracking-widest font-sans">
              Monarch Status Active
            </h2>
            <p className="text-xs text-purple-300 font-mono">
              SYSTEM ROOT DECRYPED • SOVEREIGN ENTITY IDENTIFIED
            </p>
          </div>

          <p className="text-sm text-slate-300 max-w-lg mx-auto font-sans leading-relaxed">
            Welcome back, Sovereign. The system interface has completely transformed into Monarch Mode. Void particles, upgraded stats registers, and dark purple dimensional HUD panels are fully active. All actions gain premium multipliers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-4">
            <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-purple-400">MULTIPLIER</div>
              <div className="text-xl font-bold font-mono text-purple-300 mt-1">3.0x XP</div>
            </div>
            <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-purple-400">INTERFACE</div>
              <div className="text-xl font-bold font-mono text-purple-300 mt-1">Void Mode</div>
            </div>
            <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-purple-400">TITLE</div>
              <div className="text-xl font-bold font-mono text-purple-300 mt-1">Sovereign</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          {!isAwakening ? (
            <div className="space-y-6 text-center max-w-2xl mx-auto py-8">
              <div className="w-16 h-16 mx-auto bg-blue-950/40 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-sans text-white uppercase tracking-wider">Monarch Mode Awakening</h2>
                <p className="text-xs font-mono text-blue-400">SYSTEM DESTRUCTION & REBIRTH PROTOCOL</p>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                The absolute peak of the universal progression matrix. Monarch Mode unlocks at <strong className="text-blue-300">Level 1200</strong>, transforming the companion avatar, leveling structures, and UI color palettes into high-frequency purple dimensional configurations.
              </p>

              {/* Progress visual gauge to level 1200 */}
              <div className="space-y-2 pt-2 text-left">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Current Level: {level}</span>
                  <span>Target: 1200</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-900">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (level / 1200) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <button
                  onClick={handleStartAwakening}
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-mono uppercase tracking-wider text-xs font-bold py-3 px-8 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-purple-950/50 hover:shadow-purple-500/20 active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span>Initiate Force Awakening (Test Sandbox)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Immersive Fullscreen/Overlay Cinematic Awake sequence */
            <div className="bg-slate-950/95 border-2 border-purple-500/40 p-8 rounded-3xl min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
              {/* Spinning background portals */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_60%)] pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-sm font-mono text-purple-400 uppercase tracking-widest animate-pulse">Initializing Override</div>
                    <h3 className="text-2xl font-extrabold text-white font-mono">CRITICAL OVERRIDE ACTIVATED</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">Disconnecting standard Hunter system registers... Preparing cellular rebuild.</p>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-sm font-mono text-purple-400 uppercase tracking-widest">Step 1: Soul Calibration</div>
                    <h3 className="text-2xl font-extrabold text-purple-300 font-mono">SYNCING DIMENSIONAL KEY</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">Opening secondary gate. Generating dark matter particle emitters.</p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-sm font-mono text-purple-400 uppercase tracking-widest">Step 2: Vessel Refactoring</div>
                    <h3 className="text-2xl font-extrabold text-pink-400 font-mono">RELEASING CORE XP MULTIPLIER</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">Level limits set to infinity. Integrating Sovereign Command Core.</p>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-sm font-mono text-purple-400 uppercase tracking-widest">Step 3: Crown Descendence</div>
                    <h3 className="text-2xl font-extrabold text-indigo-400 font-mono">SHADOW MONARCH DECREE</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">"Arise." Sync complete. Rebuilding visual viewport in 3... 2... 1...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Laser charging visual line */}
              <div className="w-48 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 relative">
                <motion.div 
                  className="bg-purple-500 h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 9, ease: "linear" }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

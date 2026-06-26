import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface AvatarProps {
  expression: "happy" | "serious" | "proud" | "disappointed" | "excited";
  isSpeaking: boolean;
  gesture?: string;
  className?: string;
}

export default function Avatar({ expression, isSpeaking, gesture, className = "" }: AvatarProps) {
  const [blink, setBlink] = useState(false);
  const [mouthPhase, setMouthPhase] = useState(0);

  // Trigger eye blinking at random intervals
  useEffect(() => {
    let timeout: any;
    const triggerBlink = () => {
      setBlink(true);
      timeout = setTimeout(() => {
        setBlink(false);
        const nextTime = Math.random() * 4000 + 2000; // blink every 2-6 seconds
        timeout = setTimeout(triggerBlink, nextTime);
      }, 150);
    };

    timeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timeout);
  }, []);

  // Sync lips with speaking state
  useEffect(() => {
    if (!isSpeaking) {
      setMouthPhase(0);
      return;
    }

    const interval = setInterval(() => {
      setMouthPhase((prev) => (prev + 1) % 4);
    }, 120);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Determine eye, eyebrow and mouth states depending on current expression
  const getEyebrowY = () => {
    switch (expression) {
      case "excited":
      case "proud":
        return -3;
      case "disappointed":
        return 2;
      default:
        return 0;
    }
  };

  const getEyebrowRotate = () => {
    switch (expression) {
      case "serious":
        return 12; // angled downwards inward
      case "disappointed":
        return -5; // angled downwards outward
      case "excited":
        return -8;
      default:
        return 0;
    }
  };

  // SVG paths for different resting or speaking mouth shapes
  const getMouthPath = () => {
    if (isSpeaking) {
      // Dynamic talking shapes
      switch (mouthPhase) {
        case 1: // slightly open
          return "M 92 112 Q 100 118 108 112 Q 100 114 92 112";
        case 2: // open wide
          return "M 90 112 Q 100 126 110 112 Q 100 118 90 112";
        case 3: // narrow open
          return "M 94 112 Q 100 120 106 112 Q 100 115 94 112";
        default: // closed
          return expression === "happy" || expression === "proud"
            ? "M 94 113 Q 100 118 106 113"
            : expression === "disappointed"
            ? "M 94 116 Q 100 112 106 116"
            : "M 94 114 Q 100 115 106 114";
      }
    }

    // Static mouth shapes based on expression
    switch (expression) {
      case "happy":
      case "proud":
        return "M 92 113 Q 100 120 108 113"; // smile
      case "disappointed":
        return "M 93 117 Q 100 112 107 117"; // sad frown
      case "excited":
        return "M 91 112 Q 100 125 109 112 Z"; // open laughing mouth
      case "serious":
      default:
        return "M 94 114 L 106 114"; // straight serious line
    }
  };

  const getEyeHeight = () => {
    if (blink) return 1;
    switch (expression) {
      case "serious":
        return 5; // sharp squint
      case "disappointed":
        return 6; // low-key sad
      default:
        return 8; // normal glowing eye
    }
  };

  // Animated breathing variants
  const breatheVariant = {
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  // Holographic rotating circle variants
  const holoRingVariant = {
    animate: {
      rotate: 360,
      transition: {
        duration: 25,
        ease: "linear",
        repeat: Infinity,
      },
    },
  };

  const slowSwayVariant = {
    animate: {
      rotate: isSpeaking ? [-1.5, 1.5, -1.5] : [-0.5, 0.5, -0.5],
      x: isSpeaking ? [-1, 1, -1] : [0, 0, 0],
      transition: {
        duration: isSpeaking ? 2 : 5,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  return (
    <div id="avatar-container" className={`relative flex items-center justify-center overflow-hidden bg-slate-950/40 rounded-2xl border border-blue-900/30 shadow-2xl shadow-blue-950/50 ${className}`}>
      {/* Interactive futuristic HUD grid and holographic rings in the background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,32,67,0.4)_0%,rgba(2,6,23,0.9)_80%)]" />
      
      {/* Background system portal grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,53,151,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(18,53,151,0.05)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Rotating system gate glow */}
      <motion.svg
        className="absolute w-[80%] h-[80%] opacity-25"
        viewBox="0 0 200 200"
        variants={holoRingVariant}
        animate="animate"
      >
        <circle cx="100" cy="100" r="90" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,10" />
        <circle cx="100" cy="100" r="82" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeDasharray="40,20,10,30" />
        <circle cx="100" cy="100" r="75" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3,3" />
      </motion.svg>

      {/* Floating neon indicators */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-blue-500/20 text-[10px] font-mono text-blue-400">
        <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
        <span>SYS_GUIDE_v2.7</span>
      </div>

      {/* Core animated avatar graphics */}
      <motion.div
        className="relative w-full h-full max-w-[280px] max-h-[340px] z-10 flex items-center justify-center"
        variants={breatheVariant}
        animate="animate"
      >
        <motion.svg
          id="avatar-svg"
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_20px_rgba(30,58,138,0.5)]"
          variants={slowSwayVariant}
          animate="animate"
        >
          {/* DEFINITIONS for gradients */}
          <defs>
            {/* Skin shadow */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e2235" />
              <stop offset="100%" stopColor="#0f111a" />
            </linearGradient>
            {/* Glowing neon eyes */}
            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="70%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
            {/* Hair color gradient */}
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b0f19" />
              <stop offset="40%" stopColor="#111827" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
            {/* Jacket collar highlight */}
            <linearGradient id="collarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>

          {/* TORSO / JACKET / Premium Futuristic Clothing */}
          <g id="torso">
            {/* Under-clothing neck-high futuristic plate */}
            <path d="M 75 140 L 125 140 L 135 195 L 65 195 Z" fill="#0c111d" stroke="#1d4ed8" strokeWidth="1" />
            {/* Futuristic energy neck line */}
            <path d="M 85 148 L 115 148" stroke="#3b82f6" strokeWidth="2" strokeDasharray="2,2" className="animate-pulse" />

            {/* Dark Tech-Jacket body */}
            <path d="M 50 185 L 150 185 L 165 230 L 35 230 Z" fill="#0d1321" />
            {/* Blue glowing panel lines on chest */}
            <path d="M 55 195 L 80 230 M 145 195 L 120 230" stroke="#3b82f6" strokeWidth="2.5" opacity="0.8" />
            
            {/* Elegant high-collar jacket left and right */}
            <path d="M 68 135 L 55 175 L 85 195 L 80 145 Z" fill="#111827" stroke="url(#collarGrad)" strokeWidth="1.5" />
            <path d="M 132 135 L 145 175 L 115 195 L 120 145 Z" fill="#111827" stroke="url(#collarGrad)" strokeWidth="1.5" />
          </g>

          {/* NECK */}
          <path d="M 82 118 L 118 118 L 125 146 L 75 146 Z" fill="url(#skinGrad)" stroke="#1e3a8a" strokeWidth="1" />

          {/* FACE BASE */}
          <g id="face">
            {/* Anime Jawline */}
            <path d="M 66 75 C 66 115 76 130 100 134 C 124 130 134 115 134 75 C 134 40 120 40 100 40 C 80 40 66 40 66 75 Z" fill="url(#skinGrad)" stroke="#2563eb" strokeWidth="1.5" opacity="0.9" />
            {/* Soft ear left */}
            <path d="M 66 70 C 60 70 58 82 66 85 Z" fill="#151926" stroke="#1e3a8a" strokeWidth="1" />
            {/* Soft ear right */}
            <path d="M 134 70 C 140 70 142 82 134 85 Z" fill="#151926" stroke="#1e3a8a" strokeWidth="1" />
          </g>

          {/* NOSE */}
          <path d="M 100 96 L 98 103 L 100 104" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.6" />

          {/* MOUTH with live animated mouth paths */}
          <path
            d={getMouthPath()}
            stroke="#60a5fa"
            strokeWidth="2"
            fill={expression === "excited" && isSpeaking ? "#1e3a8a" : "none"}
            strokeLinecap="round"
            className="transition-all duration-100"
          />

          {/* GLOWING BLUE EYES */}
          <g id="eyes">
            {/* Left Eye background socket */}
            <path d="M 74 78 Q 84 72 92 78 Q 84 81 74 78" fill="#080c14" stroke="#1d4ed8" strokeWidth="1" />
            {/* Right Eye background socket */}
            <path d="M 108 78 Q 116 72 126 78 Q 116 81 108 78" fill="#080c14" stroke="#1d4ed8" strokeWidth="1" />

            {/* Left Eye Pupil (glowing) */}
            <ellipse cx="83" cy="77" rx="5" ry={getEyeHeight()} fill="#60a5fa" className="transition-all duration-75" />
            <circle cx="83" cy="77" r="10" fill="url(#eyeGlow)" opacity="0.8" />
            
            {/* Right Eye Pupil (glowing) */}
            <ellipse cx="117" cy="77" rx="5" ry={getEyeHeight()} fill="#60a5fa" className="transition-all duration-75" />
            <circle cx="117" cy="77" r="10" fill="url(#eyeGlow)" opacity="0.8" />

            {/* Glowing catchlights */}
            {!blink && (
              <>
                <circle cx="85" cy="75" r="1.5" fill="#ffffff" />
                <circle cx="119" cy="75" r="1.5" fill="#ffffff" />
              </>
            )}
          </g>

          {/* ANIME EYEBROWS (Slightly dynamic based on emotion) */}
          <g id="eyebrows">
            {/* Left Eyebrow */}
            <motion.path
              d="M 72 68 Q 82 63 90 68"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{ y: getEyebrowY(), rotate: getEyebrowRotate() }}
              transition={{ duration: 0.2 }}
            />
            {/* Right Eyebrow */}
            <motion.path
              d="M 110 68 Q 118 63 128 68"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{ y: getEyebrowY(), rotate: -getEyebrowRotate() }}
              transition={{ duration: 0.2 }}
            />
          </g>

          {/* HAIR (High tech spiky anime hair styling) */}
          <g id="hair">
            {/* Base hair back */}
            <path d="M 64 65 L 56 85 L 68 88 L 62 108 L 74 100 L 126 100 L 138 108 L 132 88 L 144 85 L 136 65 Z" fill="#080c14" />

            {/* Hair spikes front & crown sways */}
            <path d="M 65 65 C 50 45 75 20 85 30 C 85 20 100 15 110 32 C 115 15 135 25 140 45 C 145 60 135 70 135 70 L 130 55 C 130 55 125 45 118 58 C 118 58 112 40 102 52 C 102 52 98 32 90 55 C 80 40 76 50 72 62 Z" fill="url(#hairGrad)" stroke="#1e293b" strokeWidth="1" />
            
            {/* Center forehead spiky bang */}
            <path d="M 94 48 L 100 78 L 105 48" fill="url(#hairGrad)" stroke="#1e293b" strokeWidth="0.8" />
            {/* Side bangs framing the face */}
            <path d="M 66 65 L 62 95 L 70 82 Z" fill="#0f172a" />
            <path d="M 134 65 L 138 95 L 130 82 Z" fill="#0f172a" />
          </g>
        </motion.svg>
      </motion.div>

      {/* Holographic orbital controls active during gestures */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
        <motion.div
          className="absolute border border-dashed border-blue-500/20 rounded-full w-[85%] h-[85%]"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        {/* Holographic scanner laser sweep */}
        <motion.div 
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
          animate={{ top: ["20%", "80%", "20%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Small floating widgets simulating "Jinwoo System Guide Panels" */}
        {gesture && gesture !== "idle" && (
          <motion.div
            id="hologram-panel"
            className="absolute bottom-8 left-4 bg-blue-950/80 border border-blue-400/40 px-2 py-1 rounded text-[8px] font-mono text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="text-blue-400 font-bold uppercase">{gesture}</div>
            <div className="text-[6px] text-blue-300/70">ACTIVE_SYSTEM_LINK</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

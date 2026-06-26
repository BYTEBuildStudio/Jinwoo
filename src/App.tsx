import React, { useState, useEffect, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  User, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { 
  auth, 
  db, 
  loginAnonymously, 
  DEFAULT_TASKS_DATA 
} from "./lib/firebase";
import { 
  UserProfile, 
  Task, 
  ConversationMessage, 
  JournalEntry 
} from "./types";
import Avatar from "./components/Avatar";
import QuestCenter from "./components/QuestCenter";
import PhysicalNutrition from "./components/PhysicalNutrition";
import StudyCoding from "./components/StudyCoding";
import FinanceHub from "./components/FinanceHub";
import MonarchGate from "./components/MonarchGate";
import { 
  Flame, 
  Calendar as CalendarIcon, 
  User as UserIcon, 
  Plus, 
  Check, 
  Lock, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  ArrowRight, 
  Upload, 
  PlusCircle, 
  TrendingUp, 
  Trash2,
  Volume2,
  VolumeX,
  Dumbbell,
  BookOpen,
  Code,
  Shield,
  MessageSquare,
  Award,
  BookMarked,
  Activity,
  Compass,
  Settings as SettingsIcon,
  HelpCircle,
  Clock,
  Trophy,
  Zap,
  Wallet
} from "lucide-react";

// Speech synthesis and recognition setup
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
}

export default function App() {
  // Authentication & Profile States
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // App Phase States
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isInitializingMissions, setIsInitializingMissions] = useState(false);

  // Dynamic Content States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"All" | "Mandatory" | "Growth" | "Custom">("All");
  const [chatHistory, setChatHistory] = useState<ConversationMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Companion UI States
  const [companionExpression, setCompanionExpression] = useState<"happy" | "serious" | "proud" | "disappointed" | "excited">("happy");
  const [companionGesture, setCompanionGesture] = useState<string>("idle");
  const [companionText, setCompanionText] = useState("Awaiting command authorization, Hunter...");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Overlay Animations
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpAnimation, setXpAnimation] = useState<{ visible: boolean; text: string } | null>(null);
  const [showNightReview, setShowNightReview] = useState(false);
  const [nightSummary, setNightSummary] = useState<any>(null);

  // Active Menu Page State
  const [activePage, setActivePage] = useState<string>("Dashboard");

  // Custom Modal States
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSkill, setNewTaskSkill] = useState<"Programming" | "Discipline" | "Physical" | "Knowledge" | "Communication">("Programming");
  const [newTaskXp, setNewTaskXp] = useState(40);

  // Journal State
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [journalInput, setJournalInput] = useState("");
  const [journalMood, setJournalMood] = useState("Focused");

  // Physical Progress Photos (stored locally/base64 to emulate real upload)
  const [progressPhotos, setProgressPhotos] = useState<Array<{ id: string; day: string; date: string; url: string }>>([
    { id: "1", day: "Day 1", date: "20 May", url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop" },
    { id: "2", day: "Day 14", date: "03 Jun", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop" },
    { id: "3", day: "Day 30", date: "19 Jun", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=300&auto=format&fit=crop" },
    { id: "4", day: "Day 60", date: "19 Jul", url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop" },
    { id: "5", day: "Day 90", date: "18 Aug", url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=300&auto=format&fit=crop" }
  ]);

  // Audio Reference for Speech Synthesis
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Mount logic - Auto Anonymous Login
  useEffect(() => {
    const unsubscribe = loginAnonymously(async (activeUser, activeProfile) => {
      setUser(activeUser);
      setProfile(activeProfile);
      setLoading(false);

      // Fetch Tasks
      let fetchedTasks: Task[] = [];
      try {
        const tasksCol = collection(db, "users", activeUser.uid, "tasks");
        const tasksSnap = await getDocs(tasksCol);
        tasksSnap.forEach((doc) => {
          fetchedTasks.push(doc.data() as Task);
        });
      } catch (err) {
        console.warn("Firestore tasks fetch failed, loading local storage:", err);
        const local = localStorage.getItem(`tasks_${activeUser.uid}`);
        if (local) {
          try {
            fetchedTasks = JSON.parse(local);
          } catch (e) {
            // ignore
          }
        }
        if (!fetchedTasks.length) {
          fetchedTasks = DEFAULT_TASKS_DATA.map((t, idx) => ({
            taskId: `task_${idx}`,
            userId: activeUser.uid,
            title: t.title,
            skill: t.skill as any,
            xpReward: t.xpReward,
            completed: false,
            skipped: false,
            createdAt: new Date().toISOString()
          }));
          localStorage.setItem(`tasks_${activeUser.uid}`, JSON.stringify(fetchedTasks));
        }
      }
      fetchedTasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setTasks(fetchedTasks);

      // Fetch Chat History
      let fetchedChat: ConversationMessage[] = [];
      try {
        const chatCol = collection(db, "users", activeUser.uid, "conversations");
        const chatSnap = await getDocs(chatCol);
        chatSnap.forEach((doc) => {
          fetchedChat.push(doc.data() as ConversationMessage);
        });
      } catch (err) {
        console.warn("Firestore chat history fetch failed, loading local storage:", err);
        const local = localStorage.getItem(`chat_${activeUser.uid}`);
        if (local) {
          try {
            fetchedChat = JSON.parse(local);
          } catch (e) {
            // ignore
          }
        }
      }
      fetchedChat.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setChatHistory(fetchedChat);

      // Fetch Journals
      let fetchedJournals: JournalEntry[] = [];
      try {
        const journalCol = collection(db, "users", activeUser.uid, "journals");
        const journalSnap = await getDocs(journalCol);
        journalSnap.forEach((doc) => {
          fetchedJournals.push(doc.data() as JournalEntry);
        });
      } catch (err) {
        console.warn("Firestore journals fetch failed, loading local storage:", err);
        const local = localStorage.getItem(`journals_${activeUser.uid}`);
        if (local) {
          try {
            fetchedJournals = JSON.parse(local);
          } catch (e) {
            // ignore
          }
        }
      }
      fetchedJournals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setJournals(fetchedJournals);
    });

    return () => unsubscribe();
  }, []);

  // Sync speech synth stop on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Web Speech Synthesis Speaker
  const triggerSpeech = (text: string) => {
    if (!ttsEnabled) return;
    window.speechSynthesis.cancel(); // cancel any active speech

    // Clean markdown text for TTS
    const speechText = text.replace(/[*#_`~]/g, "").trim();
    
    const utterance = new SpeechSynthesisUtterance(speechText);
    utteranceRef.current = utterance;

    // Search for a futuristic cool voice (prefer a slightly deep, clear male or robotic synth voice)
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => 
      v.name.includes("Google US English") || 
      v.name.includes("Microsoft David") || 
      v.lang.startsWith("en")
    );
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // Slightly lower pitch for a cool mentor vibe

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Voice Speech-To-Text Handler
  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge or type directly.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsListening(false);
      // Auto send if on authentication screen
      if (!authenticated) {
        handlePasswordVerification(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // Centralized XP Gain and level calculations
  const handleGainXP = async (amount: number, message: string) => {
    if (!user || !profile) return;
    let newXp = (profile.xp || 0) + amount;
    let newLevel = profile.level || 1;
    const xpNeeded = 1000;
    
    if (newXp >= xpNeeded) {
      newLevel += Math.floor(newXp / xpNeeded);
      newXp = newXp % xpNeeded;
      setShowLevelUp(true);
      setCompanionExpression("excited");
      setCompanionGesture("saluting");
    }

    const updatedProfile = {
      ...profile,
      xp: newXp,
      level: newLevel,
      updatedAt: new Date().toISOString()
    };
    setProfile(updatedProfile);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        xp: newXp,
        level: newLevel,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore update profile failed, fallback to local:", err);
    }
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedProfile));

    setXpAnimation({ visible: true, text: `+${amount} XP: ${message}` });
    setTimeout(() => setXpAnimation(null), 3500);
  };

  const handleUnlockMonarch = async () => {
    if (!user || !profile) return;
    const newLevel = 1200;
    const newRank = "Shadow Monarch";
    
    const updatedProfile = {
      ...profile,
      level: newLevel,
      rank: newRank,
      updatedAt: new Date().toISOString()
    };
    setProfile(updatedProfile);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        level: newLevel,
        rank: newRank,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore save failed, fallback to local:", err);
    }
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedProfile));

    setCompanionText("Arise, Shadow Monarch. The absolute Peak Sovereign interface is fully active.");
    setCompanionExpression("excited");
    setCompanionGesture("saluting");
    triggerSpeech("Arise. Welcome to Monarch Status, Sovereign.");
    
    setXpAnimation({ visible: true, text: "SOVEREIGN AWAKENED! LEVEL 1200 REACHED" });
    setTimeout(() => setXpAnimation(null), 5000);
  };

  // Startup Walkthrough Trigger
  const handleStartWalkthrough = () => {
    setAuthenticated(true);
    setIsInitializingMissions(true);

    // Dynamic mission announcement sequence
    const introText = "Password accepted. Welcome back, Hunter Vivek. Preparing today's mission list now. Synchronizing neural interface...";
    setCompanionText(introText);
    setCompanionExpression("proud");
    setCompanionGesture("saluting");
    triggerSpeech(introText);

    setTimeout(() => {
      readMissionsOneByOne();
    }, 6000);
  };

  const readMissionsOneByOne = async () => {
    setCompanionExpression("serious");
    setCompanionGesture("explaining");

    const incompleteTasks = tasks.filter(t => !t.completed);
    if (incompleteTasks.length === 0) {
      const msg = "All mandatory missions have been fully cleared for today, Hunter Vivek. Excellent discipline. Ready for level assessment!";
      setCompanionText(msg);
      triggerSpeech(msg);
      setIsInitializingMissions(false);
      return;
    }

    // Announce and read incomplete tasks sequentially
    let speechBuffer = `Hunter, your objective schedule is prepared. I am opening today's missions: `;
    incompleteTasks.forEach((t, i) => {
      speechBuffer += `${i + 1}: ${t.title}. reward: + ${t.xpReward} XP. `;
    });
    speechBuffer += "Focus on completing your disciplines. Good luck.";

    setCompanionText(`Daily objectives synced. Awaiting task clearances...`);
    triggerSpeech(speechBuffer);
    
    setTimeout(() => {
      setIsInitializingMissions(false);
    }, 8000);
  };

  // Password Verification Flow
  const handlePasswordVerification = (typedPass: string) => {
    const formattedInput = typedPass.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const cleanSecret = "i am improving";

    if (formattedInput === cleanSecret) {
      setPasswordError("");
      handleStartWalkthrough();
    } else {
      setPasswordError("Access Denied: Incorrect password. Maintain discipline and try again.");
      const warnMsg = "Incorrect passcode, Hunter. Focus on improvement. Try again.";
      setCompanionText(warnMsg);
      setCompanionExpression("disappointed");
      setCompanionGesture("warning");
      triggerSpeech(warnMsg);
    }
  };

  // Checkbox toggle handler
  const handleToggleTask = async (task: Task) => {
    if (!user || !profile) return;

    const updatedCompleted = !task.completed;
    const taskRef = doc(db, "users", user.uid, "tasks", task.taskId);

    const updatedTasks = tasks.map(t => {
      if (t.taskId === task.taskId) {
        return { ...t, completed: updatedCompleted, completedAt: updatedCompleted ? new Date().toISOString() : undefined };
      }
      return t;
    });
    setTasks(updatedTasks);

    // Save task state back to Firestore
    try {
      await updateDoc(taskRef, {
        completed: updatedCompleted,
        completedAt: updatedCompleted ? new Date().toISOString() : null
      });
    } catch (err) {
      console.warn("Firestore update task failed, fell back to local storage:", err);
    }
    localStorage.setItem(`tasks_${user.uid}`, JSON.stringify(updatedTasks));

    // Update hunter state & XP rewards
    let xpGain = task.xpReward;
    let newXp = profile.xp;
    let newSkills = { ...profile.skills };

    if (updatedCompleted) {
      // Complete Task -> Gain rewards
      newXp += xpGain;
      
      // Update specific skill details
      if (newSkills[task.skill]) {
        newSkills[task.skill].xp += xpGain;
        if (newSkills[task.skill].xp >= 1000) {
          newSkills[task.skill].level += 1;
          newSkills[task.skill].xp = newSkills[task.skill].xp - 1000;
        }
      }

      setCompanionExpression("happy");
      setCompanionGesture("nodding");
      const msg = `Mission complete! +${xpGain} ${task.skill} XP allocated to your core registry, Hunter.`;
      setCompanionText(msg);
      triggerSpeech(msg);

      // Trigger Floating XP indicators
      setXpAnimation({ visible: true, text: `+${xpGain} ${task.skill} XP` });
      setTimeout(() => setXpAnimation(null), 3000);

    } else {
      // Unchecked -> Deduct rewards
      newXp = Math.max(0, newXp - xpGain);
      if (newSkills[task.skill]) {
        newSkills[task.skill].xp = Math.max(0, newSkills[task.skill].xp - xpGain);
      }

      setCompanionExpression("serious");
      setCompanionGesture("warning");
      const msg = `Hunter, this mission remains incomplete. XP values have been recalculated.`;
      setCompanionText(msg);
      triggerSpeech(msg);
    }

    // Sync state in Firestore
    const userRef = doc(db, "users", user.uid);
    const updatedProfile = {
      ...profile,
      xp: newXp,
      skills: newSkills,
      updatedAt: new Date().toISOString()
    };
    setProfile(updatedProfile);
    try {
      await updateDoc(userRef, {
        xp: newXp,
        skills: newSkills,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore update profile failed, fell back to local storage:", err);
    }
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedProfile));
  };

  // Add Task Modal Clearance
  const handleAddNewTask = async () => {
    if (!user || !newTaskTitle.trim()) return;

    const tasksCol = collection(db, "users", user.uid, "tasks");
    const taskRef = doc(tasksCol);
    const newTask: Task = {
      taskId: taskRef.id,
      userId: user.uid,
      title: newTaskTitle,
      skill: newTaskSkill,
      xpReward: newTaskXp,
      completed: false,
      skipped: false,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    try {
      await setDoc(taskRef, newTask);
    } catch (err) {
      console.warn("Firestore save task failed, fell back to local storage:", err);
    }
    localStorage.setItem(`tasks_${user.uid}`, JSON.stringify(updatedTasks));
    
    setShowAddTaskModal(false);
    setNewTaskTitle("");

    setCompanionExpression("happy");
    setCompanionGesture("explaining");
    const announce = `New objective logged successfully: ${newTask.title}. Reward set to +${newTask.xpReward} XP. Stay disciplined.`;
    setCompanionText(announce);
    triggerSpeech(announce);
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    const updatedTasks = tasks.filter(t => t.taskId !== taskId);
    setTasks(updatedTasks);
    try {
      await deleteDoc(taskRef);
    } catch (err) {
      console.warn("Firestore delete task failed, fell back to local storage:", err);
    }
    localStorage.setItem(`tasks_${user.uid}`, JSON.stringify(updatedTasks));
  };

  // Chat Submission Flow with Server-Side Gemini API
  const handleSendChatMessage = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!chatInput.trim() || !user || !profile) return;

    const userMessageText = chatInput.trim();
    setChatInput("");

    // Add user message to history
    const userMessage: ConversationMessage = {
      messageId: Math.random().toString(36).substring(7),
      userId: user.uid,
      sender: "user",
      text: userMessageText,
      createdAt: new Date().toISOString()
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);

    // Save to Firestore
    try {
      const chatCol = collection(db, "users", user.uid, "conversations");
      await setDoc(doc(chatCol, userMessage.messageId), userMessage);
    } catch (err) {
      console.warn("Firestore save user message failed, fell back to local storage:", err);
    }
    localStorage.setItem(`chat_${user.uid}`, JSON.stringify(updatedHistory));

    setIsChatLoading(true);
    setCompanionExpression("serious");
    setCompanionGesture("thinking");
    setCompanionText("Consulting system databases...");

    try {
      const res = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessageText,
          history: updatedHistory.slice(-10), // send last 10 messages for context
          profile: profile,
          todayMissions: tasks
        })
      });

      const data = await res.json();
      
      const assistantMessage: ConversationMessage = {
        messageId: Math.random().toString(36).substring(7),
        userId: user.uid,
        sender: "assistant",
        text: data.response,
        expression: data.expression,
        createdAt: new Date().toISOString()
      };

      setChatHistory(prev => {
        const next = [...prev, assistantMessage];
        localStorage.setItem(`chat_${user.uid}`, JSON.stringify(next));
        return next;
      });
      try {
        const chatCol = collection(db, "users", user.uid, "conversations");
        await setDoc(doc(chatCol, assistantMessage.messageId), assistantMessage);
      } catch (err) {
        console.warn("Firestore save assistant message failed:", err);
      }

      // Trigger live changes to avatar
      setCompanionText(data.response);
      setCompanionExpression(data.expression || "happy");
      setCompanionGesture(data.gesture || "explaining");
      
      // Speak the response
      triggerSpeech(data.response);

    } catch (err) {
      console.warn(err);
      const fallbackMsg = "Link interface unstable. Re-routing guide matrix. What is your command, Hunter?";
      setCompanionText(fallbackMsg);
      triggerSpeech(fallbackMsg);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Daily Level Up Trigger Sequence
  const triggerLevelUpFlow = async () => {
    if (!user || !profile) return;

    // Darken screen and animate level up particles
    setShowLevelUp(true);
    setCompanionExpression("excited");
    setCompanionGesture("proud");
    
    const speakLevelUp = "Excellent work. You have fully cleared today's level. Initiating hunter class rank evaluation. Prepare for status growth.";
    setCompanionText(speakLevelUp);
    triggerSpeech(speakLevelUp);

    // Calculate state progress
    const newLevel = profile.level + 1;
    const nextRank = newLevel >= 150 ? "S-Rank" : 
                     newLevel >= 120 ? "A-Rank" :
                     newLevel >= 80 ? "B-Rank" :
                     newLevel >= 50 ? "C-Rank" :
                     newLevel >= 30 ? "D-Rank" : "E-Rank";

    const updatedProfile = {
      ...profile,
      level: newLevel,
      rank: nextRank,
      xp: 0, // Reset daily XP
      updatedAt: new Date().toISOString()
    };

    setProfile(updatedProfile);
    
    // Save to Firestore
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        level: newLevel,
        rank: nextRank,
        xp: 0,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore level up update failed, fell back to local storage:", err);
    }
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedProfile));

    // Reset daily tasks
    try {
      const batchPromises = tasks.map(t => {
        const taskRef = doc(db, "users", user.uid, "tasks", t.taskId);
        return updateDoc(taskRef, { completed: false, skipped: false });
      });
      await Promise.all(batchPromises);
    } catch (err) {
      console.warn("Firestore reset daily tasks failed:", err);
    }

    const resetTasks = tasks.map(t => ({ ...t, completed: false, skipped: false }));
    setTasks(resetTasks);
    localStorage.setItem(`tasks_${user.uid}`, JSON.stringify(resetTasks));
  };

  // Night Review Summary Generator
  const generateNightReview = () => {
    if (tasks.length === 0) return;

    const completed = tasks.filter(t => t.completed);
    const skipped = tasks.filter(t => t.skipped || (!t.completed && !t.skipped)); // implicitly incomplete items

    const totalXp = completed.reduce((acc, curr) => acc + curr.xpReward, 0);

    // Group completions by skill to find weakest and strongest areas
    const skillCounts: Record<string, number> = {};
    completed.forEach(t => {
      skillCounts[t.skill] = (skillCounts[t.skill] || 0) + 1;
    });

    let weakest = "Communication";
    let minCount = 999;
    ["Programming", "Discipline", "Physical", "Knowledge", "Communication"].forEach(sk => {
      const count = skillCounts[sk] || 0;
      if (count < minCount) {
        minCount = count;
        weakest = sk;
      }
    });

    const summary = {
      completedCount: completed.length,
      skippedCount: skipped.length,
      xpEarned: totalXp,
      weakestArea: weakest,
      recommendation: weakest === "Programming" ? "Intensify full-stack development drills on Jinwoo project." :
                     weakest === "Physical" ? "Add daily mandatory active aerobic intervals and combat pushups." :
                     weakest === "Discipline" ? "Establish morning worship schedule and avoid routine delays." :
                     weakest === "Knowledge" ? "Devote at least 45 minutes to high-concentration technical textbook reading." :
                     "Enhance communications through mock guide briefings and leadership review."
    };

    setNightSummary(summary);
    setShowNightReview(true);

    setCompanionExpression("proud");
    setCompanionGesture("explaining");
    const summarySpeech = `Hunter, here is your dynamic night review: You completed ${completed.length} missions today, earning a total of ${totalXp} XP points. Your weakest area is detected in ${weakest}. Recommendation: ${summary.recommendation}`;
    setCompanionText(`Night appraisal logged in neural files.`);
    triggerSpeech(summarySpeech);
  };

  // Skip a task
  const handleSkipTask = async (task: Task) => {
    if (!user) return;
    const taskRef = doc(db, "users", user.uid, "tasks", task.taskId);
    
    const updatedTasks = tasks.map(t => {
      if (t.taskId === task.taskId) {
        return { ...t, skipped: true, completed: false };
      }
      return t;
    });
    setTasks(updatedTasks);

    try {
      await updateDoc(taskRef, {
        skipped: true,
        completed: false
      });
    } catch (err) {
      console.warn("Firestore skip task failed, fell back to local storage:", err);
    }
    localStorage.setItem(`tasks_${user.uid}`, JSON.stringify(updatedTasks));

    setCompanionExpression("serious");
    setCompanionGesture("warning");
    const warn = `Hunter, you have declared the mission '${task.title}' skipped. Avoid routines lapses to maintain neural compatibility.`;
    setCompanionText(warn);
    triggerSpeech(warn);
  };

  // Upload dynamic progress photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const nextDayNum = progressPhotos.length + 1;
        const newPhoto = {
          id: Date.now().toString(),
          day: `Day ${nextDayNum * 15}`,
          date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" }),
          url: event.target.result as string
        };
        setProgressPhotos([...progressPhotos, newPhoto]);

        setCompanionExpression("happy");
        setCompanionGesture("nodding");
        const msg = "Physical scan record logged and encrypted successfully in databases.";
        setCompanionText(msg);
        triggerSpeech(msg);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle logging journal reflections
  const handleAddJournal = async () => {
    if (!user || !journalInput.trim()) return;

    const journalCol = collection(db, "users", user.uid, "journals");
    const jRef = doc(journalCol);
    const newEntry: JournalEntry = {
      journalId: jRef.id,
      userId: user.uid,
      content: journalInput.trim(),
      mood: journalMood,
      createdAt: new Date().toISOString()
    };

    const updatedJournals = [newEntry, ...journals];
    setJournals(updatedJournals);
    setJournalInput("");

    try {
      await setDoc(jRef, newEntry);
    } catch (err) {
      console.warn("Firestore save journal failed, fell back to local storage:", err);
    }
    localStorage.setItem(`journals_${user.uid}`, JSON.stringify(updatedJournals));

    setCompanionExpression("proud");
    setCompanionGesture("saluting");
    const msg = "Daily reflective journal locked. Memory core synced.";
    setCompanionText(msg);
    triggerSpeech(msg);
  };

  // Pre-configured system prompts for fast interaction clicks
  const executeSystemCommand = async (command: string) => {
    setChatInput(command);
    // Submit
    setTimeout(() => {
      const btn = document.getElementById("chat-submit-btn");
      if (btn) btn.click();
    }, 100);
  };

  // Calculate percentage progress of tasks
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllMandatoryCompleted = tasks.length > 0 && tasks.filter(t => !t.completed).length === 0;

  const isShadowMonarch = profile?.rank === "Shadow Monarch" || (profile?.level || 1) >= 1200;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col ${isShadowMonarch ? "selection:bg-purple-600" : "selection:bg-blue-600"} selection:text-white`}>
      {/* BACKGROUND FLOATING EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {isShadowMonarch ? (
          <>
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-950/25 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-950/30 rounded-full blur-[150px] animate-pulse" />
          </>
        ) : (
          <>
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-950/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-950/20 rounded-full blur-[150px]" />
          </>
        )}
      </div>

      {loading ? (
        // LOADING SPIN SCREEN
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-mono text-blue-400 tracking-wider">CONNECTING TO JINWOO HUNTER NETWORK...</h2>
          <p className="text-sm text-slate-400 mt-2">Configuring guide interface matrix. Please wait.</p>
        </div>
      ) : !authenticated ? (
        // STARTUP FLOW - PASSWORD SCREEN WITH JINWOO SYSTEM ENTRY
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-lg mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-slate-900/60 border border-blue-900/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            {/* Corner glowing lines */}
            <div className="absolute top-0 left-0 w-8 h-[2px] bg-blue-500" />
            <div className="absolute top-0 left-0 w-[2px] h-8 bg-blue-500" />
            <div className="absolute top-0 right-0 w-8 h-[2px] bg-blue-500" />
            <div className="absolute top-0 right-0 w-[2px] h-8 bg-blue-500" />

            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-blue-950/50 border border-blue-500/30 mb-3 animate-pulse">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold font-sans tracking-tight text-white">PROJECT JINWOO</h1>
              <p className="text-xs font-mono text-blue-400 tracking-widest uppercase mt-1">HOLOGRAPHIC COMPANION DIRECTIVE</p>
            </div>

            {/* Micro Live Avatar specifically for instructions */}
            <div className="mb-6 flex justify-center">
              <Avatar expression={companionExpression} isSpeaking={isSpeaking} gesture={companionGesture} className="w-48 h-48 border-2 border-blue-500/40" />
            </div>

            <div className="bg-slate-950/80 border border-blue-900/30 rounded-2xl p-4 mb-6">
              <p className="text-sm font-mono text-blue-300 text-center">
                "{companionText}"
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Voice / Keyboard Keyphrase Entry</label>
                <div className="relative">
                  <input
                    type="text"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Type: 'I am improving'"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handlePasswordVerification(passwordInput);
                      }
                    }}
                    className="w-full bg-slate-950/90 border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition-all pr-12"
                  />
                  <button
                    onClick={toggleListening}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-950/50 text-red-400 border border-red-500/40 animate-pulse' : 'bg-slate-900 text-blue-400 hover:bg-slate-800'}`}
                    title="Tap to speak passcode"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-rose-500 font-mono mt-2 flex items-center gap-1.5">
                    <span>●</span> {passwordError}
                  </p>
                )}
              </div>

              <button
                onClick={() => handlePasswordVerification(passwordInput)}
                className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-blue-950/30 hover:shadow-blue-950/50 transition-all flex items-center justify-center gap-2"
              >
                <span>Authorize Connection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-[10px] font-mono text-slate-500">SYSTEM GUIDANCE LINK PROTOCOL ACTIVE • LEVEL 27 AUTHORIZATION</p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        // CORE INTEGRATED COMPANION SYSTEM DASHBOARD
        <div className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden">
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-900 flex flex-col flex-shrink-0 z-20">
            {/* Brand Logo Header */}
            <div className="p-6 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/30">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wider font-sans uppercase">Jinwoo</h2>
                  <p className="text-[9px] font-mono text-blue-400 tracking-widest uppercase">{profile?.rank || "E-Rank Hunter"}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {[
                { name: "Dashboard", icon: Activity },
                { name: "Quests & Streaks", icon: Trophy },
                { name: "Physical & Nutrition", icon: Dumbbell },
                { name: "Study & Coding", icon: Code },
                { name: "Finance Hub", icon: Wallet },
                { name: "AI Assistant", icon: MessageSquare },
                { name: "Daily Tasks", icon: BookMarked },
                { name: "Skills", icon: Award },
                { name: "Physical Progress", icon: Compass },
                { name: "Journal", icon: BookOpen },
                { name: "Monarch Gate", icon: Zap },
                { name: "Settings", icon: SettingsIcon }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.name;
                return (
                  <button
                    key={item.name}
                    id={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setActivePage(item.name as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans transition-all duration-200 ${
                      isActive 
                        ? "bg-blue-950/50 text-blue-400 border-l-2 border-blue-500 font-medium" 
                        : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Level Footer Widget */}
            <div className="p-4 border-t border-slate-900 bg-slate-950/40">
              <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                <span className="text-blue-400 uppercase font-bold">E-RANK</span>
                <span className="text-slate-400">LEVEL {profile?.level} / 150</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${((profile?.level || 27) / 150) * 100}%` }}
                />
              </div>

              <button 
                disabled 
                className="w-full mt-4 bg-slate-900/80 border border-slate-800 text-slate-500 text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed font-mono"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Upgrade to D-Rank</span>
              </button>
            </div>
          </aside>

          {/* MAIN PAGE DASHBOARD CONTENT PANEL */}
          <main className="flex-1 overflow-y-auto flex flex-col bg-slate-950 relative">
            
            {/* TOP BAR SEARCH & STATISTICS BAR */}
            <header className="p-6 border-b border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
              <div>
                <h1 className="text-xl font-bold font-sans text-white">Good Morning, {profile?.playerName || "Vivek"}</h1>
                <p className="text-xs text-slate-400 mt-0.5">Another day to become the strongest version of yourself.</p>
              </div>

              {/* Status Mini Metrics */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-amber-950/20 border border-amber-500/10 px-3 py-1.5 rounded-xl">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  <div>
                    <div className="text-[10px] font-mono text-amber-400/70 leading-none">STREAK</div>
                    <div className="text-xs font-bold text-amber-500 font-mono">12 Days</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-blue-950/20 border border-blue-500/10 px-3 py-1.5 rounded-xl">
                  <CalendarIcon className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-[10px] font-mono text-blue-400/70 leading-none">TODAY'S DATE</div>
                    <div className="text-xs font-bold text-blue-400 font-mono">24 May 2025</div>
                  </div>
                </div>

                {/* User avatar mockup */}
                <div className="flex items-center gap-3 border-l border-slate-900 pl-6">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-none">{profile?.playerName || "Vivek"}</div>
                    <div className="text-[9px] font-mono text-slate-500 mt-1">Hunter ID: 001</div>
                  </div>
                </div>
              </div>
            </header>

            {/* Floating Floating XP Notification */}
            <AnimatePresence>
              {xpAnimation?.visible && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  className="fixed bottom-24 right-8 z-50 bg-gradient-to-r from-blue-900 to-indigo-950 border-2 border-blue-400/40 py-3 px-6 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center gap-3 font-mono text-blue-300"
                >
                  <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="font-bold">{xpAnimation.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTUAL RENDERED SUBPAGES */}
            <div className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">

              {activePage === "Dashboard" && (
                // VIEW 1: CENTRAL COLLABORATIVE DASHBOARD
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* COLUMN 1: TODAY'S MISSIONS (Left panel - 4cols) */}
                  <div className="lg:col-span-4 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md flex flex-col self-stretch">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold font-mono tracking-wider text-blue-400 uppercase">Today's Missions</h3>
                      <button 
                        onClick={() => setShowAddTaskModal(true)}
                        className="bg-blue-950/80 hover:bg-blue-900 border border-blue-500/30 text-xs px-3 py-1.5 rounded-xl text-blue-300 flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>

                    {/* Filter categories */}
                    <div className="flex gap-1 bg-slate-950/80 p-1 rounded-xl mb-4 overflow-x-auto border border-slate-900">
                      {(["All", "Mandatory", "Growth", "Custom"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 text-[10px] py-1.5 px-3 rounded-lg font-mono uppercase transition-all ${
                            activeTab === tab 
                              ? "bg-blue-900/60 text-blue-300 border border-blue-500/20 font-bold" 
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Task List Grid */}
                    <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                      {tasks
                        .filter(t => {
                          if (activeTab === "All") return true;
                          if (activeTab === "Mandatory") return ["Discipline", "Knowledge"].includes(t.skill);
                          if (activeTab === "Growth") return ["Programming", "Physical", "Communication"].includes(t.skill);
                          return !DEFAULT_TASKS_DATA.some(dt => dt.title === t.title); // custom ones
                        })
                        .map((task) => (
                          <div 
                            key={task.taskId}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                              task.completed 
                                ? "bg-emerald-950/15 border-emerald-900/30 text-emerald-400/80" 
                                : task.skipped 
                                ? "bg-rose-950/10 border-rose-900/20 text-rose-400/60"
                                : "bg-slate-950/40 border-slate-900 text-slate-300 hover:border-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                onClick={() => handleToggleTask(task)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                                  task.completed 
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                                    : "border-slate-700 hover:border-blue-500"
                                }`}
                              >
                                {task.completed && <Check className="w-3.5 h-3.5" />}
                              </button>
                              <div className="min-w-0">
                                <p className={`text-xs font-medium truncate ${task.completed ? 'line-through' : ''}`}>
                                  {task.title}
                                </p>
                                <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                                  {task.skill} • {DEFAULT_TASKS_DATA.some(dt => dt.title === task.title) ? "System" : "Custom"}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono ${task.completed ? 'text-emerald-400' : 'text-blue-400'}`}>
                                +{task.xpReward} XP
                              </span>
                              {!task.completed && !task.skipped && (
                                <button
                                  onClick={() => handleSkipTask(task)}
                                  className="text-[9px] font-mono text-slate-500 hover:text-rose-400 px-1.5 py-0.5 rounded border border-transparent hover:border-rose-900/40"
                                  title="Skip task"
                                >
                                  Skip
                                </button>
                              )}
                              {!DEFAULT_TASKS_DATA.some(dt => dt.title === task.title) && (
                                <button 
                                  onClick={() => handleDeleteTask(task.taskId)}
                                  className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Missions progress tracker */}
                    <div className="mt-auto pt-6 border-t border-slate-900/60">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-slate-400 font-mono">{completedCount} / {totalCount} Completed</span>
                        <span className="font-mono text-blue-400 font-bold">{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-900">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>

                      {/* Complete Day Button */}
                      <button
                        onClick={triggerLevelUpFlow}
                        disabled={!isAllMandatoryCompleted}
                        className={`w-full mt-4 py-3 px-4 rounded-xl font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          isAllMandatoryCompleted 
                            ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-lg shadow-blue-900/20" 
                            : "bg-slate-900/50 text-slate-600 border border-slate-900 cursor-not-allowed"
                        }`}
                      >
                        {!isAllMandatoryCompleted && <Lock className="w-3.5 h-3.5" />}
                        <span>Complete Day & Level Up</span>
                      </button>
                    </div>

                  </div>

                  {/* COLUMN 2: JINWOO LIVE ASSISTANT INTERACTION (Middle panel - 5cols) */}
                  <div className="lg:col-span-5 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold font-mono tracking-wider text-blue-400 uppercase">AI Assistant - Jinwoo</h3>
                      <div className="flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">Online</span>
                      </div>
                    </div>

                    {/* Integrated Avatar Block */}
                    <div className="w-full h-[290px] relative rounded-2xl overflow-hidden mb-4">
                      <Avatar expression={companionExpression} isSpeaking={isSpeaking} gesture={companionGesture} className="w-full h-full" />
                    </div>

                    {/* AI subtitle text container */}
                    <div className="w-full bg-slate-950/80 border border-blue-950/30 rounded-2xl p-4 min-h-[72px] mb-4 flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-[9px] font-mono text-blue-400 block mb-0.5">GUIDE_SYNC:</span>
                        <p className="text-xs text-blue-100 font-mono leading-relaxed italic">
                          "{companionText}"
                        </p>
                      </div>
                    </div>

                    {/* Live Wave Visualizer */}
                    {isSpeaking && (
                      <div className="flex items-center justify-center gap-0.5 h-6 mb-4 w-full">
                        {[...Array(24)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-[2px] bg-blue-500 rounded"
                            animate={{ height: [4, Math.random() * 20 + 6, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.02 }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Input Field Container */}
                    <form onSubmit={handleSendChatMessage} className="w-full flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask me anything..."
                          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                            isListening ? 'bg-rose-950/50 text-rose-400 animate-pulse border border-rose-900/40' : 'text-blue-400 hover:bg-slate-900'
                          }`}
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="submit"
                        id="chat-submit-btn"
                        disabled={isChatLoading || !chatInput.trim()}
                        className="p-3 bg-blue-950 hover:bg-blue-900 border border-blue-500/30 rounded-xl text-blue-400 disabled:opacity-50 transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Fast system clicks below chat */}
                    <div className="w-full grid grid-cols-2 gap-1.5 mt-3">
                      <button 
                        onClick={() => executeSystemCommand("Jinwoo, show today's missions.")}
                        className="bg-slate-950 hover:bg-slate-900 text-left px-3 py-1.5 rounded-lg text-[9px] font-mono text-slate-400 hover:text-blue-300 border border-slate-900 transition-all"
                      >
                        &gt; show today's missions
                      </button>
                      <button 
                        onClick={() => executeSystemCommand("Jinwoo, motivate me.")}
                        className="bg-slate-950 hover:bg-slate-900 text-left px-3 py-1.5 rounded-lg text-[9px] font-mono text-slate-400 hover:text-blue-300 border border-slate-900 transition-all"
                      >
                        &gt; motivate me
                      </button>
                      <button 
                        onClick={() => executeSystemCommand("Jinwoo, compare my progress.")}
                        className="bg-slate-950 hover:bg-slate-900 text-left px-3 py-1.5 rounded-lg text-[9px] font-mono text-slate-400 hover:text-blue-300 border border-slate-900 transition-all"
                      >
                        &gt; compare my progress
                      </button>
                      <button 
                        onClick={() => executeSystemCommand("Jinwoo, what should I learn today?")}
                        className="bg-slate-950 hover:bg-slate-900 text-left px-3 py-1.5 rounded-lg text-[9px] font-mono text-slate-400 hover:text-blue-300 border border-slate-900 transition-all"
                      >
                        &gt; what should I learn today?
                      </button>
                    </div>

                    {/* Quotes Container */}
                    <div className="mt-4 pt-4 border-t border-slate-900 w-full flex items-start gap-2 text-slate-500 italic">
                      <p className="text-[10px] font-sans">
                        “The weak have no choice but to accept their fate. But I am not weak.”
                      </p>
                    </div>

                  </div>

                  {/* COLUMN 3: STATUS & STATS OVERVIEW (Right panel - 3cols) */}
                  <div className="lg:col-span-3 space-y-6">
                    
                    {/* STATUS CARD */}
                    <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 backdrop-blur-md">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-blue-400 uppercase mb-3">Your Status</h3>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-950/60 p-3 rounded-2xl text-center border border-slate-900">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Level</span>
                          <span className="text-2xl font-bold text-white font-mono">{profile?.level}</span>
                        </div>
                        <div className="bg-slate-950/60 p-3 rounded-2xl text-center border border-slate-900">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Rank</span>
                          <span className="text-sm font-bold text-blue-400 font-mono uppercase block mt-1">{profile?.rank}</span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 mb-2 flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">Total XP</span>
                        <span className="text-slate-300 font-bold">8,420 XP</span>
                      </div>

                      {/* Level progress bar */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-500">
                          <span>Level Progress</span>
                          <span>{profile?.xp} / 1000 XP</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full transition-all duration-500" 
                            style={{ width: `${((profile?.xp || 0) / 1000) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SKILLS OVERVIEW */}
                    <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 backdrop-blur-md">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold font-mono tracking-wider text-blue-400 uppercase">Skill Overview</h3>
                        <button onClick={() => setActivePage("Skills")} className="text-[10px] font-mono text-blue-400 hover:underline">View All</button>
                      </div>

                      <div className="space-y-2.5">
                        {profile?.skills && Object.entries(profile.skills as Record<string, any>).map(([key, val]) => {
                          const Icon = key === "Programming" ? Code : 
                                      key === "Discipline" ? Shield :
                                      key === "Physical" ? Dumbbell :
                                      key === "Knowledge" ? BookOpen : MessageSquare;
                          return (
                            <div key={key}>
                              <div className="flex justify-between text-[10px] font-mono mb-1">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Icon className="w-3 h-3 text-slate-500" />
                                  <span>{key}</span>
                                </span>
                                <span className="text-slate-500">Lvl {val.level} • {val.xp}/1000</span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                                <div 
                                  className="bg-blue-500/80 h-full transition-all duration-300"
                                  style={{ width: `${(val.xp / 1000) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* PHYSICAL PROGRESS PHOTO STREAM */}
                    <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 backdrop-blur-md">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold font-mono tracking-wider text-blue-400 uppercase">Physical Progress</h3>
                        <button onClick={() => setActivePage("Physical Progress")} className="text-[10px] font-mono text-blue-400 hover:underline">View All</button>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {progressPhotos.slice(-5).map((photo) => (
                          <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-800">
                            <img src={photo.url} alt={photo.day} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-slate-950/35 flex flex-col justify-end p-0.5 text-center">
                              <span className="text-[7px] font-mono text-white leading-none font-bold">{photo.day}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <label className="w-full mt-3.5 bg-blue-950/40 hover:bg-blue-900 border border-blue-500/20 text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-mono text-blue-300 transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Today's Photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    </div>

                    {/* NIGHT APPRAISAL ACTIVATE BOX */}
                    <div className="bg-gradient-to-br from-slate-900/50 to-blue-950/20 border border-blue-900/20 rounded-3xl p-5 backdrop-blur-md text-center">
                      <h4 className="text-xs font-bold font-mono tracking-wider text-blue-400 uppercase mb-1">Night Appraisal Core</h4>
                      <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">Calculate today's full XP statistics, weakest areas and recommend corrections.</p>
                      <button 
                        onClick={generateNightReview}
                        className="w-full bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 font-mono text-xs py-2 px-3 rounded-xl transition-all"
                      >
                        Request Review
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* NEW ADAPTIVE MODULES MOUNT REGISTRY */}
              {activePage === "Quests & Streaks" && (
                <QuestCenter onGainXP={handleGainXP} skills={profile?.skills} />
              )}

              {activePage === "Physical & Nutrition" && (
                <PhysicalNutrition onGainXP={handleGainXP} />
              )}

              {activePage === "Study & Coding" && (
                <StudyCoding onGainXP={handleGainXP} />
              )}

              {activePage === "Finance Hub" && (
                <FinanceHub onGainXP={handleGainXP} />
              )}

              {activePage === "Monarch Gate" && (
                <MonarchGate level={profile?.level || 1} rank={profile?.rank || "E-Rank"} onUnlockMonarch={handleUnlockMonarch} />
              )}

              {/* VIEW 2: AI ASSISTANT EXPANDED PAGE */}
              {activePage === "AI Assistant" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-4 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-center items-center h-[520px]">
                    <h3 className="text-sm font-bold font-mono text-blue-400 uppercase tracking-widest mb-4">Companion Guide Hologram</h3>
                    <div className="w-full h-full max-h-[380px] rounded-2xl overflow-hidden border border-slate-800">
                      <Avatar expression={companionExpression} isSpeaking={isSpeaking} gesture={companionGesture} className="w-full h-full" />
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md flex flex-col h-[520px]">
                    <h3 className="text-sm font-bold font-mono text-blue-400 uppercase tracking-widest mb-4">Neural Companion Console</h3>
                    
                    {/* Expanded Chat Log */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin">
                      {chatHistory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs italic">
                          <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                          <span>No communication logs established for this session. Begin chatting below.</span>
                        </div>
                      ) : (
                        chatHistory.map((msg, index) => (
                          <div 
                            key={msg.messageId || index}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs font-mono border ${
                              msg.sender === "user" 
                                ? "bg-blue-950/40 border-blue-900/40 text-blue-200" 
                                : "bg-slate-950/80 border-slate-900 text-slate-200"
                            }`}>
                              <span className="text-[8px] text-slate-500 block mb-1">
                                {msg.sender === "user" ? "HUNTER_VIVEK" : "SYS_JINWOO"}
                              </span>
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl px-4 py-3 text-xs font-mono text-slate-500">
                            Thinking...
                          </div>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendChatMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask Jinwoo anything about training schedules, progress or coding challenges..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-3 rounded-xl border transition-colors ${
                          isListening ? 'bg-rose-950/50 text-rose-400 border-rose-500/40' : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border-slate-800'
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-3 bg-blue-950 hover:bg-blue-900 border border-blue-500/30 rounded-xl text-blue-400 transition-all font-mono text-xs"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* VIEW 3: DAILY TASKS PAGE */}
              {activePage === "Daily Tasks" && (
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white font-sans uppercase">Daily Mission Board</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Define, review, and clear your active daily directives.</p>
                    </div>
                    <button 
                      onClick={() => setShowAddTaskModal(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-mono"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Custom Directive</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map((task) => (
                      <div 
                        key={task.taskId} 
                        className={`p-4 rounded-2xl border flex items-center justify-between ${
                          task.completed 
                            ? "bg-emerald-950/10 border-emerald-900/20 text-emerald-400/80" 
                            : "bg-slate-950/60 border-slate-900 text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              task.skill === "Programming" ? "bg-blue-500" :
                              task.skill === "Discipline" ? "bg-amber-500" :
                              task.skill === "Physical" ? "bg-rose-500" :
                              task.skill === "Knowledge" ? "bg-purple-500" : "bg-emerald-500"
                            }`} />
                            <h4 className="text-sm font-bold">{task.title}</h4>
                          </div>
                          <span className="text-xs text-slate-500 block mt-1.5 font-mono">Skill trained: {task.skill} • XP reward: +{task.xpReward}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleTask(task)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                              task.completed 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                                : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-blue-500 hover:text-blue-400"
                            }`}
                          >
                            {task.completed ? "Cleared" : "Mark Clear"}
                          </button>
                          {!DEFAULT_TASKS_DATA.some(dt => dt.title === task.title) && (
                            <button 
                              onClick={() => handleDeleteTask(task.taskId)}
                              className="p-2 bg-slate-900 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 rounded-xl border border-slate-800 hover:border-rose-900/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 4: SKILLS REGISTER */}
              {activePage === "Skills" && (
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md">
                  <h3 className="text-lg font-bold text-white uppercase mb-1">Hunter Skill Repository</h3>
                  <p className="text-xs text-slate-400 mb-6">Monitor your current expertise levels and status metrics.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile?.skills && Object.entries(profile.skills as Record<string, any>).map(([key, val]) => {
                      const Icon = key === "Programming" ? Code : 
                                  key === "Discipline" ? Shield :
                                  key === "Physical" ? Dumbbell :
                                  key === "Knowledge" ? BookOpen : MessageSquare;
                      return (
                        <div key={key} className="bg-slate-950/80 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-blue-950/50 rounded-xl border border-blue-900/50">
                                  <Icon className="w-5 h-5 text-blue-400" />
                                </div>
                                <h4 className="text-sm font-bold text-white">{key}</h4>
                              </div>
                              <span className="bg-blue-950/60 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-mono">Lvl {val.level}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-4 font-sans">
                              {key === "Programming" ? "Controls command of full-stack engineering, databases, algorithms, and logical structures." :
                               key === "Discipline" ? "Determines capability to complete schedules, routine timings, prayers, and morning schedules." :
                               key === "Physical" ? "Tracks body training, muscular parameters, sleep schedules, and athletic exercises." :
                               key === "Knowledge" ? "Quantifies study routines, textbook readings, coding literature, and overall learning speed." :
                               "Measures communication fluency, system command interactions, and tutorial capabilities."}
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                              <span>Skill progress</span>
                              <span>{val.xp} / 1000 XP</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full transition-all duration-300"
                                style={{ width: `${(val.xp / 1000) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 5: PHYSICAL PROGRESS VIEW ALL */}
              {activePage === "Physical Progress" && (
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase">Physical Fitness Records</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Monitor visual muscular adjustments and physical scans over the timeline.</p>
                    </div>
                    <label className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer font-mono transition-all">
                      <Upload className="w-4 h-4" />
                      <span>Upload Daily Record</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {progressPhotos.map((photo) => (
                      <div key={photo.id} className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-lg group hover:border-blue-900/40 transition-all">
                        <div className="aspect-square relative overflow-hidden bg-slate-900">
                          <img src={photo.url} alt={photo.day} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-3 bg-slate-950 flex justify-between items-center border-t border-slate-900">
                          <div>
                            <span className="text-xs font-bold text-white block">{photo.day}</span>
                            <span className="text-[9px] font-mono text-slate-500 mt-0.5 block">{photo.date}</span>
                          </div>
                          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 6: REFLECTIVE JOURNAL */}
              {activePage === "Journal" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Create journal entry */}
                  <div className="lg:col-span-5 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md">
                    <h3 className="text-sm font-bold font-mono text-blue-400 uppercase tracking-widest mb-4">Log Today's Reflection</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Reflections / Journal Details</label>
                        <textarea
                          rows={6}
                          value={journalInput}
                          onChange={(e) => setJournalInput(e.target.value)}
                          placeholder="Write down what went well today, what needs improvement, and dynamic details..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Dominant Mood Focus</label>
                        <div className="flex gap-1.5 overflow-x-auto">
                          {["Focused", "Exhausted", "Motivated", "Stressed", "Victorious"].map((mood) => (
                            <button
                              key={mood}
                              onClick={() => setJournalMood(mood)}
                              className={`text-[10px] py-1.5 px-3 rounded-lg font-mono transition-all ${
                                journalMood === mood 
                                  ? "bg-blue-900/60 text-blue-300 border border-blue-500/20 font-bold" 
                                  : "bg-slate-950 text-slate-500 border border-slate-900 hover:text-slate-300"
                              }`}
                            >
                              {mood}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleAddJournal}
                        disabled={!journalInput.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <BookMarked className="w-4 h-4" />
                        <span>Lock Journal Entry</span>
                      </button>
                    </div>
                  </div>

                  {/* Historical Journals list */}
                  <div className="lg:col-span-7 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md self-stretch h-[470px] flex flex-col">
                    <h3 className="text-sm font-bold font-mono text-blue-400 uppercase tracking-widest mb-4">Journal Archive</h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                      {journals.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs italic">
                          <BookOpen className="w-8 h-8 text-slate-600 mb-2" />
                          <span>No reflections locked. Log your first details on the left.</span>
                        </div>
                      ) : (
                        journals.map((entry) => (
                          <div key={entry.journalId} className="bg-slate-950/80 border border-slate-900 p-4 rounded-2xl">
                            <div className="flex justify-between items-center mb-2.5">
                              <span className="bg-blue-950/60 border border-blue-500/20 text-blue-400 text-[9px] font-mono px-2 py-0.5 rounded">MOOD: {entry.mood}</span>
                              <span className="text-[9px] font-mono text-slate-500">{new Date(entry.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                            <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* VIEW 7: SETTINGS & SCHEDULING TIMINGS */}
              {activePage === "Settings" && (
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-md max-w-2xl mx-auto">
                  <h3 className="text-lg font-bold text-white uppercase mb-1">Guide Configurations</h3>
                  <p className="text-xs text-slate-400 mb-6">Customize timings, holidays, exam schedules, and AI speech configurations.</p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-2">School Timings</label>
                        <input
                          type="text"
                          value={profile?.schoolTimings || ""}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, schoolTimings: e.target.value } : null)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Coaching Timings</label>
                        <input
                          type="text"
                          value={profile?.coachingTimings || ""}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, coachingTimings: e.target.value } : null)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Worship Timings</label>
                        <input
                          type="text"
                          value={profile?.worshipTimings || ""}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, worshipTimings: e.target.value } : null)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Exams Schedules</label>
                        <input
                          type="text"
                          value={profile?.exams || ""}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, exams: e.target.value } : null)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Active Holidays</label>
                      <input
                        type="text"
                        value={profile?.holidays || ""}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, holidays: e.target.value } : null)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-900 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-white block">Text-To-Speech Output</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Let Jinwoo read today's objectives and chat messages aloud.</span>
                      </div>
                      <button
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                          ttsEnabled 
                            ? "bg-blue-950/40 text-blue-400 border-blue-500/30" 
                            : "bg-slate-950 text-slate-600 border-slate-900"
                        }`}
                      >
                        {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </button>
                    </div>

                    <button
                      onClick={async () => {
                        if (!user || !profile) return;
                        const userRef = doc(db, "users", user.uid);
                        try {
                          await updateDoc(userRef, {
                            schoolTimings: profile.schoolTimings,
                            coachingTimings: profile.coachingTimings,
                            worshipTimings: profile.worshipTimings,
                            exams: profile.exams,
                            holidays: profile.holidays
                          });
                        } catch (err) {
                          console.warn("Firestore sync configurations failed, fell back to local storage:", err);
                        }
                        localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profile));
                        setCompanionExpression("proud");
                        setCompanionGesture("saluting");
                        const confirmMsg = "Dynamic settings successfully synced in system registries.";
                        setCompanionText(confirmMsg);
                        triggerSpeech(confirmMsg);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider transition-all mt-4"
                    >
                      Sync All Configurations
                    </button>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      )}

      {/* OVERLAY 1: DYNAMIC LEVEL UP SCREEN */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md"
          >
            {/* Pulsing Portal Energy Gate */}
            <div className="absolute w-[450px] h-[450px] bg-blue-900/10 rounded-full blur-[100px] animate-pulse" />
            
            {/* Rotating system rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-80 h-80 rounded-full border border-dashed border-blue-500/20"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-96 h-96 rounded-full border border-dashed border-indigo-500/15"
            />

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="text-center relative z-10 max-w-md"
            >
              <div className="inline-flex p-4 rounded-full bg-blue-950/80 border border-blue-400/40 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <Award className="w-10 h-10 text-blue-400" />
              </div>

              <h2 className="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 font-mono mb-2 uppercase animate-pulse">
                Level Up!
              </h2>
              <p className="text-sm font-mono text-blue-400 tracking-wider uppercase mb-6">Class Appraisal Successful</p>

              <div className="bg-slate-900/80 border border-blue-900/40 rounded-3xl p-6 mb-6">
                <div className="flex justify-around items-center mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block">OLD LEVEL</span>
                    <span className="text-xl font-bold text-slate-400 font-mono">{(profile?.level || 28) - 1}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-[10px] font-mono text-blue-500 block">NEW LEVEL</span>
                    <span className="text-2xl font-extrabold text-blue-400 font-mono">{profile?.level}</span>
                  </div>
                </div>
                <div className="text-center border-t border-slate-800 pt-3">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Appraised Rank Status</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono uppercase">{profile?.rank}</span>
                </div>
              </div>

              <button
                onClick={() => setShowLevelUp(false)}
                className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-mono text-xs font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-950/40 transition-all uppercase tracking-wider w-full"
              >
                Accept Growth & Sync System
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY 2: NIGHT REVIEW STATS REPORT */}
      <AnimatePresence>
        {showNightReview && nightSummary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 z-40 flex flex-col items-center justify-center p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -15 }}
              className="bg-slate-900 border border-blue-900/40 rounded-3xl p-6 max-w-md w-full relative overflow-hidden"
            >
              <h3 className="text-lg font-bold font-mono tracking-widest text-blue-400 uppercase mb-1">Night Appraisal Report</h3>
              <p className="text-[10px] text-slate-500 font-mono mb-4">SYSTEM SUMMARY REGISTER • AUTH ID: #001</p>

              <div className="space-y-3.5 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Missions Cleared</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">{nightSummary.completedCount}</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Directives Skipped</span>
                    <span className="text-base font-bold text-rose-400 font-mono">{nightSummary.skippedCount}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">Total XP Generated</span>
                  <span className="text-blue-400 font-bold">+{nightSummary.xpEarned} XP</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">Detected Weakest Skill</span>
                  <span className="text-rose-400 font-bold uppercase">{nightSummary.weakestArea}</span>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-blue-950/30">
                  <span className="text-[9px] font-mono text-blue-400 block mb-1">COMPANION RECOMMENDATION:</span>
                  <p className="text-xs text-slate-300 italic font-mono leading-relaxed">
                    "{nightSummary.recommendation}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowNightReview(false)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold py-3 rounded-xl uppercase transition-all"
              >
                Log Report and Sleep
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD DIRECTIVE */}
      <AnimatePresence>
        {showAddTaskModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full"
            >
              <h3 className="text-base font-bold text-white uppercase mb-4 font-mono">Add Daily Directive</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Directive Title</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g., Code Express API routes"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Skill Category</label>
                  <select
                    value={newTaskSkill}
                    onChange={(e) => setNewTaskSkill(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Discipline">Discipline</option>
                    <option value="Physical">Physical</option>
                    <option value="Knowledge">Knowledge</option>
                    <option value="Communication">Communication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">XP Reward ({newTaskXp})</label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={newTaskXp}
                    onChange={(e) => setNewTaskXp(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>10 XP</span>
                    <span>100 XP</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowAddTaskModal(false)}
                    className="flex-1 bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900 py-3 rounded-xl text-xs font-mono uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewTask}
                    disabled={!newTaskTitle.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-mono uppercase"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

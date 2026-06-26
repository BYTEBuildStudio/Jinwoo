export interface SkillInfo {
  xp: number;
  level: number;
}

export interface UserProfile {
  userId: string;
  playerName: string;
  level: number;
  rank: string;
  xp: number;
  skills: {
    Programming: SkillInfo;
    Discipline: SkillInfo;
    Physical: SkillInfo;
    Knowledge: SkillInfo;
    Communication: SkillInfo;
  };
  schoolTimings: string;
  coachingTimings: string;
  worshipTimings: string;
  holidays: string;
  exams: string;
  goals: string[];
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  taskId: string;
  userId: string;
  title: string;
  skill: "Programming" | "Discipline" | "Physical" | "Knowledge" | "Communication";
  xpReward: number;
  completed: boolean;
  skipped: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface ConversationMessage {
  messageId: string;
  userId: string;
  sender: "user" | "assistant";
  text: string;
  expression?: "happy" | "serious" | "proud" | "disappointed" | "excited";
  createdAt: string;
}

export interface JournalEntry {
  journalId: string;
  userId: string;
  content: string;
  mood: string;
  createdAt: string;
}

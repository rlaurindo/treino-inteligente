export interface UserProfile {
  email: string;
  name: string;
  experienceLevel: 'Iniciante' | 'Intermediário' | 'Avançado';
  objective: string;
  avatar: string;
  isPremium: boolean;
  streak: number;
  role?: 'aluno' | 'treinador';
  studentId?: string; // unique identification for binding
  accessCount?: number; // total times logged in / sessions opened
  subscribedPlan?: string;
  subscribedPrice?: string;
  coachEmail?: string;
  coachName?: string;
  coachLinked?: boolean;
  age?: number;              // idade do aluno
  weight?: number;           // peso do aluno (kg)
  height?: number;           // altura do aluno (cm)
  healthConditions?: string; // problema de saúde relevante
  lgpdConsent?: boolean;      // consentimento de privacidade conforme proteção de dados
  lgpdConsentDate?: string;  // data do consentimento LGPD
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string; // e.g. "60s"
  observation?: string;
  day?: string; // e.g. "Dia A - Peito & Tríceps"
  weight?: string; // custom load entered by the student or prescribed by coach
  videoUrl?: string; // trainer-prescribed video guide URL for this exercise
  completedSets?: boolean[]; // track completion status per set
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  level: string;
  objective: string;
  focus: string; // e.g., "Peito e Tríceps", "Membros Inferiores"
  createdAt: string;
  exercises: Exercise[];
}

export interface TrainingLog {
  id: string;
  date: string; // ISO string
  routineId: string;
  routineTitle: string;
  durationMinutes: number;
  caloriesBurned: number;
  avgHeartRate: number;
  rating: number; // 1-5
  totalExercisesCompleted?: number; // how many exercises finished
  totalExercisesCount?: number;
  loggedExercises?: Array<{
    name: string;
    setsCount: number;
    weightPrescribed?: string;
    weightLogged?: string;
    setsCompletedCount: number;
  }>;
}

export interface Achievement {
  id: string;
  userName: string;
  userAvatar: string;
  type: 'streak' | 'heavy_lift' | 'workout_completed' | 'premium_join';
  title: string;
  description: string;
  timestamp: string;
  likes: number;
  likedByUser?: boolean;
}

export interface WearableStats {
  connected: boolean;
  deviceType: 'Apple Watch' | 'Garmin' | 'Fitbit' | 'Nenhum';
  steps: number;
  heartRate: number;
  activeCalories: number;
  syncTime?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM"
  notifyOnDays: number[]; // 0-6 (dom-sab)
  message: string;
}

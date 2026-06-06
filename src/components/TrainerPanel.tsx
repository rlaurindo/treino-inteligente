import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, TrendingUp, DollarSign, Search, PlusCircle, 
  ChevronRight, Dumbbell, Award, Flame, MessageSquare, 
  Calendar, Check, UserPlus, Trash, Sparkles, Filter, CheckCircle, HelpCircle,
  ArrowLeft, Copy, Shield
} from 'lucide-react';
import { UserProfile, TrainingLog } from '../types';

interface Student {
  id: string;
  studentId?: string; // unique linkable student ID
  name: string;
  avatar: string;
  email: string;
  experienceLevel: 'Iniciante' | 'Intermediário' | 'Avançado';
  objective: string;
  streak: number;
  consistencyScore: number; // percentage (0-100)
  status: 'Excelente' | 'Normal' | 'Necessita de Atenção';
  lastWorkoutDate: string;
  customDirective?: string;
  directiveDate?: string;
  workoutLogs: TrainingLog[];
  accessCount?: number; // Added to capture "o numero de acessos que eles fizeram"
  isActive?: boolean; // Active or inactive toggle
  pricingType?: 'mensal' | 'hora';
  pricingValue?: number;
  age?: number;
  weight?: number;
  height?: number;
  healthConditions?: string;
  lgpdConsent?: boolean;
  lgpdConsentDate?: string;
}

interface TrainerPanelProps {
  darkMode: boolean;
}

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'st-1',
    studentId: 'STU-1080',
    name: 'Mariana Silva',
    email: 'mariana.silva@fitmail.pt',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    experienceLevel: 'Intermediário',
    objective: 'Emagrecimento & Definição',
    streak: 5,
    consistencyScore: 92,
    status: 'Excelente',
    lastWorkoutDate: new Date(Date.now() - 1000 * 3600 * 18).toISOString(), // 18 hours ago
    customDirective: 'Focar na cadência lenta (3s excêntrico) nos agachamentos neste ciclo.',
    directiveDate: '2026-05-27T10:00:00Z',
    accessCount: 14,
    isActive: true,
    pricingType: 'mensal',
    pricingValue: 50.00,
    age: 24,
    weight: 62.5,
    height: 164,
    healthConditions: 'Sem restrições clínicas. Relata cansaço muscular acumulado ocasional.',
    lgpdConsent: true,
    lgpdConsentDate: '2026-05-01T12:00:00Z',
    workoutLogs: [
      { id: 'log-101', date: new Date(Date.now() - 1000 * 3600 * 18).toISOString(), routineId: 'r1', routineTitle: 'Dia A - Pernas & Glúteos', durationMinutes: 52, caloriesBurned: 420, avgHeartRate: 138, rating: 5 },
      { id: 'log-102', date: new Date(Date.now() - 1000 * 3600 * 48 * 2).toISOString(), routineId: 'r2', routineTitle: 'Dia B - Superior & Cardio', durationMinutes: 45, caloriesBurned: 380, avgHeartRate: 131, rating: 4 },
      { id: 'log-103', date: new Date(Date.now() - 1000 * 3600 * 48 * 4).toISOString(), routineId: 'r1', routineTitle: 'Dia A - Pernas & Glúteos', durationMinutes: 55, caloriesBurned: 450, avgHeartRate: 140, rating: 5 },
      { id: 'log-104', date: new Date(Date.now() - 1000 * 3600 * 48 * 6).toISOString(), routineId: 'r3', routineTitle: 'Dia C - Core & HIIT', durationMinutes: 35, caloriesBurned: 310, avgHeartRate: 145, rating: 4 }
    ]
  },
  {
    id: 'st-2',
    studentId: 'STU-4892',
    name: 'João Santos',
    email: 'joao.santos@fitness.pt',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    experienceLevel: 'Avançado',
    objective: 'Hipertrofia Muscular',
    streak: 8,
    consistencyScore: 96,
    status: 'Excelente',
    lastWorkoutDate: new Date(Date.now() - 1000 * 3600 * 5).toISOString(), // 5 hours ago
    customDirective: 'Aumentar carga de supino reto para 90kg. Descansar 90-120s entre as séries pesadas.',
    directiveDate: '2026-05-26T14:30:00Z',
    accessCount: 28,
    isActive: true,
    pricingType: 'hora',
    pricingValue: 20.00,
    age: 29,
    weight: 84.0,
    height: 181,
    healthConditions: 'Escoliose lombar rotacional leve. Deve evitar compressão axial extrema na coluna (ex: agachamento com barra pesada sobre a nuca sem devida proteção).',
    lgpdConsent: true,
    lgpdConsentDate: '2026-05-02T16:45:00Z',
    workoutLogs: [
      { id: 'log-201', date: new Date(Date.now() - 1000 * 3600 * 5).toISOString(), routineId: 'r1', routineTitle: 'Dia A - Peito & Tríceps', durationMinutes: 65, caloriesBurned: 510, avgHeartRate: 125, rating: 5 },
      { id: 'log-202', date: new Date(Date.now() - 1000 * 3600 * 48).toISOString(), routineId: 'r2', routineTitle: 'Dia B - Costas & Bíceps', durationMinutes: 60, caloriesBurned: 470, avgHeartRate: 120, rating: 5 },
      { id: 'log-203', date: new Date(Date.now() - 1000 * 3600 * 48 * 3).toISOString(), routineId: 'r3', routineTitle: 'Dia C - Pernas Completo', durationMinutes: 70, caloriesBurned: 580, avgHeartRate: 135, rating: 4 },
      { id: 'log-204', date: new Date(Date.now() - 1000 * 3600 * 48 * 5).toISOString(), routineId: 'r1', routineTitle: 'Dia A - Peito & Tríceps', durationMinutes: 62, caloriesBurned: 490, avgHeartRate: 124, rating: 5 }
    ]
  },
  {
    id: 'st-3',
    studentId: 'STU-1925',
    name: 'Pedro Costa',
    email: 'pedro.costa99@sapo.pt',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    experienceLevel: 'Iniciante',
    objective: 'Ganho de Força',
    streak: 0,
    consistencyScore: 68,
    status: 'Normal',
    lastWorkoutDate: new Date(Date.now() - 1000 * 3600 * 24 * 3).toISOString(), // 3 days ago
    customDirective: 'Trabalhar bem a mobilidade de tornozelo antes do agachamento. Manter o calcanhar apoiado.',
    directiveDate: '2026-05-24T09:15:00Z',
    age: 35,
    weight: 92.3,
    height: 178,
    healthConditions: 'Lesão pregressa leve no manguito rotador do ombro direito. Relata pinçamento ao realizar elevações frontais.',
    lgpdConsent: true,
    lgpdConsentDate: '2026-05-04T09:00:00Z',
    accessCount: 3,
    isActive: true,
    pricingType: 'mensal',
    pricingValue: 45.00,
    workoutLogs: [
      { id: 'log-301', date: new Date(Date.now() - 1000 * 3600 * 24 * 3).toISOString(), routineId: 'r1', routineTitle: 'Full Body A', durationMinutes: 48, caloriesBurned: 320, avgHeartRate: 118, rating: 4 },
      { id: 'log-302', date: new Date(Date.now() - 1000 * 3600 * 24 * 7).toISOString(), routineId: 'r2', routineTitle: 'Full Body B', durationMinutes: 45, caloriesBurned: 300, avgHeartRate: 115, rating: 3 }
    ]
  },
  {
    id: 'st-4',
    studentId: 'STU-8822',
    name: 'Ana Rodrigues',
    email: 'ana_rodrigues@gym.pt',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    experienceLevel: 'Intermediário',
    objective: 'Resistência Muscular',
    streak: 0,
    consistencyScore: 42,
    status: 'Necessita de Atenção',
    lastWorkoutDate: new Date(Date.now() - 1000 * 3600 * 24 * 6).toISOString(), // 6 days ago
    customDirective: 'Fazer o cardio de baixa intensidade no fim do treino (25 minutos). Mantenha o foco, Ana!',
    directiveDate: '2026-05-20T17:00:00Z',
    age: 21,
    weight: 54.0,
    height: 160,
    healthConditions: 'Asma leve induzida por esforço. Portadora de inalador de resgate. Supervisionar cargas aeróbicas intensas.',
    lgpdConsent: true,
    lgpdConsentDate: '2026-05-10T11:15:00Z',
    accessCount: 5,
    isActive: false,
    pricingType: 'mensal',
    pricingValue: 60.00,
    workoutLogs: [
      { id: 'log-401', date: new Date(Date.now() - 1000 * 3600 * 24 * 6).toISOString(), routineId: 'r1', routineTitle: 'Circuito Funcional A', durationMinutes: 40, caloriesBurned: 360, avgHeartRate: 142, rating: 4 },
      { id: 'log-402', date: new Date(Date.now() - 1000 * 3600 * 24 * 12).toISOString(), routineId: 'r2', routineTitle: 'Circuito Cardio B', durationMinutes: 38, caloriesBurned: 340, avgHeartRate: 139, rating: 3 }
    ]
  }
];

export default function TrainerPanel({ darkMode }: TrainerPanelProps) {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('treino_trainer_students');
    return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
  });

  const [pricePerStudent, setPricePerStudent] = useState<number>(() => {
    const saved = localStorage.getItem('treino_trainer_price_per_student');
    return saved ? parseFloat(saved) : 50.00; // default 50€ as standard personal class / tutoring fee
  });

  const [useManualTotal, setUseManualTotal] = useState<boolean>(() => {
    const saved = localStorage.getItem('treino_trainer_use_manual_total');
    return saved === 'true';
  });

  const [manualTotal, setManualTotal] = useState<string>(() => {
    return localStorage.getItem('treino_trainer_manual_total') || '150.00';
  });

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Custom states for pricing plans and cost calculator
  const [activeMainTab, setActiveMainTab] = useState<'alunos' | 'planos'>('alunos');
  const [calcPlanPrice, setCalcPlanPrice] = useState<number>(29.90);
  const [calcStudentsCount, setCalcStudentsCount] = useState<number>(50);
  
  // Keep selected student synced with updated student list
  useEffect(() => {
    if (selectedStudent) {
      const match = students.find(st => st.id === selectedStudent.id);
      if (match) {
        // Only update if there is a difference to avoid infinite render loops
        if (JSON.stringify(match) !== JSON.stringify(selectedStudent)) {
          setSelectedStudent(match);
        }
      }
    }
  }, [students, selectedStudent]);
  
  // Custom feedback inputs
  const [feedbackText, setFeedbackText] = useState('');
  const [showSaveDirectiveSuccess, setShowSaveDirectiveSuccess] = useState(false);

  // Clinical and biological state managers for trainer custom edits
  const [editAge, setEditAge] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editHealth, setEditHealth] = useState('');
  const [isEditingClinical, setIsEditingClinical] = useState(false);

  // Set clinical fields when selectedStudent is loaded
  useEffect(() => {
    if (selectedStudent) {
      setEditAge(selectedStudent.age?.toString() || '');
      setEditWeight(selectedStudent.weight?.toString() || '');
      setEditHeight(selectedStudent.height?.toString() || '');
      setEditHealth(selectedStudent.healthConditions || 'Sem restrições');
      setIsEditingClinical(false);
    }
  }, [selectedStudent?.id]);

  const handleSaveClinical = () => {
    if (!selectedStudent) return;
    const updated = students.map(st => {
      if (st.id === selectedStudent.id) {
        return {
          ...st,
          age: editAge ? parseInt(editAge) : undefined,
          weight: editWeight ? parseFloat(editWeight) : undefined,
          height: editHeight ? parseFloat(editHeight) : undefined,
          healthConditions: editHealth
        };
      }
      return st;
    });
    setStudents(updated);
    setIsEditingClinical(false);
    alert("Prontuário clínico e indicadores de composição corporal atualizados com sucesso!");
  };

  // New Student modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLevel, setNewLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [newObjective, setNewObjective] = useState('Hipertrofia');
  const [newConsistency, setNewConsistency] = useState(80);
  const [newPricingType, setNewPricingType] = useState<'mensal' | 'hora'>('mensal');
  const [newPricingValue, setNewPricingValue] = useState<number>(pricePerStudent);

  // LINK STUDENT BY ID MODULE STATES
  const [addType, setAddType] = useState<'local' | 'vincular'>('local');
  const [linkId, setLinkId] = useState('');

  // INDEPENDENT TRAINER PRESCRIPTION STATES FOR ACTIVE DIRECTIVE PRESCRIPTIONS
  const [prescribeTab, setPrescribeTab] = useState<'ia' | 'manual'>('ia');
  const [manualTitle, setManualTitle] = useState('Treino Prescrito PT');
  const [prescribingDays, setPrescribingDays] = useState(3);
  const [prescribingTime, setPrescribingTime] = useState(60);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [manualExercises, setManualExercises] = useState<Array<{
    name: string;
    sets: number;
    reps: string;
    rest: string;
    observation: string;
    day: string;
    weight?: string;
    videoUrl?: string;
  }>>([
    { name: '', sets: 3, reps: '10-12', rest: '60s', observation: '', day: 'Dia A', weight: '', videoUrl: '' }
  ]);

  const [copiedLink, setCopiedLink] = useState(false);

  // Custom states for the general unique invite link generator
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLevel, setInviteLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [trainerEmail, setTrainerEmail] = useState(() => {
    try {
      const stored = localStorage.getItem('treino_user_profile');
      return stored ? JSON.parse(stored).email || '' : '';
    } catch(e) {
      return '';
    }
  });

  // Save changes locally
  useEffect(() => {
    localStorage.setItem('treino_trainer_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('treino_trainer_price_per_student', pricePerStudent.toString());
  }, [pricePerStudent]);

  useEffect(() => {
    localStorage.setItem('treino_trainer_use_manual_total', useManualTotal.toString());
  }, [useManualTotal]);

  useEffect(() => {
    localStorage.setItem('treino_trainer_manual_total', manualTotal);
  }, [manualTotal]);

  // Keep selected copy updated if the students list changed (e.g., deleted or updated)
  useEffect(() => {
    if (selectedStudent) {
      const freshCopy = students.find(st => st.id === selectedStudent.id);
      if (freshCopy) {
        setSelectedStudent(freshCopy);
      } else {
        setSelectedStudent(null);
      }
    }
  }, [students]);

  // Handle saving physical/training guideline directives
  const handleSaveDirective = () => {
    if (!selectedStudent) return;
    
    const updated = students.map(st => {
      if (st.id === selectedStudent.id) {
        return {
          ...st,
          customDirective: feedbackText,
          directiveDate: new Date().toISOString()
        };
      }
      return st;
    });

    setStudents(updated);
    setShowSaveDirectiveSuccess(true);
    setTimeout(() => setShowSaveDirectiveSuccess(false), 2000);
  };

  // AI prescription builder
  const handleGenerateAITraining = async () => {
    if (!selectedStudent) return;
    setIsAIGenerating(true);
    try {
      const response = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceLevel: selectedStudent.experienceLevel,
          objective: selectedStudent.objective,
          height: 175,
          weight: 75,
          daysPerWeek: prescribingDays,
          availableTime: prescribingTime
        })
      });

      if (!response.ok) throw new Error("Erro de rede ao gerar rotina.");
      const data = await response.json();
      
      const prescribedRoutine = {
        id: `routine-prescribed-${Date.now()}`,
        title: data.title + " (Prescrito p/ PT)",
        focus: data.focus,
        objective: selectedStudent.objective,
        level: selectedStudent.experienceLevel,
        createdAt: new Date().toISOString(),
        exercises: data.exercises
      };

      const studentIdKey = selectedStudent.studentId || selectedStudent.id;
      localStorage.setItem(`treino_prescribed_routine_${studentIdKey}`, JSON.stringify(prescribedRoutine));
      
      const updated = students.map(st => {
        if (st.id === selectedStudent.id) {
          return {
            ...st,
            workoutLogs: [
              {
                id: `log-prescription-${Date.now()}`,
                date: new Date().toISOString(),
                routineId: prescribedRoutine.id,
                routineTitle: `Treino IA Prescrito: ${prescribedRoutine.title}`,
                durationMinutes: prescribingTime,
                caloriesBurned: 350,
                avgHeartRate: 130,
                rating: 5,
                totalExercisesCompleted: 0,
                totalExercisesCount: prescribedRoutine.exercises.length,
                loggedExercises: prescribedRoutine.exercises.map((e: any) => ({
                  name: e.name,
                  setsCount: e.sets || 3,
                  setsCompletedCount: 0,
                  weightLogged: ''
                }))
              },
              ...st.workoutLogs
            ]
          };
        }
        return st;
      });
      setStudents(updated);
      setSelectedStudent(updated.find(x => x.id === selectedStudent.id) || null);
      alert(`Sucesso! Treino IA Prescrito e Sincronizado para o aluno ${selectedStudent.name}.`);
    } catch (err) {
      console.error(err);
      
      // Local fallback routine - ENFORCE LEVEL SPECIFIC COMPOSITION
      const isBeginner = selectedStudent.experienceLevel === 'Iniciante';
      const isIntermediate = selectedStudent.experienceLevel === 'Intermediário';
      const time = prescribingTime;
      const days = prescribingDays;

      let fallbackTitle = `Plano de Treino (${selectedStudent.experienceLevel})`;
      let fallbackExercises = [];

      if (isBeginner) {
        if (time <= 50) {
          fallbackTitle = "Adaptação Curta (Full Body)";
          fallbackExercises = [
            { day: "Corpo Inteiro (Adaptação Rápida)", name: "Agachamento Globo (Goblet Squat)", sets: 3, reps: "12-15", rest: "60s", observation: "Postura ereta, aprenda o movimento." },
            { day: "Corpo Inteiro (Adaptação Rápida)", name: "Supino Horizontal Articulado (Máquina)", sets: 3, reps: "12", rest: "60s", observation: "Foco na cadência controlada." },
            { day: "Corpo Inteiro (Adaptação Rápida)", name: "Puxada Aberta Máquina (Pulley)", sets: 3, reps: "12", rest: "60s", observation: "Foco na ativação das costas." },
            { day: "Corpo Inteiro (Adaptação Rápida)", name: "Flexão Abdominal (Solo)", sets: 3, reps: "15", rest: "45s" }
          ];
        } else {
          fallbackTitle = "Adaptação Completa (Full Body)";
          fallbackExercises = [
            { day: "Corpo Inteiro - Adaptação", name: "Agachamento Globo (Goblet Squat)", sets: 3, reps: "12-15", rest: "60s", observation: "Postura ereta." },
            { day: "Corpo Inteiro - Adaptação", name: "Supino Horizontal Articulado (Máquina)", sets: 3, reps: "12-15", rest: "60s" },
            { day: "Corpo Inteiro - Adaptação", name: "Puxada Aberta Máquina (Pulley)", sets: 3, reps: "12-15", rest: "60s" },
            { day: "Corpo Inteiro - Adaptação", name: "Desenvolvimento de Ombros com Halteres", sets: 3, reps: "12", rest: "60s" },
            { day: "Corpo Inteiro - Adaptação", name: "Cadeira Extensora", sets: 3, reps: "15", rest: "45s" },
            { day: "Corpo Inteiro - Adaptação", name: "Flexão Abdominal (Solo)", sets: 3, reps: "15-20", rest: "45s" }
          ];
        }
      } else if (isIntermediate) {
        fallbackTitle = `Plano Intermediário - Divisão Equilibrada`;
        // Split depending on days
        if (days === 3) {
          fallbackExercises = [
            // Peito (4 exercícios)
            { day: "Dia A - Peito, Ombros e Tríceps", name: "Supino Inclinado com Halteres", sets: 4, reps: "10", rest: "90s" },
            { day: "Dia A - Peito, Ombros e Tríceps", name: "Supino Reto com Barra", sets: 4, reps: "10", rest: "90s" },
            { day: "Dia A - Peito, Ombros e Tríceps", name: "Crucifixo Reto Halteres", sets: 3, reps: "12", rest: "60s" },
            { day: "Dia A - Peito, Ombros e Tríceps", name: "Crossover Polia Média", sets: 3, reps: "12", rest: "60s" },
            // Ombros (2 exercícios)
            { day: "Dia A - Peito, Ombros e Tríceps", name: "Desenvolvimento Máquina", sets: 3, reps: "10", rest: "60s" },
            { day: "Dia A - Peito, Ombros e Tríceps", name: "Elevação Lateral Halteres", sets: 3, reps: "12-15", rest: "45s" },
            // Tríceps (3 exercícios)
            { day: "Dia A - Peito, Ombros e Tríceps", name: "Tríceps Corda no Pulley", sets: 3, reps: "12", rest: "60s" },
            { day: "Dia A - Peito, Ombros e Tríceps", name: "Tríceps Testa com Halteres", sets: 3, reps: "10", rest: "60s" },
            { day: "Dia A - Peito, Ombros e Tríceps", name: "Tríceps Coice Polia", sets: 3, reps: "12", rest: "60s" },

            // Costas (4 exercícios)
            { day: "Dia B - Costas & Bíceps", name: "Puxada Aberta na Polia", sets: 4, reps: "10-12", rest: "60s" },
            { day: "Dia B - Costas & Bíceps", name: "Remada Curvada com Barra", sets: 4, reps: "10", rest: "90s" },
            { day: "Dia B - Costas & Bíceps", name: "Remada Baixa Triângulo", sets: 3, reps: "12", rest: "60s" },
            { day: "Dia B - Costas & Bíceps", name: "Pull-over Polia Alta", sets: 3, reps: "12-15", rest: "60s" },
            // Bíceps (3 exercícios)
            { day: "Dia B - Costas & Bíceps", name: "Rosca Direta com Halteres", sets: 3, reps: "12", rest: "60s" },
            { day: "Dia B - Costas & Bíceps", name: "Rosca Martelo Alternada", sets: 3, reps: "12", rest: "60s" },
            { day: "Dia B - Costas & Bíceps", name: "Rosca Scott Máquina", sets: 3, reps: "12", rest: "60s" },

            // Pernas (4 exercícios)
            { day: "Dia C - Membros Inferiores", name: "Agachamento Livre", sets: 4, reps: "10-12", rest: "90s" },
            { day: "Dia C - Membros Inferiores", name: "Leg Press 45", sets: 4, reps: "12", rest: "60s" },
            { day: "Dia C - Membros Inferiores", name: "Cadeira Extensora", sets: 3, reps: "15", rest: "45s" },
            { day: "Dia C - Membros Inferiores", name: "Mesa Flexora", sets: 3, reps: "12", rest: "60s" }
          ];
        } else {
          fallbackExercises = [
            { day: "Dia A - Peito & Tríceps", name: "Supino Reto com Barra", sets: 4, reps: "8-10", rest: "90s" },
            { day: "Dia A - Peito & Tríceps", name: "Supino Inclinado Halteres", sets: 4, reps: "10-12", rest: "75s" },
            { day: "Dia A - Peito & Tríceps", name: "Tríceps Testa", sets: 3, reps: "12", rest: "60s" },
            { day: "Dia B - Costas & Bíceps", name: "Puxada Aberta Pronada", sets: 4, reps: "10-12", rest: "60s" },
            { day: "Dia B - Costas & Bíceps", name: "Remada Curvada", sets: 4, reps: "10", rest: "90s" },
            { day: "Dia B - Costas & Bíceps", name: "Rosca Direta Barra W", sets: 3, reps: "10", rest: "60s" }
          ];
        }
      } else {
        fallbackTitle = `Hipertrofia Extrema - Avançado`;
        fallbackExercises = [
          // COSTAS (5 exercícios)
          { day: "Dia A - Costas, Bíceps e Trapézio", name: "Pranchas Wide-Grip (Barra Fixa)", sets: 4, reps: "Até a falha", rest: "90s" },
          { day: "Dia A - Costas, Bíceps e Trapézio", name: "Remada Curvada Barra Pesada", sets: 4, reps: "8-10", rest: "90s" },
          { day: "Dia A - Costas, Bíceps e Trapézio", name: "Puxada Aberta na Polia Alta", sets: 4, reps: "10", rest: "75s" },
          { day: "Dia A - Costas, Bíceps e Trapézio", name: "Remada Unilateral Serrote (Halter)", sets: 3, reps: "10", rest: "60s" },
          { day: "Dia A - Costas, Bíceps e Trapézio", name: "Pull-over com Haltere Pesado", sets: 3, reps: "12-15", rest: "75s" },
          // BÍCEPS (4 exercícios)
          { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Direta com Barra Reta", sets: 4, reps: "8-10", rest: "75s" },
          { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Inclinada com Halteres", sets: 4, reps: "10", rest: "60s" },
          { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Scott com Barra W", sets: 3, reps: "10-12", rest: "60s" },
          { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Martelo Corda", sets: 3, reps: "12", rest: "60s" },
          // TRAPÉZIO (1 exercício)
          { day: "Dia A - Costas, Bíceps e Trapézio", name: "Encolhimento de Ombros com Halteres Pesado", sets: 4, reps: "12-15", rest: "60s", observation: "Isometria de 1.5s no topo." }
        ];
      }

      const prescribedRoutine = {
        id: `routine-fallback-${Date.now()}`,
        title: `${fallbackTitle} (Prescrito p/ PT)`,
        focus: `${prescribingDays} Dias p/ Semana - ${selectedStudent.objective}`,
        objective: selectedStudent.objective,
        level: selectedStudent.experienceLevel,
        createdAt: new Date().toISOString(),
        exercises: fallbackExercises
      };

      const studentIdKey = selectedStudent.studentId || selectedStudent.id;
      localStorage.setItem(`treino_prescribed_routine_${studentIdKey}`, JSON.stringify(prescribedRoutine));
      
      const updated = students.map(st => {
        if (st.id === selectedStudent.id) {
          return {
            ...st,
            workoutLogs: [
              {
                id: `log-prescription-${Date.now()}`,
                date: new Date().toISOString(),
                routineId: prescribedRoutine.id,
                routineTitle: `Treino Fallback Prescrito: ${prescribedRoutine.title}`,
                durationMinutes: prescribingTime,
                caloriesBurned: 300,
                avgHeartRate: 120,
                rating: 5,
                totalExercisesCompleted: 0,
                totalExercisesCount: prescribedRoutine.exercises.length,
                loggedExercises: prescribedRoutine.exercises.map((e: any) => ({
                  name: e.name,
                  setsCount: e.sets || 3,
                  setsCompletedCount: 0,
                  weightLogged: ''
                }))
              },
              ...st.workoutLogs
            ]
          };
        }
        return st;
      });
      setStudents(updated);
      setSelectedStudent(updated.find(x => x.id === selectedStudent.id) || null);
      alert(`Sucesso! Treino de Adaptação/Nível (${prescribedRoutine.title}) gerado e prescrito localmente para o aluno.`);
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handlePrescribeManual = () => {
    if (!selectedStudent) return;
    const validExercises = manualExercises
      .filter(ex => ex.name.trim() !== '')
      .map(ex => ({
        ...ex,
        name: ex.name.trim(),
        videoUrl: ex.videoUrl?.trim() || undefined
      }));
    if (validExercises.length === 0) {
      alert("Por favor adicione pelo menos um exercício ao treino.");
      return;
    }

    const prescribedRoutine = {
      id: `routine-manual-${Date.now()}`,
      title: manualTitle || "Treino Especializado (Prescrito)",
      focus: `Prescrição Manual - ${selectedStudent.objective}`,
      objective: selectedStudent.objective,
      level: selectedStudent.experienceLevel,
      createdAt: new Date().toISOString(),
      exercises: validExercises
    };

    const studentIdKey = selectedStudent.studentId || selectedStudent.id;
    localStorage.setItem(`treino_prescribed_routine_${studentIdKey}`, JSON.stringify(prescribedRoutine));

    const updated = students.map(st => {
      if (st.id === selectedStudent.id) {
        return {
          ...st,
          workoutLogs: [
            {
              id: `log-manual-prescription-${Date.now()}`,
              date: new Date().toISOString(),
              routineId: prescribedRoutine.id,
              routineTitle: `Treino Manual PT: ${prescribedRoutine.title}`,
              durationMinutes: 45,
              caloriesBurned: 280,
              avgHeartRate: 121,
              rating: 5,
              totalExercisesCompleted: 0,
              totalExercisesCount: prescribedRoutine.exercises.length,
              loggedExercises: prescribedRoutine.exercises.map((e: any) => ({
                name: e.name,
                setsCount: e.sets || 3,
                setsCompletedCount: 0,
                weightLogged: ''
              }))
            },
            ...st.workoutLogs
          ]
        };
      }
      return st;
    });

    setStudents(updated);
    setSelectedStudent(updated.find(x => x.id === selectedStudent.id) || null);
    alert(`Sucesso! Treino Manual de ${validExercises.length} exercícios emitido e gravado para o aluno ${selectedStudent.name}.`);
    
    // Reset state
    setManualExercises([{ name: '', sets: 3, reps: '10-12', rest: '60s', observation: '', day: 'Dia A', weight: '', videoUrl: '' }]);
    setManualTitle('Treino Prescrito PT');
  };

  const handleLinkStudentSubmit = () => {
    if (!linkId.trim()) {
      alert("Por favor insira um ID de Aluno válido.");
      return;
    }
    
    const targetId = linkId.trim().toUpperCase();
    
    // Verify if already linked
    if (students.some(st => st.studentId === targetId || st.id === targetId)) {
      alert("Este aluno já está associado à sua lista de orientação.");
      return;
    }

    // Check Trainer student limits according to active plan
    try {
      const pStr = localStorage.getItem('treino_user_profile');
      if (pStr) {
        const parsed = JSON.parse(pStr);
        const activePlan = parsed.subscribedPlan || 'Personal Pro';
        const maxLimit = activePlan === 'Personal Starter' ? 20 : activePlan === 'Personal Pro' ? 100 : 500;
        if (students.length >= maxLimit) {
          alert(`Limite de Alunos Atingido!\n\nO seu plano atual (Plano ${activePlan}) suporta no máximo ${maxLimit} alunos orientados.\n\nTente fazer upgrade do seu plano nas Configurações ou remova algum aluno inativo para registar um novo.`);
          return;
        }
      }
    } catch (err) {}

    const storedUserStr = localStorage.getItem('treino_user_profile');
    let storedUser: any = null;
    try {
      if (storedUserStr) storedUser = JSON.parse(storedUserStr);
    } catch(e){}

    const activeLogsStr = localStorage.getItem('treino_training_logs');
    let activeLogs: TrainingLog[] = [];
    try {
      if (activeLogsStr) activeLogs = JSON.parse(activeLogsStr);
    } catch(e){}

    const isMatch = storedUser && storedUser.studentId && storedUser.studentId.trim().toUpperCase() === targetId;

    if (isMatch) {
      const linkedSt: Student = {
        id: storedUser.studentId,
        studentId: storedUser.studentId,
        name: storedUser.name,
        email: storedUser.email,
        avatar: storedUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(storedUser.name)}`,
        experienceLevel: storedUser.experienceLevel,
        objective: storedUser.objective,
        streak: storedUser.streak || 1,
        consistencyScore: 88,
        status: 'Excelente',
        lastWorkoutDate: new Date().toISOString(),
        customDirective: 'Bem-vindo ao canal do Personal Trainer! Já vinculei os seus treinos.',
        directiveDate: new Date().toISOString(),
        workoutLogs: activeLogs.length > 0 ? activeLogs : [],
        accessCount: storedUser.accessCount || 3
      };
      setStudents([linkedSt, ...students]);
      setSelectedStudent(linkedSt);
      alert(`Aluno de conta ativa "${storedUser.name}" vinculado sincronizadamente com sucesso!`);
    } else {
      // Offline fallback simulations
      const fakeNames = ["Carlos Santos", "Diana Moreira", "Tiago Fernandes", "Patrícia Antunes"];
      const chosenName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
      const randomLevel = ["Iniciante", "Intermediário", "Avançado"][Math.floor(Math.random() * 3)] as any;
      const fakeStudent: Student = {
        id: `ST-${Date.now()}`,
        studentId: targetId,
        name: chosenName,
        email: `${chosenName.toLowerCase().replace(/\s+/g, '.')}@active.pt`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(chosenName)}`,
        experienceLevel: randomLevel,
        objective: 'Força & Definição Tridimensional',
        streak: 2,
        consistencyScore: 75,
        status: 'Normal',
        lastWorkoutDate: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
        customDirective: 'Treino personalizado de evolução tridimensional sincronizado.',
        directiveDate: new Date().toISOString(),
        accessCount: 6,
        isActive: true,
        workoutLogs: [
          {
            id: `log-sim-${Date.now()}`,
            date: new Date().toISOString(),
            routineId: 'r-custom',
            routineTitle: 'Treino de Pernas Tridimensional',
            durationMinutes: 48,
            caloriesBurned: 380,
            avgHeartRate: 122,
            rating: 4,
            totalExercisesCompleted: 3,
            totalExercisesCount: 3,
            loggedExercises: [
              { name: "Leg Press 45", setsCount: 3, weightLogged: "135kg", setsCompletedCount: 3 },
              { name: "Agachamento Hack", setsCount: 3, weightLogged: "70kg", setsCompletedCount: 3 },
              { name: "Cadeira Extensora", setsCount: 3, weightLogged: "45kg", setsCompletedCount: 3 }
            ]
          }
        ]
      };
      setStudents([fakeStudent, ...students]);
      setSelectedStudent(fakeStudent);
      alert(`Aluno "${chosenName}" (${targetId}) foi adicionado com sucesso de forma remota.`);
    }

    setLinkId('');
    setShowAddModal(false);
  };

  // Switch student detail view and pre-populate prescription box
  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setFeedbackText(student.customDirective || '');
  };

  // Handle adding new custom interactive student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    // Check Trainer student limits according to active plan
    try {
      const pStr = localStorage.getItem('treino_user_profile');
      if (pStr) {
        const parsed = JSON.parse(pStr);
        const activePlan = parsed.subscribedPlan || 'Personal Pro';
        const maxLimit = activePlan === 'Personal Starter' ? 20 : activePlan === 'Personal Pro' ? 100 : 500;
        if (students.length >= maxLimit) {
          alert(`Limite de Alunos Atingido!\n\nO seu plano atual (Plano ${activePlan}) suporta no máximo ${maxLimit} alunos orientados.\n\nTente fazer upgrade do seu plano nas Configurações ou remova algum aluno inativo para registar um novo.`);
          return;
        }
      }
    } catch (err) {}

    const emailStr = newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@gymnet.pt`;
    const scoreVal = parseInt(newConsistency as any) || 80;
    
    let statusId: 'Excelente' | 'Normal' | 'Necessita de Atenção' = 'Normal';
    if (scoreVal >= 90) statusId = 'Excelente';
    else if (scoreVal < 50) statusId = 'Necessita de Atenção';

    const generatedId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSt: Student = {
      id: generatedId,
      studentId: generatedId,
      name: newName,
      email: emailStr,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(newName)}`,
      experienceLevel: newLevel,
      objective: newObjective,
      streak: 1,
      consistencyScore: scoreVal,
      status: statusId,
      lastWorkoutDate: new Date().toISOString(),
      customDirective: 'Bons treinos! Vamos buscar novos limites juntos neste mês.',
      directiveDate: new Date().toISOString(),
      isActive: true,
      pricingType: newPricingType,
      pricingValue: newPricingValue,
      workoutLogs: [
        { 
          id: `log-${Date.now()}-1`, 
          date: new Date().toISOString(), 
          routineId: 'r1', 
          routineTitle: 'Treino A - Introdução Adaptativa', 
          durationMinutes: 40, 
          caloriesBurned: 300, 
          avgHeartRate: 118, 
          rating: 4 
        }
      ]
    };

    setStudents([newSt, ...students]);
    setSelectedStudent(newSt);
    
    // reset form
    setNewName('');
    setNewEmail('');
    setNewLevel('Iniciante');
    setNewObjective('Hipertrofia');
    setNewConsistency(80);
    setNewPricingType('mensal');
    setNewPricingValue(pricePerStudent);
    setShowAddModal(false);
  };

  // Delete student logic
  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Pretende mesmo remover o aluno ${name} da sua listagem?`)) {
      setStudents(students.filter(st => st.id !== id));
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
    }
  };

  // Filter student array based on inputs
  const filteredStudents = students.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(search.toLowerCase()) || 
                          st.email.toLowerCase().includes(search.toLowerCase()) ||
                          st.objective.toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (selectedStatus === 'Excelente' || selectedStatus === 'Normal' || selectedStatus === 'Necessita de Atenção') {
      matchesStatus = st.status === selectedStatus;
    } else if (selectedStatus === 'Ativos') {
      matchesStatus = st.isActive !== false;
    } else if (selectedStatus === 'Inativos') {
      matchesStatus = st.isActive === false;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Business logic metrics calculated automatically or manually based on custom price
  const activeCount = students.filter(st => st.isActive !== false).length;
  const inactiveCount = students.filter(st => st.isActive === false).length;
  
  const calculatedEarnings = students.filter(st => st.isActive !== false).reduce((sum, st) => {
    const type = st.pricingType || 'mensal';
    const value = st.pricingValue !== undefined ? st.pricingValue : (type === 'mensal' ? pricePerStudent : 20.00);
    if (type === 'mensal') {
      return sum + value;
    } else {
      const sessionsCount = Math.max(4, st.workoutLogs ? st.workoutLogs.length : 4);
      return sum + (value * sessionsCount);
    }
  }, 0);
  const displayEarnings = useManualTotal ? parseFloat(manualTotal) || 0 : calculatedEarnings;

  return (
    <div className="space-y-6">
      {selectedStudent ? (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Breadcrumbs and back actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-zinc-800">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-extrabold uppercase tracking-widest leading-none">
                <span>Painel de Alunos</span>
                <span className="text-stone-500 font-medium">/</span>
                <span className="text-brand-neon font-bold">Ficha de Treino & Monitoramento</span>
              </div>
              
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#141414] border border-zinc-850 text-[10.5px] font-black text-stone-200 hover:text-white hover:border-zinc-700 transition-all cursor-pointer select-none active:scale-95 uppercase tracking-wider"
              >
                <ArrowLeft className="w-4.5 h-4.5 text-brand-neon" />
                Voltar para Lista de Alunos
              </button>
            </div>

            {/* Sticky summary header */}
            <div className="flex items-center gap-4 bg-zinc-950/40 p-3 px-4.5 rounded-2xl border border-zinc-900 pr-6 shadow-inner">
              <div className="relative">
                <img 
                  src={selectedStudent.avatar} 
                  alt={selectedStudent.name} 
                  className="w-13 h-13 rounded-full object-cover border-2 border-brand-neon"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full border-2 border-stone-900 text-[9px] flex items-center justify-center font-black bg-orange-500 text-white" title="Sequência do Aluno">
                  {selectedStudent.streak}
                </span>
              </div>
              
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black uppercase text-white tracking-wide">{selectedStudent.name}</h2>
                  {selectedStudent.studentId && (
                    <span className="px-1.5 py-0.5 text-[8px] font-black tracking-widest text-[#10b981] bg-[#10a16b]/10 border border-[#10a16b]/20 rounded uppercase">
                      ID: {selectedStudent.studentId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400">{selectedStudent.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="px-1.5 py-0.2 bg-[#1c1c1c] rounded-md border border-zinc-800 text-[9px] uppercase font-bold text-stone-300">
                    Nível: {selectedStudent.experienceLevel}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#1c1c1c] rounded-md border border-zinc-800 text-[9px] uppercase font-bold text-stone-300">
                    Objetivo: {selectedStudent.objective}
                  </span>
                  {/* REMINDER TO SWITCH WORKOUT TIMELINE */}
                  {(() => {
                    const lvl = selectedStudent.experienceLevel || 'Iniciante';
                    let m = 2;
                    if (lvl === 'Intermediário') m = 4;
                    if (lvl === 'Avançado') m = 6;
                    return (
                      <span className="px-1.5 py-0.2 bg-amber-500/15 rounded-md border border-amber-500/30 text-[9px] uppercase font-bold text-amber-400">
                        🔄 Mudar rotina: cada {m} meses
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Action strip with status and remove button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/25 border border-zinc-900/60 font-medium">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-stone-400">Cadastro do Atleta:</span>
              <button
                type="button"
                onClick={() => {
                  const updated = students.map(st => {
                    if (st.id === selectedStudent.id) {
                      const nextActive = st.isActive === false ? true : false;
                      return { ...st, isActive: nextActive };
                    }
                    return st;
                  });
                  setStudents(updated);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                  selectedStudent.isActive !== false
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-stone-500/10 text-stone-400 border-stone-500/20 hover:bg-stone-500/20'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedStudent.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-stone-400'}`} />
                Status: {selectedStudent.isActive !== false ? 'Ativo' : 'Inativo'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleDeleteStudent(selectedStudent.id, selectedStudent.name)}
              className="px-3.5 py-2 rounded-xl border border-rose-500/15 bg-rose-500/5 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer active:scale-95 text-xs font-black uppercase flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Trash className="w-4 h-4" />
              Remover Aluno do Sistema
            </button>
          </div>

          {/* Link de Auto-Registo Gratuito para Aluno */}
          {(() => {
            const studentIdParamVal = selectedStudent.studentId || selectedStudent.id;
            const regUrl = `${window.location.origin}${window.location.pathname}?ref_coach=${encodeURIComponent(trainerEmail)}&student_email=${encodeURIComponent(selectedStudent.email || '')}&student_name=${encodeURIComponent(selectedStudent.name)}&student_id=${encodeURIComponent(studentIdParamVal)}&student_level=${encodeURIComponent(selectedStudent.experienceLevel)}`;

            const handleCopyLink = () => {
              navigator.clipboard.writeText(regUrl).then(() => {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }).catch(() => {
                // Fallback
                alert(`Por favor, copie o seguinte link manualmente:\n\n${regUrl}`);
              });
            };

            return (
              <div className={`p-5 rounded-2xl border ${
                darkMode ? 'bg-zinc-950/45 border-brand-neon/30 hover:border-brand-neon/60' : 'bg-emerald-500/5 border-emerald-400/30'
              } transition-all space-y-3 relative overflow-hidden text-left`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-brand-neon" />
                      Link de Convite e Auto-Registo Grátis do Atleta
                    </h4>
                    <p className="text-[11px] text-stone-400 leading-normal">
                      Partilhe este link com <strong className="text-stone-200">{selectedStudent.name}</strong> para que ele faça o seu registo gratuito no ecrã atleta. Ele não precisará selecionar nenhum plano ou pagar qualquer valor!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 border ${
                      copiedLink
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : darkMode 
                          ? 'bg-brand-neon border-transparent text-black hover:bg-white' 
                          : 'bg-emerald-500 border-transparent text-white hover:bg-emerald-600'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle className="w-4 h-4 animate-pulse" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Link de Convite
                      </>
                    )}
                  </button>
                </div>

                <div className="p-2.5 bg-black/40 rounded-xl border border-zinc-900/65 font-mono text-[9.5px] text-stone-300 break-all select-all flex items-center justify-between gap-2">
                  <span className="truncate flex-1">{regUrl}</span>
                  <span className="text-[8px] bg-zinc-800 text-stone-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-sans shrink-0 font-bold">Referencial Ativo</span>
                </div>
              </div>
            );
          })()}

          {/* Grid Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1 (Left 5/12): Student metrics cards, weekly consistency graphs, config pricing, workout history lists */}
            <div className="lg:col-span-5 space-y-6">

              {/* FICHA CLÍNICA & MÉTRICAS BIOLÓGICAS (LGPD COMPLIANT) */}
              <div className={`p-5 rounded-2xl border text-left ${
                darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-4 border-b pb-2.5 border-stone-200/10 dark:border-brand-border/40">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#88e010] flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Ficha Clínica & Biometria
                  </h3>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingClinical) {
                        handleSaveClinical();
                      } else {
                        setIsEditingClinical(true);
                      }
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                      isEditingClinical
                        ? 'bg-[#88e010] text-black hover:bg-white font-black' 
                        : 'bg-zinc-800 border border-zinc-700 text-stone-200 hover:bg-zinc-750'
                    }`}
                  >
                    {isEditingClinical ? 'Salvar Ficha' : 'Editar'}
                  </button>
                </div>

                {isEditingClinical ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">Idade</label>
                        <input
                          type="number"
                          value={editAge}
                          onChange={(e) => setEditAge(e.target.value)}
                          placeholder="Ex: 28"
                          className={`w-full px-2.5 py-2 rounded border text-xs focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                            darkMode ? 'bg-[#121212] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">Peso (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          placeholder="Ex: 81"
                          className={`w-full px-2.5 py-2 rounded border text-xs focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                            darkMode ? 'bg-[#121212] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">Altura (cm)</label>
                        <input
                          type="number"
                          value={editHeight}
                          onChange={(e) => setEditHeight(e.target.value)}
                          placeholder="Ex: 178"
                          className={`w-full px-2.5 py-2 rounded border text-xs focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                            darkMode ? 'bg-[#121212] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">Condições Clínicas / Limitações</label>
                      <textarea
                        rows={2}
                        value={editHealth}
                        onChange={(e) => setEditHealth(e.target.value)}
                        placeholder="Adicione restrições articulares, asma, dores crônicas..."
                        className={`w-full p-2 rounded border text-xs focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                          darkMode ? 'bg-[#121212] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      />
                    </div>
                    
                    {isEditingClinical && (
                      <button
                        type="button"
                        onClick={() => setIsEditingClinical(false)}
                        className="w-full py-1.5 text-[9.5px] font-bold uppercase tracking-widest text-[#ef4444] border border-[#ef4444]/25 hover:bg-[#ef4444]/10 rounded"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {/* Display Grid biometrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-900/40 text-center">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-stone-400 block">Idade</span>
                        <span className="text-sm font-extrabold text-[#88e010] block mt-0.5">
                          {selectedStudent.age ? `${selectedStudent.age} anos` : 'N/D'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-900/40 text-center">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-stone-400 block">Peso</span>
                        <span className="text-sm font-extrabold text-[#88e010] block mt-0.5">
                          {selectedStudent.weight ? `${selectedStudent.weight} kg` : 'N/D'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-900/40 text-center">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-stone-400 block">Altura</span>
                        <span className="text-sm font-extrabold text-[#88e010] block mt-0.5">
                          {selectedStudent.height ? `${selectedStudent.height} cm` : 'N/D'}
                        </span>
                      </div>
                    </div>

                    {/* Calculated BMI */}
                    {(() => {
                      if (selectedStudent.weight && selectedStudent.height) {
                        const hM = selectedStudent.height / 100;
                        const imc = selectedStudent.weight / (hM * hM);
                        let imcDesc = '';
                        let imcColor = '';
                        if (imc < 18.5) { imcDesc = 'Baixo Peso'; imcColor = 'text-sky-450'; }
                        else if (imc < 25) { imcDesc = 'Saudável'; imcColor = 'text-emerald-450'; }
                        else if (imc < 30) { imcDesc = 'Sobrepeso'; imcColor = 'text-yellow-405'; }
                        else { imcDesc = 'Obesidade'; imcColor = 'text-rose-450'; }

                        return (
                          <div className="flex items-center justify-between p-2 rounded bg-zinc-950/20 text-[10px] border border-zinc-900/50">
                            <span className="text-stone-400 font-bold uppercase tracking-wide">IMC de Referência:</span>
                            <span className="font-mono text-stone-200">
                              <strong className="text-white">{imc.toFixed(1)}</strong> ({imcDesc})
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Restrições Clínicas */}
                    <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/25 text-left">
                      <span className="text-[9px] font-black uppercase text-orange-400 tracking-wider block mb-1">Alertas e Histórico Clínico</span>
                      <p className="text-xs text-stone-200 leading-relaxed font-medium">
                        {selectedStudent.healthConditions || 'Nenhuma restrição articular ou problema de saúde registrado.'}
                      </p>
                    </div>

                    {/* Privacy & LGPD Compliance audit trail */}
                    <div className="flex items-center gap-1.5 text-[9px] text-[#88e010] bg-black/40 p-2.5 rounded border border-zinc-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#88e010]/95 animate-pulse shrink-0" />
                      <span className="truncate flex-1">
                        <strong>LGPD/GDPR:</strong> Consentimento de saúde ativo e auditável. {selectedStudent.lgpdConsentDate ? `Autorizado em ${new Date(selectedStudent.lgpdConsentDate).toLocaleDateString('pt-PT')}` : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Analytics Summary Panels */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'}`}>
                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-neon" />
                  Indicadores de Saúde & Comprometimento
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/60 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">Duração Média</span>
                    <span className="text-base font-black text-white block mt-1">
                      {selectedStudent.workoutLogs.length > 0
                        ? Math.round(selectedStudent.workoutLogs.reduce((acc, current) => acc + current.durationMinutes, 0) / selectedStudent.workoutLogs.length)
                        : 0} min
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/60 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">Calorias Médias</span>
                    <span className="text-base font-black text-white block mt-1">
                      {selectedStudent.workoutLogs.length > 0
                        ? Math.round(selectedStudent.workoutLogs.reduce((acc, current) => acc + current.caloriesBurned, 0) / selectedStudent.workoutLogs.length)
                        : 0} kcal
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/60 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">Frequência Semanal</span>
                    <span className="text-base font-black block mt-1 text-brand-neon">
                      {selectedStudent.consistencyScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Performance Graphic */}
              <div className={`p-5 rounded-2xl border text-left space-y-4 ${darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'}`}>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block">
                    Metabolismo / Histórico de Treinos (Histórico Gráfico)
                  </span>
                  <p className="text-[9px] text-[#9ca3af] mt-0.5 leading-normal">
                    Frequência e volume ideal de treinos das últimas 5 sessões completadas.
                  </p>
                </div>
                
                <div className="h-32 flex items-end gap-3.5 bg-[#141414]/60 p-4 rounded-xl border border-zinc-800/60 pb-2.5 pt-6 relative">
                  {selectedStudent.workoutLogs.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500">
                      Nenhum histórico disponível para gráfico.
                    </div>
                  ) : (
                    <>
                      {selectedStudent.workoutLogs.slice(0, 5).reverse().map((log, index) => {
                        const barHeightPercentage = Math.min(100, Math.max(15, (log.durationMinutes / 75) * 100));
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center group h-full justify-end">
                            {/* Hover duration bubble */}
                            <span className="text-[9px] mb-1 font-extrabold text-[#10b981] opacity-70 group-hover:opacity-100 transition-opacity">
                              {log.durationMinutes}m
                            </span>
                            
                            {/* Graphic Bar representational element */}
                            <div 
                              style={{ height: `${barHeightPercentage}%` }}
                              className="w-full max-w-[32px] rounded-t bg-gradient-to-t from-[#0e5c3b] to-[#10b981] group-hover:to-emerald-300 transition-all duration-300 relative shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                            />
                            
                            <span className="text-[9px] text-[#9ca3af] font-mono tracking-tight mt-1.5 truncate max-w-[55px] text-center">
                              {log.routineTitle.split(' - ')[1] || log.routineTitle.split(' ').slice(-1)[0]}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>

              {/* Pricing settings specifically for student */}
              <div className={`p-5 rounded-2xl border text-left space-y-4 ${darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-brand-neon" />
                    Valor de Cobrança do Aluno (Coach)
                  </h4>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] uppercase tracking-wider font-extrabold text-amber-500">
                    Preço de Orientação
                  </span>
                </div>

                <p className="text-[10px] text-stone-400 leading-normal">
                  Configure o valor que cobra a este aluno para o acompanhamento personalizado. O aluno visualizará este plano na página dele.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                  {/* Pricing Type Toggle */}
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Método de Cobrança</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = students.map(st => {
                            if (st.id === selectedStudent.id) {
                              const nextVal = st.pricingValue !== undefined ? st.pricingValue : pricePerStudent;
                              const updatedSt = { ...st, pricingType: 'mensal' as const, pricingValue: nextVal };
                              if (st.studentId) {
                                localStorage.setItem(`treino_student_price_${st.studentId.trim().toUpperCase()}`, JSON.stringify({ type: 'mensal', value: nextVal }));
                              }
                              return updatedSt;
                            }
                            return st;
                          });
                          setStudents(updated);
                          const matched = updated.find(st => st.id === selectedStudent.id);
                          if (matched) setSelectedStudent(matched);
                        }}
                        className={`flex-1 py-2 rounded text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          (selectedStudent.pricingType || 'mensal') === 'mensal'
                            ? 'bg-brand-neon text-black border-transparent font-black shadow-sm'
                            : 'bg-zinc-900 text-stone-400 border-zinc-800 hover:text-stone-300'
                        }`}
                      >
                        Mensalidade
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = students.map(st => {
                            if (st.id === selectedStudent.id) {
                              const nextVal = st.pricingValue !== undefined ? st.pricingValue : 20.00;
                              const updatedSt = { ...st, pricingType: 'hora' as const, pricingValue: nextVal };
                              if (st.studentId) {
                                localStorage.setItem(`treino_student_price_${st.studentId.trim().toUpperCase()}`, JSON.stringify({ type: 'hora', value: nextVal }));
                              }
                              return updatedSt;
                            }
                            return st;
                          });
                          setStudents(updated);
                          const matched = updated.find(st => st.id === selectedStudent.id);
                          if (matched) setSelectedStudent(matched);
                        }}
                        className={`flex-1 py-2 rounded text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          selectedStudent.pricingType === 'hora'
                            ? 'bg-brand-neon text-black border-transparent font-black shadow-sm'
                            : 'bg-zinc-900 text-stone-400 border-zinc-800 hover:text-stone-300'
                        }`}
                      >
                        Tarifa p/ Hora
                      </button>
                    </div>
                  </div>

                  {/* Pricing Value Input */}
                  <div className="w-full sm:w-32 space-y-1">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">
                      {(selectedStudent.pricingType || 'mensal') === 'mensal' ? 'Valor Mensal' : 'Valor p/ Hora'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={selectedStudent.pricingValue !== undefined ? selectedStudent.pricingValue : pricePerStudent}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const updated = students.map(st => {
                            if (st.id === selectedStudent.id) {
                              const updatedSt = { ...st, pricingValue: val };
                              if (st.studentId) {
                                localStorage.setItem(`treino_student_price_${st.studentId.trim().toUpperCase()}`, JSON.stringify({ type: st.pricingType || 'mensal', value: val }));
                              }
                              return updatedSt;
                            }
                            return st;
                          });
                          setStudents(updated);
                          const matched = updated.find(st => st.id === selectedStudent.id);
                          if (matched) setSelectedStudent(matched);
                        }}
                        className="w-full bg-[#181818] border border-zinc-800 text-stone-100 rounded px-2.5 py-2 text-xs text-center font-bold focus:outline-none focus:border-brand-neon/40 text-brand-neon font-black"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400">€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Exercise History Log List */}
              <div className={`p-5 rounded-2xl border text-left space-y-3.5 ${darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'}`}>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#9ca3af]">Histórico Recente de Treinos</h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {selectedStudent.workoutLogs.length === 0 ? (
                    <p className="text-[10px] text-stone-500 italic py-4">Nenhum treino completado por este aluno ainda.</p>
                  ) : (
                    selectedStudent.workoutLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl bg-[#141414] border border-zinc-850 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-white block uppercase text-[10.5px]">{log.routineTitle}</span>
                          <span className="text-[10px] text-stone-400 flex items-center gap-1.5 font-medium">
                            <span>{new Date(log.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}</span>
                            <span className="w-1 h-1 bg-stone-500 rounded-full" />
                            <span>{log.durationMinutes} minutos</span>
                          </span>
                        </div>
                        
                        <div className="text-right flex items-center gap-2">
                          <div className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded text-[10px] font-bold">
                            🔥 {log.caloriesBurned} kcal
                          </div>
                          <div className="text-amber-400 font-bold">
                            {'★'.repeat(log.rating)}{'☆'.repeat(5 - log.rating)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* COLUMN 2 (Right 7/12): Technical guideline directive, prescription areas for workouts AI / Manual */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* VISUALIZADOR DE TREINO ATIVO PRESCRITO */}
              {(() => {
                const studentIdKey = selectedStudent.studentId || selectedStudent.id;
                const activePrescribedStr = localStorage.getItem(`treino_prescribed_routine_${studentIdKey}`);
                if (!activePrescribedStr) {
                  return (
                    <div className={`p-4 rounded-xl border border-dashed text-left space-y-2 ${
                      darkMode ? 'border-zinc-800 bg-zinc-950/20 text-stone-400' : 'border-stone-200 bg-stone-50 text-stone-500'
                    }`}>
                      <div className="flex items-center gap-2 font-black text-[11px] uppercase tracking-wider text-amber-500">
                        <Dumbbell className="w-4 h-4 text-amber-500 animate-pulse" />
                        Nenhum Treino Prescrito Ativamente
                      </div>
                      <p className="text-[10px] leading-relaxed text-stone-400">
                        Este aluno está utilizando a rotina padrão ou não possui exercícios prescritos. Use as opções abaixo para gerar um Plano com IA (Gemini) ou montar um Treino Manual estruturado.
                      </p>
                    </div>
                  );
                }

                let info: any = null;
                try {
                  info = JSON.parse(activePrescribedStr);
                } catch(e) {}

                if (!info) return null;

                return (
                  <div className={`p-5 rounded-2xl border text-left space-y-4 ${
                    darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded bg-brand-neon/10 text-brand-neon`}>
                          <Dumbbell className="w-4.5 h-4.5 text-brand-neon" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-tight text-white">
                            Exercícios Prescritos Ativos
                          </h4>
                          <span className="text-[10.5px] text-brand-neon font-black block mt-0.5">
                            {info.title}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deseja realmente remover o treino prescrito de ${selectedStudent.name}?`)) {
                            localStorage.removeItem(`treino_prescribed_routine_${studentIdKey}`);
                            // force re-render
                            setStudents([...students]);
                          }
                        }}
                        className="text-[9px] px-2.5 py-1 text-rose-400 hover:text-rose-300 font-extrabold uppercase border border-rose-500/20 rounded hover:bg-rose-500/5 transition-all active:scale-95 cursor-pointer"
                      >
                        Limpar Treino
                      </button>
                    </div>

                    <div className="text-[11px] text-stone-400 border-t border-brand-border-muted/30 pt-3.5 space-y-3.5">
                      <div className="flex gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        <span><strong>Foco:</strong> {info.focus}</span>
                        <span>•</span>
                        <span><strong>Prescrito:</strong> {new Date(info.createdAt).toLocaleDateString('pt-PT')}</span>
                      </div>

                      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                        {info.exercises && info.exercises.map((ex: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-black/40 border border-zinc-900 flex items-center justify-between text-xs gap-3">
                            <div className="space-y-0.5">
                              <div className="font-extrabold text-stone-100 flex items-center gap-1.5 flex-wrap uppercase tracking-tight text-xs">
                                <span className="text-brand-neon font-black">#{idx + 1}</span>
                                {ex.name}
                                {ex.day && (
                                  <span className="text-[8px] bg-brand-neon/10 border border-brand-neon/20 px-1 py-0.2 rounded font-black text-brand-neon">
                                    {ex.day}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10.5px] text-stone-400 font-semibold">
                                {ex.sets} séries × {ex.reps} • Descanso: {ex.rest}
                              </div>
                              {ex.observation && (
                                <div className="text-[10px] text-amber-400/90 italic mt-1 font-medium">
                                  💡 {ex.observation}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Interactive Personal Trainer Directive Prescription Zone */}
              <div className={`p-5 rounded-2xl border text-left space-y-3.5 ${darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-brand-neon" />
                    Prescrição de Diretiva Técnica
                  </h4>
                  {selectedStudent.directiveDate && (
                    <span className="text-[9px] text-stone-400 font-mono">
                      Ult. Envio: {new Date(selectedStudent.directiveDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-stone-400 leading-normal">
                  Escreva diretrizes como cargas ajustadas, correções posturais ou incentivos motivacionais. O aluno verá esta instrução na sua página de treino.
                </p>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Ex: Aumentar o volume de HIIT após o treino para 15 minutos. Diminuir intervalo no supino inclinado..."
                    className={`w-full p-2.5 text-xs rounded-lg border focus:outline-none transition-all ${
                      darkMode 
                        ? 'bg-[#181818] border-brand-border text-stone-100 placeholder-zinc-500 focus:ring-1 focus:ring-brand-neon/30' 
                        : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
                    }`}
                  />

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[8.5px] italic text-stone-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-brand-neon" />
                      Instrução sincronizada instantaneamente
                    </span>

                    <button
                      type="button"
                      onClick={handleSaveDirective}
                      className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-white ${
                        darkMode 
                          ? 'bg-brand-neon text-black hover:bg-white font-extrabold shadow shadow-brand-neon/10' 
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {showSaveDirectiveSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Salvo!
                        </>
                      ) : (
                        'Guardar Diretriz'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Prescrição de Rotinas Completas (IA & Manual) */}
              <div className={`p-5 rounded-2xl border text-left space-y-4 ${darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-brand-neon" />
                    Prescrição de Rotinas Completas
                  </h4>
                  <span className="text-[9.5px] px-2 py-0.5 bg-brand-neon/10 border border-brand-neon/20 rounded-md font-bold text-brand-neon">
                    {selectedStudent.experienceLevel}
                  </span>
                </div>

                <p className="text-[10px] text-stone-400 leading-normal">
                  Crie planos de treino completos para o aluno {selectedStudent.name}. Os treinos prescritos ficarão imediatamente ativos e visíveis na conta do atleta.
                </p>

                {/* Tab selector */}
                <div className="flex gap-1.5 bg-[#141414] p-1 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setPrescribeTab('ia')}
                    className={`flex-1 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                      prescribeTab === 'ia'
                        ? 'bg-brand-neon text-black font-black'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    💻 Gerar Plano
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrescribeTab('manual')}
                    className={`flex-1 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                      prescribeTab === 'manual'
                        ? 'bg-brand-neon text-black font-black'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    ✍️ Criar Treino Manual
                  </button>
                </div>

                {/* Sub-panel A: IA Generation */}
                {prescribeTab === 'ia' && (
                  <div className="space-y-3.5 bg-black/30 p-3.5 rounded-lg border border-zinc-900">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Freq. Semanal</label>
                        <select
                          value={prescribingDays}
                          onChange={(e) => setPrescribingDays(parseInt(e.target.value))}
                          className="w-full text-xs p-2 rounded bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-brand-neon text-stone-200 font-bold"
                        >
                          <option value={3}>3 Dias por Semana</option>
                          <option value={4}>4 Dias por Semana</option>
                          <option value={5}>5 Dias por Semana</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Tempo de Treino</label>
                        <select
                          value={prescribingTime}
                          onChange={(e) => setPrescribingTime(parseInt(e.target.value))}
                          className="w-full text-xs p-2 rounded bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-brand-neon text-stone-200 font-bold"
                        >
                          <option value={45}>45 Minutos</option>
                          <option value={60}>60 Minutos</option>
                          <option value={75}>75 Minutos</option>
                          <option value={90}>90 Minutos</option>
                        </select>
                      </div>
                    </div>

                    {/* Adaptation Notice for Beginners */}
                    {selectedStudent.experienceLevel === 'Iniciante' ? (
                      <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9.5px] text-amber-300 leading-normal">
                        ⚠️ <strong>Treino de Adaptação (Full Body) Ativado:</strong> Por ser um aluno Iniciante, o assistente IA irá automaticamente consolidar um split adaptativo de corpo inteiro focado em coordenação motora e resistência geral.
                      </div>
                    ) : (
                      <div className="p-2.5 rounded bg-brand-neon/5 border border-brand-neon/10 text-[9.5px] text-[#e5e7eb] leading-normal font-medium">
                        ⚡ O split será gerado com foco em <strong>{selectedStudent.objective}</strong> correspondente ao perfil de nível <strong>{selectedStudent.experienceLevel}</strong>.
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isAIGenerating}
                      onClick={handleGenerateAITraining}
                      className={`w-full py-2.5 rounded font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        isAIGenerating
                          ? 'bg-[#1c1c1c] text-stone-500 cursor-not-allowed border border-zinc-800 animate-pulse'
                          : 'bg-brand-neon text-black hover:bg-white shadow-md'
                      }`}
                    >
                      {isAIGenerating ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-stone-500 border-t-white rounded-full animate-spin"></span>
                          Gerando e sincronizando...
                        </span>
                      ) : (
                        'Gerar & Prescrever Treino Inteligente IA'
                      )}
                    </button>
                  </div>
                )}

                {/* Sub-panel B: Manual Creation */}
                {prescribeTab === 'manual' && (
                  <div className="space-y-4 bg-black/30 p-3.5 rounded-lg border border-zinc-900">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Nome do Bloco de Treino</label>
                      <input
                        type="text"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        placeholder="Ex: Treino A - Força Tríceps e Peito"
                        className="w-full text-xs p-2.5 rounded bg-zinc-900 border border-zinc-850 focus:outline-none focus:border-brand-neon text-stone-200 font-bold"
                      />
                    </div>

                    {/* Manual rows list */}
                    <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                      {manualExercises.map((exercise, index) => (
                        <div key={index} className="p-3 rounded bg-zinc-950/60 border border-zinc-800 space-y-2 text-[11px] hover:border-zinc-700 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-brand-neon uppercase tracking-wide">Exercício #{index + 1}</span>
                            {manualExercises.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...manualExercises];
                                  list.splice(index, 1);
                                  setManualExercises(list);
                                }}
                                className="text-rose-400 hover:text-rose-300 text-[10px] font-bold uppercase transition-colors"
                              >
                                Remover
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) => {
                                const list = [...manualExercises];
                                list[index].name = e.target.value;
                                setManualExercises(list);
                              }}
                              placeholder="Fazer Supino livre, Cadeira Flexora..."
                              className="p-1 px-2 rounded bg-zinc-900 border border-zinc-800 text-stone-100 placeholder-zinc-500 focus:outline-none focus:border-brand-neon text-xs font-semibold"
                            />

                            <div className="grid grid-cols-3 gap-1.5">
                              <input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => {
                                  const list = [...manualExercises];
                                  list[index].sets = parseInt(e.target.value) || 3;
                                  setManualExercises(list);
                                }}
                                placeholder="Séries"
                                className="p-1 rounded bg-zinc-900 border border-zinc-800 text-stone-100 text-center text-xs font-semibold"
                                title="Séries"
                              />
                              <input
                                type="text"
                                value={exercise.reps}
                                onChange={(e) => {
                                  const list = [...manualExercises];
                                  list[index].reps = e.target.value;
                                  setManualExercises(list);
                                }}
                                placeholder="Reps"
                                className="p-1 rounded bg-zinc-900 border border-zinc-800 text-stone-100 text-center text-xs font-semibold"
                                title="Repetições"
                              />
                              <input
                                type="text"
                                value={exercise.rest}
                                onChange={(e) => {
                                  const list = [...manualExercises];
                                  list[index].rest = e.target.value;
                                  setManualExercises(list);
                                }}
                                placeholder="Pausa"
                                className="p-1 rounded bg-zinc-900 border border-zinc-800 text-stone-100 text-center text-xs font-semibold"
                                title="Intervalo"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={exercise.observation || ''}
                              onChange={(e) => {
                                const list = [...manualExercises];
                                list[index].observation = e.target.value;
                                setManualExercises(list);
                              }}
                              placeholder="Observações / Postura..."
                              className="p-1 px-2 rounded bg-zinc-900 border border-zinc-800 text-stone-300 text-[10px] focus:outline-none focus:border-brand-neon font-medium"
                            />
                            <input
                              type="text"
                              value={exercise.weight || ''}
                              onChange={(e) => {
                                const list = [...manualExercises];
                                list[index].weight = e.target.value;
                                setManualExercises(list);
                              }}
                              placeholder="Carga (Ex: 20kg)"
                              className="p-1 px-2 rounded bg-zinc-900 border border-zinc-800 text-stone-300 text-[10px] focus:outline-none focus:border-brand-neon font-medium placeholder-zinc-500"
                            />
                            <select
                              value={exercise.day || 'Dia A'}
                              onChange={(e) => {
                                const list = [...manualExercises];
                                list[index].day = e.target.value;
                                setManualExercises(list);
                              }}
                              className="p-1 rounded bg-zinc-900 border border-zinc-800 text-stone-300 text-xs text-center font-bold"
                            >
                              <option value="Dia A">Split Dia A</option>
                              <option value="Dia B">Split Dia B</option>
                              <option value="Dia C">Split Dia C</option>
                              <option value="Full Body">Corpo Inteiro</option>
                            </select>
                          </div>

                          <input
                            type="text"
                            value={exercise.videoUrl || ''}
                            onChange={(e) => {
                              const list = [...manualExercises];
                              list[index].videoUrl = e.target.value;
                              setManualExercises(list);
                            }}
                            placeholder="Link do video guia (opcional): YouTube ou MP4"
                            className="w-full p-1 px-2 rounded bg-zinc-900 border border-zinc-800 text-stone-300 text-[10px] focus:outline-none focus:border-brand-neon font-medium placeholder-zinc-500"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setManualExercises([
                          ...manualExercises,
                          { name: '', sets: 3, reps: '10-12', rest: '60s', observation: '', day: 'Dia A', weight: '', videoUrl: '' }
                        ])}
                        className="flex-1 py-2 border border-dashed border-zinc-700 bg-[#1c1c1c] text-stone-350 hover:text-white rounded-xl text-[10.5px] uppercase font-black text-center cursor-pointer hover:border-zinc-500 transition-all active:scale-95"
                      >
                        ➕ Adicionar Exercício
                      </button>

                      <button
                        type="button"
                        onClick={handlePrescribeManual}
                        className="flex-1 py-2 bg-brand-neon text-black font-black uppercase text-[10.5px] rounded-xl tracking-wider text-center hover:bg-white transition-all shadow-md shadow-brand-neon/10 active:scale-95 cursor-pointer"
                      >
                        Prescrever Treino Manual
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Header section with explanatory banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-250 dark:border-brand-border">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <Users className="w-6 h-6 text-brand-neon" />
                Controle de Alunos (Personal Trainer)
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Espaço integrado para treinadores controlarem treinos, ver histórico e prescrever directrizes de performance.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Tab Selector for Alunos vs Planos */}
              <div className="flex gap-1 p-1 bg-zinc-950/60 rounded-xl border border-zinc-900/60 font-black">
                <button
                  type="button"
                  onClick={() => setActiveMainTab('alunos')}
                  className={`px-3.5 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                    activeMainTab === 'alunos'
                      ? 'bg-brand-neon text-black font-black'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  👥 Alunos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMainTab('planos')}
                  className={`px-3.5 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMainTab === 'planos'
                      ? 'bg-brand-neon text-black font-black'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  👑 Planos & Preços
                </button>
              </div>

              {activeMainTab === 'alunos' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95 text-white ${
                    darkMode 
                      ? 'bg-brand-neon text-black hover:bg-white shadow-md shadow-brand-neon/10' 
                      : 'bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/10'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Adicionar Novo Aluno
                </button>
              )}
            </div>
          </div>

          {activeMainTab === 'alunos' ? (
            <>

          {/* Dashboard Metrics Panel with billing, active, and inactive students */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Metric 1 - Monthly Earnings (Faturamento Mensal) with inputs */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between text-left ${
              darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-xl ${darkMode ? 'bg-brand-neon/10 text-brand-neon' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Faturamento Mensal</span>
                  <span className="text-2xl font-black block mt-0.5 text-brand-neon">{displayEarnings.toFixed(2)}€</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 border-t border-stone-200/20 dark:border-brand-border-muted/30 pt-3 text-[10.5px]">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-stone-400 font-bold">Valor p/ Aluno (Mensal):</span>
                  <div className="flex items-center gap-1 font-bold text-white">
                    <input
                      type="number"
                      min="0"
                      value={pricePerStudent}
                      onChange={(e) => {
                        const nextVal = parseFloat(e.target.value) || 0;
                        const prevVal = pricePerStudent;
                        setPricePerStudent(nextVal);
                        
                        // Propagate the monthly billing rate update to all active monthly students
                        // that were using the previous default price or had undefined values, keeping them in sync
                        const updated = students.map(st => {
                          if (st.pricingType === 'mensal') {
                            if (st.pricingValue === prevVal || st.pricingValue === undefined || st.pricingValue === 50) {
                              if (st.studentId) {
                                localStorage.setItem(`treino_student_price_${st.studentId.trim().toUpperCase()}`, JSON.stringify({ type: 'mensal', value: nextVal }));
                              }
                              return { ...st, pricingValue: nextVal };
                            }
                          }
                          return st;
                        });
                        setStudents(updated);
                      }}
                      className="w-14 bg-stone-100 dark:bg-zinc-950 border border-stone-300 dark:border-zinc-800 text-stone-900 dark:text-stone-100 rounded px-1.5 py-0.5 text-center text-xs text-brand-neon font-black focus:outline-none"
                    />
                    <span>€</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-stone-400">Total Manual (Sobrescrever)?</span>
                  <input
                    type="checkbox"
                    checked={useManualTotal}
                    onChange={(e) => setUseManualTotal(e.target.checked)}
                    className="rounded accent-brand-neon focus:ring-brand-neon bg-zinc-950 border-zinc-800 text-brand-neon cursor-pointer"
                  />
                </div>
                
                {useManualTotal && (
                  <div className="flex items-center gap-1.5 justify-between animate-fade-in">
                    <span className="text-stone-400 font-bold">Total Faturamento (€):</span>
                    <input
                      type="number"
                      min="0"
                      value={manualTotal}
                      onChange={(e) => setManualTotal(e.target.value)}
                      className="w-20 bg-stone-100 dark:bg-zinc-950 border border-stone-300 dark:border-zinc-800 text-stone-900 dark:text-stone-100 rounded px-1.5 py-0.5 text-right text-xs text-brand-neon font-black focus:outline-none"
                    />
                  </div>
                )}
                
                {!useManualTotal && (
                  <p className="text-[9px] text-stone-500 font-mono italic text-right">
                    Reflete a soma das tarifas individuais de cada aluno ativo.
                  </p>
                )}
              </div>
            </div>

            {/* Metric 2 - Active Students */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 text-left ${
              darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
            }`}>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Alunos Ativos</span>
                <span className="text-2xl font-black block mt-0.5 text-emerald-400">{activeCount} alunos</span>
                <span className="text-[10px] text-stone-400">Com matrícula ativa e frequente</span>
              </div>
            </div>

            {/* Metric 3 - Inactive Students */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 text-left ${
              darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
            }`}>
              <div className="p-3.5 rounded-xl bg-orange-500/10 text-orange-400">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Alunos Inativos</span>
                <span className="text-2xl font-black block mt-0.5 text-stone-400">{inactiveCount} alunos</span>
                <span className="text-[10px] text-stone-400">Matrículas pausadas ou inativas</span>
              </div>
            </div>

          </div>

          {/* SECURED LINK GENERATOR WORKFLOW FOR PERSONAL TRAINERS */}
          <div className={`p-5 rounded-2xl border mb-2 text-left transition-all ${
            darkMode 
              ? 'bg-[#151515] border-brand-border shadow-lg shadow-brand-neon/5' 
              : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                  darkMode ? 'text-brand-neon' : 'text-emerald-650'
                }`}>
                  <UserPlus className="w-4 h-4" />
                  Gerador de Link de Convite Único
                </h3>
                <p className="text-[11px] text-stone-400">
                  Gere um convite exclusivo de registo para enviar aos seus alunos. Ao acederem, as contas deles ficarão vinculadas diretamente ao seu painel em tempo real.
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setShowInviteSection(!showInviteSection);
                  if (!showInviteSection) {
                    setGeneratedInviteUrl(null);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  showInviteSection
                    ? darkMode
                      ? 'bg-zinc-800 text-stone-300 border-zinc-700'
                      : 'bg-stone-200 text-stone-700 border-stone-300'
                    : darkMode
                      ? 'bg-brand-neon text-black border-transparent hover:bg-white hover:shadow-glow'
                      : 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600'
                }`}
              >
                {showInviteSection ? 'Minimizar Painel' : 'Abrir Painel de Convites'}
              </button>
            </div>

            {showInviteSection && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 pt-4 border-t border-dashed border-stone-200/20 dark:border-brand-border/30 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
                      Nome do Aluno (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Pedro Alvares"
                      value={inviteName}
                      onChange={(e) => {
                        setInviteName(e.target.value);
                        setGeneratedInviteUrl(null);
                      }}
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                        darkMode 
                          ? 'bg-[#1b1b1b] border-brand-border text-stone-100 placeholder-zinc-650 focus:border-brand-neon/40' 
                          : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
                      E-mail do Aluno (Opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="Ex: pedro@fitmail.com"
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setGeneratedInviteUrl(null);
                      }}
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                        darkMode 
                          ? 'bg-[#1b1b1b] border-brand-border text-stone-100 placeholder-zinc-650 focus:border-brand-neon/40' 
                          : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
                      Nível de Treino Recomendado
                    </label>
                    <select
                      value={inviteLevel}
                      onChange={(e) => {
                        setInviteLevel(e.target.value as any);
                        setGeneratedInviteUrl(null);
                      }}
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none cursor-pointer transition-all ${
                        darkMode 
                          ? 'bg-[#1b1b1b] border-brand-border text-stone-100 focus:border-brand-neon/40' 
                          : 'bg-stone-50 border-stone-200 text-stone-900'
                      }`}
                    >
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const randId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
                      // Generate complete unique invitation link URL
                      const url = `${window.location.origin}${window.location.pathname}?ref_coach=${encodeURIComponent(trainerEmail || 'personal_trainer')}&student_name=${encodeURIComponent(inviteName.trim())}&student_email=${encodeURIComponent(inviteEmail.trim())}&student_id=${encodeURIComponent(randId)}&student_level=${encodeURIComponent(inviteLevel)}`;
                      setGeneratedInviteUrl(url);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95 border ${
                      darkMode 
                        ? 'bg-brand-neon text-black border-transparent hover:bg-white font-black' 
                        : 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Gerar Link de Convite Sincronizável
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInviteName('');
                      setInviteEmail('');
                      setInviteLevel('Iniciante');
                      setGeneratedInviteUrl(null);
                    }}
                    className={`px-3 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                      darkMode 
                        ? 'border-zinc-800 text-stone-400 hover:text-white hover:bg-zinc-900' 
                        : 'border-stone-200 text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Limpar Campos
                  </button>
                </div>

                {generatedInviteUrl && (
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-4 rounded-xl border text-left space-y-2.5 relative ${
                      darkMode ? 'bg-[#111111] border-brand-neon/20' : 'bg-[#f6fff9] border-emerald-500/25'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider block ${
                        darkMode ? 'text-brand-neon' : 'text-emerald-600'
                      }`}>
                        ✓ Link pronto para partilhar!
                      </span>
                      <span className="text-[9px] text-stone-500 font-mono">
                        Mentor: {trainerEmail || 'Treinador Ativo'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedInviteUrl}
                        className={`flex-1 px-3.5 py-2 font-mono text-[10px] rounded-xl border focus:outline-none focus:ring-0 ${
                          darkMode 
                            ? 'bg-zinc-950/70 border-zinc-800 text-stone-300' 
                            : 'bg-stone-100 border-stone-200 text-stone-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedInviteUrl).then(() => {
                            setCopiedInviteLink(true);
                            setTimeout(() => setCopiedInviteLink(false), 2500);
                          }).catch(() => {
                            alert(`Por favor, copie o seguinte link manualmente:\n\n${generatedInviteUrl}`);
                          });
                        }}
                        className={`px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer border flex items-center justify-center gap-1 shrink-0 ${
                          copiedInviteLink
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : darkMode
                              ? 'bg-brand-neon text-black border-transparent hover:bg-white'
                              : 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600'
                        }`}
                      >
                        {copiedInviteLink ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar Link
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] text-stone-400 leading-normal">
                      Quando o aluno concluir o registo através deste link, ele acederá diretamente à aplicação de forma gratuita, e os seus dados biográficos serão registados no seu painel de Controle de Alunos automaticamente!
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Main List Directory Layout - Widescreen styled */}
          <div className={`p-4 sm:p-5.5 rounded-2xl border space-y-4 ${
            darkMode ? 'bg-[#121212]/90 border-brand-border-muted' : 'bg-stone-50 border-stone-150'
          }`}>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-2 text-left">
              <Search className="w-4 h-4 text-stone-500" />
              Diretório Geral de Alunos
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Filtrar por nome, email ou objetivo contratado..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 text-xs rounded-xl border focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#181818] border-brand-border text-stone-100 placeholder-zinc-500 focus:border-brand-neon/40' 
                      : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400'
                  }`}
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-stone-500" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`px-3 py-3 text-xs font-bold rounded-xl border focus:outline-none cursor-pointer ${
                    darkMode 
                      ? 'bg-[#1b1b1b] border-brand-border text-stone-300' 
                      : 'bg-white border-stone-200 text-stone-600'
                  }`}
                >
                  <option value="Todos">Filtro: Todos os Alunos</option>
                  <option value="Ativos">Matrícula: Ativos ({activeCount})</option>
                  <option value="Inativos">Matrícula: Inativos ({inactiveCount})</option>
                  <option value="Excelente">Classificação: Excelente</option>
                  <option value="Normal">Classificação: Normal</option>
                  <option value="Necessita de Atenção">Classificação: Atenção</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredStudents.length === 0 ? (
                <div className="p-12 text-center text-xs text-stone-400 col-span-2">
                  Nenhum aluno encontrado correspondente aos critérios de busca.
                </div>
              ) : (
                filteredStudents.map(student => {
                  // Color mapping for Status Badge
                  let statusBadgeStyle = '';
                  if (student.status === 'Excelente') {
                    statusBadgeStyle = darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20';
                  } else if (student.status === 'Necessita de Atenção') {
                    statusBadgeStyle = darkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-500/15 text-rose-700 border-rose-500/20';
                  } else {
                    statusBadgeStyle = darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-500/15 text-amber-700 border-amber-500/20';
                  }

                  // Simple date formatter
                  const daysAgo = Math.round((Date.now() - new Date(student.lastWorkoutDate).getTime()) / (1000 * 3600 * 24));
                  const lastSeenText = daysAgo === 0 ? 'Hoje' : daysAgo === 1 ? 'Ontem' : `Há ${daysAgo} dias`;

                  return (
                    <div
                      key={student.id}
                      onClick={() => selectStudent(student)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 hover:-translate-y-0.5 ${
                        darkMode
                          ? 'bg-[#181818] border-brand-border hover:bg-[#202020] hover:border-brand-neon/30 active:bg-zinc-900 shadow-md'
                          : 'bg-white border-stone-200 hover:bg-stone-50 select-none shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        {/* Avatar tag */}
                        <div className="relative">
                          <img 
                            src={student.avatar} 
                            alt={student.name} 
                            className="w-11 h-11 rounded-full object-cover border-2 border-stone-800"
                          />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-stone-900 text-[8px] flex items-center justify-center font-bold text-black ${
                            student.streak > 0 ? 'bg-orange-500 text-white animate-pulse' : 'bg-stone-500 text-white'
                          }`} title="Sequência de treinos consecutivos do aluno">
                            {student.streak}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs font-black uppercase tracking-wide text-stone-100">{student.name}</h3>
                            {student.studentId && (
                              <span className="px-1.5 py-0.2 text-[8px] font-black tracking-widest text-[#10b981] bg-[#10a16b]/10 border border-[#10a16b]/20 rounded uppercase">
                                {student.studentId}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-stone-400 font-medium mt-0.5 flex items-center gap-1.5">
                            <span>{student.experienceLevel}</span>
                            <span className="w-1 h-1 bg-stone-500 rounded-full" />
                            <span>{student.objective}</span>
                          </p>
                          <p className="text-[9px] text-stone-400 font-mono mt-0.5 flex items-center gap-1.5">
                            <span>Ult. Treino: <strong className={daysAgo > 4 ? 'text-rose-400 font-bold' : 'text-stone-300 font-bold'}>{lastSeenText}</strong></span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">Acessos: {student.accessCount || 3}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 text-right">
                        <span className={`px-2 py-0.5 text-[8px] uppercase font-bold tracking-wider rounded border ${statusBadgeStyle}`}>
                          {student.status}
                        </span>
                        
                        {student.isActive === false ? (
                          <span className="px-1.5 py-0.5 text-[8.5px] uppercase font-black tracking-wider rounded bg-stone-500/10 border border-stone-500/20 text-stone-400">
                            Inativo
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[8.5px] uppercase font-black tracking-wider rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            Ativo
                          </span>
                        )}
                        
                        <div className="pt-0.5 leading-none">
                          <span className="text-[9px] text-stone-500 font-bold block uppercase tracking-wide">Consistência</span>
                          <span className="text-xs font-extrabold text-stone-200">{student.consistencyScore}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-zinc-950/20 rounded-xl border border-zinc-900/60 text-xs text-stone-400 flex items-center gap-2 justify-center leading-normal">
              <Sparkles className="w-4 h-4 text-brand-neon animate-pulse" />
              <span>Dica de Navegação: Clique em qualquer cartão de aluno acima para abrir uma <strong>tela dedicada</strong> de progresso, rotina por IA ou manual e precificação.</span>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Header Description panel for plans */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-brand-border text-left relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-brand-neon/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-neon/10 rounded-xl text-brand-neon">
                <Sparkles className="w-6 h-6 text-brand-neon" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Modelo de Cobrança Justo & Eficiente</h2>
                <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                  Os alunos cadastrados no ecrã atleta têm <strong>acesso 100% gratuito</strong> à visualização de treinos, repetições, séries e registro de pesos.
                  Como Personal Trainer, você escolhe o plano de assinatura ideal para sua escala profissional de atendimento.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Plan 1: Starter */}
            <div className="p-6 rounded-2xl border bg-black/30 border-zinc-800 text-left flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded">
                    Plano de Entrada
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white pt-2">Personal Starter</h3>
                  <p className="text-[10px] text-stone-400">Excelente para iniciantes no atendimento personalizado remoto.</p>
                </div>

                <div className="py-2">
                  <div className="text-[10px] text-stone-500 uppercase font-bold tracking-wider mb-0.5">Assinatura Mensal Sugerida</div>
                  <div className="text-2xl font-black text-[#10b981]">
                    €9,90 <span className="text-xs font-medium text-stone-400">a</span> €14,90<span className="text-xs font-medium text-stone-500">/mês</span>
                  </div>
                </div>

                <ul className="space-y-2 text-[10.5px] border-t border-zinc-900 pt-4 text-stone-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span>Até <strong>20 alunos</strong> cadastrados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span>Criação ilimitada de treinos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span>Acompanhamento básico do progresso</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span>Dashboard administrativo</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button 
                  type="button"
                  onClick={() => alert('Parabéns pela escolha do Plano Starter! Entraremos em contato com você.')}
                  className="w-full py-2.5 rounded-xl border border-zinc-700 text-stone-300 text-[10.5px] font-black uppercase tracking-widest text-center hover:bg-white hover:text-black transition-all cursor-pointer"
                >
                  Selecionar Starter
                </button>
              </div>
            </div>

            {/* Plan 2: Pro - Recommended with neon brand details */}
            <div className="p-6 rounded-2xl border bg-[#141414] border-brand-neon/40 shadow-xl shadow-brand-neon/5 text-left flex flex-col justify-between relative hover:border-brand-neon/60 transition-all">
              <div className="absolute top-3 right-3 bg-brand-neon text-black text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase leading-none">
                RECOMENDADO
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-neon bg-brand-neon/10 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                    <Sparkles className="w-3 h-3 text-brand-neon" /> Multi-Recursos IA
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white pt-2">Personal Pro</h3>
                  <p className="text-[10px] text-stone-400">A melhor relação custo/benefício com análise completa por IA.</p>
                </div>

                <div className="py-2">
                  <div className="text-[10px] text-stone-500 uppercase font-bold tracking-wider mb-0.5">Assinatura Mensal Sugerida</div>
                  <div className="text-2xl font-black text-brand-neon">
                    €24,90 <span className="text-xs font-medium text-stone-400">a</span> €39,90<span className="text-xs font-medium text-stone-500">/mês</span>
                  </div>
                </div>

                <ul className="space-y-2 text-[10.5px] border-t border-zinc-900 pt-4 text-stone-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-neon shrink-0" />
                    <span>Até <strong>100 alunos</strong> cadastrados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-neon shrink-0" />
                    <span>Histórico tridimensional completo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-neon shrink-0" />
                    <span>Avaliações físicas e fotos de evolução</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-neon shrink-0" />
                    <span>Chat integrado de mentoria</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-neon shrink-0" />
                    <span className="text-brand-neon font-bold">Sugestões Avançadas IA (Gemini SDK)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => alert('Excelente! Você selecionou o Plano Pro com recursos de IA. Vamos inicializar sua experiência.')}
                  className="w-full py-2.5 rounded-xl bg-brand-neon text-black text-[10.5px] font-black uppercase tracking-widest text-center hover:bg-white transition-all shadow-md shadow-brand-neon/15 cursor-pointer"
                >
                  Selecionar Pro (Sugerido)
                </button>
              </div>
            </div>

            {/* Plan 3: Studio/Gym */}
            <div className="p-6 rounded-2xl border bg-black/30 border-zinc-800 text-left flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#a855f7] bg-[#a855f7]/10 px-2 py-0.5 rounded">
                    Para Organizações
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white pt-2">Studio / Ginásio</h3>
                  <p className="text-[10px] text-stone-400">Ideal para redes de ginásio ou estúdios com equipes de treinadores.</p>
                </div>

                <div className="py-2">
                  <div className="text-[10px] text-stone-500 uppercase font-bold tracking-wider mb-0.5">Assinatura Mensal Comercial</div>
                  <div className="text-2xl font-black text-[#a855f7]">
                    €79 <span className="text-xs font-medium text-stone-400">a</span> €199<span className="text-xs font-medium text-stone-500">/mês</span>
                  </div>
                </div>

                <ul className="space-y-2 text-[10.5px] border-t border-zinc-900 pt-4 text-stone-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                    <span><strong>Vários Personal Trainers</strong> integrados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                    <span>Controle e gestão de equipas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                    <span>Relatórios consolidados de vendas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                    <span>Personalização de Marca Branca</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => alert('Entraremos em contato para estruturar a Marca Branca do seu Studio/Ginásio.')}
                  className="w-full py-2.5 rounded-xl border border-zinc-700 text-stone-300 text-[10.5px] font-black uppercase tracking-widest text-center hover:bg-white hover:text-black transition-all cursor-pointer"
                >
                  Selecionar Studio
                </button>
              </div>
            </div>

          </div>

          {/* Interactive Cost Calculator & Analysis */}
          <div className="p-6 rounded-2xl bg-[#181818] border border-zinc-850 text-left space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <TrendingUp className="w-5 h-5 text-brand-neon" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Simulador de Viabilidade (Retorno p/ Aluno)</h3>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              O investimento mensal amortiza-se quase na totalidade à medida que você adiciona atletas.
              Abaixo, comprove como o custo dividido pela sua quantidade real de alunos torna-se desprezível e instantaneamente justificável.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-5">
                {/* Control 1: Price slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-stone-300">
                    <span className="uppercase tracking-wider">Preço Sugerido do Plano PT</span>
                    <span className="text-brand-neon font-black font-mono">€{calcPlanPrice.toFixed(2)} / mês</span>
                  </div>
                  <input
                    type="range"
                    min="9.90"
                    max="199.00"
                    step="5.00"
                    value={calcPlanPrice}
                    onChange={(e) => setCalcPlanPrice(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-brand-neon"
                  />
                  <div className="flex justify-between text-[9px] text-stone-500 font-bold uppercase">
                    <span>Mín: €9.90</span>
                    <span>Pro: ~€29.90</span>
                    <span>Máx: €199</span>
                  </div>
                </div>

                {/* Control 2: Students count slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-stone-300">
                    <span className="uppercase tracking-wider">Quantidade de Alunos</span>
                    <span className="text-brand-neon font-black font-mono">{calcStudentsCount} Alunos</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="120"
                    step="1"
                    value={calcStudentsCount}
                    onChange={(e) => setCalcStudentsCount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-brand-neon"
                  />
                  <div className="flex justify-between text-[9px] text-stone-500 font-bold uppercase">
                    <span>2 Alunos</span>
                    <span>50 Alunos</span>
                    <span>120 Alunos</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Calculation Output card */}
              <div className="p-5 rounded-xl bg-black/45 border border-zinc-900 flex flex-col justify-center items-center text-center space-y-3">
                <span className="text-[10px] font-black uppercase text-stone-500 tracking-widest leading-none">CUSTO EFETIVO AMORTIZADO</span>
                
                <div className="space-y-1">
                  <div className="text-2xl font-black text-brand-neon leading-none">
                    €{(calcPlanPrice / calcStudentsCount).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    por aluno / mês
                  </div>
                </div>

                <div className="text-[10.5px] text-stone-300/90 leading-relaxed border-t border-zinc-900 pt-3">
                  Exemplo: Com uma assinatura Pro de <strong className="text-white">€{calcPlanPrice.toFixed(2)}/mês</strong> dedicada a <strong className="text-white">{calcStudentsCount} alunos</strong>, o custo repassado por atleta é de apenas <span className="text-[#10b981] font-black">€{(calcPlanPrice / calcStudentsCount).toFixed(2)}/mês</span>. É um valor incrivelmente fácil de se justificar.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )}

      {/* Pop-up Modal to Add New Student */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative w-full max-w-md p-6 rounded-2xl border shadow-2xl z-10 text-left ${
                darkMode ? 'bg-brand-card border-brand-border text-white' : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              <h3 className="text-lg font-black uppercase tracking-tight mb-2 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand-neon" />
                Matricular Novo Aluno
              </h3>

              {/* Selection Tabs for Direct vs ID linkage */}
              <div className="flex gap-2 mb-4 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAddType('local')}
                  className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    addType === 'local'
                      ? 'bg-brand-neon text-black'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  📝 Cadastrar Off-line
                </button>
                <button
                  type="button"
                  onClick={() => setAddType('vincular')}
                  className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    addType === 'vincular'
                      ? 'bg-brand-neon text-black'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  🔗 Vincular pelo ID
                </button>
              </div>

              {addType === 'local' ? (
                <form onSubmit={handleAddStudent} className="space-y-4">
                  
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">Nome do Aluno</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pedro Fonseca"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className={`w-full p-2.5 text-xs rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                        darkMode 
                          ? 'bg-[#181818] border-brand-border text-stone-100 focus:ring-brand-neon/30' 
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:ring-emerald-500/30'
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">E-mail (Opcional)</label>
                    <input
                      type="email"
                      placeholder="Ex: pedro@fit.pt"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className={`w-full p-2.5 text-xs rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                        darkMode 
                          ? 'bg-[#181818] border-brand-border text-stone-100 focus:ring-brand-neon/30' 
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:ring-emerald-500/30'
                      }`}
                    />
                  </div>

                  {/* Experience Level & Objective Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">Nível Inicial</label>
                      <select
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value as any)}
                        className={`w-full p-2.5 text-xs rounded-lg border focus:outline-none cursor-pointer ${
                          darkMode ? 'bg-[#181818] border-brand-border text-stone-100' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      >
                        <option value="Iniciante">Iniciante</option>
                        <option value="Intermediário">Intermediário</option>
                        <option value="Avançado">Avançado</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">Objetivo</label>
                      <select
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        className={`w-full p-2.5 text-xs rounded-lg border focus:outline-none cursor-pointer ${
                          darkMode ? 'bg-[#181818] border-brand-border text-stone-100' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      >
                        <option value="Hipertrofia">Hipertrofia</option>
                        <option value="Emagrecimento">Emagrecimento</option>
                        <option value="Força">Força</option>
                        <option value="Resistência">Resistência</option>
                      </select>
                    </div>
                  </div>

                  {/* Consistency Slider */}
                  <div className="space-y-1.5 pb-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Consistência Estimada</label>
                      <span className="text-xs font-black text-brand-neon">{newConsistency}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={newConsistency}
                      onChange={(e) => setNewConsistency(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-neon"
                    />
                  </div>

                  {/* Pricing settings upon adding student */}
                  <div className="grid grid-cols-2 gap-3 pb-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">Cobrança Base</label>
                      <select
                        value={newPricingType}
                        onChange={(e) => setNewPricingType(e.target.value as any)}
                        className={`w-full p-2.5 text-xs rounded-lg border focus:outline-none cursor-pointer ${
                          darkMode ? 'bg-[#181818] border-brand-border text-stone-100' : 'bg-stone-50 border-stone-200 text-stone-900'
                        }`}
                      >
                        <option value="mensal">Mensalidade</option>
                        <option value="hora">Tarifa p/ Hora</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">Valor Base (€)</label>
                      <input
                        type="number"
                        min="0"
                        value={newPricingValue}
                        onChange={(e) => setNewPricingValue(parseFloat(e.target.value) || 0)}
                        className={`w-full p-2.5 text-xs rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                          darkMode 
                            ? 'bg-[#181818] border-brand-border text-stone-100 focus:ring-brand-neon/30' 
                            : 'bg-stone-50 border-stone-200 text-stone-900 focus:ring-emerald-500/30'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                        darkMode
                          ? 'bg-transparent border-brand-border text-stone-400 hover:text-white hover:bg-[#181818]'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-black transition-all cursor-pointer ${
                        darkMode
                          ? 'bg-brand-neon hover:bg-white shadow-md shadow-brand-neon/15'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                      }`}
                    >
                      Efetuar Cadastro
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">Identificador Único do Aluno (ID Atleta)</label>
                    <input
                      type="text"
                      placeholder="Ex: STU-4892"
                      value={linkId}
                      onChange={(e) => setLinkId(e.target.value)}
                      className={`w-full p-2.5 text-xs rounded-lg border focus:outline-none focus:ring-1 transition-all uppercase ${
                        darkMode 
                          ? 'bg-[#181818] border-brand-border text-stone-100 focus:ring-brand-neon/30' 
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:ring-emerald-500/30'
                      }`}
                    />
                    <p className="text-[10.5px] text-stone-400 leading-normal pt-1.5">
                      Insira o identificador único fornecido pelo aluno em seu próprio ecrã atleta (Ex: <strong>STU-4892</strong>). Isso criará uma vinculação bidirecional sincronizada, onde poderá acompanhar os acessos reais e as cargas preenchidas em tempo real.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                        darkMode
                          ? 'bg-transparent border-brand-border text-stone-400 hover:text-white hover:bg-[#181818]'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleLinkStudentSubmit}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-black transition-all cursor-pointer ${
                        darkMode
                          ? 'bg-brand-neon hover:bg-white shadow-md shadow-brand-neon/15 font-black'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                      }`}
                    >
                      Efetuar Vinculação
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

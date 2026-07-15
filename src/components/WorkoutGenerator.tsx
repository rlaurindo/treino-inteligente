import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Dumbbell, Play, CheckCircle2, RefreshCw, ChevronRight, 
  ArrowLeft, Clock, Flame, Award, HeartPulse, Download, ShieldAlert, BadgeInfo,
  Lock, CreditCard, Smartphone, QrCode, DollarSign, Video, X, Info, Activity,
  ExternalLink, Search, Printer
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { WorkoutRoutine, TrainingLog, UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { loadPrescribedRoutineForStudent, loadWorkoutRoutines } from '../services/db';

// Helper functions to detect and format YouTube URLs for high-quality inline iframe presentation
const isYouTubeUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeEmbedUrl = (url: string): string => {
  let videoId = '';
  if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/watch')) {
    try {
      const parts = url.split('?');
      if (parts[1]) {
        const urlParams = new URLSearchParams(parts[1]);
        videoId = urlParams.get('v') || '';
      }
    } catch (e) {
      console.error("Erro ao fazer parse da URL do YouTube:", e);
    }
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  
  return videoId 
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playlist=${videoId}&loop=1&controls=1&rel=0`
    : url;
};

// Library of interactive exercise form tutorials with videos and safety guidelines (including YouTube training resource sources)
const EXERCISE_TUTORIAL_LIBRARY: Record<string, {
  videoUrl: string;
  category: string;
  muscleGroup: string;
  execution: string[];
  mistakes: string[];
}> = {
  "agachamento": {
    videoUrl: "https://www.youtube.com/watch?v=ultWZbUmPL8", // Guia de Agachamento (Bowflex)
    category: "Membros Inferiores",
    muscleGroup: "Quadríceps, Glúteos, Posteriores",
    execution: [
      "Posicione os pés afastados na largura dos ombros, apontando de leve para fora.",
      "Inicie descendo o quadril para trás, como se estivesse sentando em um banco invisível.",
      "Mantenha os joelhos alinhados com a ponta dos pés, sem deixá-los entrar.",
      "Desça mantendo as costas retas e o peito bem aberto até que as coxas fiquem paralelas ao chão.",
      "Empurre o chão firmemente pelos calcanhares para retornar à posição inicial."
    ],
    mistakes: [
      "Deixar os joelhos irem para dentro durante a fase de descida ou subida (valgo).",
      "Tirar os calcanhares do solo, jogando o peso e a tensão nos joelhos.",
      "Curvar excessivamente a coluna lombar na parte mais baixa do movimento."
    ]
  },
  "supino": {
    videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg", // Guia de Supino (Bowflex)
    category: "Membros Superiores",
    muscleGroup: "Peitoral Maior, Tríceps, Ombros (Deltoide Anterior)",
    execution: [
      "Deite-se no banco plano com ambos os pés firmes no chão para estabilidade.",
      "Segure a barra ou halteres um pouco mais aberto que a linha dos ombros.",
      "Retraia as escápulas (junte as asas das costas) e mantenha os ombros bem apoiados.",
      "Desça a carga controladamente até tocar de leve próximo ao peito (linha dos mamilos).",
      "Empurre de volta para cima mantendo a estabilidade dos cotovelos."
    ],
    mistakes: [
      "Tirar o quadril ou os pés de apoio estável do banco na fase concêntrica.",
      "Bater a barra com impacto violento no osso do peito.",
      "Projetar os ombros para cima e desmontar as escápulas estáveis ao topo."
    ]
  },
  "puxada": {
    videoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc", // Guia de Puxada Alta (Howcast)
    category: "Membros Superiores",
    muscleGroup: "Dorsal (Asas), Redondo Maior, Bíceps",
    execution: [
      "Sente-se no aparelho e ajuste a proteção de coxas para não se levantar.",
      "Segure a barra com uma pegada confortável aberta (pegada pronada).",
      "Inicie o movimento puxando os cotovelos para baixo e ligeiramente para trás.",
      "Direcione a barra à linha clavicular superior, mantendo o tórax bem aberto.",
      "Controle a volta do peso estendendo completamente a musculatura das costas com cadência."
    ],
    mistakes: [
      "Jogar o peso com impulso das costas inclinando o tronco quase 45 graus para trás.",
      "Puxar a barra por trás da cabeça, exercendo altíssima pressão insegura na articulação do ombro.",
      "Despencar o peso na subida, perdendo a fase excêntrica de estímulo muscular."
    ]
  },
  "rosca": {
    videoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Up", // Guia de Rosca Direta (Howcast)
    category: "Membros Superiores",
    muscleGroup: "Bíceps Braquial, Braquial anterior",
    execution: [
      "Fique em pé com postura firme e joelhos levemente destravados.",
      "Segure os halteres ou barra com a palma das mãos voltadas para cima.",
      "Prenda os cotovelos de forma firme e imóvel ao lado do abdômen.",
      "Flexione os braços trazendo a carga até a altura média do peitoral.",
      "Retorne à posição inicial de forma lenta e concentrada sob tensão."
    ],
    mistakes: [
      "Gingar o tronco para frente e para trás para auxiliar a subida com impulso.",
      "Mover os cotovelos drasticamente para frente ou para trás, descansando o bíceps no topo.",
      "Deixar o punho flexionar excessivamente, transferindo carga para o antebraço."
    ]
  },
  "abdominal": {
    videoUrl: "https://www.youtube.com/watch?v=Xyd_fa5zoEU", // Guia de Abdominal (Howcast)
    category: "Core & Abdominais",
    muscleGroup: "Reto Abdominal, Transverso",
    execution: [
      "Deite-se no solo ou colchonete com joelhos confortavelmente flexionados.",
      "Apoie os calcanhares no chão e coloque as pontas dos dedos suavemente atrás das orelhas.",
      "Contraia as fibras do abdômen ao expirar, erguendo apenas as escápulas do chão.",
      "Mantenha a lombar bem apoiada no solo.",
      "Desça suavemente até aproximar os ombros ao chão, mantendo a tensão de repetição."
    ],
    mistakes: [
      "Puxar agressivamente a cabeça pelas mãos flexionando o pescoço e causando dores cervicais.",
      "Retirar a coluna de forma bruta gerando impacto lombar prejudicial.",
      "Realizar repetições velozes demais sem o tempo correto de contração e controle biológico."
    ]
  }
};

// Rich index of popular exercises with muscle groups and category details for instant client-side lookup
const DEFAULT_SEARCHABLE_EXERCISES = [
  { name: 'Agachamento Livre', category: 'Membros Inferiores', muscleGroup: 'Quadríceps, Glúteos, Posteriores' },
  { name: 'Leg Press 45', category: 'Membros Inferiores', muscleGroup: 'Quadríceps, Glúteos, Adutores' },
  { name: 'Cadeira Extensora', category: 'Membros Inferiores', muscleGroup: 'Quadríceps' },
  { name: 'Cadeira Flexora', category: 'Membros Inferiores', muscleGroup: 'Posteriores de Coxa, Panturrilhas' },
  { name: 'Stiff com Halteres', category: 'Membros Inferiores', muscleGroup: 'Isquiotibiais, Glúteos, Lombar' },
  { name: 'Afundo / Passada', category: 'Membros Inferiores', muscleGroup: 'Quadríceps, Glúteos, Posterior de Coxa' },
  { name: 'Supino Reto', category: 'Membros Superiores', muscleGroup: 'Peitoral Maior, Tríceps, Deltoide Anterior' },
  { name: 'Supino Inclinado', category: 'Membros Superiores', muscleGroup: 'Peitoral Superior, Deltoide, Tríceps' },
  { name: 'Crucifixo Reto', category: 'Membros Superiores', muscleGroup: 'Peitoral Maior, Coracobraquial' },
  { name: 'Crossover na Polia', category: 'Membros Superiores', muscleGroup: 'Peitoral Maior, Tríceps' },
  { name: 'Puxada Alta (Pulley)', category: 'Membros Superiores', muscleGroup: 'Costas (Grande Dorsal), Bíceps, Redondo' },
  { name: 'Remada Curvada', category: 'Membros Superiores', muscleGroup: 'Costas (Dorsal), Trapézio, Bíceps' },
  { name: 'Rosca Direta', category: 'Membros Superiores', muscleGroup: 'Bíceps Braquial, Braquial Anterior' },
  { name: 'Rosca Martelo', category: 'Membros Superiores', muscleGroup: 'Bíceps, Braquiorradial, Antebraço' },
  { name: 'Abdominal Supra', category: 'Core & Abdominais', muscleGroup: 'Reto Abdominal (Parte Superior)' },
  { name: 'Abdominal Infra', category: 'Core & Abdominais', muscleGroup: 'Reto Abdominal (Parte Inferior)' },
  { name: 'Prancha Isométrica', category: 'Core & Abdominais', muscleGroup: 'Core, Transverso do Abdómen, Lombar' },
  { name: 'Elevação Lateral', category: 'Membros Superiores', muscleGroup: 'Deltoides (Laterais do Ombro)' },
  { name: 'Desenvolvimento de Ombros', category: 'Membros Superiores', muscleGroup: 'Ombros, Deltoide Anterior, Tríceps' }
];

// Returns matching or fallback customized structure for tutorials
const getExerciseTutorial = (name: string, customVideos?: Record<string, string>, prescribedVideoUrl?: string | null) => {
  const norm = name.toLowerCase().trim();
  
  let customUrl = "";
  if (customVideos) {
    // Look for exact match or normalized subset
    const keys = Object.keys(customVideos);
    // Exact match or contains relation
    const matchedKey = keys.find(k => norm === k || norm.includes(k) || k.includes(norm));
    if (matchedKey) {
      customUrl = customVideos[matchedKey];
    }
  }

  let tutorialData;
  if (norm.includes("agacha") || norm.includes("leg press") || norm.includes("extensor") || norm.includes("panturrilha") || norm.includes("flexor") || norm.includes("stiff") || norm.includes("afundo") || norm.includes("passada")) {
    tutorialData = { title: name, ...EXERCISE_TUTORIAL_LIBRARY["agachamento"] };
  } else if (norm.includes("supino") || norm.includes("crucifixo") || norm.includes("peito") || norm.includes("fly") || norm.includes("flexão de braço") || norm.includes("crossover") || norm.includes("push up")) {
    tutorialData = { title: name, ...EXERCISE_TUTORIAL_LIBRARY["supino"] };
  } else if (norm.includes("puxada") || norm.includes("remada") || norm.includes("pulley") || norm.includes("costas") || norm.includes("pull") || norm.includes("row") || norm.includes("chin up") || norm.includes("bars")) {
    tutorialData = { title: name, ...EXERCISE_TUTORIAL_LIBRARY["puxada"] };
  } else if (norm.includes("rosca") || norm.includes("bíceps") || norm.includes("biceps")) {
    tutorialData = { title: name, ...EXERCISE_TUTORIAL_LIBRARY["rosca"] };
  } else if (norm.includes("abdominal") || norm.includes("prancha") || norm.includes("crunch") || norm.includes("infra") || norm.includes("obliquo") || norm.includes("abdominal solo")) {
    tutorialData = { title: name, ...EXERCISE_TUTORIAL_LIBRARY["abdominal"] };
  } else {
    // Default tutorial details customized based on user's active name query
    tutorialData = {
      title: name,
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-woman-running-on-treadmill-41460-large.mp4",
      category: "Geral & Força",
      muscleGroup: "Musculatura Alvo e Estabilizadores",
      execution: [
        "Mantenha a postura alinhada e as articulações em ângulo seguro.",
        "Controle a velocidade: desça em 2-3 segundos (fase excêntrica) e suba de forma potente.",
        "Mantenha as escápulas travadas e o core contraído para estabilizar o tronco.",
        "Respire corretamente: expire no momento de maior esforço e inspire na fase de retorno."
      ],
      mistakes: [
        "Esticar totalmente a articulação (hiperextensão) cortando a ativação muscular constante.",
        "Utilizar pesos maiores do que consegue suportar, compensando com má postura corporal.",
        "Segurar o folego ou prender a respiração, diminuindo a oxigenação e o rendimento físico."
      ]
    };
  }

  const cleanPrescribedUrl = prescribedVideoUrl?.trim();
  if (cleanPrescribedUrl) {
    tutorialData = { ...tutorialData, videoUrl: cleanPrescribedUrl, videoSource: "prescribed" };
  } else if (customUrl) {
    tutorialData = { ...tutorialData, videoUrl: customUrl, videoSource: "custom" };
  } else {
    tutorialData = { ...tutorialData, videoSource: "automatic" };
  }

  return tutorialData;
};

interface WorkoutGeneratorProps {
  user: UserProfile;
  onChangeProfile?: (profile: Partial<UserProfile>) => void;
  onLogWorkout: (log: TrainingLog) => void;
  savedOfflineWorkouts: WorkoutRoutine[];
  onSaveOffline: (routine: WorkoutRoutine) => void;
  isOfflineMode: boolean;
  darkMode: boolean;
}

export default function WorkoutGenerator({
  user,
  onChangeProfile,
  onLogWorkout,
  savedOfflineWorkouts,
  onSaveOffline,
  isOfflineMode,
  darkMode
}: WorkoutGeneratorProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<WorkoutRoutine | null>(null);
  const [prescriptionNotice, setPrescriptionNotice] = useState('');
  const lastNotifiedRoutineId = useRef<string | null>(null);

  // Secure Height, Weight and configuration states tied exclusively to active authenticated user to prevent data leaks
  const [height, setHeight] = useState<string>(() => {
    if (user?.height) return user.height.toString();
    const key = user?.studentId 
      ? user.studentId.trim().toUpperCase() 
      : (user?.email ? user.email.trim().toUpperCase() : 'GUEST');
    return localStorage.getItem(`user_height_${key}`) || localStorage.getItem('user_height') || '';
  });

  const [weight, setWeight] = useState<string>(() => {
    if (user?.weight) return user.weight.toString();
    const key = user?.studentId 
      ? user.studentId.trim().toUpperCase() 
      : (user?.email ? user.email.trim().toUpperCase() : 'GUEST');
    return localStorage.getItem(`user_weight_${key}`) || localStorage.getItem('user_weight') || '';
  });

  const [daysPerWeek, setDaysPerWeek] = useState<string>(() => {
    const key = user?.studentId 
      ? user.studentId.trim().toUpperCase() 
      : (user?.email ? user.email.trim().toUpperCase() : 'GUEST');
    return localStorage.getItem(`user_days_per_week_${key}`) || localStorage.getItem('user_days_per_week') || '4';
  });

  const [availableTime, setAvailableTime] = useState<string>(() => {
    const key = user?.studentId 
      ? user.studentId.trim().toUpperCase() 
      : (user?.email ? user.email.trim().toUpperCase() : 'GUEST');
    return localStorage.getItem(`user_available_time_${key}`) || localStorage.getItem('user_available_time') || '60';
  });

  const [showError, setShowError] = useState(false);

  // Auto-sync form inputs when checking/viewing a different authenticated student's profile
  useEffect(() => {
    if (user) {
      const key = user.studentId 
        ? user.studentId.trim().toUpperCase() 
        : (user.email ? user.email.trim().toUpperCase() : 'GUEST');
      
      setHeight(user.height ? user.height.toString() : (localStorage.getItem(`user_height_${key}`) || localStorage.getItem('user_height') || ''));
      setWeight(user.weight ? user.weight.toString() : (localStorage.getItem(`user_weight_${key}`) || localStorage.getItem('user_weight') || ''));
      setDaysPerWeek(localStorage.getItem(`user_days_per_week_${key}`) || localStorage.getItem('user_days_per_week') || '4');
      setAvailableTime(localStorage.getItem(`user_available_time_${key}`) || localStorage.getItem('user_available_time') || '60');
    }
  }, [user]);

  // Handle PDF Export of the currently displayed workout routine
  const handleExportPDF = () => {
    if (!currentRoutine) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      let y = 15;

      // Helper function to draw corporate styled page brand headers & footers
      const drawPageHeader = (pageNumber: number) => {
        // Background Header Block
        doc.setFillColor(15, 23, 42); // slate 900
        doc.rect(0, 0, 210, 40, 'F');

        // Decorative emerald dividing bar
        doc.setFillColor(16, 185, 129); // emerald 500
        doc.rect(0, 40, 210, 3, 'F');

        // Main App Brand & document type
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text("TREINO INTELIGENTE", 15, 17);

        // Subtext description
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(148, 163, 184); // slate 300
        doc.text("PROGRAMA DE EXERCÍCIOS FÍSICOS E SUPORTE PEDAGÓGICO", 15, 23);

        // Document Metadata top right-aligned
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-PT')}`, 140, 16);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(203, 213, 225);
        doc.text(`Nível de Treino: ${currentRoutine.level || 'Iniciante'}`, 140, 22);
        doc.text(`Objetivo Principal: ${currentRoutine.objective || 'N/D'}`, 140, 28);
        if (currentRoutine.focus) {
          doc.text(`Foco Muscular: ${currentRoutine.focus}`, 140, 34);
        }
      };

      const drawPageFooter = (pageNumber: number) => {
        doc.setDrawColor(226, 232, 240); // slate 200
        doc.setLineWidth(0.5);
        doc.line(12, 280, 198, 280);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // slate 500
        doc.text("Ficha de treino pessoal e intransferível. Atividade física deve ser monitorada por profissionais.", 15, 285);
        doc.setFont('helvetica', 'bold');
        doc.text(`Página ${pageNumber}`, 180, 285);
      };

      // PAGE 1 Start
      drawPageHeader(1);

      // Student and Coach Profile Section
      y = 53;
      doc.setDrawColor(203, 213, 225); // slate 300
      doc.setFillColor(248, 250, 252); // slate 50 (soft background)
      doc.roundedRect(12, y, 186, 30, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42); // slate 900
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text("ATLETA BENEFICIÁRIO & MÉTODOS DE CONTROLE", 16, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // slate 700
      doc.text(`Nome do Aluno: ${user?.name || 'Atleta cadastrado'}`, 16, y + 13);
      doc.text(`Identificação / Email: ${user?.email || 'N/D'}`, 16, y + 19);
      doc.text(`Modalidade / Suporte: Treino Inteligente - Prescrição Dinâmica`, 16, y + 25);

      // Compositions right-aligned inside profile card
      const compStr = [
        user?.age ? `${user.age} anos` : 'N/D Idade',
        user?.weight ? `${user.weight} kg` : 'N/D Peso',
        user?.height ? `${user.height} cm` : 'N/D Altura'
      ].join('  |  ');
      
      doc.text(`Indicadores Médicos: ${compStr}`, 110, y + 13);
      doc.text(`Plano Associado: ${user?.isPremium ? 'Premium PRO (Ativo)' : 'Versão Standard'}`, 110, y + 19);

      if (user?.lgpdConsent) {
        doc.setTextColor(16, 185, 129); // green
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text("✓ DADOS BIOMÉTRICOS TRATADOS SOB TERMOS LGPD / PRIVACIDADE", 110, y + 25);
      } else {
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text("✓ DADOS DE SAÚDE SALVOS DE FORMA LOCAL E CRIPTOGRAFADA", 110, y + 25);
      }

      // Title header
      y = 92;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`ROTEIRO COMPLETO: ${currentRoutine.title.toUpperCase()}`, 12, y);

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.8);
      doc.line(12, y + 2, 198, y + 2);
      y += 10;

      // Group exercises by day subset
      const exercisesByDay: { [key: string]: typeof currentRoutine.exercises } = {};
      currentRoutine.exercises.forEach(ex => {
        const d = ex.day || 'Sequência de Exercícios / Geral';
        if (!exercisesByDay[d]) {
          exercisesByDay[d] = [];
        }
        exercisesByDay[d].push(ex);
      });

      const dayKeys = Object.keys(exercisesByDay);
      let pageNum = 1;

      dayKeys.forEach((dayKey) => {
        // If y is close to page bottom, create new page for the Day Subheader
        if (y > 245) {
          drawPageFooter(pageNum);
          doc.addPage();
          pageNum++;
          drawPageHeader(pageNum);
          y = 52;
        }

        // Render Day Header Ribbon
        doc.setFillColor(241, 245, 249); // slate 100
        doc.rect(12, y, 186, 7, 'F');
        doc.setDrawColor(203, 213, 225); // slate 300
        doc.rect(12, y, 186, 7, 'D');

        doc.setTextColor(30, 41, 59); // slate 800
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(dayKey.toUpperCase(), 16, y + 4.8);
        y += 11;

        const dayExs = exercisesByDay[dayKey];
        dayExs.forEach((ex, idx) => {
          // Calculate height needed for this card
          const cardHeight = ex.observation ? 24 : 17;
          if (y + cardHeight > 260) {
            drawPageFooter(pageNum);
            doc.addPage();
            pageNum++;
            drawPageHeader(pageNum);
            y = 52;

            // Redraw day heading block on new page to signify context continuation
            doc.setFillColor(241, 245, 249);
            doc.rect(12, y, 186, 7, 'F');
            doc.setDrawColor(203, 213, 225);
            doc.rect(12, y, 186, 7, 'D');
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(`${dayKey.toUpperCase()} (CONT.)`, 16, y + 4.8);
            y += 11;
          }

          // Render Exercise Border
          doc.setDrawColor(226, 232, 240); // slate 200 light
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(12, y, 186, cardHeight, 1, 1, 'FD');

          // Left Index number container
          doc.setFillColor(240, 253, 250); // extremely light teal
          doc.roundedRect(14, y + 2.5, 6, 6, 0.5, 0.5, 'F');
          
          doc.setTextColor(13, 148, 136); // teal 600
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`${idx + 1}`, 15.8, y + 6.8);

          // Exercise Name
          doc.setTextColor(15, 23, 42); // slate 900
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(ex.name.toUpperCase(), 23, y + 6.5);

          // Sub parameters (Séries, Repetições, Descanso)
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139); // slate 500
          doc.text(`${ex.sets} séries × ${ex.reps}    |    Descanso: ${ex.rest}`, 23, y + 11.5);

          // Right columns (Checkboxes for physical printing)
          // Draw checkboxes for up to 6 sets
          doc.setDrawColor(148, 163, 184); // slate 400
          doc.setFontSize(6);
          doc.setTextColor(100, 116, 139);
          let checkX = 145;
          for (let s = 1; s <= Math.min(ex.sets, 6); s++) {
            doc.rect(checkX, y + 3, 3.5, 3.5, 'D');
            doc.text(`${s}`, checkX + 1.2, y + 9.5);
            checkX += 5.5;
          }

          // Carga / Weight column
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          if (ex.weight) {
            doc.text(`Carga: ${ex.weight}`, 110, y + 6.5);
          } else {
            doc.text("Peso: _______ kg", 110, y + 6.5);
          }

          // If observation exists
          if (ex.observation) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(30, 41, 59); // dark text for clarity
            doc.text(`💡 Obs: ${ex.observation}`, 15, y + 18.5);
          }

          y += cardHeight + 3;
        });

        y += 4; // space between day subsections
      });

      // Render final page footer
      drawPageFooter(pageNum);

      // Save document
      const docName = currentRoutine.title.toLowerCase().replace(/\s+/g, '_');
      doc.save(`Ficha_Treino_${docName}.pdf`);

    } catch (e) {
      console.error("PDF generation failure:", e);
      alert("Desculpe, ocorreu uma falha ao compilar e exportar o seu treino para PDF.");
    }
  };

  // Unlocked Workout routine IDs
  const [unlockedRoutines, setUnlockedRoutines] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('unlocked_routines');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Simulated Checkout fields
  const [mbwayMode, setMbwayMode] = useState<'phone' | 'qr'>('phone');
  const [qrTxId, setQrTxId] = useState<string>('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [mbwayPhone, setMbwayPhone] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Sandbox MB WAY Virtual Phone Simulation states
  const [activeTransactionId, setActiveTransactionId] = useState<string>('');
  const [activePhoneUsed, setActivePhoneUsed] = useState<string>('');
  const [virtualPhoneStep, setVirtualPhoneStep] = useState<'idle' | 'notified' | 'authorizing' | 'success' | 'failed'>('idle');
  const [pinDots, setPinDots] = useState<string>('');

  // Load pricing info for this student from the coach's list
  const coachPricing = (() => {
    try {
      const studentId = user?.studentId;
      if (studentId) {
        const coachStudentsStr = localStorage.getItem('treino_trainer_students');
        if (coachStudentsStr) {
          const coachStudents = JSON.parse(coachStudentsStr);
          const match = coachStudents.find((st: any) => 
            (st.studentId && st.studentId.trim().toUpperCase() === studentId.trim().toUpperCase()) ||
            (st.email && st.email.toLowerCase() === user.email.toLowerCase())
          );
          if (match) {
            return {
              type: match.pricingType || 'mensal',
              value: match.pricingValue !== undefined ? match.pricingValue : 50.00,
              isActive: match.isActive !== false
            };
          }
        }
        const directSaved = localStorage.getItem(`treino_student_price_${studentId.trim().toUpperCase()}`);
        if (directSaved) {
          const parsed = JSON.parse(directSaved);
          return {
            type: parsed.type || 'mensal',
            value: parsed.value !== undefined ? parsed.value : 50.00,
            isActive: true
          };
        }
      }
      return { type: 'mensal', value: 0, isActive: false };
    } catch {
      return { type: 'mensal', value: 0, isActive: false };
    }
  })();

  // Day Selection States for multi-day plans
  const [selectedDayTab, setSelectedDayTab] = useState<string>('');

  // Active workout tracking states
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<boolean[]>([]);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<any>(null);
  const [intensityRating, setIntensityRating] = useState<number>(4);
  const [activeCalorieTick, setActiveCalorieTick] = useState(0);
  
  // Tutorial and Video playback speeds states
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [selectedTutorialVideoUrl, setSelectedTutorialVideoUrl] = useState<string | null>(null);
  const [playRate, setPlayRate] = useState<number>(1);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const openExerciseTutorial = (exerciseName: string, prescribedVideoUrl?: string) => {
    setSelectedTutorial(exerciseName);
    setSelectedTutorialVideoUrl(prescribedVideoUrl?.trim() || null);
    setPlayRate(1);
  };

  // States to persist custom exercise video URLs locally
  const [customExerciseVideos, setCustomExerciseVideos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('custom_exercise_videos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [editingVideoUrl, setEditingVideoUrl] = useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');

  // States for search and quick-filter by muscle group inside generator container
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [selectedMuscleCategory, setSelectedMuscleCategory] = useState<string>('Todos');
  const [routineSearchQuery, setRoutineSearchQuery] = useState('');
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false);

  const appSubscriptionLabel = user.subscribedPrice || '€5,99 / mês';
  const appSubscriptionAmount = (() => {
    const raw = appSubscriptionLabel.replace(',', '.');
    const match = raw.match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 5.99;
  })();
  const hasCoachLink = !!user.coachLinked || !!user.coachEmail || (user.subscribedPlan || '').toLowerCase().includes('orientado');

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playRate;
    }
  }, [playRate, selectedTutorial]);
  
  const [workoutExercisesProgress, setWorkoutExercisesProgress] = useState<Array<{
    name: string;
    setsCount: number;
    weightPrescribed?: string;
    weightLogged?: string;
    setsCompletedCount: number;
  }>>([]);

  // Find unique days from currentRoutine
  const uniqueDays = React.useMemo(() => {
    if (!currentRoutine || !currentRoutine.exercises) return [];
    const days = currentRoutine.exercises
      .map(ex => ex.day)
      .filter((day): day is string => !!day);
    return Array.from(new Set(days));
  }, [currentRoutine]);

  // Sync selected day tab when routine loaded
  useEffect(() => {
    if (uniqueDays.length > 0) {
      if (!selectedDayTab || !uniqueDays.includes(selectedDayTab)) {
        setSelectedDayTab(uniqueDays[0]);
      }
    } else {
      setSelectedDayTab('');
    }
  }, [uniqueDays, selectedDayTab]);

  // Active exercises for the active workout session (based on selectedDayTab if multi-day)
  const activeExercises = React.useMemo(() => {
    if (!currentRoutine || !currentRoutine.exercises) return [];
    if (uniqueDays.length <= 1) return currentRoutine.exercises;
    const filtered = currentRoutine.exercises.filter(ex => ex.day === selectedDayTab);
    return filtered.length > 0 ? filtered : currentRoutine.exercises;
  }, [currentRoutine, selectedDayTab, uniqueDays]);

  // Real-time search/filter for matching current displayed routine exercises by name or muscle group
  const filteredActiveExercisesForDisplay = React.useMemo(() => {
    if (!routineSearchQuery.trim()) return activeExercises;
    const query = routineSearchQuery.toLowerCase().trim();
    return activeExercises.filter(ex => {
      const nameMatch = ex.name.toLowerCase().includes(query);
      const obsMatch = ex.observation ? ex.observation.toLowerCase().includes(query) : false;
      const dayMatch = ex.day ? ex.day.toLowerCase().includes(query) : false;
      
      // Look up muscle group in DEFAULT_SEARCHABLE_EXERCISES
      const libraryEx = DEFAULT_SEARCHABLE_EXERCISES.find(le => 
        le.name.toLowerCase() === ex.name.toLowerCase() || 
        ex.name.toLowerCase().includes(le.name.toLowerCase()) ||
        le.name.toLowerCase().includes(ex.name.toLowerCase())
      );
      const muscleMatch = libraryEx ? libraryEx.muscleGroup.toLowerCase().includes(query) : false;
      
      return nameMatch || obsMatch || dayMatch || muscleMatch;
    });
  }, [activeExercises, routineSearchQuery]);

  const getLocalFallbackExercisesSplit = (daysSelected: string | number, level: string, timeAvailable?: string | number) => {
    const days = Math.max(1, Math.min(7, Number(daysSelected) || 3));
    const time = Number(timeAvailable) || 60;
    
    if (level === 'Iniciante') {
      if (time <= 50) {
        // Shorter 4-exercise adaptation routine for session <= 40-50 minutes
        return [
          { day: "Corpo Inteiro (Adaptação Rápida)", name: "Agachamento Globo (Goblet Squat)", sets: 3, reps: "12-15", rest: "60s", observation: "Postura ereta, adapte a carga para aprender o movimento." },
          { day: "Corpo Inteiro (Adaptação Rápida)", name: "Supino Horizontal Articulado (Máquina)", sets: 3, reps: "12-15", rest: "60s", observation: "Controle as fases excêntrica e concêntrica." },
          { day: "Corpo Inteiro (Adaptação Rápida)", name: "Puxada Aberta Máquina (Pulley)", sets: 3, reps: "12-15", rest: "60s", observation: "Mantenha o peito aberto, ombros para baixo." },
          { day: "Corpo Inteiro (Adaptação Rápida)", name: "Flexão Abdominal de Adaptação", sets: 3, reps: "15", rest: "45s", observation: "Contraia o abdômen sem forçar o pescoço." }
        ];
      } else {
        // Regular 6-exercise adaptation routine for session > 45 minutes
        return [
          { day: "Corpo Inteiro - Adaptação", name: "Agachamento Globo (Goblet Squat)", sets: 3, reps: "12-15", rest: "60s", observation: "Postura ereta e calcanhares firmes no chão." },
          { day: "Corpo Inteiro - Adaptação", name: "Supino Horizontal Articulado (Máquina)", sets: 3, reps: "12-15", rest: "60s", observation: "Controle as fases excêntrica e concêntrica." },
          { day: "Corpo Inteiro - Adaptação", name: "Puxada Aberta Máquina (Pulley)", sets: 3, reps: "12-15", rest: "60s", observation: "Mantenha o peito aberto, ombros para baixo." },
          { day: "Corpo Inteiro - Adaptação", name: "Desenvolvimento de Ombros com Halteres", sets: 3, reps: "12", rest: "60s", observation: "Cadência controlada, sem travar cotovelos." },
          { day: "Corpo Inteiro - Adaptação", name: "Cadeira Extensora", sets: 3, reps: "15", rest: "45s" },
          { day: "Corpo Inteiro - Adaptação", name: "Flexão Abdominal (Solo)", sets: 3, reps: "15-20", rest: "45s", observation: "Contraia o abdômen sem forçar o pescoço." }
        ];
      }
    }

    if (level === 'Intermediário') {
      if (days === 1) {
        return [
          { day: "Dia A - Corpo Inteiro", name: "Agachamento Livre", sets: 4, reps: "10-12", rest: "90s", observation: "Foco na amplitude segura." },
          { day: "Dia A - Corpo Inteiro", name: "Supino Reto com Barra", sets: 4, reps: "10", rest: "90s", observation: "Controle a descida." },
          { day: "Dia A - Corpo Inteiro", name: "Puxada Aberta Pulley", sets: 4, reps: "12", rest: "60s" },
          { day: "Dia A - Corpo Inteiro", name: "Desenvolvimento Halteres", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia A - Corpo Inteiro", name: "Rosca Direta", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia A - Corpo Inteiro", name: "Tríceps Corda", sets: 3, reps: "12", rest: "60s" }
        ];
      } else if (days === 2) {
        return [
          { day: "Dia A - Superior", name: "Supino Reto com Barra", sets: 4, reps: "8-10", rest: "90s" },
          { day: "Dia A - Superior", name: "Puxada Alta Pronada", sets: 4, reps: "10-12", rest: "60s" },
          { day: "Dia A - Superior", name: "Desenvolvimento Ombros", sets: 3, reps: "10", rest: "60s" },
          { day: "Dia A - Superior", name: "Elevação Lateral", sets: 3, reps: "15", rest: "45s" },
          { day: "Dia A - Superior", name: "Rosca Alternada", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia B - Inferior + Core", name: "Agachamento Hack", sets: 4, reps: "10-12", rest: "90s" },
          { day: "Dia B - Inferior + Core", name: "Leg Press 45", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia B - Inferior + Core", name: "Cadeira Extensora", sets: 3, reps: "12", rest: "45s" },
          { day: "Dia B - Inferior + Core", name: "Mesa Flexora", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia B - Inferior + Core", name: "Prancha Abdominal", sets: 3, reps: "45s", rest: "30s" }
        ];
      } else if (days === 3) {
        // PUSH SPLIT INTERMEDIATE: 4 chest, 3 triceps, 2 shoulder exercises
        return [
          // Peito (4 exercícios)
          { day: "Dia A - Peito, Ombros e Tríceps", name: "Supino Inclinado com Halteres", sets: 4, reps: "10", rest: "90s", observation: "Foco no peitoral superior." },
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

          // Pernas (4 exercícios) + Panturrilhas + Core
          { day: "Dia C - Membros Inferiores", name: "Agachamento Livre", sets: 4, reps: "10-12", rest: "90s" },
          { day: "Dia C - Membros Inferiores", name: "Leg Press 45", sets: 4, reps: "12", rest: "60s" },
          { day: "Dia C - Membros Inferiores", name: "Cadeira Extensora", sets: 3, reps: "15", rest: "45s" },
          { day: "Dia C - Membros Inferiores", name: "Mesa Flexora", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia C - Membros Inferiores", name: "Gêmeos em Pé (Panturrilhas)", sets: 4, reps: "15", rest: "45s" },
          { day: "Dia C - Membros Inferiores", name: "Prancha Abdominal Estática", sets: 3, reps: "45s", rest: "30s" }
        ];
      } else {
        return [
          { day: "Dia A - Peito & Tríceps", name: "Supino Reto com Barra", sets: 4, reps: "8-10", rest: "90s" },
          { day: "Dia A - Peito & Tríceps", name: "Supino Inclinado Halteres", sets: 4, reps: "10-12", rest: "75s" },
          { day: "Dia A - Peito & Tríceps", name: "Fly em Máquina (Peck Deck)", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia A - Peito & Tríceps", name: "Polia Crossover", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia A - Peito & Tríceps", name: "Tríceps Testa", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia A - Peito & Tríceps", name: "Tríceps Corda", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia B - Costas & Bíceps", name: "Puxada Aberta Pronada", sets: 4, reps: "10-12", rest: "60s" },
          { day: "Dia B - Costas & Bíceps", name: "Remada Curvada", sets: 4, reps: "10", rest: "90s" },
          { day: "Dia B - Costas & Bíceps", name: "Remada Unilateral", sets: 3, reps: "12", rest: "60s" },
          { day: "Dia B - Costas & Bíceps", name: "Rosca Direta Barra W", sets: 3, reps: "10", rest: "60s" },
          { day: "Dia B - Costas & Bíceps", name: "Rosca Martelo", sets: 3, reps: "12", rest: "60s" }
        ];
      }
    }

    // LEVEL: AVANÇADO (High volume, target muscle routing: 5 Costas, 4 Biceps, 1 Trapezius etc. or similar ratios for Peito/Ombros/Triceps)
    return [
      // COSTAS (5 exercícios)
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Pranchas Wide-Grip (Barra Fixa)", sets: 4, reps: "Até a falha", rest: "90s", observation: "Ativação de dorsais em amplitude máxima." },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Remada Curvada com Barra Pesada", sets: 4, reps: "8-10", rest: "90s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Puxada Aberta na Polia Alta", sets: 4, reps: "10", rest: "75s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Remada Unilateral Serrote (Halter)", sets: 3, reps: "10", rest: "60s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Pull-over com Haltere Pesado", sets: 3, reps: "12-15", rest: "75s" },
      // BÍCEPS (4 exercícios)
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Direta com Barra Reta", sets: 4, reps: "8-10", rest: "75s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Inclinada com Halteres (45°)", sets: 4, reps: "10", rest: "60s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Scott com Barra W", sets: 3, reps: "10-12", rest: "60s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Martelo Corda", sets: 3, reps: "12", rest: "60s" },
      // TRAPÉZIO (1 exercício)
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Encolhimento de Ombros com Halteres Pesado", sets: 4, reps: "12-15", rest: "60s", observation: "Isometria de 1.5s no topo do movimento." },

      // PEITO (5 exercícios)
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Supino Reto com Barra Olímpica", sets: 4, reps: "8-10", rest: "90s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Supino Inclinado com Halteres Pesado", sets: 4, reps: "10", rest: "90s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Crucifixo Inclinado Halteres", sets: 3, reps: "12", rest: "75s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Crossover Cabo Polia Média", sets: 3, reps: "12", rest: "60s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Flexão de Braços Decrescente (Falha)", sets: 3, reps: "Falha", rest: "60s" },
      // OMBROS (3 exercícios)
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Desenvolvimento Militar de Ombros com Barra", sets: 4, reps: "8-10", rest: "90s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Elevação Lateral com Halteres (Dropset)", sets: 4, reps: "10+Falha", rest: "60s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Elevação Frontal com Barra", sets: 3, reps: "12", rest: "60s" },
      // TRÍCEPS (4 exercícios)
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Tríceps Testa com Barra W", sets: 4, reps: "10", rest: "75s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Supino com Pegada Fechada (Close-Grip)", sets: 3, reps: "10", rest: "75s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Tríceps Corda Polia Alta", sets: 3, reps: "12", rest: "60s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Tríceps Francês Unilateral", sets: 3, reps: "12", rest: "60s" },

      // PERNAS (5 exercícios)
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Agachamento Livre com Barra Pesado", sets: 4, reps: "8-10", rest: "120s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Leg Press 45° (Dropset)", sets: 4, reps: "12+12", rest: "90s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Cadeira Extensora (Série Pirâmide)", sets: 4, reps: "15/12/10/8", rest: "60s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Mesa Flexora (Controle Excêntrico)", sets: 4, reps: "10-12", rest: "60s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Stiff com Halteres Pesados", sets: 3, reps: "10", rest: "90s" },
      // PANTURRILHA (2 exercícios)
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Gêmeos em Pé Polia Elevada", sets: 4, reps: "15", rest: "45s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Gêmeos Sentado na Máquina", sets: 3, reps: "15", rest: "45s" },
      // CORE (2 exercícios)
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Abdominais Crunch na Polia Alta", sets: 4, reps: "15", rest: "60s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Elevação de Pernas Suspenso na Barra", sets: 3, reps: "15", rest: "65s" }
    ];
  };

  // Start executing active workout timer
  function startWorkout() {
    if (activeExercises.length === 0) return;
    setIsWorkoutActive(true);
    setCurrentExerciseIndex(0);
    setSecondsElapsed(0);
    
    // Clear old timers
    if (timerIntervalId) clearInterval(timerIntervalId);

    const intId = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    setTimerIntervalId(intId);

    // Initialize completed sets checklist
    const currentEx = activeExercises[0];
    setCompletedSets(Array(currentEx.sets).fill(false));

    // Initialize tracking progress
    setWorkoutExercisesProgress(activeExercises.map(ex => ({
      name: ex.name,
      setsCount: ex.sets,
      weightPrescribed: ex.weight || '',
      weightLogged: ex.weight || '',
      setsCompletedCount: 0
    })));
  }

  // Skip exercise or go forward
  function nextExercise() {
    if (activeExercises.length === 0) return;
    if (currentExerciseIndex < activeExercises.length - 1) {
      const nextIdx = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIdx);
      const nextEx = activeExercises[nextIdx];
      setCompletedSets(Array(nextEx.sets).fill(false));
    } else {
      // Finished all exercises
      finishWorkout();
    }
  }

  function finishWorkout() {
    if (timerIntervalId) clearInterval(timerIntervalId);
    setTimerIntervalId(null);
    setIsWorkoutActive(false);

    if (!currentRoutine) return;

    // Create log
    const durationMins = Math.max(1, Math.round(secondsElapsed / 60));
    const activeCal = Math.round(durationMins * 7 + 35); // base calculation
    const avgHr = Math.floor(Math.random() * (145 - 120)) + 120; // 120-145 HR

    const totalDone = workoutExercisesProgress.filter(p => p.setsCompletedCount > 0).length;

    const log: TrainingLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      routineId: currentRoutine.id,
      routineTitle: `${currentRoutine.title}${selectedDayTab ? ` - ${selectedDayTab}` : ''}`,
      durationMinutes: durationMins,
      caloriesBurned: activeCal,
      avgHeartRate: avgHr,
      rating: intensityRating,
      totalExercisesCompleted: totalDone,
      totalExercisesCount: activeExercises.length,
      loggedExercises: workoutExercisesProgress
    };

    onLogWorkout(log);
    alert(`Parabéns! Você completou: ${currentRoutine.title}${selectedDayTab ? ` (${selectedDayTab})` : ''}. (${durationMins} minutos, ${totalDone}/${activeExercises.length} exercícios concluídos, ~${activeCal} kcal)`);
  }

  const cancelWorkout = () => {
    if (timerIntervalId) clearInterval(timerIntervalId);
    setTimerIntervalId(null);
    setIsWorkoutActive(false);
  };

  const sendSimulatedWebhook = async (status: 'paid' | 'failed') => {
    if (!activeTransactionId) return;
    setVirtualPhoneStep('authorizing');
    try {
      const response = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'mbway_secret_webhook_signature_auth_token'
        },
        body: JSON.stringify({
          transactionId: activeTransactionId,
          amount: appSubscriptionAmount,
          event: status === 'paid' ? 'payment.success' : 'payment.failed',
          failureReason: status === 'failed' ? 'Cancelado intencionalmente na Sandbox Pessoal.' : undefined,
          timestamp: new Date().toISOString()
        })
      });
      const data = await response.json();
      if (data.success) {
        setVirtualPhoneStep(status === 'paid' ? 'success' : 'failed');
      } else {
        setVirtualPhoneStep('failed');
      }
    } catch (err) {
      console.error("Erro ao simular webhook de resposta:", err);
      setVirtualPhoneStep('failed');
    }
  };

  const handleQRInitiate = async () => {
    if (!currentRoutine) return;
    setPaymentError('');
    setIsPaying(true);
    setPinDots('');

    try {
      const response = await fetch('/api/payments/mbway/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: 'QR_CODE_SCAN',
          amount: appSubscriptionAmount
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.transaction) {
        throw new Error(data.error || 'Não foi possível gerar o código QR de pagamento.');
      }

      const transactionId = data.transaction.id;
      setQrTxId(transactionId);
      setActiveTransactionId(transactionId);
      setActivePhoneUsed('Leitura de Código QR');
      setVirtualPhoneStep('notified');

      // Iniciar pooling para ouvir se o Webhook confirmou ou reprovou o pagamento
      let attempts = 0;
      const maxAttempts = 90; // Aguardar no máximo 90 segundos

      const statusInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch(`/api/payments/mbway/status/${transactionId}`);
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();

          if (statusData.success && statusData.status !== 'pending') {
            clearInterval(statusInterval);
            setIsPaying(false);
            setQrTxId('');
            setActiveTransactionId('');
            setVirtualPhoneStep('idle');
            setPinDots('');

            if (statusData.status === 'paid') {
              setPaymentSuccess(true);
              const updated = [...unlockedRoutines, currentRoutine.id];
              setUnlockedRoutines(updated);
              localStorage.setItem('unlocked_routines', JSON.stringify(updated));

              setTimeout(() => {
                setPaymentSuccess(false);
              }, 1200);
            } else {
              setPaymentError(`O pagamento por QR Code falhou: ${statusData.transaction.failureReason || "Rejeitado."}`);
            }
          }
        } catch (pollErr) {
          console.error("Erro ao verificar estado QR Code:", pollErr);
        }

        if (attempts >= maxAttempts) {
          clearInterval(statusInterval);
          setIsPaying(false);
          setQrTxId('');
          setActiveTransactionId('');
          setVirtualPhoneStep('idle');
          setPinDots('');
          setPaymentError("O QR Code de pagamento expirou. Por favor, clique para gerar um novo QR Code.");
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setIsPaying(false);
      setPaymentError(err.message || 'Erro temporário nos servidores ao gerar QR Code.');
    }
  };

  useEffect(() => {
    if (mbwayMode === 'qr' && !qrTxId && !isPaying && !paymentSuccess) {
      handleQRInitiate();
    } else if (mbwayMode === 'phone') {
      setQrTxId('');
    }
  }, [mbwayMode]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoutine) return;

    if (!mbwayPhone) {
      setPaymentError('Por favor, introduza o seu número MB WAY.');
      return;
    }

    const cleanedPhone = mbwayPhone.trim().replace(/\s+/g, "");
    if (!/^[9][1236]\d{7}$/.test(cleanedPhone) && cleanedPhone.length < 9) {
      setPaymentError('Por favor, introduza um número de telemóvel MB WAY válido em Portugal (9 dígitos).');
      return;
    }

    setPaymentError('');
    setIsPaying(true);
    setPinDots('');

    try {
      // Inicia a transação com valor único de 20€ no servidor
      const response = await fetch('/api/payments/mbway/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: cleanedPhone,
          amount: appSubscriptionAmount
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.transaction) {
        throw new Error(data.error || 'Não foi possível estabelecer contato com o gateway de pagamentos.');
      }

      const transactionId = data.transaction.id;
      setActiveTransactionId(transactionId);
      setActivePhoneUsed(cleanedPhone);
      setVirtualPhoneStep('notified');

      // Iniciar pooling para ouvir se o Webhook confirmou ou reprovou o pagamento
      let attempts = 0;
      const maxAttempts = 90; // Aguardar no máximo 90 segundos

      const statusInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch(`/api/payments/mbway/status/${transactionId}`);
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();

          if (statusData.success && statusData.status !== 'pending') {
            clearInterval(statusInterval);
            setIsPaying(false);
            setActiveTransactionId('');
            setVirtualPhoneStep('idle');
            setPinDots('');

            if (statusData.status === 'paid') {
              setPaymentSuccess(true);
              // Armazena e desbloqueia o plano gerado
              const updated = [...unlockedRoutines, currentRoutine.id];
              setUnlockedRoutines(updated);
              localStorage.setItem('unlocked_routines', JSON.stringify(updated));

              setTimeout(() => {
                setPaymentSuccess(false);
              }, 1200);
            } else {
              // failed
              setPaymentError(`O pagamento foi rejeitado: ${statusData.transaction.failureReason || "Rejeitado na aplicação MB WAY."}`);
            }
          }
        } catch (pollErr) {
          console.error("Erro ao poller estado de pagamento:", pollErr);
        }

        if (attempts >= maxAttempts) {
          clearInterval(statusInterval);
          setIsPaying(false);
          setActiveTransactionId('');
          setVirtualPhoneStep('idle');
          setPinDots('');
          setPaymentError("Tempo limite esgotado. Por favor, verifique a sua aplicação e tente novamente.");
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setIsPaying(false);
      setPaymentError(err.message || 'Erro temporário nos servidores de pagamento.');
    }
  };

  // Automatically persist the active/last generated routine in localStorage whenever it changes
  useEffect(() => {
    if (hasCoachLink) {
      return;
    }

    if (currentRoutine) {
      const userKey = user?.studentId 
        ? user.studentId.trim().toUpperCase() 
        : (user?.email ? user.email.trim().toUpperCase() : 'GUEST');
      localStorage.setItem(`treino_active_routine_${userKey}`, JSON.stringify(currentRoutine));
    }
  }, [currentRoutine, user?.studentId, user?.email, hasCoachLink]);

  // Load last generated or offline fallback
  useEffect(() => {
    let isMounted = true;

    // Priority 1: Check if there is a PT prescribed routine for this student
    const studentIdKey = user?.studentId;
    const routineLookupKey = studentIdKey || user?.email;
    if (studentIdKey) {
      let prescribedStr = localStorage.getItem(`treino_prescribed_routine_${studentIdKey.trim().toUpperCase()}`);
      if (!prescribedStr) {
        prescribedStr = localStorage.getItem(`treino_prescribed_routine_${studentIdKey.trim()}`);
      }
      if (prescribedStr) {
        try {
          const prescribed = JSON.parse(prescribedStr);
          setCurrentRoutine(prescribed);
          if (!hasCoachLink) {
            return;
          }
        } catch (e) {
          console.error("Erro ao carregar treino prescrito:", e);
        }
      }
    }

    if (hasCoachLink) {
      let retryTimer: number | undefined;
      let pollTimer: number | undefined;
      if (routineLookupKey) {
        const fetchPrescribedRoutine = () => {
          loadPrescribedRoutineForStudent(user.coachEmail, routineLookupKey, user.email)
            .then(async (cloudRoutine) => {
              let routine = cloudRoutine;
              if (!routine && user.email) {
                const routines = await loadWorkoutRoutines(user.email);
                routine = routines.find(item => item.id.startsWith('prescribed-')) || routines[0] || null;
              }
              if (!isMounted || !routine) return;
              setCurrentRoutine(routine);
              const isNewRoutine = lastNotifiedRoutineId.current !== routine.id;
              if (isNewRoutine) {
                lastNotifiedRoutineId.current = routine.id;
                setPrescriptionNotice(`Novo treino recebido: ${routine.title}`);
              }
              if (isNewRoutine && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('Treino Inteligente', {
                  body: `O seu Personal publicou "${routine.title}".`
                });
              }
              localStorage.setItem(`treino_prescribed_routine_${routineLookupKey.trim().toUpperCase()}`, JSON.stringify(routine));
            })
            .catch(console.error);
        };
        fetchPrescribedRoutine();
        retryTimer = window.setTimeout(fetchPrescribedRoutine, 1800);
        pollTimer = window.setInterval(fetchPrescribedRoutine, 10000);
      }
      return () => {
        isMounted = false;
        if (retryTimer) {
          window.clearTimeout(retryTimer);
        }
        if (pollTimer) {
          window.clearInterval(pollTimer);
        }
      };
    }

    if (routineLookupKey) {
      loadPrescribedRoutineForStudent(user.coachEmail, routineLookupKey, user.email)
        .then((cloudRoutine) => {
          if (!isMounted || !cloudRoutine) return;
          setCurrentRoutine(cloudRoutine);
          if (lastNotifiedRoutineId.current !== cloudRoutine.id) {
            lastNotifiedRoutineId.current = cloudRoutine.id;
            setPrescriptionNotice(`Novo treino recebido: ${cloudRoutine.title}`);
          }
          localStorage.setItem(`treino_prescribed_routine_${routineLookupKey.trim().toUpperCase()}`, JSON.stringify(cloudRoutine));
        })
        .catch(console.error);
    }

    if (hasCoachLink) {
      setCurrentRoutine(null);
      return;
    }

    // Priority 2: Stored active/self-generated routine for this student
    const userKey = user?.studentId 
      ? user.studentId.trim().toUpperCase() 
      : (user?.email ? user.email.trim().toUpperCase() : 'GUEST');
    const activeStr = localStorage.getItem(`treino_active_routine_${userKey}`);
    if (activeStr) {
      try {
        const active = JSON.parse(activeStr);
        setCurrentRoutine(active);
        return;
      } catch (e) {
        console.error("Erro ao carregar treino ativo salvo:", e);
      }
    }

    // Priority 3: Stored offline workouts
    if (savedOfflineWorkouts.length > 0) {
      setCurrentRoutine(savedOfflineWorkouts[0]);
    }
    return () => {
      isMounted = false;
    };
  }, [user?.studentId, user?.email, user?.coachEmail, savedOfflineWorkouts, hasCoachLink]);

  // Sync active calorie tick with timer
  useEffect(() => {
    if (isWorkoutActive) {
      setActiveCalorieTick(Math.round(secondsElapsed * 0.18)); // Approx 11 calories/minute
    }
  }, [secondsElapsed, isWorkoutActive]);

  const handleGenerateWorkout = async () => {
    if (hasCoachLink) {
      alert('A sua conta esta vinculada a um Personal Trainer. O treino sera disponibilizado quando o Personal gerar ou prescrever a rotina.');
      return;
    }

    if (
      !height || !weight || isNaN(Number(height)) || isNaN(Number(weight)) || Number(height) <= 30 || Number(weight) <= 15 ||
      !daysPerWeek || !availableTime || isNaN(Number(daysPerWeek)) || isNaN(Number(availableTime)) || Number(daysPerWeek) < 1 || Number(daysPerWeek) > 7 || Number(availableTime) < 10
    ) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setIsLoading(true);

    if (isOfflineMode) {
      // Offline fallback: Use localized generator split
      setTimeout(() => {
        const fallbackId = `offline-${Date.now()}`;
        const exercisesList = getLocalFallbackExercisesSplit(daysPerWeek, user.experienceLevel, availableTime);
        const generated: WorkoutRoutine = {
          id: fallbackId,
          title: `Plano de Treinos Completo (${user.experienceLevel}) [Offline]`,
          focus: `${daysPerWeek} Dias por Semana - ${user.objective}`,
          objective: user.objective,
          level: user.experienceLevel,
          createdAt: new Date().toISOString(),
          exercises: exercisesList
        };
        setCurrentRoutine(generated);
        setShowRoutineBuilder(false);
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceLevel: user.experienceLevel,
          objective: user.objective,
          height: height,
          weight: weight,
          daysPerWeek: daysPerWeek,
          availableTime: availableTime
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar treino com IA.');
      }

      const data = await response.json();
      const generated: WorkoutRoutine = {
        id: `routine-${Date.now()}`,
        title: data.title,
        focus: data.focus,
        objective: user.objective,
        level: user.experienceLevel,
        createdAt: new Date().toISOString(),
        exercises: data.exercises
      };
      
      setCurrentRoutine(generated);
      setShowRoutineBuilder(false);
    } catch (err) {
      console.error(err);
      // Fail over to internal local template split
      const fallbackId = `fallback-${Date.now()}`;
      const exercisesList = getLocalFallbackExercisesSplit(daysPerWeek, user.experienceLevel, availableTime);
      const generated: WorkoutRoutine = {
        id: fallbackId,
        title: `Plano de Treinos Completo (${user.experienceLevel})`,
        focus: `${daysPerWeek} Dias por Semana - ${user.objective}`,
        objective: user.objective,
        level: user.experienceLevel,
        createdAt: new Date().toISOString(),
        exercises: exercisesList
      };
      setCurrentRoutine(generated);
      setShowRoutineBuilder(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSetCompleted = (index: number) => {
    const nextSets = [...completedSets];
    nextSets[index] = !nextSets[index];
    setCompletedSets(nextSets);

    const activeEx = activeExercises[currentExerciseIndex];
    if (activeEx) {
      setWorkoutExercisesProgress(prev => {
        const nextProg = [...prev];
        const currentProg = nextProg[currentExerciseIndex] || {
          name: activeEx.name,
          setsCount: activeEx.sets,
          weightPrescribed: activeEx.weight || '',
          weightLogged: activeEx.weight || '',
          setsCompletedCount: 0
        };
        const completedCount = nextSets.filter(Boolean).length;
        nextProg[currentExerciseIndex] = {
          ...currentProg,
          weightLogged: activeEx.weight || '',
          setsCompletedCount: completedCount
        };
        return nextProg;
      });
    }
  };

  const isCurrentDownloaded = currentRoutine && savedOfflineWorkouts.some(w => w.title === currentRoutine.title);

  return (
    <div className="space-y-6" id="generator-container">
      {/* Real-time Routine Exercise Search Input (Top of #generator-container) */}
      <div className={`p-4 rounded-2xl border text-left flex flex-col md:flex-row gap-4 items-center justify-between transition-all ${
        darkMode ? 'bg-[#141414] border-brand-border' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="w-full md:w-5/12 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${darkMode ? 'bg-brand-neon/10 text-brand-neon' : 'bg-emerald-500/10 text-emerald-600'}`}>
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-stone-900'}`}>
              {t('workout.searchTitle')}
            </h4>
            <p className="text-[10px] text-stone-400 mt-0.5 leading-normal">
              {t('workout.searchDesc')}
            </p>
          </div>
        </div>

        <div className="w-full md:w-7/12 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
            darkMode ? 'text-stone-500' : 'text-stone-400'
          }`} />
          <input
            type="text"
            placeholder={
              currentRoutine 
                ? t('workout.searchRoutine')
                : t('workout.noActiveRoutinePlaceholder')
            }
            disabled={!currentRoutine}
            value={routineSearchQuery}
            onChange={(e) => setRoutineSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-medium focus:ring-1 outline-none transition-all ${
              !currentRoutine 
                ? 'bg-stone-100/10 text-stone-500 border-stone-200/20 cursor-not-allowed'
                : darkMode 
                  ? 'bg-[#121212] border-brand-border/60 text-white placeholder-stone-500 focus:ring-brand-neon' 
                  : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-450 focus:bg-white focus:ring-emerald-500'
            }`}
          />
          {routineSearchQuery && (
            <button
              type="button"
              onClick={() => setRoutineSearchQuery('')}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors ${
                darkMode ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          </div>
          {!hasCoachLink && (
            <button
              type="button"
              onClick={() => setShowRoutineBuilder(true)}
              className={`px-3.5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                darkMode
                  ? 'bg-brand-neon text-black border-transparent hover:bg-white'
                  : 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('workout.createNewRoutine')}
            </button>
          )}
        </div>
      </div>

      {prescriptionNotice && (
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
          darkMode ? 'bg-brand-neon/10 border-brand-neon/25 text-stone-100' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-brand-neon' : 'text-emerald-600'}`} />
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest">Treino publicado pelo Personal</h3>
              <p className={`text-xs mt-1 ${darkMode ? 'text-stone-300' : 'text-emerald-800'}`}>{prescriptionNotice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPrescriptionNotice('')}
            className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10 text-stone-300' : 'hover:bg-emerald-100 text-emerald-700'}`}
            aria-label="Fechar notificacao"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isWorkoutActive ? (
          <motion.div
            key="generator-setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Coach & Subscription Billing Dashboard Card */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between items-stretch text-left ${
              darkMode ? 'bg-[#141414] border-brand-border' : 'bg-white border-stone-200'
            }`}>
              {/* Part 1: App subscription premium (€ 6.99) */}
              <div className="flex-1 flex items-start gap-3.5 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className={`p-2.5 rounded-lg shrink-0 ${darkMode ? 'bg-brand-neon/10 text-brand-neon' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{t('workout.appSubscription')}</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:bg-brand-neon/15 dark:text-brand-neon">
                      Ativo
                    </span>
                  </div>
                  <h4 className={`text-sm font-black mt-1 uppercase tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                    {appSubscriptionLabel} <span className="text-[10px] text-stone-400 font-semibold lowercase">/ assinatura</span>
                  </h4>
                  <p className="text-[10.5px] text-stone-400 mt-1 leading-normal">
                    Assinatura que liberta a geração ilimitada de treinos por Inteligência Artificial do Workout Generator e relatórios.
                  </p>
                </div>
              </div>

              {/* Part 2: Personal Coach Charging Rate */}
              {hasCoachLink && coachPricing.isActive && (
              <div className="flex-1 flex items-start gap-3.5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">{t('workout.coachTracking')}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      coachPricing.isActive 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-stone-500/10 text-stone-400'
                    }`}>
                      {coachPricing.isActive ? 'Vínculo Ativo' : 'Vínculo Inativo'}
                    </span>
                  </div>
                  <h4 className={`text-sm font-black mt-1 uppercase tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                    {coachPricing.value.toFixed(2)} € 
                    <span className="text-[10px] text-stone-400 font-semibold italic">
                      {coachPricing.type === 'mensal' ? ' / plano mensal' : ' / hora aula'}
                    </span>
                  </h4>
                  <p className="text-[10.5px] text-stone-400 mt-1 leading-normal">
                    {coachPricing.isActive ? (
                      <span>Valor definido pelo seu treinador para prescrições personalizadas e acompanhamento direto.</span>
                    ) : (
                      <span className="text-stone-450 italic">Sem taxa registada. Contacte o seu Coach para atualizar e registar a matrícula.</span>
                    )}
                  </p>
                </div>
              </div>
              )}
            </div>

            {/* Campo de Pesquisa e Biblioteca de Exercícios no #generator-container */}
            {currentRoutine && (
            <div className={`p-6 rounded-2xl border text-left ${
              darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Search className={`w-5 h-5 ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`} />
                  <div>
                    <h3 className="font-bold text-base uppercase tracking-tight">Biblioteca & Guia de Exercícios</h3>
                    <p className={`text-[10px] sm:text-[10.5px] mt-0.5 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                      Pesquise a execução correta, postura e vídeos explicativos antes de gerar ou iniciar a rotina.
                    </p>
                  </div>
                </div>
              </div>

              {/* Search input with left icon & clear button */}
              <div className="relative mb-4">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-stone-500' : 'text-stone-400'
                }`} />
                <input
                  type="text"
                  placeholder="Pesquise por nome (Ex: Supino) ou músculo (Ex: Quadríceps, Peito, Biceps)..."
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs focus:ring-1 outline-none transition-all ${
                    darkMode 
                      ? 'bg-[#121212] border-brand-border/60 text-white placeholder-stone-500 focus:ring-brand-neon' 
                      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-450 focus:bg-white focus:ring-emerald-500'
                  }`}
                />
                {exerciseSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setExerciseSearchQuery('')}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors ${
                      darkMode ? 'text-stone-400' : 'text-stone-500'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Quick Filters */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {['Todos', 'Membros Superiores', 'Membros Inferiores', 'Core & Abdominais'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedMuscleCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedMuscleCategory === cat
                        ? darkMode
                          ? 'bg-brand-neon text-black font-black'
                          : 'bg-emerald-500 text-white font-bold'
                        : darkMode
                          ? 'bg-zinc-900 text-stone-300 hover:bg-white/5 border border-brand-border/40'
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {cat === 'Todos' ? 'Todos os Músculos' : cat}
                  </button>
                ))}
              </div>

              {/* Real-time Search Results Grid */}
              {(() => {
                const query = exerciseSearchQuery.toLowerCase().trim();
                const filtered = DEFAULT_SEARCHABLE_EXERCISES.filter(ex => {
                  const matchesQuery = query === '' || 
                    ex.name.toLowerCase().includes(query) || 
                    ex.muscleGroup.toLowerCase().includes(query) ||
                    ex.category.toLowerCase().includes(query);
                  const matchesCategory = selectedMuscleCategory === 'Todos' || ex.category === selectedMuscleCategory;
                  return matchesQuery && matchesCategory;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-6 text-stone-400 bg-stone-100/10 dark:bg-zinc-900/10 rounded-xl border border-dashed border-stone-200/20 dark:border-brand-border/20">
                      <p className="text-xs">Nenhum exercício encontrado para "{exerciseSearchQuery}".</p>
                      <button
                        type="button"
                        onClick={() => {
                          setExerciseSearchQuery('');
                          setSelectedMuscleCategory('Todos');
                        }}
                        className={`mt-2 text-[10px] font-black uppercase text-brand-neon hover:underline`}
                      >
                        Limpar filtros
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {filtered.map((ex) => (
                      <div
                        key={ex.name}
                        onClick={() => setSelectedTutorial(ex.name)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group h-full min-h-[90px] sm:min-h-[100px] ${
                          darkMode 
                            ? 'bg-zinc-900/45 border-brand-border/40 hover:bg-brand-neon/5 hover:border-brand-neon/30' 
                            : 'bg-stone-50 border-stone-200 hover:bg-emerald-500/[0.04] hover:border-emerald-500/20'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-xs font-bold leading-tight uppercase tracking-tight transition-colors ${
                              darkMode ? 'text-white group-hover:text-brand-neon' : 'text-stone-900 group-hover:text-emerald-600'
                            }`}>
                              {ex.name}
                            </h4>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap ${
                              ex.category === 'Membros Superiores'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                                : ex.category === 'Membros Inferiores'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                            }`}>
                              {ex.category.split(' ')[0]}
                            </span>
                          </div>
                          <p className={`text-[10px] line-clamp-1 italic ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                            {ex.muscleGroup}
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-2.5">
                          <span className={`text-[8.5px] font-bold uppercase tracking-widest ${
                            darkMode ? 'text-brand-neon group-hover:opacity-100 opacity-60' : 'text-emerald-600 group-hover:opacity-100 opacity-65'
                          }`}>
                            Ver Guia
                          </span>
                          <Play className={`w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5 ${
                            darkMode ? 'text-brand-neon' : 'text-emerald-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            )}

            {hasCoachLink && !currentRoutine && (
              <div className={`p-6 rounded-2xl border text-left ${
                darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-tight">
                      {t('workout.waitingCoachTitle')}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                      {t('workout.waitingCoachDesc').replace('{coach}', user.coachName || user.coachEmail || 'responsável')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick stats and action cards */}
            {(!hasCoachLink && (!currentRoutine || showRoutineBuilder)) && (
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className={`w-5 h-5 animate-pulse ${darkMode ? 'text-brand-neon' : 'text-amber-500'}`} />
                  <h3 className="font-bold text-base uppercase tracking-tight">{t('workout.createRoutineTitle')}</h3>
                </div>
                {isOfflineMode && (
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full flex items-center gap-1 ${
                    darkMode ? 'bg-brand-neon/10 text-brand-neon border border-brand-neon/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5" /> offline
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-3.5 p-4 rounded-xl border text-left bg-zinc-900/10 border-brand-border-muted">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block">
                    Treino Customizado para o seu Perfil
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Level Selector */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Nível de Treino</span>
                      <select
                        value={user.experienceLevel}
                        onChange={(e) => onChangeProfile && onChangeProfile({ experienceLevel: e.target.value as any })}
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                          darkMode 
                            ? 'bg-[#181818] border-brand-border text-brand-neon' 
                            : 'bg-white border-stone-200 text-emerald-600'
                        }`}
                      >
                        <option value="Iniciante">Iniciante</option>
                        <option value="Intermediário">Intermediário</option>
                        <option value="Avançado">Avançado</option>
                      </select>
                    </div>

                    {/* Objective Selector */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Objetivo</span>
                      <select
                        value={
                          ['Hipertrofia', 'Emagrecimento', 'Força', 'Resistência'].includes(user.objective)
                            ? user.objective
                            : 'Hipertrofia'
                        }
                        onChange={(e) => onChangeProfile && onChangeProfile({ objective: e.target.value })}
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                          darkMode 
                            ? 'bg-[#181818] border-brand-border text-brand-neon' 
                            : 'bg-white border-stone-200 text-emerald-600'
                        }`}
                      >
                        <option value="Hipertrofia">Hipertrofia muscular</option>
                        <option value="Emagrecimento">Definição & Emagrecimento</option>
                        <option value="Força">Força (Powerlifting)</option>
                        <option value="Resistência">Resistência muscular</option>
                      </select>
                    </div>
                  </div>
                  
                  <p className="text-[10.5px] text-stone-400 leading-normal pt-1">
                    Cada nova rotina gerada pela IA será estruturada especificamente com base no seu nível de experiência de treino e foco escolhidos acima.
                  </p>
                </div>

                {/* Registo de Dados Físicos Obrigatórios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1.5">
                      Altura (cm) *
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 175"
                      value={height}
                      onChange={(e) => {
                        setHeight(e.target.value);
                        localStorage.setItem('user_height', e.target.value);
                        const key = user?.studentId ? user.studentId.trim().toUpperCase() : (user?.email ? user.email.trim().toUpperCase() : 'GUEST');
                        localStorage.setItem(`user_height_${key}`, e.target.value);
                        const nextHeight = parseFloat(e.target.value);
                        if (onChangeProfile && !Number.isNaN(nextHeight)) {
                          onChangeProfile({ height: nextHeight });
                        }
                      }}
                      className={`w-full px-3.5 py-3 rounded-lg border text-xs font-bold focus:outline-none transition-all ${
                        darkMode 
                          ? 'bg-[#181818] border-brand-border text-stone-100 placeholder-zinc-500 focus:ring-1 focus:ring-brand-neon/30' 
                          : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:ring-1 focus:ring-emerald-500/30'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1.5">
                      Peso (kg) *
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 75"
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value);
                        localStorage.setItem('user_weight', e.target.value);
                        const key = user?.studentId ? user.studentId.trim().toUpperCase() : (user?.email ? user.email.trim().toUpperCase() : 'GUEST');
                        localStorage.setItem(`user_weight_${key}`, e.target.value);
                        const nextWeight = parseFloat(e.target.value);
                        if (onChangeProfile && !Number.isNaN(nextWeight)) {
                          onChangeProfile({ weight: nextWeight });
                        }
                      }}
                      className={`w-full px-3.5 py-3 rounded-lg border text-xs font-bold focus:outline-none transition-all ${
                        darkMode 
                          ? 'bg-[#181818] border-brand-border text-stone-100 placeholder-zinc-500 focus:ring-1 focus:ring-brand-neon/30' 
                          : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:ring-1 focus:ring-emerald-500/30'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Registo de rotina semanal e tempo de treino */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1.5">
                      Dias de Treino / Semana *
                    </label>
                    <select
                      value={daysPerWeek}
                      onChange={(e) => {
                        setDaysPerWeek(e.target.value);
                        localStorage.setItem('user_days_per_week', e.target.value);
                        const key = user?.studentId ? user.studentId.trim().toUpperCase() : (user?.email ? user.email.trim().toUpperCase() : 'GUEST');
                        localStorage.setItem(`user_days_per_week_${key}`, e.target.value);
                      }}
                      className={`w-full px-3.5 py-3 rounded-lg border text-xs font-bold focus:outline-none transition-all ${
                        darkMode 
                          ? 'bg-[#181818] border-brand-border text-stone-100 placeholder-zinc-500 focus:ring-1 focus:ring-brand-neon/30' 
                          : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-450 focus:ring-1 focus:ring-emerald-500/30'
                      }`}
                      required
                    >
                      <option value="1">1 dia/semana</option>
                      <option value="2">2 dias/semana</option>
                      <option value="3">3 dias/semana</option>
                      <option value="4">4 dias/semana</option>
                      <option value="5">5 dias/semana</option>
                      <option value="6">6 dias/semana</option>
                      <option value="7">7 dias/semana</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1.5">
                      Tempo de Treino (minutos) *
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 60"
                      min="10"
                      value={availableTime}
                      onChange={(e) => {
                        setAvailableTime(e.target.value);
                        localStorage.setItem('user_available_time', e.target.value);
                        const key = user?.studentId ? user.studentId.trim().toUpperCase() : (user?.email ? user.email.trim().toUpperCase() : 'GUEST');
                        localStorage.setItem(`user_available_time_${key}`, e.target.value);
                      }}
                      className={`w-full px-3.5 py-3 rounded-lg border text-xs font-bold focus:outline-none transition-all ${
                        darkMode 
                          ? 'bg-[#181818] border-brand-border text-stone-100 placeholder-zinc-500 focus:ring-1 focus:ring-brand-neon/30' 
                          : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:ring-1 focus:ring-emerald-500/30'
                      }`}
                      required
                    />
                  </div>
                </div>

                {showError && (
                  <p className="text-xs text-rose-500 font-extrabold flex items-center gap-1 mt-1 transition-all">
                    ⚠️ Por favor introduza dados válidos (Altura, Peso, 1-7 dias por semana e no mínimo 10 minutos de treino).
                  </p>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleGenerateWorkout}
                    disabled={isLoading}
                    className={`w-full py-4 text-xs font-extrabold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2.5 transition-all text-sm group ${
                      darkMode 
                        ? 'bg-brand-neon text-black hover:bg-white shadow-lg shadow-brand-neon/15 font-black' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/10'
                    }`}
                  >
                    {isLoading ? (
                      <RefreshCw className={`w-4 h-4 animate-spin ${darkMode ? 'text-black' : 'text-white'}`} />
                    ) : (
                      <>
                        <Sparkles className={`w-4 h-4 group-hover:scale-125 transition-transform ${darkMode ? 'text-black' : 'text-white'}`} />
                        {isOfflineMode ? 'Gerar Treino Local Offline' : 'Gerar Treino'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* Current Workout Details */}
            {currentRoutine && (
              unlockedRoutines.includes(currentRoutine.id) || 
              currentRoutine.id.startsWith('routine-') || 
              currentRoutine.id.startsWith('fallback-') || 
              currentRoutine.id.startsWith('offline-') || 
              user?.role === 'aluno' ||
              user?.role === 'treinador' ||
              savedOfflineWorkouts.some(offline => offline.id === currentRoutine.id) ? (
                <div className={`p-6 rounded-2xl border transition-colors ${
                  darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4 gap-3 border-stone-100 dark:border-brand-border-muted">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold tracking-widest uppercase rounded-lg border ${
                          darkMode 
                            ? 'bg-brand-neon/10 text-brand-neon border-brand-neon/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15'
                        }`}>
                          {currentRoutine.level} • {currentRoutine.objective}
                        </span>
                        {currentRoutine.id.startsWith('routine-') && (
                          <span className="px-1.5 py-0.5 bg-brand-neon/20 border border-brand-neon/30 text-[8.5px] font-black text-brand-neon tracking-wider uppercase rounded animate-pulse">
                            ★ Prescrito Pelo PT
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-extrabold tracking-tight mt-1.5 uppercase text-white flex items-center gap-2">
                        {currentRoutine.title}
                      </h2>
                      {/* RENEWAL TIMELINE REMINDER */}
                      {(() => {
                        const lvl = user?.experienceLevel || currentRoutine.level || 'Iniciante';
                        let months = 2;
                        if (lvl === 'Intermediário' || lvl.includes('Intermed')) months = 4;
                        if (lvl === 'Avançado' || lvl.includes('Avan')) months = 6;
                        return (
                          <div className={`mt-2 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 ${
                            darkMode 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-amber-500/5 text-amber-600 border border-amber-500/15'
                          }`}>
                            ⚠️ Lembrete {lvl}: Troque ou aperfeiçoe este treino a cada {months} meses para manter-se em evolução.
                          </div>
                        );
                      })()}
                    </div>
                    
                    {/* Premium & PDF Download Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleExportPDF}
                        title="Exportar plano de treino completo para PDF/Impressão"
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          darkMode
                            ? 'bg-brand-neon text-black border-transparent hover:bg-white font-black'
                            : 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600 font-bold'
                        }`}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir / Baixar PDF</span>
                      </button>

                      {user.isPremium ? (
                        <button
                          onClick={() => onSaveOffline(currentRoutine)}
                          disabled={isCurrentDownloaded}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            isCurrentDownloaded 
                              ? darkMode 
                                ? 'bg-brand-neon/10 text-brand-neon border-brand-neon/25 cursor-default'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default'
                              : darkMode
                                ? 'bg-[#181818] text-stone-300 border-brand-border-muted hover:bg-brand-border hover:text-white'
                                : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          {isCurrentDownloaded ? 'Salvo Offline' : 'Salvar Offline'}
                        </button>
                      ) : (
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1 max-w-[150px] leading-tight text-right">
                          <BadgeInfo className={`w-3.5 h-3.5 flex-shrink-0 ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`} />
                          <span>Disponibilize offline com conta premium</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Day Selection Tabs for Unlocked Routine */}
                  {uniqueDays.length > 1 && (
                    <div className="flex flex-wrap gap-1.5 mb-5 border-b pb-3 border-stone-100 dark:border-brand-border-muted">
                      {uniqueDays.map((dayName) => (
                        <button
                          key={dayName}
                          onClick={() => setSelectedDayTab(dayName)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                            selectedDayTab === dayName
                              ? darkMode
                                ? 'bg-brand-neon text-black border-brand-neon font-black'
                                : 'bg-emerald-500 text-white border-emerald-500 font-bold'
                              : darkMode
                                ? 'bg-[#181818] text-stone-400 border-zinc-800 hover:text-stone-200'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:text-stone-900'
                          }`}
                        >
                          {dayName}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Exercises Stack */}
                  {filteredActiveExercisesForDisplay.length === 0 ? (
                    <div className="col-span-full text-center py-10 rounded-xl border border-dashed border-stone-200/40 dark:border-brand-border-muted/40 bg-stone-50/5 p-6 my-4">
                      <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        Nenhum exercício na rotina corresponde ao termo <strong className="text-emerald-500 dark:text-[#88e010]">"{routineSearchQuery}"</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() => setRoutineSearchQuery('')}
                        className={`mt-2.5 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                          darkMode ? 'text-brand-neon hover:text-white' : 'text-emerald-600 hover:text-emerald-700'
                        }`}
                      >
                        Limpar pesquisa
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                      {filteredActiveExercisesForDisplay.map((ex, index) => {
                        const originalIndex = activeExercises.findIndex(orig => orig.name === ex.name);
                        const displayIndex = originalIndex !== -1 ? originalIndex + 1 : index + 1;
                        return (
                          <div 
                            key={index}
                            className={`p-4 sm:p-5 rounded-xl flex flex-col justify-between gap-4 border text-left transition-all duration-200 hover:shadow-md h-full w-full min-h-[145px] sm:min-h-[155px] ${
                              darkMode 
                                ? 'bg-[#181818]/70 border-brand-border/80 text-stone-100 hover:border-brand-neon/30' 
                                : 'bg-stone-50 border-stone-200/60 text-stone-900 hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className={`p-2 rounded-lg font-black text-xs sm:text-sm w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 shadow-sm ${
                                darkMode 
                                  ? 'bg-brand-neon/10 text-brand-neon border border-brand-neon/10' 
                                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10'
                              }`}>
                                {displayIndex}
                              </div>
                              
                              <div className="flex-1 min-w-0 space-y-2 sm:space-y-2.5">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <h4 className="font-extrabold text-xs sm:text-sm md:text-base uppercase tracking-tight break-words max-w-full">
                                    {ex.name}
                                  </h4>
                                  {ex.day && uniqueDays.length <= 1 && (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 uppercase shrink-0">
                                      {ex.day}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
                                  <div className={`text-[11px] sm:text-xs font-semibold py-1 px-2.5 rounded-md inline-flex items-center shrink-0 ${
                                    darkMode ? 'bg-[#121212]/90 text-stone-300' : 'bg-stone-100 text-stone-700'
                                  }`}>
                                    {ex.sets} séries × {ex.reps} <span className="mx-1 text-stone-400">•</span> Descanso: {ex.rest}
                                  </div>
                                  
                                  {/* Load (Carga) Input Field */}
                                  <div className="flex items-center gap-1.5 min-w-0 shrink-0">
                                    <div className={`p-1 rounded flex items-center justify-center shrink-0 ${
                                      darkMode ? 'bg-brand-neon/10 text-brand-neon' : 'bg-emerald-500/10 text-emerald-600'
                                    }`}>
                                      <Dumbbell className="w-3 h-3" />
                                    </div>
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className={`text-[9px] font-black uppercase tracking-wider shrink-0 ${
                                        darkMode ? 'text-stone-400' : 'text-stone-500'
                                      }`}>
                                        Carga:
                                      </span>
                                      <input
                                        type="text"
                                        placeholder="Ex: 20kg"
                                        value={ex.weight || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          if (currentRoutine) {
                                            const updatedExs = currentRoutine.exercises.map(exItem => {
                                              if (exItem.name === ex.name) {
                                                return { ...exItem, weight: val };
                                              }
                                              return exItem;
                                            });
                                            setCurrentRoutine({
                                              ...currentRoutine,
                                              exercises: updatedExs
                                            });
                                          }
                                        }}
                                        className={`px-2 py-0.5 rounded border text-[11px] font-bold focus:outline-none transition-all w-20 sm:w-24 shrink-0 ${
                                          darkMode 
                                            ? 'bg-[#121212]/95 border-brand-border/60 text-stone-100 focus:ring-1 focus:ring-brand-neon/40 focus:border-brand-neon' 
                                            : 'bg-white border-stone-300 text-stone-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                                        }`}
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                {ex.observation && (
                                  <p className={`text-[10px] sm:text-[11px] font-medium leading-relaxed border-l-2 pl-2 ${
                                    darkMode 
                                      ? 'text-brand-neon/85 border-brand-neon/30 bg-brand-neon/5 py-1 px-2 rounded-r-md' 
                                      : 'text-emerald-700 border-emerald-400 bg-emerald-50/40 py-1 px-2 rounded-r-md'
                                  }`}>
                                    💡 {ex.observation}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className={`pt-2 sm:pt-3 border-t border-dashed flex justify-end items-center mt-auto shrink-0 ${
                              darkMode ? 'border-brand-border/40' : 'border-stone-200/60'
                            }`}>
                              <button
                                type="button"
                                onClick={() => {
                                  openExerciseTutorial(ex.name, ex.videoUrl);
                                }}
                                className={`px-3 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest cursor-pointer shadow-sm ${
                                  darkMode 
                                    ? 'bg-[#121212] border-brand-border text-brand-neon hover:bg-brand-neon hover:text-black hover:border-transparent hover:shadow-[0_0_12px_rgba(16,185,129,0.30)]' 
                                    : 'bg-white border-stone-200 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-transparent'
                                }`}
                              >
                                <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 animate-pulse" />
                                <span>{ex.videoUrl ? 'Guia do PT' : 'Visualizar Guia'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={startWorkout}
                    className={`w-full py-4 font-bold uppercase tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all text-xs ${
                      darkMode 
                        ? 'bg-brand-neon text-black hover:bg-white shadow-brand-neon/15 font-black' 
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
                    }`}
                  >
                    <Play className={`w-4 h-4 ${darkMode ? 'fill-black text-black' : 'fill-white text-white'}`} />
                    Iniciar Treino Agora
                  </button>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-center max-w-5xl mx-auto w-full animate-fade-in relative z-10 text-left">
                  {/* Bloco de Informações e Formulário de Cobrança */}
                  <div className={`flex-1 p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    darkMode ? 'bg-brand-card border-brand-border text-stone-100' : 'bg-white border-stone-200 text-stone-900'
                  }`}>
                    {paymentSuccess ? (
                      <div className="flex flex-col items-center justify-center text-center py-10 space-y-4 my-auto">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          darkMode ? 'bg-brand-neon/20 text-brand-neon animate-bounce' : 'bg-emerald-500/10 text-emerald-500 animate-bounce'
                        }`}>
                          <CheckCircle2 className="w-10 h-10 text-emerald-400 stroke-[3]" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Pagamento Concluído!</h3>
                        <p className="text-stone-300 text-xs max-w-sm">
                          O seu pagamento de {appSubscriptionLabel} foi processado com sucesso. A sua subscrição premium do app foi ativada!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-stone-100 dark:border-brand-border-muted animate-fade-in">
                          <div className={`p-3 rounded-full ${darkMode ? 'bg-brand-neon/10 text-brand-neon' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            <Lock className="w-8 h-8 animate-pulse text-amber-500" />
                          </div>
                          <div>
                            <span className={`px-2.5 py-1 text-[9px] font-extrabold tracking-widest uppercase rounded-lg border ${
                              darkMode 
                                ? 'bg-brand-neon/10 text-brand-neon border-brand-neon/20' 
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15'
                            }`}>
                              Plano de Treino Bloqueado 🔒
                            </span>
                            <h2 className="text-xl font-extrabold tracking-tight mt-1.5 uppercase leading-tight">{currentRoutine.title}</h2>
                          </div>
                          <p className="text-xs text-stone-300 max-w-sm leading-relaxed">
                            O seu plano de treino foi gerado de forma única tendo em conta a sua fisionomia (Altura: <strong className="text-stone-200">{height} cm</strong>, Peso: <strong className="text-stone-200">{weight} kg</strong>) e disponibilidade (<strong className="text-stone-200">{daysPerWeek} dias/semana</strong> com <strong className="text-stone-200">{availableTime} min/sessão</strong>).
                          </p>
                          <div className="flex items-baseline gap-1.5 pt-1">
                            <span className={`text-3xl font-black ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`}>{appSubscriptionLabel}</span>
                          </div>
                        </div>

                        {/* MB WAY Selection Tabs */}
                        <div className="flex border-b border-stone-100 dark:border-brand-border-muted pb-px gap-2">
                          <button
                            type="button"
                            onClick={() => { setMbwayMode('phone'); setPaymentError(''); }}
                            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                              mbwayMode === 'phone'
                                ? darkMode
                                  ? 'border-brand-neon text-brand-neon font-black'
                                  : 'border-emerald-500 text-emerald-500 font-black'
                                : 'border-transparent text-stone-400 hover:text-stone-300'
                            }`}
                          >
                            <Smartphone className="w-4.5 h-4.5" />
                            Telemóvel (Push)
                          </button>
                          <button
                            type="button"
                            onClick={() => { setMbwayMode('qr'); setPaymentError(''); }}
                            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                              mbwayMode === 'qr'
                                ? darkMode
                                  ? 'border-brand-neon text-brand-neon font-black'
                                  : 'border-emerald-500 text-emerald-500 font-black'
                                : 'border-transparent text-stone-400 hover:text-stone-300'
                            }`}
                          >
                            <QrCode className="w-4.5 h-4.5" />
                            Código QR MB WAY
                          </button>
                        </div>

                        {mbwayMode === 'phone' ? (
                          /* MB WAY Mobile Number Form */
                          <form onSubmit={handlePaymentSubmit} className="space-y-4 animate-fade-in">
                            <div className="space-y-1.5 bg-[#181818]/60 p-4 rounded-lg border border-brand-border-muted text-left">
                              <div className="flex items-center gap-2 mb-3">
                                <Smartphone className="w-5 h-5 text-brand-neon" />
                                <span className="text-xs font-black uppercase tracking-wider text-stone-100">
                                  Pagamento por MB WAY Portugal
                                </span>
                              </div>

                              <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1">
                                Número de Telemóvel MB WAY
                              </label>
                              <input
                                type="tel"
                                required
                                placeholder="9XXXXXXXX"
                                value={mbwayPhone}
                                onChange={(e) => setMbwayPhone(e.target.value)}
                                className={`w-full px-3.5 py-3 rounded-lg border text-xs font-extrabold focus:outline-none transition-all ${
                                  darkMode 
                                    ? 'bg-[#181818] border-brand-border text-stone-100 placeholder-zinc-500 focus:ring-1 focus:ring-brand-neon/30' 
                                    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
                                }`}
                              />
                              <span className="text-[9px] text-stone-400 leading-normal block pt-1 font-medium">
                                Será enviada uma notificação instantânea para a sua aplicação móvel MB WAY para confirmar o pagamento de {appSubscriptionLabel}.
                              </span>
                            </div>

                            {/* Sandbox Simulation Helper Banner */}
                            <div className={`p-3 p-3.5 rounded-lg border text-[11px] leading-relaxed text-left ${
                              darkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-stone-50 border-stone-200 text-stone-600'
                            }`}>
                              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] mb-1.5 text-amber-500">
                                <span>💡 Simulador Interativável MB WAY</span>
                              </div>
                              <p className="text-[10px] text-stone-400 leading-normal">
                                Após clicar para pagar, repare no **Telemóvel Virtual** à direita do ecrã para ver e interagir no simulador! Pode aprovar com PIN ou rejeitar de imediato!
                              </p>
                            </div>

                            {paymentError && (
                              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-lg text-left">
                                ⚠️ {paymentError}
                              </div>
                            )}

                            {/* Checkout Submit Call Button */}
                            <button
                              type="submit"
                              disabled={isPaying}
                              className={`w-full py-4 font-extrabold uppercase tracking-widest rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-md ${
                                darkMode 
                                  ? 'bg-brand-neon text-black hover:bg-white shadow-brand-neon/15 font-black' 
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
                              }`}
                            >
                              {isPaying ? (
                                <>
                                 <RefreshCw className="w-4 h-4 animate-spin" />
                                  A aguardar aprovação no MB WAY...
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  Pagar {appSubscriptionLabel} com MB WAY & Desbloquear Premium
                                </>
                              )}
                            </button>
                          </form>
                        ) : (
                          /* MB WAY QR Code Scan Screen */
                          <div className="space-y-4 animate-fade-in">
                            {isPaying && qrTxId ? (
                              <div className="flex flex-col items-center justify-center bg-[#151515] p-5 rounded-xl border border-brand-border-muted relative overflow-hidden text-center">
                                {/* Glowing Scan Bar Line Effect */}
                                <div className="absolute inset-x-0 h-0.5 bg-brand-neon shadow-[0_0_12px_#10b981] animate-pulse" style={{ top: '45%' }} />
                                
                                <div className="w-44 h-44 bg-white border-2 border-brand-neon/40 rounded-xl p-2.5 flex items-center justify-center relative shadow-lg">
                                  {/* Vector Mockup QR Pattern */}
                                  <svg viewBox="0 0 100 100" className="w-40 h-40 text-stone-900 fill-current">
                                    <path d="M0,0 h30 v6 h-24 v24 h-6 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z" />
                                    <path d="M70,0 h30 v30 h-6 v-24 h-24 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z" />
                                    <path d="M0,70 h6 v24 h24 v6 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z" />
                                    <path d="M82,82 h6 v6 h-6 z M80,80 h10 v10 h-10 M84,84 h2 v2 h-2 z" fillRule="evenodd" />
                                    
                                    <rect x="35" y="5" width="4" height="4" />
                                    <rect x="42" y="12" width="8" height="4" />
                                    <rect x="55" y="2" width="4" height="8" />
                                    <rect x="62" y="10" width="4" height="4" />
                                    <rect x="38" y="22" width="6" height="4" />
                                    <rect x="52" y="18" width="8" height="4" />
                                    
                                    <rect x="5" y="35" width="4" height="8" />
                                    <rect x="15" y="42" width="8" height="4" />
                                    <rect x="22" y="50" width="4" height="4" />
                                    
                                    <rect x="35" y="35" width="12" height="12" />
                                    <rect x="55" y="35" width="8" height="8" />
                                    <rect x="70" y="35" width="4" height="16" />
                                    <rect x="85" y="38" width="10" height="4" />
                                    
                                    <text x="50" y="54" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#ef4444">MB</text>
                                    
                                    <rect x="35" y="55" width="4" height="12" />
                                    <rect x="48" y="58" width="10" height="4" />
                                    <rect x="62" y="52" width="12" height="6" />
                                    
                                    <rect x="35" y="72" width="8" height="4" />
                                    <rect x="50" y="72" width="4" height="8" />
                                    <rect x="62" y="70" width="8" height="4" />
                                    
                                    <rect x="42" y="85" width="12" height="4" />
                                    <rect x="58" y="82" width="4" height="10" />
                                    <rect x="68" y="88" width="10" height="4" />
                                  </svg>
                                </div>

                                <div className="mt-4 space-y-1">
                                  <p className={`text-sm font-black uppercase tracking-wide ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`}>
                                    {appSubscriptionLabel}
                                  </p>
                                  <p className="text-[10px] text-stone-300 font-bold">
                                    Acesse o seu **Telemóvel Virtual** à direita do ecrã para simular a leitura do código no app MB WAY de teste!
                                  </p>
                                  <p className="text-[9px] text-stone-400 font-mono uppercase pt-1">
                                    ID Transação: <span className="font-bold text-stone-200">{qrTxId}</span>
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center bg-[#151515] p-6 rounded-xl border border-brand-border-muted text-center space-y-4">
                                <div className="p-3 bg-brand-neon/10 rounded-full text-brand-neon">
                                  <QrCode className="w-10 h-10" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-black uppercase tracking-wide text-stone-100">Código QR MB WAY</h4>
                                  <p className="text-[10px] text-stone-400 max-w-xs mt-1">
                                    Geramos um Código QR dinâmico único com o valor exato da sua subscrição ({appSubscriptionLabel}) para escanear de forma simplificada e segura.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleQRInitiate}
                                  className="px-5 py-2.5 text-xs font-extrabold bg-brand-neon text-black rounded-lg uppercase tracking-wider hover:bg-white transition-all shadow-md"
                                >
                                  Gerar Código QR do MB WAY
                                </button>
                              </div>
                            )}

                            {/* Sandbox Simulation Helper Banner for QR Status */}
                            <div className={`p-3 p-3.5 rounded-lg border text-[11px] leading-relaxed text-left ${
                              darkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-stone-50 border-stone-200 text-stone-600'
                            }`}>
                              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] mb-1.5 text-amber-500">
                                <span>💡 Simulação Interativa MB WAY</span>
                              </div>
                              <p className="text-[10px] text-stone-400 leading-normal">
                                Após gerar o código, o simulador de smartphone surgirá à direita. Use-o para ler o QR Code virtualmente e aprovar o pagamento no mesmo instante!
                              </p>
                            </div>

                            {paymentError && (
                              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-lg text-left">
                                ⚠️ {paymentError}
                              </div>
                            )}

                            {isPaying && qrTxId && (
                              <div className="flex items-center justify-center gap-2 p-3 bg-brand-neon/10 border border-brand-neon/20 rounded-lg text-xs text-brand-neon text-left font-black animate-pulse">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                A escutar sinalização de pagamento do gateway comercial...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sandbox MB WAY Virtual Mobile Screen (Aparece apenas quando isPaying === true) */}
                  {isPaying && (
                    <div className="w-full lg:w-72 flex flex-col items-center justify-center animate-fade-in shrink-0">
                      <div className="relative w-64 h-[440px] bg-stone-900 border-4 border-stone-850 rounded-[38px] shadow-2xl overflow-hidden flex flex-col justify-between p-2.5 font-sans ring-4 ring-stone-900/40">
                        
                        {/* Notch / Coluna de Câmara do smartphone */}
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-stone-900 rounded-full z-30 flex items-center justify-between px-2 select-none">
                          <span className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
                          <span className="w-8 h-1 bg-neutral-800 rounded-full" />
                          <span className="w-1.5 h-1.5 bg-blue-600/60 rounded-full" />
                        </div>

                        {/* Corpo Interno com o Fundo Azul Oficial MB WAY */}
                        <div className="bg-gradient-to-b from-[#1b3c75] to-[#0c1833] h-full rounded-[28px] overflow-hidden flex flex-col justify-between p-3 pt-5 text-stone-100 relative select-none">
                          
                          {/* Telefonia StatusBar */}
                          <div className="flex justify-between items-center px-1 text-[8px] text-indigo-200 font-extrabold select-none z-20">
                            <span>18:15</span>
                            <div className="flex items-center gap-1">
                              <span>5G</span>
                              <div className="w-3.5 h-1.5 border border-indigo-300 rounded-sm p-[1px] flex items-center">
                                <div className="bg-emerald-400 w-2.5 h-0.75 rounded-sm" />
                              </div>
                            </div>
                          </div>

                          {virtualPhoneStep === 'notified' && (
                            <div className="flex-1 flex flex-col justify-between py-2 animate-fade-in animate-duration-300">
                              
                              {/* Push Notification no topo */}
                              <div 
                                className="bg-white text-stone-900 rounded-xl p-2 md:p-2.5 shadow-lg border border-stone-100 mt-1 select-none cursor-pointer hover:scale-102 transition-transform relative z-25"
                                onClick={() => {
                                  setPinDots('');
                                  setVirtualPhoneStep('pin');
                                }}
                              >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-red-500 flex items-center justify-center text-[7px] text-white font-black">MB</div>
                                  <span className="text-[8px] font-black uppercase text-stone-500 tracking-wider">MB WAY Push</span>
                                  <span className="text-[7px] text-stone-400 ml-auto">agora</span>
                                </div>
                                <h5 className="text-[9px] font-black text-stone-900 leading-tight">Autorização de Pagamento</h5>
                                <p className="text-[8px] text-stone-600 leading-normal mt-0.5">O Workout Generator está a solicitar {appSubscriptionLabel}.</p>
                              </div>

                              {/* Logotipo da Marca MB WAY Central */}
                              <div className="flex flex-col items-center justify-center text-center my-auto space-y-1">
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg relative overflow-hidden border-2 border-indigo-400">
                                  <span className="text-xl font-black italic bg-gradient-to-r from-blue-600 to-[#ef4444] bg-clip-text text-transparent transform -skew-x-12 select-none">MB</span>
                                </div>
                                <h4 className="text-[10px] font-black tracking-widest uppercase text-indigo-400 select-none">PORTUGAL SANDBOX</h4>
                              </div>

                              {/* Caixa De Detalhes de Pagamento do MB WAY */}
                              <div className="bg-indigo-950/65 p-2 rounded-xl border border-indigo-500/20 text-center space-y-1.5 mb-1">
                                <span className="text-[7.5px] font-extrabold uppercase tracking-wider text-indigo-300 block">Comerciante Parceiro</span>
                                <span className="text-[10px] font-black text-white block">Gym Neon Coach</span>
                                
                                <div className="py-1 border-t border-b border-indigo-800/30">
                                  <span className="text-[8px] uppercase tracking-wider text-indigo-300 block font-bold">Valor Solicitado</span>
                                  <span className="text-base font-black text-white">{appSubscriptionLabel}</span>
                                </div>
                                
                                <span className="text-[7.5px] text-indigo-300 block font-semibold leading-relaxed">
                                  Destinatário: {activePhoneUsed}
                                </span>

                                <div className="flex flex-col gap-1 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPinDots('');
                                      setVirtualPhoneStep('pin');
                                    }}
                                    className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-450 text-white rounded-lg text-[8.5px] font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Confirmar Pagamento
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => sendSimulatedWebhook('failed')}
                                    className="w-full py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[8px] font-bold uppercase tracking-wide transition-all border border-rose-500/10 cursor-pointer active:scale-98"
                                  >
                                    Rejeitar e Cancelar
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {virtualPhoneStep === 'pin' && (
                            <div className="flex-1 flex flex-col justify-between py-2 animate-fade-in text-center animate-duration-300">
                              <div className="mt-2 space-y-1">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Inserir PIN MB WAY</h4>
                                <p className="text-[8px] text-indigo-200 max-w-[170px] mx-auto leading-normal">
                                  Insira o seu PIN de 6 dígitos para autorizar o pagamento de <strong className="text-white">{appSubscriptionLabel}</strong>.
                                </p>
                              </div>

                              {/* PIN Dots indicators */}
                              <div className="flex justify-center gap-2.5 my-3">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                  <div 
                                    key={index} 
                                    className={`w-2.5 h-2.5 rounded-full border transition-all duration-150 ${
                                      pinDots.length > index 
                                        ? 'bg-rose-500 border-rose-500 scale-110 shadow-[0_0_6px_#ef4444]' 
                                        : 'bg-transparent border-indigo-400'
                                    }`} 
                                  />
                                ))}
                              </div>

                              {/* Elegant Numerical Keypad */}
                              <div className="grid grid-cols-3 gap-1 px-4 mt-auto">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => {
                                      if (pinDots.length < 6) {
                                        const newPin = pinDots + num;
                                        setPinDots(newPin);
                                        if (newPin.length === 6) {
                                          setTimeout(() => {
                                            sendSimulatedWebhook('paid');
                                          }, 400);
                                        }
                                      }
                                    }}
                                    className="aspect-square w-8.5 h-8.5 rounded-full bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-850 flex items-center justify-center text-xs font-black text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                  >
                                    {num}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPinDots(pinDots.slice(0, -1));
                                  }}
                                  className="aspect-square w-8.5 h-8.5 rounded-full flex items-center justify-center text-[7.5px] uppercase font-black text-indigo-300 hover:text-white transition-all cursor-pointer"
                                >
                                  Apagar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (pinDots.length < 6) {
                                      const newPin = pinDots + "0";
                                      setPinDots(newPin);
                                      if (newPin.length === 6) {
                                        setTimeout(() => {
                                          sendSimulatedWebhook('paid');
                                        }, 400);
                                      }
                                    }
                                  }}
                                  className="aspect-square w-8.5 h-8.5 rounded-full bg-indigo-950/40 hover:bg-[#122854] border border-indigo-850 flex items-center justify-center text-xs font-black text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                  0
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (pinDots.length === 6) {
                                      sendSimulatedWebhook('paid');
                                    }
                                  }}
                                  disabled={pinDots.length < 6}
                                  className={`aspect-square w-8.5 h-8.5 rounded-full flex items-center justify-center text-[8px] font-black transition-all ${
                                    pinDots.length === 6 
                                      ? 'bg-emerald-500 text-white hover:bg-emerald-400 cursor-pointer active:scale-95' 
                                      : 'text-indigo-600 bg-indigo-950/20 cursor-not-allowed'
                                  }`}
                                >
                                  OK
                                </button>
                              </div>
                            </div>
                          )}

                          {virtualPhoneStep === 'authorizing' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in select-none">
                              <RefreshCw className="w-10 h-10 text-indigo-300 animate-spin" />
                              <div>
                                <h4 className="text-[11px] font-black uppercase tracking-wide text-white">Rede Multibanco</h4>
                                <p className="text-[8px] text-indigo-200 mt-1 max-w-[160px] mx-auto leading-relaxed">
                                  A processar transação via Webhook Push seguro de gateway na Sandbox...
                                </p>
                              </div>
                            </div>
                          )}

                          {virtualPhoneStep === 'success' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in select-none">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                                <CheckCircle2 className="w-7 h-7" />
                              </div>
                              <div>
                                <h4 className="text-[11px] font-black uppercase tracking-wide text-white">Sucesso Autorizado!</h4>
                                <p className="text-[8px] text-emerald-200 mt-1 max-w-[160px] mx-auto leading-relaxed">
                                  O sinal de webhook POST foi recebido no backend com sucesso. Verifique o seu ecrã à esquerda!
                                </p>
                              </div>
                            </div>
                          )}

                          {virtualPhoneStep === 'failed' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in select-none">
                              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                                <Lock className="w-7 h-7 text-rose-400" />
                              </div>
                              <div>
                                <h4 className="text-[11px] font-black uppercase tracking-wide text-white">Transação Rejeitada</h4>
                                <p className="text-[8px] text-rose-200 mt-1 max-w-[160px] mx-auto leading-relaxed">
                                  O sinal de falha foi assinado e enviado de volta via POST no Webhook comercial de simulação.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Marca Rodapé do Smartphone */}
                          <div className="text-[7.5px] text-indigo-400 font-extrabold text-center tracking-widest uppercase py-1 border-t border-indigo-900/10 select-none">
                            SIBS • SECURE CONNECT
                          </div>
                        </div>
                      </div>
                      
                      {/* Pequeno indicador que é um ambiente de Sandbox */}
                      <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest mt-2 block text-center">
                        📲 SIMULADOR SANDBOX INTEGRADO
                      </span>
                    </div>
                  )}
                </div>
              )
            )}
          </motion.div>
        ) : (
          /* Active Workout Screen */
          <motion.div
            key="active-workout-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
            }`}
          >
            {/* Active Header */}
            <div className={`flex items-center justify-between border-b pb-4 mb-6 ${
              darkMode ? 'border-brand-border-muted' : 'border-stone-100'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                  darkMode ? 'text-brand-neon' : 'text-stone-550'
                }`}>
                  Treino em Andamento
                </span>
              </div>
              <button
                onClick={cancelWorkout}
                className="text-xs font-bold uppercase tracking-tight text-rose-500 hover:underline px-2 py-1 rounded"
              >
                Cancelar Treino
              </button>
            </div>

            {/* Time / Stat Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className={`p-4 rounded-xl text-center border ${
                darkMode ? 'bg-[#181818]/80 border-brand-border' : 'bg-stone-50 border-stone-100'
              }`}>
                <Clock className={`w-4 h-4 mx-auto mb-1 ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`} />
                <span className="text-[9px] text-stone-400 uppercase tracking-widest block font-bold">Duração</span>
                <span className={`font-mono text-base font-bold ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`}>
                  {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className={`p-4 rounded-xl text-center border ${
                darkMode ? 'bg-[#181818]/80 border-brand-border' : 'bg-stone-50 border-stone-100'
              }`}>
                <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-[9px] text-stone-400 uppercase tracking-widest block font-bold">Calorias</span>
                <span className="text-base font-bold text-amber-500">{activeCalorieTick} kcal</span>
              </div>
              <div className={`p-4 rounded-xl text-center border ${
                darkMode ? 'bg-[#181818]/80 border-brand-border' : 'bg-stone-50 border-stone-100'
              }`}>
                <HeartPulse className="w-4 h-4 text-rose-500 mx-auto mb-1 animate-pulse" />
                <span className="text-[9px] text-stone-400 uppercase tracking-widest block font-bold">Frequência</span>
                <span className="text-base font-bold text-rose-500">
                  {isWorkoutActive ? Math.floor(Math.sin(secondsElapsed / 10) * 12 + 134) : 72} bpm
                </span>
              </div>
            </div>

            {/* Core workout stepper */}
            {currentRoutine && activeExercises[currentExerciseIndex] && (
              <div className="space-y-6">
                <div className={`p-5 rounded-xl border ${
                  darkMode ? 'bg-[#181818]/50 border-brand-border-muted' : 'bg-stone-50/50 border-stone-100'
                }`}>
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded border ${
                    darkMode 
                      ? 'bg-brand-neon/10 text-brand-neon border-brand-neon/20 font-black' 
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15 font-bold'
                  }`}>
                    EXERCÍCIO {currentExerciseIndex + 1} de {activeExercises.length}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2.5">
                    <h3 className={`text-xl font-extrabold tracking-tight uppercase flex-1 ${
                      darkMode ? 'text-brand-neon' : 'text-emerald-555'
                    }`}>
                      {activeExercises[currentExerciseIndex].name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        openExerciseTutorial(
                          activeExercises[currentExerciseIndex].name,
                          activeExercises[currentExerciseIndex].videoUrl
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer ${
                        darkMode 
                          ? 'bg-[#121212] border-brand-border text-brand-neon hover:bg-brand-neon hover:text-black hover:border-transparent hover:shadow-[0_0_12px_rgba(16,185,129,0.35)]' 
                          : 'bg-white border-stone-200 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-transparent shadow-sm'
                      }`}
                    >
                      <Video className="w-4 h-4 text-rose-500 animate-pulse" />
                      <span>Ver Execução</span>
                    </button>
                  </div>
                  {activeExercises[currentExerciseIndex].observation && (
                    <p className={`text-xs mt-1.5 font-medium p-2.5 rounded-lg border ${
                      darkMode ? 'text-amber-400 bg-amber-500/5 border-amber-500/10' : 'text-amber-500 bg-amber-500/5'
                    }`}>
                      💡 {activeExercises[currentExerciseIndex].observation}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                    <div>SÉRIES: <span className={`font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>{activeExercises[currentExerciseIndex].sets}</span></div>
                    <div>REPETIÇÕES: <span className={`font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>{activeExercises[currentExerciseIndex].reps}</span></div>
                    <div>DESCANSO: <span className={`font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>{activeExercises[currentExerciseIndex].rest}</span></div>
                  </div>

                  {/* Weight / Load (Carga) Tracker Input */}
                  <div className={`mt-4 p-3 rounded-lg border border-dashed ${
                    darkMode ? 'bg-[#202020]/40 border-zinc-805' : 'bg-stone-100 border-stone-200'
                  }`}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-1">
                      🏋️ Registrar Carga Atual Usada (kg)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ex: 15kg, 20-20, Halter de 18..."
                        value={activeExercises[currentExerciseIndex].weight || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          
                          // Update active exercise weight
                          activeExercises[currentExerciseIndex].weight = val;
                          
                          // Sync with workoutExercisesProgress
                          setWorkoutExercisesProgress(prev => {
                            const nextProg = [...prev];
                            if (nextProg[currentExerciseIndex]) {
                              nextProg[currentExerciseIndex].weightLogged = val;
                            }
                            return nextProg;
                          });

                          // Persistent sync with currentRoutine exercises
                          if (currentRoutine) {
                            const updatedExs = currentRoutine.exercises.map(ex => {
                              if (ex.name === activeExercises[currentExerciseIndex].name) {
                                return { ...ex, weight: val };
                              }
                              return ex;
                            });
                            setCurrentRoutine({
                              ...currentRoutine,
                              exercises: updatedExs
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded border text-xs font-bold focus:outline-none transition-all ${
                          darkMode 
                            ? 'bg-[#121212] border-brand-border text-stone-100 focus:ring-1 focus:ring-brand-neon/30' 
                            : 'bg-white border-stone-300 text-stone-900 focus:ring-2 focus:ring-emerald-500/20'
                        }`}
                      />
                      <span className="text-[10px] text-stone-500 font-bold">Informa a carga para acompanhar progressão!</span>
                    </div>
                  </div>
                </div>

                {/* Series Check-off tracker */}
                <div>
                  <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">
                    Marcar Séries Completas
                  </h4>
                  <div className="space-y-2">
                    {completedSets.map((done, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => toggleSetCompleted(sIdx)}
                        className={`w-full p-4 rounded-lg border flex items-center justify-between transition-all ${
                          done
                            ? darkMode
                              ? 'bg-brand-neon/10 border-brand-neon/30 text-brand-neon font-black'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold'
                            : darkMode
                              ? 'bg-[#181818]/40 border-brand-border text-stone-400 hover:border-brand-border-muted hover:text-white'
                              : 'bg-stone-50 border-stone-100 text-stone-700'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-tight">Série {sIdx + 1}</span>
                        <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center ${
                          done 
                            ? 'bg-brand-neon text-black' 
                            : darkMode ? 'border-brand-border-muted' : 'border-stone-400'
                        }`}>
                          {done && <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation inside Workout */}
                <div className="pt-4 flex items-center gap-3">
                  <div className="flex-1">
                    <button
                      onClick={nextExercise}
                      className={`w-full py-4 font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-lg text-xs ${
                        darkMode 
                          ? 'bg-brand-neon text-black hover:bg-white shadow-brand-neon/15 font-black' 
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
                      }`}
                    >
                      {currentExerciseIndex < activeExercises.length - 1 ? (
                        <>
                          Próximo Exercício
                          <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-black' : 'text-white'}`} />
                        </>
                      ) : (
                        <>
                          <Award className={`w-5 h-5 ${darkMode ? 'text-black' : 'text-white'}`} />
                          Finalizar Treino
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Tutorial Modal overlay */}
      <AnimatePresence>
        {selectedTutorial && (() => {
          const tutorial = getExerciseTutorial(selectedTutorial, customExerciseVideos, selectedTutorialVideoUrl);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
              onClick={() => {
                setSelectedTutorial(null);
                setSelectedTutorialVideoUrl(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className={`w-full max-w-xl rounded-2xl overflow-hidden border shadow-2xl flex flex-col ${
                  darkMode ? 'bg-zinc-950 border-brand-border text-white' : 'bg-white border-stone-200 text-stone-900'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  darkMode ? 'border-brand-border/40 bg-[#161616]' : 'border-stone-100 bg-stone-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                      <Video className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-tight">{tutorial.title}</h4>
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest block mt-0.5">
                        {tutorial.category} • {tutorial.muscleGroup}
                      </span>
                      {tutorial.videoSource === "prescribed" && (
                        <span className="text-[8px] text-rose-400 font-black uppercase tracking-widest block mt-1">
                          Link prescrito pelo PT
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTutorial(null);
                      setSelectedTutorialVideoUrl(null);
                    }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      darkMode ? 'hover:bg-zinc-800 text-stone-400 hover:text-white' : 'hover:bg-stone-100 text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body scroll */}
                <div className="flex-1 overflow-y-auto max-h-[70vh] p-4 space-y-4">
                  {/* Video Player Display Container */}
                  <div className={`relative aspect-video w-full rounded-xl overflow-hidden border ${
                    darkMode ? 'bg-black border-zinc-900' : 'bg-stone-100 border-stone-200'
                  }`}>
                    {isYouTubeUrl(tutorial.videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(tutorial.videoUrl)}
                        title={tutorial.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0 absolute inset-0"
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        src={tutorial.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Quick Velocity Switcher controls (Only for non-YouTube direct MP4 files) */}
                    {!isYouTubeUrl(tutorial.videoUrl) && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 p-1 bg-black/75 backdrop-blur-md rounded-lg border border-white/10 z-10">
                        <span className="text-[8px] text-stone-300 font-black uppercase px-1 tracking-wider hidden sm:inline">
                          Velocidade:
                        </span>
                        {([0.5, 1.0, 1.5] as const).map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              setPlayRate(rate);
                              if (videoRef.current) {
                                videoRef.current.playbackRate = rate;
                              }
                            }}
                            className={`px-1.5 py-0.5 text-[9px] font-black rounded transition-all cursor-pointer ${
                              playRate === rate
                                ? darkMode
                                  ? 'bg-brand-neon text-black font-black'
                                  : 'bg-emerald-500 text-white font-bold'
                                : 'text-stone-300 hover:bg-white/10'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-[8px] text-white/95 px-2 py-1 rounded font-black uppercase tracking-wider flex items-center gap-1 border border-white/5 z-10">
                      <Activity className="w-3 h-3 text-brand-neon animate-pulse" /> {isYouTubeUrl(tutorial.videoUrl) ? 'Vídeo Aula / Guia' : 'Loop de Movimento'}
                    </div>
                  </div>

                  {/* Fallback watch on Youtube button if embedding is restricted or blocked by browser cookie policies */}
                  {isYouTubeUrl(tutorial.videoUrl) && (
                    <div className={`p-3 rounded-xl border flex flex-col sm:flex-row gap-2.5 items-center justify-between text-left transition-all ${
                      darkMode ? 'bg-zinc-900/60 border-brand-border/40' : 'bg-stone-50 border-stone-150'
                    }`}>
                      <div className="space-y-0.5">
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                          darkMode ? 'text-brand-neon' : 'text-emerald-600'
                        }`}>
                          Assistir no YouTube
                        </span>
                        <p className={`text-[10px] ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                          Caso sua conexão esteja bloqueando o player integrado, assista diretamente original.
                        </p>
                      </div>
                      <a
                        href={tutorial.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all text-[9.5px] font-extrabold uppercase tracking-wider whitespace-nowrap cursor-pointer shadow-sm min-w-[120px] ${
                          darkMode 
                            ? 'bg-[#121212] border-brand-border text-brand-neon hover:bg-brand-neon hover:text-black hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]' 
                            : 'bg-white border-stone-200 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-transparent'
                        }`}
                      >
                        <ExternalLink className="w-3 h-3 text-rose-500" />
                        Abrir Vídeo
                      </a>
                    </div>
                  )}

                  {/* Custom video link customization options */}
                  <div className={`p-3.5 rounded-xl border space-y-3 text-left transition-all ${
                    darkMode ? 'bg-zinc-900/40 border-brand-border/35' : 'bg-stone-50 border-stone-200/50'
                  }`}>
                    {editingVideoUrl ? (
                      <div className="space-y-2.5">
                        <label className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                          darkMode ? 'text-brand-neon' : 'text-emerald-700'
                        }`}>
                          Editar Link do Vídeo (YouTube ou MP4)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={videoUrlInput}
                            onChange={(e) => setVideoUrlInput(e.target.value)}
                            placeholder="Ex: https://www.youtube.com/watch?v=..."
                            className={`flex-1 px-3 py-1.5 rounded-lg border text-xs focus:ring-1 outline-none ${
                              darkMode 
                                ? 'bg-[#121212] border-brand-border/60 text-white focus:ring-brand-neon' 
                                : 'bg-white border-stone-300 text-stone-900 focus:ring-emerald-500'
                            }`}
                          />
                          <div className="flex gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const norm = selectedTutorial.toLowerCase().trim();
                                const urlToSave = videoUrlInput.trim();
                                const updatedVideos = {
                                  ...customExerciseVideos,
                                  [norm]: urlToSave
                                };
                                setCustomExerciseVideos(updatedVideos);
                                localStorage.setItem('custom_exercise_videos', JSON.stringify(updatedVideos));
                                setEditingVideoUrl(null);
                              }}
                              className={`px-3 py-1.5 rounded-lg font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm ${
                                darkMode ? 'bg-brand-neon text-black hover:bg-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              }`}
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVideoUrl(null);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] border cursor-pointer ${
                                darkMode ? 'border-brand-border/60 text-stone-300 hover:bg-white/5' : 'border-stone-200 text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                        {videoUrlInput.trim() && !isYouTubeUrl(videoUrlInput) && (
                          <p className="text-[9px] text-amber-500 font-semibold leading-relaxed">
                            ⚠️ Dica: Recomendamos links normais de vídeos do YouTube ou vídeos curtos no formato direto (.mp4).
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                            darkMode ? 'text-brand-neon' : 'text-emerald-700'
                          }`}>
                            Personalizar Link do Vídeo
                          </span>
                          <span className={`text-[9.5px] block ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                            Insira um link do YouTube ou câmera próprio para este exercício ({selectedTutorial}).
                          </span>
                        </div>
                        <div className="flex gap-2 justify-end shrink-0">
                          {customExerciseVideos[selectedTutorial.toLowerCase().trim()] && (
                            <button
                              type="button"
                              onClick={() => {
                                const norm = selectedTutorial.toLowerCase().trim();
                                const updatedVideos = { ...customExerciseVideos };
                                delete updatedVideos[norm];
                                setCustomExerciseVideos(updatedVideos);
                                localStorage.setItem('custom_exercise_videos', JSON.stringify(updatedVideos));
                              }}
                              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider cursor-pointer shadow-sm ${
                                darkMode 
                                  ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                                  : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                              }`}
                            >
                              Voltar ao Padrão
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setVideoUrlInput(tutorial.videoUrl);
                              setEditingVideoUrl(selectedTutorial);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider cursor-pointer shadow-sm ${
                              darkMode 
                                ? 'bg-[#121212] border-brand-border text-stone-350 hover:bg-brand-neon hover:text-black hover:border-transparent' 
                                : 'bg-white border-stone-250 text-stone-700 hover:bg-emerald-500 hover:text-white hover:border-transparent'
                            }`}
                          >
                            Alterar Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Proper Form Instructions and Mistakes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {/* Execution Guide */}
                    <div className={`p-4 rounded-xl border ${
                      darkMode ? 'bg-[#181818]/60 border-brand-border-muted' : 'bg-stone-50 border-stone-100'
                    }`}>
                      <h5 className="font-extrabold text-[10px] uppercase tracking-widest text-[#10b981] flex items-center gap-1.5 mb-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        Execução Correta
                      </h5>
                      <ol className="space-y-2 text-[11px] font-medium text-stone-300 leading-relaxed list-decimal list-inside">
                        {tutorial.execution.map((step, sIdx) => (
                          <li key={sIdx} className="pl-0.5">
                            <span className={darkMode ? 'text-stone-200' : 'text-stone-700'}>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Mistakes to avoid */}
                    <div className={`p-4 rounded-xl border ${
                      darkMode ? 'bg-[#181818]/60 border-brand-border-muted' : 'bg-stone-50 border-stone-100'
                    }`}>
                      <h5 className="font-extrabold text-[10px] uppercase tracking-widest text-[#ef4444] flex items-center gap-1.5 mb-2.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        Erros comuns a evitar
                      </h5>
                      <ul className="space-y-2 text-[11px] font-medium text-stone-300 leading-relaxed list-disc list-inside">
                        {tutorial.mistakes.map((mistake, mIdx) => (
                          <li key={mIdx} className="pl-0.5 marker:text-rose-500">
                            <span className={darkMode ? 'text-stone-200' : 'text-stone-700'}>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg flex items-start gap-2 border border-dashed text-left ${
                    darkMode ? 'bg-blue-500/5 border-blue-500/20 text-[#60a5fa]' : 'bg-blue-50 border-blue-100 text-blue-700'
                  }`}>
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#60a5fa]" />
                    <p className="text-[10px] leading-relaxed font-semibold">
                      Dica de Coaching: Domine a postura e a desaceleração (fase excêntrica) para extrair o máximo do estímulo sem sobrecarregar as suas articulações.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, LogIn, Mail, User, ShieldCheck, Sparkles, Check, 
  ArrowLeft, CreditCard, Shield, TrendingUp, AlertCircle, Coins, 
  Flame, Award, ShoppingBag, ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
  darkMode: boolean;
}

type AuthStep = 'role-selector' | 'personal-plans' | 'aluno-plans' | 'payment-simulation' | 'login-credentials';

export default function AuthScreen({ onLoginSuccess, darkMode }: AuthScreenProps) {
  // Invite URL Query Parameters
  const [refCoach, setRefCoach] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref_coach');
  });
  const [studentIdParam, setStudentIdParam] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('student_id');
  });

  // Navigation & Plan Choice states
  const [step, setStep] = useState<AuthStep>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ref_coach')) {
      return 'login-credentials';
    }
    return 'role-selector';
  });
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: string;
    description: string;
    isMonthly: boolean;
    frequencyLimit?: string;
  } | null>(null);

  // Google Account Chooser Selector States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [showGoogleCustomForm, setShowGoogleCustomForm] = useState(false);

  // Authentication credentials states
  const [role, setRole] = useState<'aluno' | 'treinador'>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ref_coach')) {
      return 'aluno';
    }
    return 'aluno';
  });
  const [email, setEmail] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('student_email') || '';
  });
  const [name, setName] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('student_name') || '';
  });
  const [experienceLevel, setExperienceLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lvl = urlParams.get('student_level');
    if (lvl === 'Iniciante' || lvl === 'Intermediário' || lvl === 'Avançado') {
      return lvl as any;
    }
    return 'Iniciante';
  });
  const [objective, setObjective] = useState('Hipertrofia');
  const [isRegistering, setIsRegistering] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return !!urlParams.get('ref_coach');
  });

  // Custom biological and health profiling states (LGPD compliant)
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [healthConditions, setHealthConditions] = useState<string>('');
  const [lgpdConsent, setLgpdConsent] = useState<boolean>(false);
  const [showLgpdModal, setShowLgpdModal] = useState<boolean>(false);
  const [pendingActionAfterConsent, setPendingActionAfterConsent] = useState<'email' | 'google' | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Payment simulated values
  const [payMethod, setPayMethod] = useState<'card' | 'mbway' | 'multibanco'>('card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('321');
  const [phoneMB, setPhoneMB] = useState('912 345 678');
  const [isPaying, setIsPaying] = useState(false);

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleRoleSelection = (chosenRole: 'aluno' | 'treinador') => {
    setRole(chosenRole);
    if (chosenRole === 'treinador') {
      setStep('personal-plans');
    } else {
      setStep('aluno-plans');
    }
  };

  const handleSelectPlan = (plan: typeof selectedPlan) => {
    setSelectedPlan(plan);
    setStep('payment-simulation');
  };

  const handleSimulatePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setStep('login-credentials');
      alert(`Excelente! Pagamento simulado com sucesso de ${selectedPlan?.price} para o plano "${selectedPlan?.name}". Prossiga para criar sua conta.`);
    }, 1500);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('E-mail é obrigatório.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Por favor, digite um e-mail válido.');
      return;
    }
    if (isRegistering && !name) {
      setEmailError('Nome é obrigatório para cadastro.');
      return;
    }

    if (role === 'aluno' && !lgpdConsent) {
      setPendingActionAfterConsent('email');
      setShowLgpdModal(true);
      return;
    }

    setEmailError('');
    setIsLoading(true);

    // Simulated network latency
    setTimeout(() => {
      setIsLoading(false);
      const isStudent = role === 'aluno';
      const userProfile: UserProfile = {
        email: email,
        name: isRegistering ? name : email.split('@')[0],
        experienceLevel: isStudent ? experienceLevel : 'Intermediário',
        objective: isStudent ? objective : 'Gestão & Prescrição',
        avatar: isStudent 
          ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
          : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
        isPremium: true, // Anyone going through payment simulations gains active Premium status
        streak: 1,
        role: role,
        studentId: isStudent ? (studentIdParam || `STU-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
        accessCount: 1,
        subscribedPlan: refCoach 
          ? 'Atleta Orientado (Grátis)' 
          : selectedPlan?.name || (role === 'treinador' ? 'Personal Pro' : 'Atleta Frequente'),
        subscribedPrice: refCoach
          ? '€0,00'
          : selectedPlan?.price || (role === 'treinador' ? '€29,90/mês' : '€5,99/mês'),
        age: isStudent && age ? parseInt(age) : undefined,
        weight: isStudent && weight ? parseFloat(weight) : undefined,
        height: isStudent && height ? parseFloat(height) : undefined,
        healthConditions: isStudent ? (healthConditions.trim() || 'Sem restrições') : undefined,
        lgpdConsent: lgpdConsent,
        lgpdConsentDate: lgpdConsent ? new Date().toISOString() : undefined
      };
      
      onLoginSuccess(userProfile);
    }, 1200);
  };

  const executeLoginAfterConsent = () => {
    setEmailError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const isStudent = role === 'aluno';
      const userProfile: UserProfile = {
        email: email,
        name: isRegistering ? name : email.split('@')[0],
        experienceLevel: isStudent ? experienceLevel : 'Intermediário',
        objective: isStudent ? objective : 'Gestão & Prescrição',
        avatar: isStudent 
          ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
          : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
        isPremium: true,
        streak: 1,
        role: role,
        studentId: isStudent ? (studentIdParam || `STU-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
        accessCount: 1,
        subscribedPlan: refCoach 
          ? 'Atleta Orientado (Grátis)' 
          : selectedPlan?.name || (role === 'treinador' ? 'Personal Pro' : 'Atleta Frequente'),
        subscribedPrice: refCoach
          ? '€0,00'
          : selectedPlan?.price || (role === 'treinador' ? '€29,90/mês' : '€5,99/mês'),
        age: isStudent && age ? parseInt(age) : undefined,
        weight: isStudent && weight ? parseFloat(weight) : undefined,
        height: isStudent && height ? parseFloat(height) : undefined,
        healthConditions: isStudent ? (healthConditions.trim() || 'Sem restrições') : undefined,
        lgpdConsent: true,
        lgpdConsentDate: new Date().toISOString()
      };
      onLoginSuccess(userProfile);
    }, 1200);
  };

  const handleGoogleLogin = () => {
    if (role === 'aluno' && !lgpdConsent) {
      setPendingActionAfterConsent('google');
      setShowLgpdModal(true);
      return;
    }
    setEmailError('');
    setShowGoogleModal(true);
  };

  const handleSelectGoogleAccount = (selectedEmail: string, selectedName: string) => {
    setShowGoogleModal(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const isStudent = role === 'aluno';
      const userProfile: UserProfile = {
        email: selectedEmail,
        name: selectedName,
        experienceLevel: isStudent ? 'Intermediário' : 'Avançado',
        objective: isStudent ? 'Hipertrofia & Força' : 'Coaching Científico',
        avatar: isStudent 
          ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedEmail)}`
          : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedEmail)}`,
        isPremium: true,
        streak: 3,
        role: role,
        studentId: isStudent ? (studentIdParam || 'STU-4892') : undefined,
        accessCount: 3,
        subscribedPlan: refCoach 
          ? 'Atleta Orientado (Grátis)' 
          : selectedPlan?.name || (role === 'treinador' ? 'Personal Pro' : 'Atleta Frequente'),
        subscribedPrice: refCoach
          ? '€0,00'
          : selectedPlan?.price || (role === 'treinador' ? '€29,90/mês' : '€5,99/mês'),
        lgpdConsent: lgpdConsent,
        lgpdConsentDate: lgpdConsent ? new Date().toISOString() : undefined
      };
      onLoginSuccess(userProfile);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      darkMode ? 'bg-brand-bg text-stone-100' : 'bg-stone-50 text-stone-900'
    }`} id="auth-container">
      
      <div className={`w-full max-w-lg p-7 sm:p-9 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        darkMode ? 'bg-[#121212] border-brand-border shadow-2xl' : 'bg-white border-stone-200'
      }`}>
        
        {darkMode && (
          <div className="absolute -right-20 -top-20 w-44 h-44 bg-brand-neon/5 rounded-full blur-3xl"></div>
        )}

        {/* TOP BRAND HEADER (Shows on all screens) */}
        <div className="text-center mb-6 relative">
          <div className={`inline-flex items-center justify-center p-2.5 rounded-xl mb-3 ${
            darkMode ? 'bg-brand-neon/10 text-brand-neon' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-2.5xl font-light italic tracking-tight uppercase leading-none">
            Treino<span className={`font-black not-italic ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`}>Inteligente</span>
          </h1>
          <span className="text-[10px] text-stone-500 uppercase font-black tracking-widest block mt-1">RLL Solutions</span>
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: WELCOME & ROLE SELECTOR */}
          {step === 'role-selector' && (
            <motion.div
              key="role-selector"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  Seja Bem-Vindo ao Treino Inteligente
                </h2>
                <p className="text-xs text-stone-400">
                  Gerenciador profissional de treinos de musculação e acompanhamento em tempo real.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400 block text-center">
                  Identifique o seu perfil: Você é um...
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A: Personal */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelection('treinador')}
                    className={`p-5 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] cursor-pointer group ${
                      darkMode 
                        ? 'bg-zinc-950/40 border-zinc-800 hover:border-brand-neon hover:bg-zinc-900/40' 
                        : 'bg-stone-50 border-stone-200 hover:border-emerald-500 hover:bg-stone-100'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className={`p-2 rounded-lg w-max ${darkMode ? 'bg-brand-neon/15 text-brand-neon' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <Award className="w-5 h-5" />
                      </div>
                      <h3 className="font-black text-sm uppercase text-white group-hover:text-brand-neon transition-colors">
                        Personal Trainer
                      </h3>
                      <p className="text-[10px] text-stone-400 leading-normal">
                        Prescreva treinos rápidos com inteligência artificial, faça o acompanhamento e fature recorrentemente.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase text-brand-neon mt-4 leading-none select-none">
                      Ver Planos <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Option B: Aluno */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelection('aluno')}
                    className={`p-5 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] cursor-pointer group ${
                      darkMode 
                        ? 'bg-zinc-950/40 border-zinc-800 hover:border-brand-neon hover:bg-zinc-900/40' 
                        : 'bg-stone-50 border-stone-200 hover:border-emerald-500 hover:bg-stone-100'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className={`p-2 rounded-lg w-max ${darkMode ? 'bg-brand-neon/15 text-brand-neon' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <Flame className="w-5 h-5" />
                      </div>
                      <h3 className="font-black text-sm uppercase text-white group-hover:text-brand-neon transition-colors">
                        Atleta / Aluno
                      </h3>
                      <p className="text-[10px] text-stone-400 leading-normal">
                        Tenha acesso às suas rotinas personalizadas, controle e registre as suas cargas de exercícios e avalie métricas off-line.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase text-brand-neon mt-4 leading-none select-none">
                      Ver Opções <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Directly log in if already registered */}
              <div className="text-center pt-2">
                <p className="text-[10.5px] text-stone-400">
                  Já possui uma conta ativa paga na plataforma?{' '}
                  <button
                    type="button"
                    onClick={() => setStep('login-credentials')}
                    className={`font-black underline uppercase tracking-tight ${darkMode ? 'text-brand-neon hover:text-white' : 'text-emerald-500 hover:text-emerald-600'}`}
                  >
                    Entrar Direto
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 2A: PERSONAL PLANS SELECTION */}
          {step === 'personal-plans' && (
            <motion.div
              key="personal-plans"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('role-selector')}
                  className="text-stone-400 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                </button>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-neon px-2.5 py-0.5 bg-brand-neon/10 rounded">
                  PLANOS DE PERSONAL TRAINER
                </span>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {/* Starter Plan */}
                <div className={`p-4 rounded-xl border text-left space-y-2 relative transition-all ${
                  darkMode ? 'bg-zinc-950/30 border-zinc-850 hover:bg-zinc-950/50' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-tight">Personal Starter</h4>
                      <p className="text-[9.5px] text-stone-400">Até 20 alunos. Acompanhamento básico e dashboards.</p>
                    </div>
                    <span className="text-sm font-black text-white font-mono shrink-0">€09,90 a €14,90/mês</span>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] text-[#10b981] font-bold uppercase">
                    <span>✓ Criação de treinos grátis</span>
                    <span>✓ Acompanhamento básico</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan({
                      name: 'Personal Starter',
                      price: '€12,90/mês',
                      description: 'Até 20 alunos, criação de treinos, acompanhamento básico e painel básico.',
                      isMonthly: true
                    })}
                    className="w-full py-1.5 rounded bg-zinc-800 text-white font-bold text-[9px] uppercase tracking-widest text-center hover:bg-brand-neon hover:text-black transition-colors cursor-pointer"
                  >
                    Adquirir Starter (Simular)
                  </button>
                </div>

                {/* Pro Plan */}
                <div className={`p-4 rounded-xl border text-left space-y-2 relative transition-all ${
                  darkMode ? 'bg-brand-card border-brand-neon/40 shadow-md hover:bg-[#181818]' : 'bg-zinc-50 border-emerald-500/30'
                }`}>
                  <span className="absolute top-2 right-2 bg-brand-neon text-black text-[7px] font-black tracking-widest px-1.5 py-0.2 rounded uppercase">
                    RECOMENDADO
                  </span>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-tight flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-brand-neon" /> Personal Pro
                      </h4>
                      <p className="text-[9.5px] text-[#e2ff3b]">Até 100 alunos. Histórico tridimensional de cargas por IA.</p>
                    </div>
                    <span className="text-sm font-black text-[#e2ff3b] font-mono shrink-0">€24,90 a €39,90/mês</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[8.5px] text-stone-300 font-bold uppercase">
                    <span>✓ IA para sugestões de treino</span>
                    <span>✓ Avaliações físicas completas</span>
                    <span>✓ Fotos de evolução integradas</span>
                    <span>✓ Chat bidirecional em tempo real</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan({
                      name: 'Personal Pro',
                      price: '€29,90/mês',
                      description: 'Até 100 alunos, avaliações, fotos de evolução, chat imediato e IA sugestões (Gemini SDK).',
                      isMonthly: true
                    })}
                    className="w-full py-2 rounded bg-brand-neon text-black font-black text-[9px] uppercase tracking-widest text-center hover:bg-white transition-all cursor-pointer"
                  >
                    Adquirir Pro (Simular €29,90)
                  </button>
                </div>

                {/* Gym/Studio Plan */}
                <div className={`p-4 rounded-xl border text-left space-y-2 relative transition-all ${
                  darkMode ? 'bg-zinc-950/30 border-zinc-850 hover:bg-zinc-950/50' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-tight">Studio / Ginásio</h4>
                      <p className="text-[9.5px] text-stone-400">Vários personais, marca branca técnica e relatórios consolidados.</p>
                    </div>
                    <span className="text-sm font-black text-white font-mono shrink-0">€79 a €199/mês</span>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] text-[#a855f7] font-bold uppercase">
                    <span>✓ Gestão de equipa total</span>
                    <span>✓ Customização de Marca Branca</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan({
                      name: 'Studio / Ginásio',
                      price: '€119,00/mês',
                      description: 'Múltiplos personal trainers, controle administrativo corporativo e customização de marca corporativa.',
                      isMonthly: true
                    })}
                    className="w-full py-1.5 rounded bg-zinc-800 text-white font-bold text-[9px] uppercase tracking-widest text-center hover:bg-brand-neon hover:text-black transition-colors cursor-pointer"
                  >
                    Adquirir Studio (Simular)
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2B: ALUNO PLANS SELECTION */}
          {step === 'aluno-plans' && (
            <motion.div
              key="aluno-plans"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('role-selector')}
                  className="text-stone-400 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                </button>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-neon px-2.5 py-0.5 bg-brand-neon/10 rounded">
                  PLANOS DE ATLETAS / ALUNOS
                </span>
              </div>

              <div className="space-y-3">
                {/* Aluno Plan 1: Avulso */}
                <div className={`p-4 rounded-xl border text-left space-y-2 relative transition-all ${
                  darkMode ? 'bg-zinc-950/30 border-zinc-850 hover:bg-zinc-950/50' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-tight">Atleta Avulso</h4>
                      <p className="text-[9.5px] text-stone-400">Você só gere 1 plano de treino ativo.</p>
                    </div>
                    <span className="text-sm font-black text-white font-mono shrink-0">€1,99</span>
                  </div>
                  <p className="text-[8.5px] text-amber-400 leading-normal">
                    ⚠️ Se precisar de gerar outro plano no futuro por alteração ou fadiga, é cobrado um novo valor avulso (€1,99). Paga uma única vez por rotina.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan({
                      name: 'Atleta Avulso',
                      price: '€1,99 (Pago Único)',
                      description: 'Acesso a 1 plano de treino único ativo. Custos avulsos adicionais por novas gerações.',
                      isMonthly: false
                    })}
                    className="w-full py-1.5 rounded bg-zinc-800 text-white font-bold text-[9px] uppercase tracking-widest text-center hover:bg-brand-neon hover:text-black transition-colors cursor-pointer"
                  >
                    Selecionar Avulso
                  </button>
                </div>

                {/* Aluno Plan 2: Frequente (Recommended) */}
                <div className={`p-4 rounded-xl border text-left space-y-2 relative transition-all ${
                  darkMode ? 'bg-brand-card border-brand-neon/40 shadow-md hover:bg-[#181818]' : 'bg-[#eefcf3] border-emerald-500/25'
                }`}>
                  <span className="absolute top-2 right-2 bg-brand-neon text-black text-[7px] font-black tracking-widest px-1.5 py-0.2 rounded uppercase">
                    MAIS CONVENIENTE
                  </span>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-tight flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-brand-neon animate-pulse" /> Atleta Frequente
                      </h4>
                      <p className="text-[9.5px] text-stone-300">Pague mensalmente e ganhe atualizações programadas.</p>
                    </div>
                    <span className="text-sm font-black text-[#e2ff3b] font-mono shrink-0">€5,99/mês</span>
                  </div>
                  <p className="text-[8.5px] text-stone-400 leading-normal">
                    ✓ Permite gerar até <strong>3 planos de treinos completos por ano</strong>. Ideal para manter progressões de carga saudáveis de trimestre em trimestre.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan({
                      name: 'Atleta Frequente',
                      price: '€5,99 / mês',
                      description: 'Permite gerar 3 planos por ano para uma sequência ideal de evolução muscular.',
                      isMonthly: true
                    })}
                    className="w-full py-2 rounded bg-brand-neon text-black font-black text-[9px] uppercase tracking-widest text-center hover:bg-white transition-all cursor-pointer"
                  >
                    Adquirir Frequente (Simular)
                  </button>
                </div>

                {/* Aluno Plan 3: Ilimitado */}
                <div className={`p-4 rounded-xl border text-left space-y-2 relative transition-all ${
                  darkMode ? 'bg-zinc-950/30 border-zinc-850 hover:bg-zinc-950/50' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-tight">Atleta Ilimitado</h4>
                      <p className="text-[9.5px] text-stone-400">Geração de planos ilimitados por inteligência artificial.</p>
                    </div>
                    <span className="text-sm font-black text-white font-mono shrink-0">€7,99/mês</span>
                  </div>
                  <p className="text-[8.5px] text-stone-400 leading-normal">
                    ✓ Gere quando, como e quantos planos quiser. Altere divisões muscular, split de dias e foco na hora, sem restrições.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan({
                      name: 'Atleta Ilimitado',
                      price: '€7,99 / mês',
                      description: 'Geração absolutamente ilimitada de novas rotinas do atleta.',
                      isMonthly: true
                    })}
                    className="w-full py-1.5 rounded bg-zinc-800 text-white font-bold text-[9px] uppercase tracking-widest text-center hover:bg-brand-neon hover:text-black transition-colors cursor-pointer"
                  >
                    Selecionar Ilimitado
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: INTERACTIVE SIMULATED CHECKOUT PAYMENT */}
          {step === 'payment-simulation' && selectedPlan && (
            <motion.div
              key="payment-simulation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <button
                  type="button"
                  onClick={() => setStep(role === 'treinador' ? 'personal-plans' : 'aluno-plans')}
                  className="text-stone-400 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Mudar Plano
                </button>
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase text-amber-500">
                  <ShieldCheck className="w-4 h-4" /> Checkout Seguro
                </div>
              </div>

              {/* Chosen Plan Review */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-900 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest">Plano Escolhido</span>
                  <span className="text-xs font-black text-brand-neon font-mono">{selectedPlan.price}</span>
                </div>
                <h4 className="text-sm font-black uppercase text-white flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4 text-brand-neon" /> {selectedPlan.name}
                </h4>
                <p className="text-[10px] text-stone-400 leading-normal italic">{selectedPlan.description}</p>
              </div>

              <form onSubmit={handleSimulatePaymentSubmit} className="space-y-3.5">
                {/* Custom Tab selector for Payment method */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-900 text-center font-bold text-[9px]">
                  <button
                    type="button"
                    onClick={() => setPayMethod('card')}
                    className={`py-1 rounded cursor-pointer uppercase ${payMethod === 'card' ? 'bg-brand-neon text-black font-black' : 'text-stone-400'}`}
                  >
                    💳 Cartão
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('mbway')}
                    className={`py-1 rounded cursor-pointer uppercase ${payMethod === 'mbway' ? 'bg-brand-neon text-black font-black' : 'text-stone-400'}`}
                  >
                    📱 MB Way
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('multibanco')}
                    className={`py-1 rounded cursor-pointer uppercase ${payMethod === 'multibanco' ? 'bg-brand-neon text-black font-black' : 'text-stone-400'}`}
                  >
                    🧾 Entidade
                  </button>
                </div>

                {payMethod === 'card' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase text-stone-400">Nº do Cartão</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-zinc-900 rounded font-mono text-[11px] text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase text-stone-400">Titular do Cartão</label>
                        <input
                          type="text"
                          placeholder="Ex: Carlos Santos"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          required
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-zinc-900 rounded text-[11px] text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase text-stone-400">Validade</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-zinc-900 rounded font-mono text-[11px] text-center text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase text-stone-400">CVC</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-black/60 border border-zinc-900 rounded font-mono text-[11px] text-center text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {payMethod === 'mbway' && (
                  <div className="p-3 bg-black/40 border border-zinc-950 rounded-xl space-y-2">
                    <label className="text-[10px] font-extrabold uppercase text-stone-400 block">Número do Telemóvel associado</label>
                    <input
                      type="text"
                      value={phoneMB}
                      onChange={(e) => setPhoneMB(e.target.value)}
                      className="w-full px-3 py-2 bg-black/80 border border-zinc-900 rounded font-semibold text-xs tracking-wider text-center text-brand-neon focus:outline-none"
                    />
                    <p className="text-[9px] text-stone-450 text-center leading-normal">
                      ⚠️ Ao simular, você receberá uma notificação fictícia no aplicativo MB Way para autorizar o valor de <strong>{selectedPlan.price}</strong>.
                    </p>
                  </div>
                )}

                {payMethod === 'multibanco' && (
                  <div className="p-4 bg-zinc-950/90 border border-zinc-900 rounded-xl text-center space-y-2.5 font-mono text-[10.5px]">
                    <div className="font-extrabold text-[9px] text-stone-500 uppercase">Referência de Pagamento Multibanco</div>
                    <div className="flex justify-between border-b border-zinc-900/50 pb-1 text-stone-300">
                      <span>ENTIDADE:</span>
                      <span className="font-bold text-white tracking-widest">24990</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/50 pb-1 text-stone-300">
                      <span>REFERÊNCIA:</span>
                      <span className="font-bold text-brand-neon tracking-widest">881 292 {Math.floor(100 + Math.random() * 900)}</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>VALOR TOTAL:</span>
                      <span className="font-bold text-white">{selectedPlan.price}</span>
                    </div>
                    <span className="text-[8px] uppercase tracking-wider text-amber-500 block">✓ Instantâneo e seguro sem atrasos de compensação</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPaying}
                  className={`w-full py-3.5 font-black uppercase tracking-widest text-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    darkMode ? 'bg-brand-neon hover:bg-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  {isPaying ? (
                    <span className="border-2 border-t-transparent rounded-full w-4 h-4 animate-spin border-black" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Efetuar Pagamento ({selectedPlan.price})
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: AUTHENTICATION CREDENTIALS FORM */}
          {step === 'login-credentials' && (
            <motion.div
              key="login-credentials"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                {!refCoach ? (
                  <button
                    type="button"
                    onClick={() => setStep('role-selector')}
                    className="text-stone-400 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Recomeçar
                  </button>
                ) : (
                  <div className="text-[10px] text-brand-neon font-black tracking-widest uppercase">
                    ✓ Convite Recebido
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-neon/10 text-brand-neon font-black text-[9px] uppercase tracking-wider">
                  {role === 'aluno' ? 'Atleta / Aluno' : 'Personal Trainer'}
                </div>
              </div>

              {refCoach && (
                <div className="p-4 rounded-xl border border-brand-neon/35 bg-brand-neon/5 text-left space-y-1.5 shadow-md shadow-brand-neon/5">
                  <div className="flex items-center gap-2 text-brand-neon font-extrabold text-[10px] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 animate-pulse text-brand-neon" />
                    <span>Conexão Sincronizada Ativa!</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    Bem-vindo, <strong className="text-white">{name || 'atleta'}</strong>! O treinador <strong className="text-brand-neon font-mono text-[10px]">{refCoach}</strong> registou o seu perfil no painel de acompanhamento inteligente e convida-o a concluir o seu registo gratuito.
                  </p>
                  <p className="text-[10px] text-[#10b981] font-black uppercase tracking-wider flex items-center gap-1.5">
                    ✓ Acesso 100% Gratuito garantido pelo Treinador (€0,00)
                  </p>
                </div>
              )}

              {selectedPlan && !refCoach && (
                <div className="p-2.5 rounded-lg border border-brand-neon/30 bg-brand-neon/5 text-left text-[10.5px] text-stone-300 leading-normal flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-neon shrink-0 animate-bounce" />
                  <span>Plano ativo garantido: <strong className="text-white">{selectedPlan.name}</strong> • Pronto para acessar</span>
                </div>
              )}

              {/* Form Container */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {isRegistering && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder={role === 'aluno' ? 'Seu nome de treino' : 'Seu nome profissional'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm focus:outline-none transition-all ${
                          darkMode 
                            ? 'bg-[#181818] border-brand-border-muted text-stone-100 placeholder-zinc-500 focus:ring-1 focus:ring-brand-neon/30' 
                            : 'bg-stone-100 border-stone-200 text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500/30'
                        }`}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
                    Endereço de E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm focus:outline-none transition-all ${
                        darkMode 
                          ? 'bg-[#181818] border-brand-border-muted text-stone-100 placeholder-zinc-500 focus:ring-1 focus:ring-brand-neon/30' 
                          : 'bg-stone-100 border-stone-200 text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500/30'
                      }`}
                      required
                    />
                  </div>
                </div>

                {role === 'aluno' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
                        Sua Experiência
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Iniciante', 'Intermediário', 'Avançado'] as const).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setExperienceLevel(level)}
                            className={`py-2 px-1 text-[11px] font-bold uppercase tracking-tighter rounded-lg border transition-all ${
                              experienceLevel === level
                                ? darkMode 
                                  ? 'bg-brand-neon text-black border-transparent shadow-md font-black'
                                  : 'bg-emerald-500 text-white border-transparent shadow'
                                : darkMode
                                  ? 'bg-[#181818] border-brand-border text-stone-400 hover:bg-brand-border-muted hover:text-white'
                                  : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">
                        Objetivo Fitness
                      </label>
                      <select
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className={`w-full px-3 py-3 rounded-lg border text-sm focus:outline-none transition-all ${
                          darkMode 
                            ? 'bg-[#181818] border-brand-border-muted text-stone-100 focus:ring-1 focus:ring-brand-neon/30' 
                            : 'bg-stone-100 border-stone-200 text-stone-900 focus:ring-2 focus:ring-emerald-500/30'
                        }`}
                      >
                        <option value="Hipertrofia">Hipertrofia muscular</option>
                        <option value="Emagrecimento">Definição & Emagrecimento</option>
                        <option value="Força">Força (Powerlifting)</option>
                        <option value="Resistência">Resistência muscular</option>
                      </select>
                    </div>

                    {/* Personal Physical Metrics & Pro Health Conditions */}
                    {isRegistering && (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                              Idade
                            </label>
                            <input
                              type="number"
                              min="10"
                              max="120"
                              placeholder="Idade"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              className={`w-full px-2.5 py-2.5 rounded-lg border text-xs focus:outline-none transition-all ${
                                darkMode 
                                  ? 'bg-[#181818] border-brand-border-muted text-stone-100 focus:ring-1 focus:ring-brand-neon/30' 
                                  : 'bg-stone-100 border-stone-200 text-stone-900 focus:ring-2 focus:ring-emerald-500/30'
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                              Peso (kg)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Ex: 78"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              className={`w-full px-2.5 py-2.5 rounded-lg border text-xs focus:outline-none transition-all ${
                                darkMode 
                                  ? 'bg-[#181818] border-brand-border-muted text-stone-100 focus:ring-1 focus:ring-brand-neon/30' 
                                  : 'bg-stone-100 border-stone-200 text-stone-900 focus:ring-2 focus:ring-emerald-500/30'
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                              Altura (cm)
                            </label>
                            <input
                              type="number"
                              placeholder="Ex: 178"
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                              className={`w-full px-2.5 py-2.5 rounded-lg border text-xs focus:outline-none transition-all ${
                                darkMode 
                                  ? 'bg-[#181818] border-brand-border-muted text-stone-100 focus:ring-1 focus:ring-brand-neon/30' 
                                  : 'bg-stone-100 border-stone-200 text-stone-900 focus:ring-2 focus:ring-emerald-500/30'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                            Problemas ou Restrições de Saúde
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Ex: Escoliose lombar leve, asma esforço ou 'Sem restrições'..."
                            value={healthConditions}
                            onChange={(e) => setHealthConditions(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs focus:outline-none transition-all ${
                              darkMode 
                                ? 'bg-[#181818] border-brand-border-muted text-stone-100 focus:ring-1 focus:ring-brand-neon/30' 
                                : 'bg-stone-100 border-stone-200 text-stone-900 focus:ring-2 focus:ring-emerald-500/30'
                            }`}
                          />
                        </div>
                      </>
                    )}

                    {/* Explicit privacy/LGPD consent checkbox */}
                    <div 
                      onClick={() => {
                        if (!lgpdConsent) {
                          setPendingActionAfterConsent(null);
                          setShowLgpdModal(true);
                        } else {
                          setLgpdConsent(false);
                        }
                      }}
                      className={`p-3.5 rounded-xl border flex gap-3 text-left transition-all cursor-pointer group ${
                        darkMode 
                          ? 'bg-zinc-900/25 border-brand-border/30 hover:bg-zinc-900/55' 
                          : 'bg-stone-100/30 border-stone-200 hover:bg-stone-100/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id="lgpdConsent"
                        checked={lgpdConsent}
                        readOnly
                        className={`mt-0.5 shrink-0 w-4 h-4 rounded cursor-pointer ${
                          darkMode ? 'accent-brand-neon' : 'accent-emerald-500'
                        }`}
                      />
                      <label htmlFor="lgpdConsent" className="text-[9.5px] leading-relaxed select-none cursor-pointer flex-grow">
                        <strong className={darkMode ? 'text-white' : 'text-stone-900'}>Consentimento de Proteção de Dados (LGPD/RGPD):</strong> Aceito o processamento e armazenamento de segurança dos meus indicadores físicos e do meu estado de saúde para fins de personalização das minhas fichas de treino. <span className={`underline font-bold transition-all ${darkMode ? 'text-brand-neon group-hover:text-white' : 'text-emerald-600 group-hover:text-emerald-700'}`}>Clique para ler e aceitar o termo completo.</span>
                      </label>
                    </div>
                  </>
                )}

                {emailError && (
                  <p className="text-rose-500 text-xs font-semibold text-center">{emailError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 font-bold uppercase tracking-tight rounded-lg shadow-lg transition-all text-xs flex items-center justify-center gap-2 ${
                    darkMode 
                      ? 'bg-brand-neon text-black hover:bg-white shadow-brand-neon/10' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
                  }`}
                >
                  {isLoading ? (
                    <span className={`border-2 border-t-transparent rounded-full w-4 h-4 animate-spin ${
                      darkMode ? 'border-black' : 'border-white'
                    }`} />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      {refCoach 
                        ? 'Concluir Registo Gratuito' 
                        : isRegistering 
                          ? 'Criar Conta' 
                          : 'Acessar com E-mail'
                      }
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className={`flex-grow border-t border-dashed ${darkMode ? 'border-brand-border-muted' : 'border-stone-300'}`} />
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-3">Ou</span>
                <div className={`flex-grow border-t border-dashed ${darkMode ? 'border-brand-border-muted' : 'border-stone-300'}`} />
              </div>

              {/* Google OAuth mock launcher */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={`w-full py-3 border text-xs font-bold uppercase tracking-tight rounded-lg transition-all flex items-center justify-center gap-3 ${
                  darkMode 
                    ? 'bg-[#181818] border-brand-border-muted text-stone-200 hover:bg-brand-border hover:text-white' 
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100/50'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.247-3.125C18.29 1.95 15.54 1 12.24 1 6.133 1 1.2 5.933 1.2 12s4.933 11 11.04 11c6.38 0 10.613-4.414 10.613-10.786 0-.726-.08-1.284-.176-1.929H12.24z"
                  />
                </svg>
                {refCoach ? 'Concluir com o Google (Grátis)' : 'Entrar com o Google'}
              </button>

              {/* Footer Toggle Register vs Login */}
              {!refCoach && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className={`text-xs hover:underline font-bold uppercase tracking-tight ${
                      darkMode ? 'text-brand-neon' : 'text-emerald-500'
                    }`}
                  >
                    {isRegistering ? 'Já tem uma conta? Faça login aqui' : 'Novo por aqui? Crie o seu cadastro'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Dynamic footer status of step */}
        <div className={`mt-8 pt-4 border-t text-center flex items-center justify-center gap-2 ${
          darkMode ? 'border-brand-border text-zinc-500' : 'border-stone-100 text-stone-500'
        }`}>
          <Dumbbell className={`w-3.5 h-3.5 ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`} />
          <span className="text-[9px] tracking-wider uppercase font-extrabold text-stone-400">
            Seguro & Conexão Criptografada SSL
          </span>
        </div>

      </div>

      {/* GOOGLE ACCOUNT CHOOSER DIALOG */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-stone-900 rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-stone-200 z-[100]"
            >
              {/* Google colorful logo */}
              <div className="text-center mb-5">
                <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <h3 className="text-lg font-black tracking-tight mt-3 text-stone-900">Escolha uma conta</h3>
                <p className="text-xs text-stone-500 mt-1">
                  para continuar para <span className="font-bold text-gray-700">Treino Inteligente</span>
                </p>
              </div>

              {!showGoogleCustomForm ? (
                <div className="space-y-2.5 mb-4">
                  {/* Account option 1: Carlos Oliveira */}
                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount('rllautomations@gmail.com', 'Carlos Oliveira')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
                        CO
                      </div>
                      <div>
                        <div className="font-extrabold text-stone-950 text-xs group-hover:text-blue-600 transition-colors">Carlos Oliveira</div>
                        <div className="text-[10px] text-stone-500">rllautomations@gmail.com</div>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Principal
                    </span>
                  </button>

                  {/* Account option 2: Outra conta */}
                  <button
                    type="button"
                    onClick={() => setShowGoogleCustomForm(true)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-sm shadow">
                      +
                    </div>
                    <div>
                      <div className="font-extrabold text-stone-950 text-xs group-hover:text-blue-600 transition-colors">Utilizar outra conta</div>
                      <div className="text-[10px] text-stone-500">Entrar com um nome e e-mail Google personalizado</div>
                    </div>
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (googleCustomEmail && googleCustomName) {
                      handleSelectGoogleAccount(googleCustomEmail, googleCustomName);
                    }
                  }}
                  className="space-y-4 mb-4 text-left"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-stone-500">Nome da Conta Google</label>
                    <input
                      type="text"
                      placeholder="Ex: Ana Silva"
                      value={googleCustomName}
                      onChange={(e) => setGoogleCustomName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-stone-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-stone-500">Endereço de E-mail Google</label>
                    <input
                      type="email"
                      placeholder="seu-login@gmail.com"
                      value={googleCustomEmail}
                      onChange={(e) => setGoogleCustomEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-stone-950"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGoogleCustomForm(false)}
                      className="flex-1 py-2 text-stone-500 hover:text-stone-700 hover:bg-stone-50 text-[10px] uppercase font-black tracking-wider text-center border border-stone-200 rounded-lg transition-all cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] uppercase font-black tracking-wider text-center rounded-lg transition-all cursor-pointer shadow-md"
                    >
                      Iniciar Sessão
                    </button>
                  </div>
                </form>
              )}

              {/* Informative footer text */}
              <p className="text-[9.5px] text-stone-400 text-center leading-relaxed mt-2 pt-2 border-t border-stone-100">
                Para continuar, a Google irá partilhar o seu nome, endereço de e-mail, preferência de idioma e fotografia de perfil com a aplicação <strong className="text-stone-600">Treino Inteligente</strong>.
              </p>

              {/* Secondary close button */}
              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  setShowGoogleCustomForm(false);
                }}
                className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LGPD TERMS OF CONSENT DIALOG MODAL */}
      <AnimatePresence>
        {showLgpdModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl w-full max-w-xl p-6 shadow-2xl relative border z-[110] transition-colors ${
                darkMode ? 'bg-[#121212] border-brand-border text-stone-200' : 'bg-white border-stone-200 text-stone-800'
              }`}
            >
              <div className="flex items-start gap-4 mb-5 border-b pb-4 border-dashed border-stone-550/20">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  darkMode ? 'bg-brand-neon/10 text-brand-neon' : 'bg-emerald-500/10 text-emerald-600'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-lg font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                    Consentimento de Dados Pessoais
                  </h3>
                  <p className="text-[10px] uppercase font-black tracking-wider text-stone-500 mt-0.5">
                    Regulamento Geral de Proteção de Dados (LGPD/RGPD)
                  </p>
                </div>
              </div>

              {/* Terms Content text box */}
              <div className={`text-xs space-y-4 max-h-72 overflow-y-auto block pr-3 mb-6 scrollbar-thin leading-relaxed ${
                darkMode ? 'text-stone-400' : 'text-stone-600'
              }`}>
                <p>
                  O <strong>Treino Inteligente (RLL Solutions)</strong> leva a confidencialidade e a segurança das suas informações de saúde com o máximo rigor científico e ético. De acordo com a Lei Geral de Proteção de Dados (LGPD) e o Regulamento Geral sobre a Proteção de Dados (RGPD), os dados desportivos e clínico-fisiológicos necessitam do seu consentimento explícito para processamento.
                </p>

                <div className="space-y-2">
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-brand-neon' : 'text-emerald-700'}`}>
                    1. Tipos de Informação Processada:
                  </h4>
                  <p>
                    Recolhemos os seus dados de rastreamento físico (peso, altura, idade e nível desportivo), objetivos gerais de evolução, logs e históricos de treino diários, e quaisquer restrições médico-fisiológicas relevantes (problemas de postura, patologias ou dores musculares) indicadas livremente por si na ficha de perfil ou fornecidas pelo seu dispositivo wearable.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-brand-neon' : 'text-emerald-700'}`}>
                    2. Finalidades Legais e Clínicas:
                  </h4>
                  <p>
                    O processamento destas métricas sensíveis serve exclusivamente para adaptar e personalizar as fichas e rotinas de exercícios de forma estritamente individual através de nosso algoritmo preditivo inteligente, prevenindo lesões e gerando cargas adequadas, assim como permitir a análise gráfica do seu progresso desportivo real pelo seu treinador ou consultor associado.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-brand-neon' : 'text-emerald-700'}`}>
                    3. Confidencialidade e Armazenamento Controlado:
                  </h4>
                  <p>
                    As suas informações de saúde são armazenadas localmente no registo seguro do navegador e sincronizadas de forma anônima. Nenhuma de suas informações será vendida, transferida ou partilhada com empresas terceiras de publicidade ou marketing. Se estiver vinculado a um treinador pessoal por meio de link específico, os dados serão partilhados apenas com esse profissional autorizado.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-brand-neon' : 'text-emerald-700'}`}>
                    4. Livre Revogação e Exclusão Instantânea:
                  </h4>
                  <p>
                    Compreendo que posso, a qualquer momento, revogar livremente este consentimento, consultar detalhadamente, alterar ou ordenar a eliminação permanente e completa de todo o meu histórico de treinos e indicadores físicas diretamente na área de Configurações, removendo imediatamente todos os meus vestígios digitais de saúde da aplicação.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className={`font-bold text-xs ${darkMode ? 'text-brand-neon' : 'text-emerald-700'}`}>
                    5. Termos do Consentimento Livre e Esclarecido:
                  </h4>
                  <p>
                    Ao clicar no botão "Aceitar e Confirmar", declara concordar voluntariamente com a recolha, tratamento e o armazenamento criptografado seguro dos seus dados de fitness descritos acima para a finalidade única de personalização do seu programa de treinos diários.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 justify-end pt-3 border-t border-stone-500/15">
                <button
                  type="button"
                  onClick={() => {
                    setShowLgpdModal(false);
                    setPendingActionAfterConsent(null);
                  }}
                  className={`px-4.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-colors cursor-pointer ${
                    darkMode 
                      ? 'bg-zinc-900 border border-brand-border-muted text-stone-400 hover:text-white hover:bg-zinc-800' 
                      : 'bg-stone-100 border border-stone-200 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLgpdConsent(true);
                    setShowLgpdModal(false);
                    // If a pending action exists, run it immediately!
                    if (pendingActionAfterConsent === 'email') {
                      executeLoginAfterConsent();
                    } else if (pendingActionAfterConsent === 'google') {
                      setShowGoogleModal(true);
                    }
                    setPendingActionAfterConsent(null);
                  }}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-tight transition-all shadow-md cursor-pointer ${
                    darkMode 
                      ? 'bg-brand-neon text-black hover:bg-white shadow-brand-neon/10' 
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/10'
                  }`}
                >
                  Aceitar e Confirmar
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowLgpdModal(false);
                  setPendingActionAfterConsent(null);
                }}
                className={`absolute top-4 right-4 transition-colors p-1 text-xs cursor-pointer ${
                  darkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

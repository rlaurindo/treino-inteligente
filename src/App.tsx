import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, TrendingUp, Users, Bluetooth, Settings, Sparkles, 
  Flame, ShieldAlert, Award, LogOut, Bell, HeartPulse, Check
} from 'lucide-react';

// Subcomponents
import AuthScreen from './components/AuthScreen';
import WorkoutGenerator from './components/WorkoutGenerator';
import ProgressTracker from './components/ProgressTracker';
import CommunityFeed from './components/CommunityFeed';
import WearableSync from './components/WearableSync';
import SettingsPanel from './components/SettingsPanel';
import TrainerPanel from './components/TrainerPanel';

// Types
import { UserProfile, WorkoutRoutine, TrainingLog, WearableStats, NotificationSettings } from './types';
import { useLanguage } from './context/LanguageContext';
import { 
  saveUserProfile, 
  getUserProfile, 
  saveWorkoutRoutine, 
  loadWorkoutRoutines, 
  saveTrainingLog, 
  loadTrainingLogs, 
  saveWearableStats, 
  loadWearableStats, 
  saveNotificationSettings, 
  loadNotificationSettings 
} from './services/db';
import { auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';

export default function App() {
  const { language, t } = useLanguage();
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  // Persistence state loaders
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('treino_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [savedOfflineWorkouts, setSavedOfflineWorkouts] = useState<WorkoutRoutine[]>(() => {
    try {
      const savedUser = localStorage.getItem('treino_user_profile');
      const userObj = savedUser ? JSON.parse(savedUser) : null;
      const userKey = userObj?.studentId 
        ? userObj.studentId.trim().toUpperCase() 
        : (userObj?.email ? userObj.email.trim().toUpperCase() : 'GUEST');
      const saved = localStorage.getItem(`treino_offline_routines_${userKey}`) || localStorage.getItem('treino_offline_routines');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>(() => {
    try {
      const savedUser = localStorage.getItem('treino_user_profile');
      const userObj = savedUser ? JSON.parse(savedUser) : null;
      const userKey = userObj?.studentId 
        ? userObj.studentId.trim().toUpperCase() 
        : (userObj?.email ? userObj.email.trim().toUpperCase() : 'GUEST');
      const saved = localStorage.getItem(`treino_training_logs_${userKey}`) || localStorage.getItem('treino_training_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wearableStats, setWearableStats] = useState<WearableStats>(() => {
    try {
      const savedUser = localStorage.getItem('treino_user_profile');
      const userObj = savedUser ? JSON.parse(savedUser) : null;
      const userKey = userObj?.studentId 
        ? userObj.studentId.trim().toUpperCase() 
        : (userObj?.email ? userObj.email.trim().toUpperCase() : 'GUEST');
      const saved = localStorage.getItem(`treino_wearable_stats_${userKey}`) || localStorage.getItem('treino_wearable_stats');
      return saved ? JSON.parse(saved) : {
        connected: false,
        deviceType: 'Nenhum',
        steps: 0,
        heartRate: 0,
        activeCalories: 0
      };
    } catch {
      return {
        connected: false,
        deviceType: 'Nenhum',
        steps: 0,
        heartRate: 0,
        activeCalories: 0
      };
    }
  });

  const [notificationConfig, setNotificationConfig] = useState<NotificationSettings>(() => {
    try {
      const savedUser = localStorage.getItem('treino_user_profile');
      const userObj = savedUser ? JSON.parse(savedUser) : null;
      const userKey = userObj?.studentId 
        ? userObj.studentId.trim().toUpperCase() 
        : (userObj?.email ? userObj.email.trim().toUpperCase() : 'GUEST');
      const saved = localStorage.getItem(`treino_notification_settings_${userKey}`) || localStorage.getItem('treino_notification_settings');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        time: '08:00',
        notifyOnDays: [1, 2, 3, 4, 5],
        message: 'Hora de amassar os ferros e buscar sua evolução!'
      };
    } catch {
      return {
        enabled: true,
        time: '08:00',
        notifyOnDays: [1, 2, 3, 4, 5],
        message: 'Hora de amassar os ferros e buscar sua evolução!'
      };
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('treino_dark_mode');
      return saved ? JSON.parse(saved) : true; // default dark mode for accessibility and premium look
    } catch {
      return true;
    }
  });

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('treino_offline_mode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Automatically sign in anonymously on mount to allow secure read/write security rules matching in Firestore
  useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth)
        .then((cred) => {
          console.log("Authenticated anonymously with UID:", cred.user.uid);
          if (currentUser && !currentUser.firebaseUid) {
            const updated = { ...currentUser, firebaseUid: cred.user.uid };
            setCurrentUser(updated);
            saveUserProfile(updated).catch(console.error);
          }
        })
        .catch((err) => {
          console.error("Auth initialization error:", err);
        });
    } else {
      if (currentUser && !currentUser.firebaseUid) {
        const updated = { ...currentUser, firebaseUid: auth.currentUser.uid };
        setCurrentUser(updated);
        saveUserProfile(updated).catch(console.error);
      }
    }
  }, [currentUser]);

  // VERIFICATION WORKFLOW: Securely re-orient all local state buffers immediately on authentication swap + trigger Firestore cloud sync
  useEffect(() => {
    const userKey = currentUser?.studentId 
      ? currentUser.studentId.trim().toUpperCase() 
      : (currentUser?.email ? currentUser.email.trim().toUpperCase() : 'GUEST');

    // 1. Immediate visual speed-up using local cache
    try {
      const savedLogs = localStorage.getItem(`treino_training_logs_${userKey}`);
      if (savedLogs) {
        setTrainingLogs(JSON.parse(savedLogs));
      } else {
        setTrainingLogs([]);
      }
    } catch {
      setTrainingLogs([]);
    }

    try {
      const savedOffline = localStorage.getItem(`treino_offline_routines_${userKey}`);
      if (savedOffline) {
        setSavedOfflineWorkouts(JSON.parse(savedOffline));
      } else {
        setSavedOfflineWorkouts([]);
      }
    } catch {
      setSavedOfflineWorkouts([]);
    }

    try {
      const savedWearable = localStorage.getItem(`treino_wearable_stats_${userKey}`);
      if (savedWearable) {
        setWearableStats(JSON.parse(savedWearable));
      } else {
        setWearableStats({
          connected: false,
          deviceType: 'Nenhum',
          steps: 0,
          heartRate: 0,
          activeCalories: 0
        });
      }
    } catch {
      // ignore
    }

    try {
      const savedNotifs = localStorage.getItem(`treino_notification_settings_${userKey}`);
      if (savedNotifs) {
        setNotificationConfig(JSON.parse(savedNotifs));
      } else {
        setNotificationConfig({
          enabled: true,
          time: '08:00',
          notifyOnDays: [1, 2, 3, 4, 5],
          message: 'Hora de amassar os ferros e buscar sua evolução!'
        });
      }
    } catch {
      // ignore
    }

    // 2. Perform live Cloud Firestore Database Sync securely if a user is authenticated
    if (!currentUser) return;
    let isSubscribed = true;

    async function syncAndLoad() {
      setIsSyncingDb(true);
      try {
        const cloudProfile = await getUserProfile(currentUser!.email);
        if (cloudProfile) {
          if (isSubscribed) {
            // Keep state and local synchronization updated with cloud master copy
            setCurrentUser(cloudProfile);
          }
          const routines = await loadWorkoutRoutines(currentUser!.email);
          if (routines && routines.length > 0 && isSubscribed) {
            setSavedOfflineWorkouts(routines);
          } else if (savedOfflineWorkouts.length > 0) {
            for (const r of savedOfflineWorkouts) {
              await saveWorkoutRoutine(currentUser!.email, r);
            }
          }
          const logs = await loadTrainingLogs(currentUser!.email);
          if (logs && logs.length > 0 && isSubscribed) {
            setTrainingLogs(logs);
          } else if (trainingLogs.length > 0) {
            for (const log of trainingLogs) {
              await saveTrainingLog(currentUser!.email, log);
            }
          }
          const wear = await loadWearableStats(currentUser!.email);
          if (wear && isSubscribed) {
            setWearableStats(wear);
          } else {
            await saveWearableStats(currentUser!.email, wearableStats);
          }
          const notof = await loadNotificationSettings(currentUser!.email);
          if (notof && isSubscribed) {
            setNotificationConfig(notof);
          } else {
            await saveNotificationSettings(currentUser!.email, notificationConfig);
          }
        } else {
          // If first time user logging in (not yet in Cloud), upload current dataset to create new record
          await saveUserProfile(currentUser!);
          for (const r of savedOfflineWorkouts) {
            await saveWorkoutRoutine(currentUser!.email, r);
          }
          for (const log of trainingLogs) {
            await saveTrainingLog(currentUser!.email, log);
          }
          await saveWearableStats(currentUser!.email, wearableStats);
          await saveNotificationSettings(currentUser!.email, notificationConfig);
        }
      } catch (err) {
        console.error('Error syncing with Firestore database:', err);
      } finally {
        if (isSubscribed) {
          setIsSyncingDb(false);
        }
      }
    }

    syncAndLoad();

    return () => {
      isSubscribed = false;
    };
  }, [currentUser?.email]);

  // Navigation and alerts
  const [currentTab, setCurrentTab] = useState<'workout' | 'stats' | 'feed' | 'wearable' | 'config' | 'trainer'>('workout');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotificationAlert, setShowNotificationAlert] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Save state synchronizers to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('treino_user_profile', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('treino_user_profile');
    }
  }, [currentUser]);

  useEffect(() => {
    const userKey = currentUser?.studentId 
      ? currentUser.studentId.trim().toUpperCase() 
      : (currentUser?.email ? currentUser.email.trim().toUpperCase() : 'GUEST');
    localStorage.setItem(`treino_offline_routines_${userKey}`, JSON.stringify(savedOfflineWorkouts));
  }, [savedOfflineWorkouts, currentUser]);

  useEffect(() => {
    const userKey = currentUser?.studentId 
      ? currentUser.studentId.trim().toUpperCase() 
      : (currentUser?.email ? currentUser.email.trim().toUpperCase() : 'GUEST');
    localStorage.setItem(`treino_training_logs_${userKey}`, JSON.stringify(trainingLogs));
  }, [trainingLogs, currentUser]);

  useEffect(() => {
    const userKey = currentUser?.studentId 
      ? currentUser.studentId.trim().toUpperCase() 
      : (currentUser?.email ? currentUser.email.trim().toUpperCase() : 'GUEST');
    localStorage.setItem(`treino_wearable_stats_${userKey}`, JSON.stringify(wearableStats));
  }, [wearableStats, currentUser]);

  useEffect(() => {
    const userKey = currentUser?.studentId 
      ? currentUser.studentId.trim().toUpperCase() 
      : (currentUser?.email ? currentUser.email.trim().toUpperCase() : 'GUEST');
    localStorage.setItem(`treino_notification_settings_${userKey}`, JSON.stringify(notificationConfig));
  }, [notificationConfig, currentUser]);

  useEffect(() => {
    localStorage.setItem('treino_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('treino_offline_mode', JSON.stringify(isOfflineMode));
  }, [isOfflineMode]);

  // Synchronize and increment user access count once per session
  useEffect(() => {
    const sessionTriggered = sessionStorage.getItem('treino_access_incremented');
    if (currentUser && !sessionTriggered) {
      setCurrentUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          accessCount: (prev.accessCount || 0) + 1
        };
      });
      sessionStorage.setItem('treino_access_incremented', 'true');
    }
  }, [currentUser]);

  // Redirect trainer/coach users to Trainer tab by default
  useEffect(() => {
    if (currentUser?.role === 'treinador' && currentTab !== 'trainer' && currentTab !== 'feed' && currentTab !== 'config') {
      setCurrentTab('trainer');
    }
  }, [currentUser, currentTab]);

  // Redirect student/athlete users away from Trainer tab by default
  useEffect(() => {
    if (currentUser?.role === 'aluno' && currentTab === 'trainer') {
      setCurrentTab('workout');
    }
  }, [currentUser, currentTab]);

  // Simulate notification schedule triggers
  useEffect(() => {
    if (!currentUser) return;

    // Trigger a simulated reminder in 8 seconds to demonstrate real mechanics in preview
    const timer = setTimeout(() => {
      setNotificationMessage(notificationConfig.message || 'Hora de amassar os ferros e buscar sua evolução!');
      setShowNotificationAlert(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [currentUser, notificationConfig]);

  const handleUpdateUserProfile = (updated: Partial<UserProfile>) => {
    if (currentUser) {
      const newUser = { ...currentUser, ...updated };
      setCurrentUser(newUser);
      saveUserProfile(newUser).catch(console.error);
    }
  };

  const handleLogWorkout = (log: TrainingLog) => {
    setTrainingLogs([log, ...trainingLogs]);
    
    // Increment user streak and active stats
    if (currentUser) {
      const nextStreak = currentUser.streak + 1;
      const newUser = {
        ...currentUser,
        streak: nextStreak
      };
      setCurrentUser(newUser);
      saveUserProfile(newUser).catch(console.error);
      saveTrainingLog(currentUser.email, log).catch(console.error);
    }
  };

  const handleSaveOfflineWorkout = (routine: WorkoutRoutine) => {
    if (!currentUser?.isPremium) {
      alert("Apenas usuários premium podem salvar treinos offline!");
      return;
    }
    
    if (savedOfflineWorkouts.some(items => items.title === routine.title)) {
      alert("Este treino já está guardado offline.");
      return;
    }

    setSavedOfflineWorkouts([routine, ...savedOfflineWorkouts]);
    if (currentUser) {
      saveWorkoutRoutine(currentUser.email, routine).catch(console.error);
    }
    alert(`Treino "${routine.title}" salvo offline com sucesso.`);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setCurrentUser(null);
    setCurrentTab('workout');
    setShowLogoutConfirm(false);
  };

  // If user is not authenticated, render login form
  if (!currentUser) {
    return (
      <AuthScreen 
        onLoginSuccess={(profile) => {
          const updatedProfile = {
            ...profile,
            accessCount: (profile.accessCount || 0) + 1
          };

          const urlParams = new URLSearchParams(window.location.search);
          const refCoach = urlParams.get('ref_coach');

          if (updatedProfile.role === 'aluno' && refCoach) {
            try {
              const savedStudents = localStorage.getItem('treino_trainer_students');
              let list = savedStudents ? JSON.parse(savedStudents) : [];

              const existingIndex = list.findIndex((st: any) => 
                st.email.toLowerCase() === updatedProfile.email.toLowerCase() || 
                (updatedProfile.studentId && st.studentId === updatedProfile.studentId)
              );

              const studentPayload = {
                id: updatedProfile.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
                studentId: updatedProfile.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
                name: updatedProfile.name,
                email: updatedProfile.email,
                avatar: updatedProfile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(updatedProfile.name)}`,
                experienceLevel: updatedProfile.experienceLevel,
                objective: updatedProfile.objective,
                streak: updatedProfile.streak || 1,
                consistencyScore: 88,
                status: 'Excelente' as any,
                lastWorkoutDate: new Date().toISOString(),
                customDirective: 'Olá! Concluiu o seu registo de atleta vinculado. Seja bem-vindo ao acompanhamento do seu Personal Trainer.',
                directiveDate: new Date().toISOString(),
                workoutLogs: [],
                accessCount: updatedProfile.accessCount,
                isActive: true,
                pricingType: 'mensal',
                pricingValue: 50.00,
                age: updatedProfile.age,
                weight: updatedProfile.weight,
                height: updatedProfile.height,
                healthConditions: updatedProfile.healthConditions,
                lgpdConsent: updatedProfile.lgpdConsent,
                lgpdConsentDate: updatedProfile.lgpdConsentDate
              };

              if (existingIndex > -1) {
                list[existingIndex] = {
                  ...list[existingIndex],
                  ...studentPayload,
                  workoutLogs: list[existingIndex].workoutLogs || []
                };
              } else {
                list.unshift(studentPayload);
              }
              localStorage.setItem('treino_trainer_students', JSON.stringify(list));
            } catch (err) {
              console.error('Error linking invited student to coach', err);
            }
          }

          setCurrentUser(updatedProfile);
        }} 
        darkMode={darkMode} 
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-brand-bg text-stone-100' : 'bg-stone-50 text-stone-900'
    }`}>
      
      {/* Dynamic Simulated Floating Notification Banners */}
      <AnimatePresence>
        {showNotificationAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className={`p-4 rounded-xl shadow-2xl flex items-start gap-3.5 border ${
              darkMode 
                ? 'bg-brand-card text-white border-brand-neon/40 shadow-brand-neon/5' 
                : 'bg-white text-stone-900 border-emerald-500/20'
            }`}>
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-brand-neon/10 text-brand-neon' : 'bg-emerald-500/10 text-emerald-500'}`}>
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <span className={`text-[10px] uppercase font-black tracking-widest block ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`}>
                  Lembrete Diário
                </span>
                <p className="text-xs font-bold mt-0.5 leading-relaxed">{notificationMessage}</p>
              </div>
              <button 
                onClick={() => setShowNotificationAlert(false)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all font-bold uppercase tracking-tight ${
                  darkMode ? 'bg-brand-neon text-black hover:bg-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-900'
                }`}
              >
                Entendido
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic App Shell Header */}
      <header className={`px-4 sm:px-6 py-4 border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        darkMode ? 'bg-brand-bg/85 border-brand-border' : 'bg-white/85 border-stone-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center font-black italic shadow-lg ${
              darkMode ? 'bg-brand-neon text-black shadow-brand-neon/15 text-lg' : 'bg-emerald-500 text-white shadow-emerald-500/10'
            }`}>
              F
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase italic leading-none">
                Treino<span className={darkMode ? 'text-brand-neon' : 'text-emerald-500'}>Inteligente</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest">
                  Personal Trainer Premium
                </span>
                {isSyncingDb && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-500 animate-pulse uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Sincronizando...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Quick Info Badge */}
          <div className="flex items-center gap-3.5">
            {isOfflineMode && (
              <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase border rounded-lg flex items-center gap-1 ${
                darkMode ? 'bg-brand-neon/10 text-brand-neon border-brand-neon/25' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                <ShieldAlert className="w-3.5 h-3.5" /> offline
              </span>
            )}
            
            {/* Streak Tracker Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${
              darkMode 
                ? 'bg-brand-card border-brand-border-muted text-brand-neon shadow-sm' 
                : 'bg-amber-500/10 border-amber-500/10 text-amber-500'
            }`}>
              <Flame className="w-4 h-4 animate-pulse text-brand-neon" />
              <span>{currentUser.streak} DIA{currentUser.streak !== 1 ? 'S' : ''}</span>
            </div>

            {/* Profile Avatar Triggering Menu */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className={`w-9 h-9 rounded-full object-cover border-2 ${
                    darkMode ? 'border-brand-neon' : 'border-stone-200'
                  }`} 
                />
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold block">{currentUser.name}</span>
                  <span className={`text-[9px] uppercase tracking-wider font-extrabold ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`}>
                    {currentUser.isPremium ? '⚡ Premium' : 'Gratuito'}
                  </span>
                </div>
              </div>

              {/* Sair da Aplicação Button */}
              <button
                onClick={handleLogout}
                title="Sair da aplicação"
                className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  darkMode 
                    ? 'bg-[#181818] border-brand-border text-stone-400 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5' 
                    : 'bg-stone-100 border-stone-200 text-stone-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50'
                }`}
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Core View Area with Sidebar layout on Desktop and Bottom-nav on mobile */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Desktop Sidebar Navigation Menu */}
        <aside className="hidden md:block md:col-span-3 space-y-2 select-none">
          <div className={`p-5 rounded-2xl border mb-4 text-center relative overflow-hidden ${
            darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
          }`}>
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-brand-neon/5 rounded-full blur-2xl"></div>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className={`w-16 h-16 rounded-full mx-auto object-cover border-2 ${
                darkMode ? 'border-brand-border-muted' : 'border-stone-100'
              }`} 
            />
            <h3 className="font-extrabold text-sm mt-3 uppercase tracking-tight">{currentUser.name}</h3>
            <span className={`text-[10px] font-bold tracking-wider mt-1 block uppercase ${
              darkMode ? 'text-brand-neon' : 'text-emerald-500'
            }`}>
              {currentUser.experienceLevel} • {currentUser.objective}
            </span>

            {currentUser.isPremium && (
              <span className={`mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full border ${
                darkMode ? 'bg-brand-neon/5 text-brand-neon border-brand-neon/15 animate-pulse' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}>
                <Sparkles className="w-3 h-3" /> PRO ACTIVE
              </span>
            )}
          </div>

          <nav className="space-y-1">
            {currentUser?.role !== 'treinador' && (
              <>
                <button
                  onClick={() => setCurrentTab('workout')}
                  className={`w-full p-4 rounded-xl flex items-center gap-3.5 font-bold text-xs transition-all text-left border ${
                    currentTab === 'workout' 
                      ? darkMode 
                        ? 'bg-brand-neon text-black border-transparent shadow-lg shadow-brand-neon/10 uppercase tracking-tight'
                        : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 border-transparent' 
                      : darkMode
                        ? 'text-stone-400 bg-transparent border-transparent hover:bg-brand-card hover:text-white hover:border-brand-border'
                        : 'text-stone-500 bg-transparent border-transparent hover:bg-stone-100'
                  }`}
                >
                  <Dumbbell className="w-4 h-4" />
                  {t('nav.routine')}
                </button>
                <button
                  onClick={() => setCurrentTab('stats')}
                  className={`w-full p-4 rounded-xl flex items-center gap-3.5 font-bold text-xs transition-all text-left border ${
                    currentTab === 'stats' 
                      ? darkMode 
                        ? 'bg-brand-neon text-black border-transparent shadow-lg shadow-brand-neon/10 uppercase tracking-tight'
                        : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 border-transparent' 
                      : darkMode
                        ? 'text-stone-400 bg-transparent border-transparent hover:bg-brand-card hover:text-white hover:border-brand-border'
                        : 'text-stone-500 bg-transparent border-transparent hover:bg-stone-100'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  {t('nav.progress')}
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentTab('feed')}
              className={`w-full p-4 rounded-xl flex items-center gap-3.5 font-bold text-xs transition-all text-left border ${
                currentTab === 'feed' 
                  ? darkMode 
                    ? 'bg-brand-neon text-black border-transparent shadow-lg shadow-brand-neon/10 uppercase tracking-tight'
                    : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 border-transparent' 
                  : darkMode
                    ? 'text-stone-400 bg-transparent border-transparent hover:bg-brand-card hover:text-white hover:border-brand-border'
                    : 'text-stone-500 bg-transparent border-transparent hover:bg-stone-100'
              }`}
            >
              <Users className="w-4 h-4" />
              {t('nav.feed')}
            </button>
            {currentUser?.role !== 'treinador' && (
              <button
                onClick={() => setCurrentTab('wearable')}
                className={`w-full p-4 rounded-xl flex items-center gap-3.5 font-bold text-xs transition-all text-left border ${
                  currentTab === 'wearable' 
                    ? darkMode 
                      ? 'bg-brand-neon text-black border-transparent shadow-lg shadow-brand-neon/10 uppercase tracking-tight'
                      : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 border-transparent' 
                    : darkMode
                      ? 'text-stone-400 bg-transparent border-transparent hover:bg-brand-card hover:text-white hover:border-brand-border'
                      : 'text-stone-500 bg-transparent border-transparent hover:bg-stone-100'
                }`}
              >
                <Bluetooth className="w-4 h-4" />
                {t('nav.wearable')}
              </button>
            )}
            {currentUser?.role === 'treinador' && (
              <button
                onClick={() => setCurrentTab('trainer')}
                className={`w-full p-4 rounded-xl flex items-center justify-between gap-2.5 font-bold text-xs transition-all text-left border cursor-pointer ${
                  currentTab === 'trainer' 
                    ? darkMode 
                      ? 'bg-brand-neon text-black border-transparent shadow-lg shadow-brand-neon/10 uppercase tracking-tight'
                      : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 border-transparent' 
                    : darkMode
                      ? 'text-stone-400 bg-[#161616]/40 border-transparent hover:bg-brand-card hover:text-white hover:border-brand-border'
                      : 'text-stone-500 bg-stone-100/45 border-transparent hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Users className="w-4 h-4" />
                  {t('nav.coach')}
                </div>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                  currentTab === 'trainer'
                    ? 'bg-black/10 text-black'
                    : darkMode ? 'bg-brand-neon/15 text-brand-neon' : 'bg-emerald-500/15 text-emerald-600'
                }`}>
                  Coach
                </span>
              </button>
            )}
            <button
              onClick={() => setCurrentTab('config')}
              className={`w-full p-4 rounded-xl flex items-center gap-3.5 font-bold text-xs transition-all text-left border ${
                currentTab === 'config' 
                  ? darkMode 
                    ? 'bg-brand-neon text-black border-transparent shadow-lg shadow-brand-neon/10 uppercase tracking-tight'
                    : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 border-transparent' 
                  : darkMode
                    ? 'text-stone-400 bg-transparent border-transparent hover:bg-brand-card hover:text-white hover:border-brand-border'
                    : 'text-stone-500 bg-transparent border-transparent hover:bg-stone-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              {t('nav.settings')}
            </button>

            <button
              onClick={handleLogout}
              className={`w-full p-4 mt-6 rounded-xl flex items-center gap-3.5 font-bold text-xs transition-all text-left border cursor-pointer ${
                darkMode
                  ? 'text-rose-400 bg-transparent border-rose-500/10 hover:bg-rose-500/5 hover:border-rose-500/30'
                  : 'text-rose-600 bg-transparent border-rose-500/20 hover:bg-rose-50 hover:border-rose-500/40'
              }`}
            >
              <LogOut className="w-4 h-4" />
              {t('nav.logout')}
            </button>
          </nav>
        </aside>

        {/* Dynamic Route View Switching Pane */}
        <section className="col-span-1 md:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'workout' && (
                <WorkoutGenerator 
                  user={currentUser}
                  onChangeProfile={handleUpdateUserProfile}
                  onLogWorkout={handleLogWorkout}
                  savedOfflineWorkouts={savedOfflineWorkouts}
                  onSaveOffline={handleSaveOfflineWorkout}
                  isOfflineMode={isOfflineMode}
                  darkMode={darkMode}
                />
              )}

              {currentTab === 'stats' && (
                <ProgressTracker 
                  user={currentUser}
                  logs={trainingLogs}
                  wearable={wearableStats}
                  darkMode={darkMode}
                />
              )}

              {currentTab === 'feed' && (
                <CommunityFeed 
                  user={currentUser}
                  darkMode={darkMode}
                />
              )}

              {currentTab === 'wearable' && (
                <WearableSync 
                  stats={wearableStats}
                  onUpdateStats={(updated) => {
                    const nextStats = { ...wearableStats, ...updated };
                    setWearableStats(nextStats);
                    if (currentUser) {
                      saveWearableStats(currentUser.email, nextStats).catch(console.error);
                    }
                  }}
                  darkMode={darkMode}
                />
              )}

              {currentTab === 'trainer' && currentUser?.role === 'treinador' && (
                <TrainerPanel 
                  darkMode={darkMode}
                />
              )}

              {currentTab === 'config' && (
                <SettingsPanel 
                  user={currentUser}
                  onChangeProfile={handleUpdateUserProfile}
                  notifications={notificationConfig}
                  onUpdateNotifications={(settings) => {
                    const nextNotifs = { ...notificationConfig, ...settings };
                    setNotificationConfig(nextNotifs);
                    if (currentUser) {
                      saveNotificationSettings(currentUser.email, nextNotifs).catch(console.error);
                    }
                  }}
                  onLogout={handleLogout}
                  isOfflineMode={isOfflineMode}
                  onToggleOfflineMode={setIsOfflineMode}
                  darkMode={darkMode}
                  onToggleDarkMode={setDarkMode}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Sleek Touch Bottom Navigation Bar for Mobile and Tablets */}
      <footer className={`md:hidden fixed bottom-0 left-0 right-0 border-t pt-2 pb-[calc(env(safe-area-inset-bottom)+10px)] px-3 z-40 backdrop-blur-lg flex justify-around select-none transition-all ${
        darkMode ? 'bg-brand-bg/85 border-brand-border' : 'bg-white/85 border-stone-200'
      }`}>
        {currentUser?.role !== 'treinador' && (
          <>
            <button
              onClick={() => setCurrentTab('workout')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl gap-0.5 active:scale-90 transition-transform ${
                currentTab === 'workout' 
                  ? darkMode ? 'text-brand-neon font-extrabold' : 'text-emerald-500 font-extrabold'
                  : 'text-stone-400'
              }`}
            >
              <Dumbbell className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-tight">Treino</span>
            </button>
            <button
              onClick={() => setCurrentTab('stats')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl gap-0.5 active:scale-90 transition-transform ${
                currentTab === 'stats' 
                  ? darkMode ? 'text-brand-neon font-extrabold' : 'text-emerald-500 font-extrabold'
                  : 'text-stone-400'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-tight">Evolução</span>
            </button>
          </>
        )}
        <button
          onClick={() => setCurrentTab('feed')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl gap-0.5 active:scale-90 transition-transform ${
            currentTab === 'feed' 
              ? darkMode ? 'text-brand-neon font-extrabold' : 'text-emerald-500 font-extrabold'
              : 'text-stone-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tight">Feed</span>
        </button>
        {currentUser?.role !== 'treinador' && (
          <button
            onClick={() => setCurrentTab('wearable')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl gap-0.5 active:scale-90 transition-transform ${
              currentTab === 'wearable' 
                ? darkMode ? 'text-brand-neon font-extrabold' : 'text-emerald-500 font-extrabold'
                : 'text-stone-400'
            }`}
          >
            <Bluetooth className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-tight">Relógio</span>
          </button>
        )}
        {currentUser?.role === 'treinador' && (
          <button
            onClick={() => setCurrentTab('trainer')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl gap-0.5 active:scale-90 transition-transform ${
              currentTab === 'trainer' 
                ? darkMode ? 'text-brand-neon font-extrabold' : 'text-emerald-500 font-extrabold'
                : 'text-stone-400'
            }`}
          >
            <Users className="w-5 h-5 text-indigo-400" />
            <span className="text-[9px] font-bold uppercase tracking-tight">Alunos</span>
          </button>
        )}
        <button
          onClick={() => setCurrentTab('config')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl gap-0.5 active:scale-90 transition-transform ${
            currentTab === 'config' 
              ? darkMode ? 'text-brand-neon font-extrabold' : 'text-emerald-500 font-extrabold'
              : 'text-stone-400'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-tight">Ajustes</span>
        </button>
      </footer>

      {/* Custom Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop wrapper */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Card wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className={`relative w-full max-w-sm p-6 rounded-2xl border shadow-2xl z-10 text-center ${
                darkMode 
                  ? 'bg-brand-card border-brand-border-muted text-white' 
                  : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50'
              }`}>
                <LogOut className={`w-6 h-6 ${darkMode ? 'text-rose-400' : 'text-rose-500'}`} />
              </div>

              <h3 className="text-base font-extrabold uppercase tracking-tight mb-2">
                Sair da Aplicação?
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed mb-6">
                Tem certeza que deseja sair da sua conta? Suas rotinas e histórico locais serão mantidos no telemóvel.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer active:scale-95 ${
                    darkMode
                      ? 'bg-transparent border-brand-border text-stone-400 hover:text-white hover:bg-[#181818]'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 text-white ${
                    darkMode
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10'
                      : 'bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/10'
                  }`}
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Bell, Moon, Sun, Smartphone, Dumbbell, UserCheck, 
  Sparkles, ShieldCheck, Mail, LogOut, Download, Sliders, Volume2,
  Camera, User, Scale, FileText, CheckCircle2, Trash2, Fingerprint, Lock,
  Globe
} from 'lucide-react';
import { UserProfile, NotificationSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SettingsPanelProps {
  user: UserProfile;
  onChangeProfile: (profile: Partial<UserProfile>) => void;
  notifications: NotificationSettings;
  onUpdateNotifications: (settings: Partial<NotificationSettings>) => void;
  onLogout: () => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: (enabled: boolean) => void;
  darkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
}

export default function SettingsPanel({
  user,
  onChangeProfile,
  notifications,
  onUpdateNotifications,
  onLogout,
  isOfflineMode,
  onToggleOfflineMode,
  darkMode,
  onToggleDarkMode
}: SettingsPanelProps) {
  const { language, setLanguage, t } = useLanguage();
  const [notiMessage, setNotiMessage] = useState(notifications.message);
  const [notiTime, setNotiTime] = useState(notifications.time);
  const [selectedDays, setSelectedDays] = useState<number[]>(notifications.notifyOnDays);

  // States for user profile form
  const [profileName, setProfileName] = useState(user.name);
  const [profileAge, setProfileAge] = useState(user.age?.toString() || '');
  const [profileWeight, setProfileWeight] = useState(user.weight?.toString() || '');
  const [profileHeight, setProfileHeight] = useState(user.height?.toString() || '');
  const [profileHealth, setProfileHealth] = useState(user.healthConditions || 'Sem restrições');
  const [lgpdConsent, setLgpdConsent] = useState(user.lgpdConsent || false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleTogglePremium = () => {
    const nextPrem = !user.isPremium;
    onChangeProfile({ isPremium: nextPrem });
    alert(nextPrem 
      ? 'Você agora é um Membro Premium! Baixe treinos offline e exporte relatórios PDF à vontade.' 
      : 'Plano Premium desativado. Alguns recursos agora estão restritos.'
    );
  };

  const handleUpdateLevel = (lvl: 'Iniciante' | 'Intermediário' | 'Avançado') => {
    onChangeProfile({ experienceLevel: lvl });
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNotifications({
      message: notiMessage,
      time: notiTime,
      notifyOnDays: selectedDays,
    });
    
    // Simulate push alert request
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    alert(`Lembrete diário configurado para as ${notiTime}!`);
  };

  // Profile image handler - Base64 compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem selecionada é muito grande! Escolha um arquivo menor que 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChangeProfile({ avatar: reader.result as string });
        alert("Sua foto de perfil foi atualizada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile biological and physical information
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeProfile({
      name: profileName,
      age: profileAge ? parseInt(profileAge) : undefined,
      weight: profileWeight ? parseFloat(profileWeight) : undefined,
      height: profileHeight ? parseFloat(profileHeight) : undefined,
      healthConditions: profileHealth,
      lgpdConsent: lgpdConsent,
      lgpdConsentDate: lgpdConsent ? (user.lgpdConsentDate || new Date().toISOString()) : undefined
    });
    alert("Perfil e preferências físicas foram salvos com sucesso!");
  };

  // LGPD - Export structured data (Portability)
  const handleExportData = () => {
    const filteredUser = { ...user };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredUser, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `meus_dados_lgpd_${user.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // LGPD - Clear structured data (Right to be forgotten)
  const handleClearData = () => {
    if (confirm("LGPD - Direito ao Esquecimento: Tem certeza de que prefere apagar definitivamente todas as suas métricas biológicas e histórico de saúde salvos de nossos registros? Esta ação não pode ser revertida.")) {
      onChangeProfile({
        age: undefined,
        weight: undefined,
        height: undefined,
        healthConditions: 'Sem restrições',
        lgpdConsent: false,
        lgpdConsentDate: undefined
      });
      setProfileAge('');
      setProfileWeight('');
      setProfileHeight('');
      setProfileHealth('Sem restrições');
      setLgpdConsent(false);
      alert("As suas informações biológicas e clínicas foram totalmente eliminadas.");
    }
  };

  const toggleDaySelection = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="space-y-6" id="settings-container">
      {/* MEU PERFIL CARD (ALUNO ou TREINADOR) */}
      <div className={`p-6 rounded-2xl border text-left ${
        darkMode ? 'bg-brand-card border-brand-border shadow-2xl' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2.5 mb-5 border-b pb-3 border-stone-200/5 dark:border-brand-border/40">
          <UserCheck className={`w-5 h-5 ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`} />
          <div>
            <h3 className="font-extrabold text-base uppercase tracking-tight">{t('settings.profileTitle')}</h3>
            <p className={`text-[10px] sm:text-xs mt-0.5 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              {t('settings.profileDesc')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Avatar Section & Photo upload */}
          <div className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border ${
            darkMode ? 'bg-[#181818]/40 border-brand-border/30' : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="relative group overflow-hidden rounded-full w-20 h-20 border-2 border-brand-neon/40 shadow-inner shrink-0 bg-stone-900/10">
              <img 
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"} 
                alt="Foto de Perfil" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200">
                <Camera className="w-5 h-5 text-brand-neon" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                />
              </label>
            </div>
            
            <div className="text-center sm:text-left space-y-1.5 flex-1 w-full">
              <div className="text-xs font-black uppercase tracking-wider">{t('settings.changePhoto')}</div>
              <p className={`text-[10px] leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                {t('settings.changePhotoDesc')}
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('settings.photoPlaceholder')}
                  value={user.avatar}
                  onChange={(e) => onChangeProfile({ avatar: e.target.value })}
                  className={`w-full px-3 py-1.5 rounded-lg border text-[10.5px] focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                    darkMode ? 'bg-[#121212] border-brand-border/50 text-white' : 'bg-white border-stone-200 text-stone-900'
                  }`}
                />
                <label className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all tracking-wider cursor-pointer whitespace-nowrap flex items-center justify-center ${
                  darkMode ? 'bg-zinc-800 border-zinc-700 text-stone-300 hover:bg-zinc-750' : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-150'
                }`}>
                  {t('settings.btnFile')}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">{t('auth.name')}</span>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className={`w-full p-3 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                  darkMode ? 'bg-[#181818] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                }`}
                required
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">{t('settings.profileTitle')} (E-mail)</span>
              <input
                type="email"
                value={user.email}
                disabled
                className={`w-full p-3 rounded-lg text-xs border opacity-55 cursor-not-allowed ${
                  darkMode ? 'bg-[#181818] border-brand-border text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-500'
                }`}
              />
            </div>
          </div>

          {/* Se for aluno, mostra idade, peso, altura, problemas de saude */}
          {user.role === 'aluno' && (
            <div className="space-y-4 border-t pt-4 border-stone-200/10 dark:border-brand-border/40">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1">{t('auth.age')}</span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={profileAge}
                    onChange={(e) => setProfileAge(e.target.value)}
                    placeholder="Ex: 27"
                    className={`w-full p-2.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                      darkMode ? 'bg-[#181818] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1">{t('auth.weight')}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={profileWeight}
                    onChange={(e) => setProfileWeight(e.target.value)}
                    placeholder="Ex: 72.5"
                    className={`w-full p-2.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                      darkMode ? 'bg-[#181818] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1">{t('auth.height')}</span>
                  <input
                    type="number"
                    value={profileHeight}
                    onChange={(e) => setProfileHeight(e.target.value)}
                    placeholder="Ex: 172"
                    className={`w-full p-2.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                      darkMode ? 'bg-[#181818] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">{t('auth.health')}</span>
                <textarea
                  rows={2}
                  value={profileHealth}
                  onChange={(e) => setProfileHealth(e.target.value)}
                  placeholder={t('auth.healthPlaceholder')}
                  className={`w-full p-3 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                    darkMode ? 'bg-[#181818] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              {/* GDPR/LGPD compliance options */}
              <div className={`p-4 rounded-xl border space-y-3 text-left ${
                darkMode ? 'bg-zinc-950/50 border-brand-border/40' : 'bg-stone-50/70 border-stone-200'
              }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="lgpdConsentSettings"
                    checked={lgpdConsent}
                    onChange={(e) => setLgpdConsent(e.target.checked)}
                    className="mt-0.5 shrink-0 w-4 h-4 rounded cursor-pointer accent-emerald-500"
                  />
                  <div>
                    <label htmlFor="lgpdConsentSettings" className="text-xs font-black leading-tight uppercase tracking-wider block cursor-pointer">
                      {t('auth.consentLabel')}
                    </label>
                    <p className={`text-[10px] leading-relaxed mt-0.5 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                      {t('auth.consentBrief')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-stone-200/10 dark:border-brand-border/20">
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="flex items-center gap-1 text-[9.5px] font-black uppercase text-[#88e010] hover:text-white tracking-wide hover:underline cursor-pointer"
                  >
                    <Fingerprint className="w-3.5 h-3.5" /> {t('settings.rightsBtn')}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="flex items-center gap-1 text-[9.5px] font-black uppercase text-indigo-400 hover:text-indigo-300 tracking-wide hover:underline cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> {t('settings.exportBtn')}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearData}
                      className="flex items-center gap-1 text-[9.5px] font-black uppercase text-rose-500 hover:text-rose-400 tracking-wide hover:underline cursor-pointer ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> {t('settings.clearBtn')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save profile modifications action button */}
          <button
            type="submit"
            className={`w-full py-3.5 font-bold uppercase tracking-widest rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              darkMode 
                ? 'bg-brand-neon text-black hover:bg-white shadow-lg shadow-brand-neon/15 font-black' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Salvar Alterações do Perfil
          </button>
        </form>
      </div>

      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-6 rounded-2xl border text-left flex flex-col justify-between ${
            darkMode ? 'bg-[#121212] border-brand-border text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 dark:border-brand-border/40 border-stone-100">
                <Fingerprint className="text-[#88e010] w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">Manual de Direitos & Proteção de Dados</h3>
                  <p className="text-[10px] text-stone-400 uppercase">LGPD (Lei nº 13.709/2018) & RGPD Aplicado</p>
                </div>
              </div>
              
              <div className="text-xs space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar text-stone-300">
                <p>
                  <strong className="text-white">1. Titular dos Dados:</strong> Quem usa o aplicativo tem o controle exclusivo sobre seus indicadores. Nós não vendemos, comercializamos ou espelhamos seus dados biológicos para terceiros.
                </p>
                <p>
                  <strong className="text-white">2. Dados de Categoria Sensível:</strong> Conforme o Artigo 5º, II da LGPD, informações sobre condições clínicas, restrições articulares, peso e estresse corporal constituem dados de saúde (sensíveis) e requerem seu consentimento inequívoco e específico para processá-los na montagem de fichas de treino.
                </p>
                <p>
                  <strong className="text-white">3. Direito de Eliminação (Portabilidade & Esquecimento):</strong> O usuário pode, a qualquer segundo, exportar seu arquivo estruturado (JSON) ou solicitar a purga absoluta de todos os perfis, logs e históricos armazenados.
                </p>
                <p>
                  <strong className="text-white">4. Confidencialidade do Treinador:</strong> Apenas o profissional de Educação Física explicitamente associado ao seu ID de aluno terá acesso visual exclusivo a estas métricas para fins estritos de orientação pedagógica desportiva.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="mt-6 w-full py-2.5 bg-zinc-800 text-stone-200 hover:bg-zinc-700 text-xs font-bold uppercase rounded-lg border border-brand-border/50 text-center cursor-pointer transition-all"
            >
              Fechar e Voltar
            </button>
          </div>
        </div>
      )}

      {/* Premium Upgrade banner */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden transition-all ${
        user.isPremium 
          ? 'bg-gradient-to-r from-brand-neon/10 to-[#121a05] border-brand-neon/30 text-stone-100' 
          : 'bg-brand-card border-brand-border text-stone-100'
      }`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-brand-neon animate-spin" style={{ animationDuration: '40s' }} />
        </div>

        <div className="relative">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[9px] font-extrabold uppercase mb-3 ${
            user.isPremium ? 'bg-brand-neon/10 text-brand-neon border-brand-neon/20' : 'bg-stone-500/10 text-stone-400 border-stone-500/20'
          }`}>
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            {user.isPremium ? 'Membro Premium' : 'Plano Gratuito Lite'}
          </div>

          <h3 className={`text-xl font-black uppercase tracking-tight ${user.isPremium ? 'text-brand-neon' : 'text-white'}`}>
            {user.isPremium ? 'Treine Sem Limites Offline!' : 'Experimente o Treino Inteligente Pro'}
          </h3>
          <p className="text-xs text-stone-300 mt-1 leading-relaxed max-w-sm mb-6">
            Acesso ilimitado ao gerador de treinos musculares, download ilimitado para treinos sem conexão, exportação de PDF de análise e comunidade liberada.
          </p>

          <button
            onClick={handleTogglePremium}
            className={`py-3 px-6 font-bold uppercase tracking-widest rounded-lg text-xs transition-all shadow-lg ${
              user.isPremium
                ? 'bg-[#181818] hover:bg-zinc-800 text-stone-300 shadow-zinc-950/20 border border-brand-border'
                : 'bg-brand-neon text-black font-black hover:bg-white shadow-brand-neon/15'
            }`}
          >
            {user.isPremium ? 'Mudar para Plano Grátis' : 'Ativar Modo Premium de Graça'}
          </button>
        </div>
      </div>

      {/* Accessibility & Device Options */}
      <div className={`p-6 rounded-2xl border ${
        darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
      }`}>
        <h3 className="font-extrabold text-base uppercase tracking-tight mb-5">{t('settings.displayTitle')}</h3>
        <div className="space-y-4">
          {/* Language Selector */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-sm font-bold block uppercase tracking-tight">{t('settings.languageSelect')}</span>
              <span className="text-xs text-stone-400 block mt-0.5">Português / English</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLanguage('pt')}
                className={`py-1.5 px-3 rounded-lg border font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  language === 'pt'
                    ? darkMode
                      ? 'bg-brand-neon text-black border-transparent shadow-md'
                      : 'bg-emerald-500 text-white border-transparent shadow-md'
                    : darkMode
                      ? 'bg-[#181818] border-brand-border text-stone-400 hover:text-white'
                      : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>🇧🇷 PT</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-1.5 px-3 rounded-lg border font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  language === 'en'
                    ? darkMode
                      ? 'bg-brand-neon text-black border-transparent shadow-md'
                      : 'bg-emerald-500 text-white border-transparent shadow-md'
                    : darkMode
                      ? 'bg-[#181818] border-brand-border text-stone-400 hover:text-white'
                      : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>🇺🇸 EN</span>
              </button>
            </div>
          </div>

          <div className={`border-t pb-2 mb-2 ${darkMode ? 'border-brand-border-muted' : 'border-stone-100'}`} />

          {/* Dark Mode switcher */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-sm font-bold block uppercase tracking-tight">{t('settings.darkMode')}</span>
              <span className="text-xs text-stone-400 block mt-0.5">{t('settings.darkModeDesc')}</span>
            </div>
            <button
              onClick={() => onToggleDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                darkMode
                  ? 'bg-[#181818] border-brand-border text-brand-neon hover:bg-brand-border'
                  : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: '60s' }} /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className={`border-t pb-2 mb-2 ${darkMode ? 'border-brand-border-muted' : 'border-stone-100'}`} />

          {/* Offline Toggle Simulator */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-sm font-bold block uppercase tracking-tight">{t('settings.forcedOffline')}</span>
              <span className="text-xs text-stone-400 block mt-0.5">{t('settings.forcedOfflineDesc')}</span>
            </div>
            <button
              onClick={() => onToggleOfflineMode(!isOfflineMode)}
              className={`py-2 px-4 rounded-lg border font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                isOfflineMode
                  ? 'bg-amber-500 border-transparent text-white'
                  : darkMode
                    ? 'bg-[#181818] border-brand-border text-stone-400 hover:text-white'
                    : 'bg-stone-100 border-stone-200 text-stone-700'
              }`}
            >
              {isOfflineMode ? (language === 'pt' ? 'Ativado (Offline)' : 'Enabled (Offline)') : (language === 'pt' ? 'Desativado' : 'Disabled')}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Reminders Scheduler Notifications */}
      <div className={`p-6 rounded-2xl border ${
        darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
      }`}>
        <div className="flex items-center gap-2.5 mb-2">
          <Bell className={`w-5 h-5 ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`} />
          <h3 className="font-extrabold text-base uppercase tracking-tight">Lembretes de Treino Diários</h3>
        </div>
        <p className="text-xs text-stone-400 mb-5">Configure notificações de lembrete customizadas para manter seu foco nos treinos.</p>

        <form onSubmit={handleSaveNotifications} className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">Hora do Lembrete</span>
            <input
              type="time"
              value={notiTime}
              onChange={(e) => setNotiTime(e.target.value)}
              className={`px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                darkMode ? 'bg-[#181818] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
              }`}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">Dias de Notificação</span>
            <div className="flex gap-1.5 flex-wrap">
              {weekdays.map((day, idx) => {
                const isSelected = selectedDays.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDaySelection(idx)}
                    className={`w-10 h-10 text-xs font-black rounded-lg border transition-all flex items-center justify-center ${
                      isSelected
                        ? darkMode ? 'bg-brand-neon text-black border-transparent font-black shadow' : 'bg-emerald-500 text-white border-transparent'
                        : darkMode
                          ? 'bg-[#181818] border-brand-border text-stone-400 hover:bg-brand-border hover:text-white'
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">Frase Motivadora Personalizada</span>
            <input
              type="text"
              value={notiMessage}
              onChange={(e) => setNotiMessage(e.target.value)}
              placeholder="Ex: Hora de amassar os ferros!"
              className={`w-full p-3.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-brand-neon/30 ${
                darkMode ? 'bg-[#181818] border-brand-border text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
              }`}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 font-bold uppercase tracking-widest rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 ${
              darkMode 
                ? 'bg-brand-neon text-black hover:bg-white shadow-lg shadow-brand-neon/15 font-black' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Salvar Notificações
          </button>
        </form>
      </div>

      {/* Experience level & Objective customizer */}
      <div className={`p-6 rounded-2xl border ${
        darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
      }`}>
        <h3 className="font-extrabold text-base uppercase tracking-tight mb-1">Mudar Nível de Treino</h3>
        <p className="text-xs text-stone-400 mb-4">A IA e o gerador adaptam o volume dependendo do seu condicionamento.</p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {(['Iniciante', 'Intermediário', 'Avançado'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleUpdateLevel(lvl)}
              className={`py-2 px-1 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                user.experienceLevel === lvl
                  ? darkMode ? 'bg-brand-neon text-black border-transparent font-black shadow' : 'bg-emerald-500 text-white border-transparent shadow'
                  : darkMode
                    ? 'bg-[#181818] border-brand-border text-stone-400 hover:text-white'
                    : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className={`border-t mb-5 ${darkMode ? 'border-brand-border-muted' : 'border-stone-100'}`} />

        <h3 className="font-extrabold text-base uppercase tracking-tight mb-1">Alterar Objetivo Fitness</h3>
        <p className="text-xs text-stone-400 mb-4">Altere seu foco para focar os novos treinos no seu objetivo desejado.</p>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'Hipertrofia', label: 'Hipertrofia', desc: 'Ganho de massa' },
            { id: 'Emagrecimento', label: 'Emagrecimento', desc: 'Definição & Queima' },
            { id: 'Força', label: 'Força', desc: 'Aumento de carga' },
            { id: 'Resistência', label: 'Resistência', desc: 'Cardio & Resistência' }
          ].map((obj) => {
            const isSelected = user.objective === obj.id || 
              (obj.id === 'Hipertrofia' && user.objective?.toLowerCase().includes('hipertrofia')) ||
              (obj.id === 'Emagrecimento' && user.objective?.toLowerCase().includes('emagrecimento')) ||
              (obj.id === 'Força' && user.objective?.toLowerCase().includes('força')) ||
              (obj.id === 'Resistência' && user.objective?.toLowerCase().includes('resistência'));

            return (
              <button
                key={obj.id}
                onClick={() => onChangeProfile({ objective: obj.id })}
                className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? darkMode 
                      ? 'bg-brand-neon/15 border-brand-neon text-brand-neon font-black' 
                      : 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-bold'
                    : darkMode
                      ? 'bg-[#181818] border-brand-border text-stone-400 hover:text-white'
                      : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-150'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider">{obj.label}</div>
                <div className="text-[10px] text-stone-400 font-medium mt-0.5 leading-tight">{obj.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exit account row */}
      <button
        onClick={onLogout}
        className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs"
      >
        <LogOut className="w-4 h-4" />
        Sair / Trocar de Conta
      </button>
    </div>
  );
}

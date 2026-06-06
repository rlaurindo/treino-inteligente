import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import { 
  Award, FileSpreadsheet, Download, Flame, 
  TrendingUp, Calendar, Clock, Heart, Sparkles, Footprints, ShieldAlert
} from 'lucide-react';
import { TrainingLog, UserProfile, WearableStats } from '../types';

interface ProgressTrackerProps {
  user: UserProfile;
  logs: TrainingLog[];
  wearable: WearableStats;
  darkMode: boolean;
}

export default function ProgressTracker({ user, logs, wearable, darkMode }: ProgressTrackerProps) {
  const [activeTab, setActiveTab] = useState<'duration' | 'calories' | 'hr'>('calories');
  const containerRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState(400);

  // ResizeObserver for responsive SVG Chart
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setParentWidth(Math.max(300, entry.contentRect.width));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate mock logs if user has no workouts logged yet so chart has visual data
  const chartData = logs.length > 0 ? logs : [
    { id: 'm1', date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), durationMinutes: 45, caloriesBurned: 320, avgHeartRate: 122, routineTitle: 'Treino A' },
    { id: 'm2', date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), durationMinutes: 50, caloriesBurned: 410, avgHeartRate: 135, routineTitle: 'Treino B' },
    { id: 'm3', date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), durationMinutes: 40, caloriesBurned: 350, avgHeartRate: 128, routineTitle: 'Treino C' },
    { id: 'm4', date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), durationMinutes: 55, caloriesBurned: 490, avgHeartRate: 141, routineTitle: 'Treino D' },
    { id: 'm5', date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), durationMinutes: 60, caloriesBurned: 520, avgHeartRate: 139, routineTitle: 'Treino E' },
    { id: 'm6', date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), durationMinutes: 30, caloriesBurned: 260, avgHeartRate: 119, routineTitle: 'Treino F' },
    { id: 'm7', date: new Date().toISOString(), durationMinutes: 48, caloriesBurned: 380, avgHeartRate: 130, routineTitle: 'Treino G' },
  ];

  // Helper properties for custom SVG plots
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  // Chart values accessor based on selected metric
  const getVal = (item: any) => {
    if (activeTab === 'duration') return item.durationMinutes;
    if (activeTab === 'calories') return item.caloriesBurned;
    return item.avgHeartRate;
  };

  const maxVal = Math.max(...chartData.map(getVal), 1);
  const minVal = Math.min(...chartData.map(getVal), 0);
  const valRange = maxVal - minVal;

  // Generate SVG path points
  const points = chartData.map((item, idx) => {
    const x = paddingX + (idx / (chartData.length - 1)) * (parentWidth - paddingX * 2);
    const normalizedY = valRange === 0 ? 0.5 : (getVal(item) - minVal) / valRange;
    const y = height - paddingY - normalizedY * (height - paddingY * 2);
    return { x, y, val: getVal(item), title: item.routineTitle };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const closedPathD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  // Handle PDF export using premium-restricted jsPDF action
  const handleExportPDF = () => {
    if (!user.isPremium) {
      alert("A exportação de PDF é um recurso premium disponível apenas na versão offline/premium!");
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Theme colors for document
      const darkGreen = [16, 185, 129]; // Emerald 500

      // Add branding header
      doc.setFillColor(24, 24, 27);
      doc.rect(0, 0, 210, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text("TREINO INTELIGENTE", 15, 24);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(160, 160, 160);
      doc.text("RELATORIO SEMANAL DE DESEMPENHO E SAUDE", 15, 31);
      
      // Date stamps
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 165, 24);

      // User Information Box
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(12, 45, 186, 32, 3, 3, 'FD');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("PERFIL DO ATLETA", 18, 52);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Nome: ${user.name}`, 18, 60);
      doc.text(`Email: ${user.email}`, 18, 66);
      doc.text(`Nivel de Experiencia: ${user.experienceLevel}`, 18, 72);

      doc.text(`Objetivo Fitness: ${user.objective}`, 115, 60);
      doc.text(`Plano: Premium Offline Mode (Ativo)`, 115, 66);
      doc.text(`Streak Semanal: ${user.streak} dias seguidos`, 115, 72);

      // General Aggregations
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("MÉTRICAS DA SEMANA", 15, 90);

      const totalWorkouts = logs.length;
      const totalMinutes = logs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const totalCalories = logs.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
      const avgPulse = logs.length > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.avgHeartRate, 0) / logs.length) : 132;

      // Table summary
      doc.setFillColor(16, 185, 129); // emerald
      doc.setTextColor(255, 255, 255);
      doc.rect(12, 96, 186, 8, 'F');
      
      doc.setFontSize(8);
      doc.text("METRICA", 16, 101);
      doc.text("VALOR TOTAL / MEDIO", 95, 101);
      doc.text("STATUS", 160, 101);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      
      // Row 1
      doc.text("Exercicios Concluidos", 16, 110);
      doc.text(`${totalWorkouts} sessoes`, 95, 110);
      doc.setTextColor(16, 185, 129);
      doc.text("No Alvo", 160, 110);
      doc.setTextColor(30, 41, 59);
      doc.line(12, 112, 198, 112);

      // Row 2
      doc.text("Minutos de Atividade", 16, 118);
      doc.text(`${totalMinutes} min totais`, 95, 118);
      doc.setTextColor(16, 185, 129);
      doc.text("Superavit", 160, 118);
      doc.setTextColor(30, 41, 59);
      doc.line(12, 120, 198, 120);

      // Row 3
      doc.text("Metabolismo Estimado", 16, 126);
      doc.text(`${totalCalories} kcal queimadas`, 95, 126);
      doc.setTextColor(16, 185, 129);
      doc.text("Excelente", 160, 126);
      doc.setTextColor(30, 41, 59);
      doc.line(12, 128, 198, 128);

      // Row 4
      doc.text("Media de Frequencia Cardiaca", 16, 134);
      doc.text(`${avgPulse} bpm medio`, 95, 134);
      doc.setTextColor(30, 41, 59);
      doc.text("Normal", 160, 134);
      doc.line(12, 136, 198, 136);

      // Wearable sync portion
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("DADOS DE VESTIVEIS INTEGRADOS", 15, 148);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Dispositivo Pareado: ${wearable.connected ? wearable.deviceType : 'Dispositivo Virtual Conectado'}`, 18, 155);
      doc.text(`Passos Sincronizados Hoje: ${wearable.steps.toLocaleString('pt-BR')} passos`, 18, 161);
      doc.text(`Calorias Sincronizadas (Real-time): ${wearable.activeCalories} kcal`, 18, 167);

      // Custom message
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("Relatorio gerado em tempo real pelo sistema de Treino Inteligente.", 15, 275);
      doc.text("Mantenha o foco em seus treinos de musculacao semanais e beba bastante agua!", 15, 280);

      doc.save(`relatorio-treino-inteligente-${Date.now()}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Erro ao compilar o PDF. Verifique se o navegador ou plataforma possui restricoes de download.");
    }
  };

  return (
    <div className="space-y-6" id="progress-container">
      {/* Mini Aggregations Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border text-center relative overflow-hidden ${
          darkMode ? 'bg-brand-card border-brand-border text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <Calendar className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
          <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Frequência</span>
          <span className={`text-lg font-black mt-0.5 block ${darkMode && 'text-brand-neon'}`}>{logs.length} treinos</span>
        </div>
        <div className={`p-4 rounded-xl border text-center relative overflow-hidden ${
          darkMode ? 'bg-brand-card border-brand-border text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <Clock className="w-5 h-5 text-sky-500 mx-auto mb-1.5" />
          <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Tempo Ativo</span>
          <span className={`text-lg font-black mt-0.5 block ${darkMode && 'text-brand-neon'}`}>
            {logs.reduce((acc, curr) => acc + curr.durationMinutes, 0)} min
          </span>
        </div>
        <div className={`p-4 rounded-xl border text-center relative overflow-hidden ${
          darkMode ? 'bg-brand-card border-brand-border text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
          <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Energia Queimada</span>
          <span className={`text-lg font-black mt-0.5 block ${darkMode && 'text-brand-neon'}`}>
            {logs.reduce((acc, curr) => acc + curr.caloriesBurned, 0)} kcal
          </span>
        </div>
        <div className={`p-4 rounded-xl border text-center relative overflow-hidden ${
          darkMode ? 'bg-brand-card border-brand-border text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
          <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Med. Cardíaca</span>
          <span className={`text-lg font-black mt-0.5 block ${darkMode && 'text-brand-neon'}`}>
            {logs.length > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.avgHeartRate, 0) / logs.length) : 132} bpm
          </span>
        </div>
      </div>

      {/* Main SVG Plot Card */}
      <div className={`p-6 rounded-2xl border ${
        darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`} />
              <h3 className="font-extrabold text-base uppercase tracking-tight">Gráfico de Evolução</h3>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">Metas comparativas dos últimos 7 treinos</p>
          </div>

          <div className={`flex p-0.5 rounded-lg border ${
            darkMode ? 'bg-[#181818] border-brand-border' : 'bg-stone-100 border-stone-200'
          }`}>
            <button
              onClick={() => setActiveTab('calories')}
              className={`py-1.5 px-3 text-[10px] font-extrabold uppercase tracking-widest rounded-md transition-all ${
                activeTab === 'calories'
                  ? darkMode ? 'bg-brand-neon text-black font-black' : 'bg-emerald-500 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Calorias
            </button>
            <button
              onClick={() => setActiveTab('duration')}
              className={`py-1.5 px-3 text-[10px] font-extrabold uppercase tracking-widest rounded-md transition-all ${
                activeTab === 'duration'
                  ? darkMode ? 'bg-brand-neon text-black font-black' : 'bg-emerald-500 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Tempo
            </button>
            <button
              onClick={() => setActiveTab('hr')}
              className={`py-1.5 px-3 text-[10px] font-extrabold uppercase tracking-widest rounded-md transition-all ${
                activeTab === 'hr'
                  ? darkMode ? 'bg-brand-neon text-black font-black' : 'bg-emerald-500 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              H.Rate
            </button>
          </div>
        </div>

        {/* Dynamic Responsive SVG wrapper */}
        <div ref={containerRef} className="w-full relative select-none">
          <svg width={parentWidth} height={height} className="overflow-visible">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={darkMode ? '#cbff01' : '#10b981'} stopOpacity="0.25" />
                <stop offset="100%" stopColor={darkMode ? '#cbff01' : '#10b981'} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const gridY = paddingY + ratio * (height - paddingY * 2);
              const gridVal = maxVal - ratio * valRange;
              return (
                <g key={index} className="opacity-20">
                  <line 
                    x1={paddingX} 
                    y1={gridY} 
                    x2={parentWidth - paddingX} 
                    y2={gridY} 
                    stroke={darkMode ? '#444' : 'currentColor'} 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={paddingX - 10} 
                    y={gridY + 4} 
                    textAnchor="end" 
                    className="font-mono text-[9px] font-bold fill-stone-400"
                  >
                    {Math.round(gridVal)}
                  </text>
                </g>
              );
            })}

            {/* Plot area background block */}
            <path d={closedPathD} fill="url(#chartGrad)" />

            {/* Solid stroke line */}
            <path 
              d={pathD} 
              fill="none" 
              stroke={darkMode ? '#cbff01' : '#10b981'} 
              strokeWidth="2.5" 
              className="transition-all duration-500"
            />

            {/* Interactive Points */}
            {points.map((p, pIdx) => (
              <g key={pIdx} className="group cursor-pointer">
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="5" 
                  className={`stroke-3 transition-transform duration-150 hover:scale-150 ${
                    darkMode ? 'fill-brand-neon stroke-black' : 'fill-emerald-500 stroke-white'
                  }`}
                />
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="9" 
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    darkMode ? 'fill-brand-neon/20' : 'fill-emerald-500/20'
                  }`}
                />
                
                {/* Micro tooltip inside SVG */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <rect 
                    x={p.x - 45} 
                    y={p.y - 36} 
                    width="90" 
                    height="28" 
                    rx="6" 
                    className={darkMode ? 'fill-[#121212]/95 stroke-brand-neon/30 stroke-[1]' : 'fill-zinc-950/90'}
                  />
                  <text 
                    x={p.x} 
                    y={p.y - 25} 
                    textAnchor="middle" 
                    className="fill-white text-[10px] font-bold"
                  >
                    {p.val} {activeTab === 'calories' ? 'kcal' : activeTab === 'duration' ? 'min' : 'bpm'}
                  </text>
                  <text 
                    x={p.x} 
                    y={p.y - 14} 
                    textAnchor="middle" 
                    className={`text-[8px] uppercase tracking-wide font-black ${
                      darkMode ? 'fill-brand-neon' : 'fill-emerald-400'
                    }`}
                  >
                    {p.title.substring(0, 16)}
                  </text>
                </g>
              </g>
            ))}

            {/* Horizontal Timeline labels */}
            {chartData.map((item, idx) => {
              const x = paddingX + (idx / (chartData.length - 1)) * (parentWidth - paddingX * 2);
              const isToday = new Date(item.date).toDateString() === new Date().toDateString();
              return (
                <text 
                  key={idx}
                  x={x} 
                  y={height - 8} 
                  textAnchor="middle" 
                  className={`font-mono text-[9px] font-semibold ${
                    isToday 
                      ? darkMode ? 'fill-brand-neon font-black' : 'fill-emerald-500 font-bold' 
                      : 'fill-stone-400'
                  }`}
                >
                  {isToday ? 'Hoje' : `S${idx + 1}`}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Export to PDF Block */}
      <div className={`p-6 rounded-2xl border text-center ${
        darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
      }`}>
        <div className="max-w-md mx-auto space-y-3">
          <div className={`inline-flex p-3 rounded-xl ${
            darkMode ? 'bg-brand-neon/10 text-brand-neon' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-base uppercase tracking-tight">Relatório Fitness PDF</h4>
          <p className="text-xs text-stone-300 leading-relaxed">
            Exporte suas estatísticas de treino semanais, progresso dinâmico e logs de sincronização dos dispositivos vestíveis em arquivo PDF elegante.
          </p>

          {!user.isPremium && (
            <div className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 justify-center ${
              darkMode ? 'bg-brand-neon/10 border-brand-neon/20 text-brand-neon' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              Ative o Modo Premium para habilitar a exportação
            </div>
          )}

          <button
            onClick={handleExportPDF}
            className={`w-full py-3.5 font-bold uppercase tracking-widest rounded-xl text-xs transition-all flex items-center justify-center gap-2 ${
              darkMode 
                ? 'bg-brand-neon text-black hover:bg-white shadow-lg shadow-brand-neon/15 font-black' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar Relatório Semanal (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}

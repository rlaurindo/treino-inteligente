import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Bluetooth, RefreshCw, Footprints, Flame, CheckCircle, Smartphone, Info
} from 'lucide-react';
import { WearableStats } from '../types';

interface WearableSyncProps {
  stats: WearableStats;
  onUpdateStats: (updated: Partial<WearableStats>) => void;
  darkMode: boolean;
}

export default function WearableSync({ stats, onUpdateStats, darkMode }: WearableSyncProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [pulseDirection, setPulseDirection] = useState(true);

  // Active sync loop
  useEffect(() => {
    let telemetryInterval: any = null;

    if (stats.connected) {
      telemetryInterval = setInterval(() => {
        // Mock dynamic steps increasing slightly
        const stepsAdd = Math.floor(Math.random() * 4) + 1; // 1-4 steps per few seconds
        const activeCalAdd = stepsAdd * 0.04; // 0.04 cal per step approx

        // Random heartrate changes (fluctuate around 70-130 depending on active work)
        const currentHr = stats.heartRate;
        const hrDelta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const nextHr = Math.max(68, Math.min(155, currentHr + hrDelta));

        onUpdateStats({
          steps: stats.steps + stepsAdd,
          activeCalories: Math.round(stats.activeCalories + activeCalAdd),
          heartRate: nextHr,
          syncTime: new Date().toLocaleTimeString('pt-BR')
        });
      }, 3000);
    }

    return () => {
      if (telemetryInterval) clearInterval(telemetryInterval);
    };
  }, [stats.connected, stats.steps, stats.activeCalories, stats.heartRate]);

  const handleScanAndConnect = () => {
    setIsScanning(true);
    setAvailableDevices([]);

    // Simulate Bluetooth scanning cycle
    setTimeout(() => {
      setAvailableDevices(['Apple Watch', 'Garmin Forerunner', 'Fitbit Charge 6']);
      setIsScanning(false);
    }, 1500);
  };

  const handleSelectDevice = (device: string) => {
    onUpdateStats({
      connected: true,
      deviceType: device as any,
      steps: 4230,
      heartRate: 78,
      activeCalories: 142,
      syncTime: new Date().toLocaleTimeString('pt-BR')
    });
    setAvailableDevices([]);
  };

  const handleDisconnect = () => {
    onUpdateStats({
      connected: false,
      deviceType: 'Nenhum',
      steps: 0,
      heartRate: 0,
      activeCalories: 0,
      syncTime: undefined
    });
  };

  return (
    <div className="space-y-6" id="wearable-container">
      {/* Device Connection Hub */}
      <div className={`p-6 rounded-2xl border ${
        darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bluetooth className={`w-5 h-5 animate-pulse ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`} />
            <h3 className="font-bold text-base uppercase tracking-tight">Sincronização de Dispositivos</h3>
          </div>
          {stats.connected && (
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 ${
              darkMode ? 'bg-brand-neon/10 text-brand-neon border-brand-neon/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block animate-ping ${darkMode ? 'bg-brand-neon' : 'bg-emerald-500'}`} /> conectado
            </span>
          )}
        </div>

        <p className="text-xs text-stone-300 mb-6 leading-relaxed">
          Sincronize sua frequência cardíaca, calorias ativas e passos em tempo real durante os treinos conectando seu smartwatch via Bluetooth LE.
        </p>

        {/* Live Metrics Grid */}
        {stats.connected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-4 rounded-xl border text-center ${
                darkMode ? 'bg-[#181818]/80 border-brand-border' : 'bg-stone-50 border-stone-100'
              }`}>
                <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1 animate-pulse" />
                <span className="text-[9px] text-stone-400 uppercase font-extrabold tracking-wider block">Frequência</span>
                <span className="text-base font-extrabold text-rose-500 mt-1 block">{stats.heartRate} bpm</span>
              </div>
              <div className={`p-4 rounded-xl border text-center ${
                darkMode ? 'bg-[#181818]/80 border-brand-border' : 'bg-stone-50 border-stone-100'
              }`}>
                <Footprints className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                <span className="text-[9px] text-stone-400 uppercase font-extrabold tracking-wider block">Passos Hoje</span>
                <span className={`text-base font-extrabold mt-1 block ${darkMode ? 'text-brand-neon' : 'text-sky-500'}`}>{stats.steps.toLocaleString('pt-BR')}</span>
              </div>
              <div className={`p-4 rounded-xl border text-center ${
                darkMode ? 'bg-[#181818]/80 border-brand-border' : 'bg-stone-50 border-stone-100'
              }`}>
                <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-[9px] text-stone-400 uppercase font-extrabold tracking-wider block">Kcal Ativas</span>
                <span className="text-base font-extrabold text-amber-500 mt-1 block">{stats.activeCalories} kcal</span>
              </div>
            </div>

            {/* Sync telemetry summary info */}
            <div className={`text-[10px] text-stone-500 flex items-center justify-between border-t pt-3 font-semibold gap-2 ${
              darkMode ? 'border-brand-border-muted' : 'border-stone-100'
            }`}>
              <span className="flex items-center gap-1 text-white"><Smartphone className="w-3.5 h-3.5" /> {stats.deviceType}</span>
              <span>Sincronizado há segundos atrás ({stats.syncTime})</span>
            </div>

            <button
              onClick={handleDisconnect}
              className={`w-full py-3 border font-extrabold uppercase tracking-tight rounded-lg transition-all text-xs ${
                darkMode 
                  ? 'bg-[#181818] border-brand-border text-stone-300 hover:bg-brand-border hover:text-white' 
                  : 'bg-zinc-805 bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              Desconectar {stats.deviceType}
            </button>
          </div>
        ) : (
          /* Connecting Screen */
          <div className="space-y-4">
            <button
              onClick={handleScanAndConnect}
              disabled={isScanning}
              className={`w-full py-3.5 font-bold uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-xs ${
                darkMode 
                  ? 'bg-brand-neon text-black hover:bg-white shadow-brand-neon/15 font-black' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className={`w-4 h-4 animate-spin ${darkMode ? 'text-black' : 'text-white'}`} /> Escaneando Smartwatches...
                </>
              ) : (
                'Escanear Smartwatches Próximos'
              )}
            </button>

            {/* List Devices found */}
            <AnimatePresence>
              {availableDevices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                    Dispositivos Encontrados (Clique para conectar):
                  </label>
                  <div className="space-y-1.5">
                    {availableDevices.map((dev) => (
                      <button
                        key={dev}
                        onClick={() => handleSelectDevice(dev)}
                        className={`w-full p-4 rounded-lg border flex items-center justify-between transition-all text-left ${
                          darkMode 
                            ? 'bg-[#181818] border-brand-border text-stone-300 hover:border-brand-neon/30 hover:bg-brand-neon/5' 
                            : 'bg-stone-50 border-stone-100 text-stone-700 hover:border-emerald-500 hover:bg-emerald-500/5'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-tight">{dev}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          darkMode ? 'text-brand-neon' : 'text-emerald-500'
                        }`}>conectar</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sync stats message */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        darkMode ? 'bg-brand-neon/5 border-brand-neon/10' : 'bg-stone-100 border-stone-200'
      }`}>
        <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`} />
        <p className="text-xs text-stone-300 leading-relaxed">
          <strong className={`font-extrabold uppercase tracking-tight block mb-0.5 ${darkMode ? 'text-brand-neon' : 'text-stone-700'}`}>Saborosamente Real-time:</strong>
          Sua contagem de calorias e BPM são estimadas continuadamente quando pareadas. O histórico de logs se ajusta dinamicamente a cada sincronização ativa.
        </p>
      </div>
    </div>
  );
}

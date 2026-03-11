import React, { useState } from 'react';
import { useSupplements } from '@/context/SupplementContext';
import { motion } from 'motion/react';
import { Check, AlertTriangle, Droplets, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function Dashboard() {
  const { supplements, takeDose, monthlyCost } = useSupplements();
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set());
  const today = new Date().getDay(); // 0-6

  const handleTakeDose = (id: string) => {
    takeDose(id);
    setTakenIds(prev => new Set(prev).add(id));
  };

  // Filter supplements for today and sort by time
  const todaysSupplements = supplements
    .filter(s => s.schedule.some(sched => sched.days.includes(today)))
    .map(s => {
      // Find the specific schedule entry for today to get the time
      const todaySchedule = s.schedule.find(sched => sched.days.includes(today));
      return { ...s, time: todaySchedule?.time || '00:00' };
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const lowStock = supplements.filter(s => 
    s.currentDoses <= s.lowStockThreshold
  );

  return (
    <div className="space-y-6 pt-2">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-100 rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"></div>
        <h2 className="text-3xl font-bold text-emerald-900 mb-1">
          {format(new Date(), "EEEE", { locale: pt })}
        </h2>
        <p className="text-emerald-700 font-medium opacity-80 mb-6">
          {format(new Date(), "d 'de' MMMM", { locale: pt })}
        </p>
        
        <div className="flex gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 flex-1">
            <p className="text-xs text-emerald-800 uppercase tracking-wider font-bold mb-1">Custo Mensal</p>
            <p className="text-2xl font-bold text-emerald-950">{monthlyCost.toFixed(2)}€</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 flex-1">
            <p className="text-xs text-emerald-800 uppercase tracking-wider font-bold mb-1">Hoje</p>
            <p className="text-2xl font-bold text-emerald-950">{todaysSupplements.length} <span className="text-sm font-normal text-emerald-800">itens</span></p>
          </div>
        </div>
      </motion.div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="bg-orange-100 p-2 rounded-full text-orange-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-orange-900 text-sm">Atenção ao stock</h3>
            <p className="text-xs text-orange-700 mt-1">
              {lowStock.map(s => s.name).join(', ')} {lowStock.length > 1 ? 'estão' : 'está'} a acabar.
            </p>
          </div>
        </motion.div>
      )}

      {/* Today's Schedule */}
      <div>
        <h3 className="text-lg font-bold text-stone-800 mb-4 px-1">Para tomar hoje</h3>
        <div className="space-y-3">
          {todaysSupplements.length === 0 ? (
            <div className="text-center py-10 text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              <Droplets size={48} className="mx-auto mb-2 opacity-20" />
              <p>Nada agendado para hoje.</p>
            </div>
          ) : (
            todaysSupplements.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0 relative">
                    {s.generatedImage ? (
                      <img src={s.generatedImage} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Droplets size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800">{s.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1 bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-md font-medium">
                        <Clock size={10} /> {s.time}
                      </span>
                      <span>{s.dosagePerServing} dose(s)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleTakeDose(s.id)}
                  disabled={takenIds.has(s.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-90 ${
                    takenIds.has(s.id)
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-violet-50 text-violet-600 hover:bg-violet-500 hover:text-white'
                  }`}
                >
                  <Check size={20} strokeWidth={3} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

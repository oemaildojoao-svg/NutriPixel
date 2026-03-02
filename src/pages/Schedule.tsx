import React from 'react';
import { useSupplements } from '@/context/SupplementContext';
import { WEEKDAYS } from '@/types';
import { motion } from 'motion/react';
import { Droplets, Clock } from 'lucide-react';

export default function SchedulePage() {
  const { supplements } = useSupplements();

  return (
    <div className="space-y-6 pt-2">
      <h2 className="text-2xl font-bold text-stone-800 px-2">Agenda Semanal</h2>
      
      <div className="space-y-6">
        {WEEKDAYS.map((day) => {
          const daySupplements = supplements
            .filter(s => s.schedule.some(sched => sched.days.includes(day.id)))
            .map(s => {
              const schedule = s.schedule.find(sched => sched.days.includes(day.id));
              return { ...s, time: schedule?.time || '00:00' };
            })
            .sort((a, b) => a.time.localeCompare(b.time));

          return (
            <div key={day.id} className="relative pl-6 border-l-2 border-stone-100 last:border-transparent">
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${daySupplements.length > 0 ? 'bg-violet-500 border-violet-100' : 'bg-stone-200 border-stone-50'}`}></div>
              
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">{day.full}</h3>
              
              <div className="space-y-3">
                {daySupplements.length === 0 ? (
                  <p className="text-xs text-stone-300 italic">Descanso</p>
                ) : (
                  daySupplements.map(s => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="bg-white rounded-2xl p-3 shadow-sm border border-stone-100 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-stone-50 overflow-hidden flex-shrink-0 relative">
                         {s.generatedImage ? (
                            <img src={s.generatedImage} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <Droplets size={16} />
                            </div>
                          )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-stone-800 text-sm">{s.name}</p>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md">
                            <Clock size={10} /> {s.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500">{s.dosagePerServing} dose(s)</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

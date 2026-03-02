import React, { createContext, useContext, useEffect, useState } from 'react';
import { Supplement } from '@/types';
import { toast } from 'sonner';

interface SupplementContextType {
  supplements: Supplement[];
  addSupplement: (supplement: Supplement) => void;
  updateSupplement: (id: string, updates: Partial<Supplement>) => void;
  deleteSupplement: (id: string) => void;
  takeDose: (id: string) => void;
  monthlyCost: number;
}

const SupplementContext = createContext<SupplementContextType | undefined>(undefined);

export function SupplementProvider({ children }: { children: React.ReactNode }) {
  const [supplements, setSupplements] = useState<Supplement[]>(() => {
    const saved = localStorage.getItem('nutripixel_supplements');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nutripixel_supplements', JSON.stringify(supplements));
  }, [supplements]);

  const addSupplement = (supplement: Supplement) => {
    setSupplements((prev) => [...prev, supplement]);
    toast.success('Suplemento adicionado!');
  };

  const updateSupplement = (id: string, updates: Partial<Supplement>) => {
    setSupplements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    toast.success('Suplemento atualizado!');
  };

  const deleteSupplement = (id: string) => {
    setSupplements((prev) => prev.filter((s) => s.id !== id));
    toast.success('Suplemento removido!');
  };

  const takeDose = (id: string) => {
    // Play sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3'); // Simple beep/pop sound
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed', e));

    setSupplements((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newDoses = Math.max(0, s.currentDoses - s.dosagePerServing);
          
          // Check for low stock
          const weeksRemaining = newDoses / (s.dosagePerServing * s.schedule.length || 1); 
          // Rough estimate, better logic needed for exact schedule matching but this is a good proxy
          
          if (newDoses <= s.lowStockThreshold && s.currentDoses > s.lowStockThreshold) {
             toast.warning(`Atenção: ${s.name} está a acabar!`, {
                 description: "Está na hora de comprar mais.",
                 duration: 5000,
             });
          }

          return { ...s, currentDoses: newDoses };
        }
        return s;
      })
    );
    toast.success('Dose registada!');
  };

  const monthlyCost = supplements.reduce((acc, s) => {
    // Calculate cost per dose
    const costPerDose = s.totalDoses > 0 ? s.price / s.totalDoses : 0;
    // Calculate doses per week based on schedule
    const dosesPerWeek = s.schedule.reduce((count, sched) => count + sched.days.length, 0);
    // Monthly cost (approx 4.3 weeks)
    return acc + (costPerDose * dosesPerWeek * 4.3);
  }, 0);

  return (
    <SupplementContext.Provider
      value={{
        supplements,
        addSupplement,
        updateSupplement,
        deleteSupplement,
        takeDose,
        monthlyCost,
      }}
    >
      {children}
    </SupplementContext.Provider>
  );
}

export function useSupplements() {
  const context = useContext(SupplementContext);
  if (context === undefined) {
    throw new Error('useSupplements must be used within a SupplementProvider');
  }
  return context;
}

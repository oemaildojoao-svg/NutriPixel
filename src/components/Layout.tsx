import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, Calendar, Activity, Plus } from 'lucide-react';
import { Toaster } from 'sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24 overflow-hidden selection:bg-violet-100">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden border-x border-stone-100">
        <header className="px-6 pt-12 pb-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-200">
                N
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-800">NutriPixel</h1>
            </div>
          </div>
        </header>

        <main className="px-4 pb-4 animate-in fade-in duration-500">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-stone-100 px-6 py-4 z-50 flex justify-between items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-violet-600' : 'text-stone-400 hover:text-stone-600'
              }`
            }
          >
            <Home size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Início</span>
          </NavLink>
          
          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-violet-600' : 'text-stone-400 hover:text-stone-600'
              }`
            }
          >
            <List size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Lista</span>
          </NavLink>

          <NavLink
            to="/add"
            className="flex flex-col items-center justify-center -mt-8"
          >
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl shadow-lg shadow-yellow-200 flex items-center justify-center text-stone-900 hover:scale-105 transition-transform">
              <Plus size={32} strokeWidth={3} />
            </div>
          </NavLink>

          <NavLink
            to="/schedule"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-violet-600' : 'text-stone-400 hover:text-stone-600'
              }`
            }
          >
            <Calendar size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Agenda</span>
          </NavLink>

          <NavLink
            to="/analysis"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-violet-600' : 'text-stone-400 hover:text-stone-600'
              }`
            }
          >
            <Activity size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Análise</span>
          </NavLink>
        </nav>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

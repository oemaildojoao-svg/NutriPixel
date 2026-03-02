import React, { useState } from 'react';
import { useSupplements } from '@/context/SupplementContext';
import { motion } from 'motion/react';
import { Search, Filter, Edit2, Trash2, Plus } from 'lucide-react';
import { CATEGORIES, Category } from '@/types';
import { Link } from 'react-router-dom';

export default function Inventory() {
  const { supplements, deleteSupplement } = useSupplements();
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');

  const filtered = supplements.filter(s => {
    const matchesCategory = filter === 'All' || s.category === filter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center gap-2 bg-stone-100 rounded-2xl px-4 py-3">
        <Search size={20} className="text-stone-400" />
        <input
          type="text"
          placeholder="Procurar suplemento..."
          className="bg-transparent border-none outline-none w-full text-stone-800 placeholder:text-stone-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilter('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'All' ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600'
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100 overflow-hidden relative"
          >
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-2xl bg-stone-50 flex-shrink-0 overflow-hidden relative">
                 {s.generatedImage ? (
                    <img src={s.generatedImage} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-300">
                      <span className="text-xs">Sem img</span>
                    </div>
                  )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-1 rounded-md mb-2 inline-block">
                      {s.category}
                    </span>
                    <h3 className="font-bold text-stone-900 text-lg leading-tight truncate">{s.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/edit/${s.id}`} className="p-2 text-stone-400 hover:text-stone-800 transition-colors">
                      <Edit2 size={16} />
                    </Link>
                    <button 
                      onClick={() => {
                        if (window.confirm('Tem a certeza que deseja eliminar este suplemento?')) {
                          deleteSupplement(s.id);
                        }
                      }}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-4 text-xs text-stone-500 font-medium">
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase">Doses</span>
                    <span className={s.currentDoses < s.lowStockThreshold ? 'text-orange-600 font-bold' : 'text-stone-800'}>
                      {s.currentDoses}/{s.totalDoses}
                    </span>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-[10px] uppercase">Preço</span>
                    <span className="text-stone-800">{s.price}€</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-stone-50">
              <p className="text-xs text-stone-500 line-clamp-2">{s.benefits}</p>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-400">Nenhum suplemento encontrado.</p>
            <Link to="/add" className="text-violet-600 font-medium text-sm mt-2 inline-block">
              Adicionar novo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

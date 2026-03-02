import React, { useEffect, useState } from 'react';
import { useSupplements } from '@/context/SupplementContext';
import { analyzeStack } from '@/services/ai';
import { motion } from 'motion/react';
import { Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Analysis() {
  const { supplements } = useSupplements();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem('nutripixel_analysis');
    if (cached) {
      setAnalysis(cached);
    }
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeStack(supplements);
      setAnalysis(result);
      localStorage.setItem('nutripixel_analysis', result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="text-yellow-300" /> Análise IA
        </h2>
        <p className="text-violet-100 text-sm mb-6">
          O teu assistente pessoal analisa a tua combinação de suplementos e sugere melhorias.
        </p>
        
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="bg-white text-violet-600 px-6 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Gerar Relatório'}
        </button>
      </div>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 prose prose-stone prose-sm max-w-none"
        >
          <div className="markdown-body">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}

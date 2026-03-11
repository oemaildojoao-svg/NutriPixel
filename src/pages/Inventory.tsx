import React, { useState, useRef, useCallback } from 'react';
import { useSupplements } from '@/context/SupplementContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Edit2, Trash2, Plus, ImagePlus, X, Check as CheckIcon } from 'lucide-react';
import { CATEGORIES, Category } from '@/types';
import { Link } from 'react-router-dom';
import Cropper from 'react-easy-crop';

// Helper to get cropped image
const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: any) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg', 0.8);
}

export default function Inventory() {
  const { supplements, deleteSupplement, updateSupplement } = useSupplements();
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  
  // Cropper state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const filtered = supplements.filter(s => {
    const matchesCategory = filter === 'All' || s.category === filter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const resizeImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve) => {
      let img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingImageId) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        try {
          // Resize first to avoid massive images in cropper
          const resized = await resizeImage(result, 1200, 1200);
          setCropImageSrc(resized);
        } catch (err) {
          console.error("Error processing image:", err);
          setCropImageSrc(result);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (cropImageSrc && croppedAreaPixels && editingImageId) {
      try {
        const croppedImage = await getCroppedImg(cropImageSrc, croppedAreaPixels);
        if (croppedImage) {
          updateSupplement(editingImageId, { generatedImage: croppedImage });
        }
      } catch (e) {
        console.error(e);
      }
    }
    setCropImageSrc(null);
    setEditingImageId(null);
  };

  const handleCancelCrop = () => {
    setCropImageSrc(null);
    setEditingImageId(null);
  };

  const triggerImageUpload = (id: string) => {
    setEditingImageId(id);
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 pt-2">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
      />
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
              <div 
                className="w-24 h-24 rounded-2xl bg-stone-50 flex-shrink-0 overflow-hidden relative cursor-pointer group"
                onClick={() => triggerImageUpload(s.id)}
              >
                 {s.generatedImage ? (
                    <>
                      <img src={s.generatedImage} alt={s.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImagePlus className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 hover:bg-stone-200 transition-colors">
                      <ImagePlus size={20} className="mb-1" />
                      <span className="text-[10px] uppercase font-bold">Adicionar</span>
                    </div>
                  )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-1 rounded-md mb-2 inline-block">
                      {s.category}
                    </span>
                    <h3 className="font-bold text-stone-900 text-lg leading-tight truncate">{s.name}</h3>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
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

      {/* Cropper Modal */}
      <AnimatePresence>
        {cropImageSrc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black"
          >
            <div className="flex justify-between items-center p-4 bg-black/50 text-white absolute top-0 left-0 right-0 z-10">
              <button onClick={handleCancelCrop} className="p-2 bg-stone-800 rounded-full">
                <X size={24} />
              </button>
              <h3 className="font-bold">Ajustar Imagem</h3>
              <button onClick={handleSaveCrop} className="p-2 bg-emerald-500 rounded-full text-white">
                <CheckIcon size={24} />
              </button>
            </div>
            
            <div className="relative flex-1 w-full h-full">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                objectFit="contain"
              />
            </div>
            
            <div className="p-6 bg-black/80 absolute bottom-0 left-0 right-0 z-10">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

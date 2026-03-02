export type Category = 'Vitaminas' | 'Proteína' | 'Aminoácidos' | 'Outros';

export interface Schedule {
  days: number[]; // 0-6, 0 is Sunday
  time: string; // HH:mm
}

export interface Supplement {
  id: string;
  name: string;
  category: Category;
  image?: string; // Base64 or URL
  generatedImage?: string; // AI generated representation
  ingredients: string;
  benefits: string;
  price: number;
  totalDoses: number;
  currentDoses: number;
  dosagePerServing: number; // How many units (pills/scoops) per serving
  schedule: Schedule[];
  lowStockThreshold: number;
}

export const CATEGORIES: Category[] = ['Vitaminas', 'Proteína', 'Aminoácidos', 'Outros'];

export const WEEKDAYS = [
  { id: 0, label: 'D', full: 'Domingo' },
  { id: 1, label: 'S', full: 'Segunda' },
  { id: 2, label: 'T', full: 'Terça' },
  { id: 3, label: 'Q', full: 'Quarta' },
  { id: 4, label: 'Q', full: 'Quinta' },
  { id: 5, label: 'S', full: 'Sexta' },
  { id: 6, label: 'S', full: 'Sábado' },
];

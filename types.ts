
export type Category = 'Genel' | 'İş' | 'Kişisel' | 'Fikirler' | 'Önemli';
export type Theme = 'light' | 'dark' | 'sepia';
export type Language = 'tr' | 'en';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: Category;
  color: string;
  createdAt: number;
  updatedAt: number;
}

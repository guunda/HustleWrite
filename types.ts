export type Platform = 'instagram' | 'whatsapp' | 'etsy' | 'marketplace';

export type Category =
  | 'Handmade & Crafts'
  | 'Fashion & Accessories'
  | 'Home & Living'
  | 'Beauty & Skincare'
  | 'Food & Gourmet'
  | 'Tech & Gadgets'
  | 'Digital Products'
  | 'Other';

export type Tone =
  | 'friendly'
  | 'luxury'
  | 'bold'
  | 'minimalist'
  | 'artisan'
  | 'urgent';

export interface ProductInput {
  name: string;
  platform: Platform;
  category: Category;
  price: string;
  currency: string;
  targetAudience: string;
  features: string;
  tone: Tone;
  specialNotes?: string;
}

export interface GeneratedListing {
  id: string;
  createdAt: string;
  productName: string;
  platform: Platform;
  tone: Tone;
  category: Category;
  priceFormatted: string;
  title: string;
  description: string;
  keySellingPoints: string[];
  socialCaption: string;
  seoKeywords: string[];
  hashtags: string[];
  cta: string;
  engineUsed: 'ollama' | 'gemini' | 'grounded-local';
}

export interface HistoryItem extends GeneratedListing {
  rawInput: ProductInput;
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export interface EngineStatus {
  state: 'ready' | 'checking' | 'offline' | 'fallback';
  modelName: string;
  message?: string;
  latencyMs?: number;
}

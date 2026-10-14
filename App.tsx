/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Instagram,
  MessageCircle,
  Store,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  ProductInput,
  GeneratedListing,
  HistoryItem,
  OllamaConfig,
  EngineStatus,
} from './types';
import { SAMPLE_PRODUCTS, INITIAL_PREVIEW_LISTING } from './data/presets';
import {
  generateListing,
  checkOllamaHealth,
  DEFAULT_OLLAMA_CONFIG,
} from './services/aiEngine';
import { Header } from './components/Header';
import { ProductForm } from './components/ProductForm';
import { OutputPanel } from './components/OutputPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import {
  TerminalSetupModal,
  WhyLocalModal,
  EngineConfigModal,
} from './components/Modals';

const STORAGE_KEY = 'hustlewrite_history_v1';
const CONFIG_KEY = 'hustlewrite_config_v1';

export default function App() {
  // Form State initialized with the Candle sample
  const [productInput, setProductInput] = useState<ProductInput>(SAMPLE_PRODUCTS.candle);

  // Listing Output State - initialized with rich preview listing so preview is immediately visible!
  const [listing, setListing] = useState<GeneratedListing | null>(INITIAL_PREVIEW_LISTING);

  // Loading & Generation State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        ...INITIAL_PREVIEW_LISTING,
        rawInput: SAMPLE_PRODUCTS.candle,
      },
    ];
  });

  // Config & Engine State
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_OLLAMA_CONFIG;
  });

  const [engineStatus, setEngineStatus] = useState<EngineStatus>({
    state: 'ready',
    modelName: 'qwen2.5:1.5b (Smart Engine Active)',
    message: 'Grounded Anti-Hallucination Copy Engine Ready',
  });

  // Modals & Drawers
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isWhyLocalOpen, setIsWhyLocalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEngineConfigOpen, setIsEngineConfigOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Ping engine on mount or config change
  const testEngineConnection = useCallback(async () => {
    setEngineStatus((prev) => ({ ...prev, state: 'checking' }));
    const result = await checkOllamaHealth(ollamaConfig);
    if (result.online && result.modelFound) {
      setEngineStatus({
        state: 'ready',
        modelName: ollamaConfig.model,
        message: `Connected to local Ollama (${ollamaConfig.model})`,
      });
      showToast(`Ollama connected: ${ollamaConfig.model}`);
    } else {
      setEngineStatus({
        state: 'fallback',
        modelName: 'qwen2.5:1.5b (Smart Fallback)',
        message: result.message,
      });
    }
  }, [ollamaConfig, showToast]);

  useEffect(() => {
    testEngineConnection();
  }, [testEngineConnection]);

  // Keyboard shortcut for Generate (Ctrl+Enter or Cmd+Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (productInput.name.trim().length >= 2 && productInput.features.trim().length >= 5 && !isLoading) {
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Handlers
  const handleInputChange = (updated: Partial<ProductInput>) => {
    setProductInput((prev) => ({ ...prev, ...updated }));
  };

  const handleSelectPreset = (key: string) => {
    const preset = SAMPLE_PRODUCTS[key];
    if (preset) {
      setProductInput(preset);
      showToast(`Loaded ${preset.name} preset`);
    }
  };

  const handleResetForm = () => {
    setProductInput({
      name: '',
      platform: 'instagram',
      category: 'Handmade & Crafts',
      price: '',
      currency: '$',
      targetAudience: '',
      features: '',
      tone: 'artisan',
      specialNotes: '',
    });
    showToast('Form reset to blank', 'info');
  };

  const handleGenerate = async () => {
    if (productInput.name.trim().length < 2 || productInput.features.trim().length < 5) {
      showToast('Please provide a product title and features', 'info');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Initializing generation engine...');

    try {
      const generated = await generateListing(productInput, ollamaConfig, (step) => {
        setLoadingStep(step);
      });

      setListing(generated);

      // Add to history
      const newHistoryItem: HistoryItem = {
        ...generated,
        rawInput: { ...productInput },
      };
      setHistory((prev) => [newHistoryItem, ...prev.filter((h) => h.id !== newHistoryItem.id).slice(0, 19)]);

      showToast('Generated 7 platform-tailored conversion assets!');
    } catch {
      showToast('Encountered an issue during generation. Please try again.', 'info');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleLoadInstantPreview = () => {
    setProductInput(SAMPLE_PRODUCTS.candle);
    setListing(INITIAL_PREVIEW_LISTING);
    showToast('Loaded instant Amber & Moss Soy Candle preview!');
  };

  const handleUpdateListing = (updated: Partial<GeneratedListing>) => {
    if (!listing) return;
    setListing((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const handleRestoreFromHistory = (item: HistoryItem) => {
    setProductInput(item.rawInput);
    setListing(item);
    showToast(`Loaded "${item.productName}" from history`);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    showToast('Removed from history');
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('History cleared');
  };

  const handleSaveEngineConfig = (newConfig: OllamaConfig) => {
    setOllamaConfig(newConfig);
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    } catch {
      // ignore
    }
    showToast('Inference settings saved');
  };

  // 1-Click Copy All formatted text
  const handleCopyAll = async () => {
    if (!listing) return;

    const fullListingText = `=====================================================
HUSTLEWRITE AI - E-COMMERCE LISTING SUITE
=====================================================
Product: ${listing.productName}
Platform: ${listing.platform.toUpperCase()}
Category: ${listing.category}
Price: ${listing.priceFormatted}
Tone: ${listing.tone}
Created: ${new Date(listing.createdAt).toLocaleString()}

-----------------------------------------------------
1. SEO PRODUCT TITLE
-----------------------------------------------------
${listing.title}

-----------------------------------------------------
2. POLISHED SALES DESCRIPTION
-----------------------------------------------------
${listing.description}

-----------------------------------------------------
3. 5 KEY SELLING POINTS
-----------------------------------------------------
${listing.keySellingPoints.map((bp) => `• ${bp}`).join('\n')}

-----------------------------------------------------
4. ${listing.platform.toUpperCase()} SOCIAL MEDIA CAPTION
-----------------------------------------------------
${listing.socialCaption}

-----------------------------------------------------
5. HIGH-INTENT SEO KEYWORDS & SEARCH TAGS
-----------------------------------------------------
${listing.seoKeywords.join(', ')}

-----------------------------------------------------
6. HASHTAGS
-----------------------------------------------------
${listing.hashtags.join(' ')}

-----------------------------------------------------
7. HIGH-CONVERTING CALL TO ACTION (CTA)
-----------------------------------------------------
${listing.cta}
=====================================================`;

    try {
      await navigator.clipboard.writeText(fullListingText);
      showToast('Copied all 7 listing assets to clipboard!');
    } catch {
      showToast('Unable to copy to clipboard', 'info');
    }
  };

  // Download clean .txt file
  const handleDownloadTxt = () => {
    if (!listing) return;

    const fullListingText = `HustleWrite AI Generated Listing: ${listing.productName}
Platform: ${listing.platform.toUpperCase()}
Category: ${listing.category}
Price: ${listing.priceFormatted}
Generated: ${new Date(listing.createdAt).toISOString()}

1. SEO PRODUCT TITLE:
${listing.title}

2. POLISHED DESCRIPTION:
${listing.description}

3. KEY SELLING POINTS:
${listing.keySellingPoints.map((bp) => `• ${bp}`).join('\n')}

4. ${listing.platform.toUpperCase()} SOCIAL CAPTION:
${listing.socialCaption}

5. SEO DISCOVERY KEYWORDS:
${listing.seoKeywords.join(', ')}

6. HASHTAGS:
${listing.hashtags.join(' ')}

7. CALL TO ACTION:
${listing.cta}
`;

    const blob = new Blob([fullListingText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = listing.productName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    link.href = url;
    link.download = `${safeName || 'product'}-listing.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Listing downloaded as .txt file!');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-100 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        engineStatus={engineStatus}
        historyCount={history.length}
        onOpenTerminalGuide={() => setIsTerminalOpen(true)}
        onOpenWhyLocal={() => setIsWhyLocalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenEngineConfig={() => setIsEngineConfigOpen(true)}
        onLoadInstantPreview={handleLoadInstantPreview}
      />

      {/* Hero Banner with value props */}
      <section className="border-b border-stone-800/80 bg-gradient-to-b from-stone-900/60 to-stone-950 px-4 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-medium border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hacktoberfest 2026 · Side Hustle Challenge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Turn product details into listings that{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
                sell.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Generate 7 conversion-ready copy assets tailored for Instagram, WhatsApp Business, Etsy, and online marketplaces.
              Powered by local open-weight AI with strict anti-hallucination grounding.
            </p>
          </div>

          {/* Quick Platform Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-300">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800">
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Instagram</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Etsy</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800">
              <Store className="w-4 h-4 text-blue-400" />
              <span>Marketplace</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace (2-Column Layout) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Product Form */}
          <div className="lg:col-span-5 w-full">
            <ProductForm
              input={productInput}
              onChange={handleInputChange}
              onSubmit={handleGenerate}
              onReset={handleResetForm}
              isLoading={isLoading}
              onSelectPreset={handleSelectPreset}
            />
          </div>

          {/* Right Column: Output Panel */}
          <div className="lg:col-span-7 w-full">
            <OutputPanel
              listing={listing}
              isLoading={isLoading}
              loadingStep={loadingStep}
              onUpdateListing={handleUpdateListing}
              onLoadInstantPreview={handleLoadInstantPreview}
              onCopyAll={handleCopyAll}
              onDownloadTxt={handleDownloadTxt}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 py-6 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-stone-400">HustleWrite AI</span>
            <span>·</span>
            <span>Local Open-Weight Model Runner (Qwen 2.5)</span>
            <span>·</span>
            <span>Zero Cloud Telemetry</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsTerminalOpen(true)}
              className="hover:text-stone-300 transition cursor-pointer"
            >
              Terminal Setup
            </button>
            <button
              onClick={() => setIsWhyLocalOpen(true)}
              className="hover:text-stone-300 transition cursor-pointer"
            >
              Privacy & Licensing
            </button>
            <button
              onClick={handleLoadInstantPreview}
              className="hover:text-amber-400 transition cursor-pointer"
            >
              Reset to Candle Preview
            </button>
          </div>
        </div>
      </footer>

      {/* Drawers and Modals */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={handleRestoreFromHistory}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      <TerminalSetupModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />

      <WhyLocalModal
        isOpen={isWhyLocalOpen}
        onClose={() => setIsWhyLocalOpen(false)}
      />

      <EngineConfigModal
        isOpen={isEngineConfigOpen}
        onClose={() => setIsEngineConfigOpen(false)}
        config={ollamaConfig}
        onSaveConfig={handleSaveEngineConfig}
        status={engineStatus}
        onTestPing={testEngineConnection}
      />
    </div>
  );
}

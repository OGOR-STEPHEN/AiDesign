"use client";

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader,
  Copy,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  History as HistoryIcon,
  Layout,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Edit3,
  Search,
  Plus
} from 'lucide-react';
import CanvasTemplate from './components/CanvasTemplate';

type GenerationResult = {
  id?: string;
  success: boolean;
  title: string;
  quote: string;
  hashtags: string;
  imageUrl: string;
  imagePrompt: string;
  canvaUrl?: string;
  isRealCanva?: boolean;
  errorCode?: string;
  template?: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  error?: string;
  canvaError?: string;
  timestamp?: number;
};

const TEMPLATES = [
  { id: 'classic', name: 'Classic Corporate', preview: 'bg-indigo-600' },
  { id: 'vibrant', name: 'Digital Pulse', preview: 'bg-pink-600' },
  { id: 'dark', name: 'Futuristic Dark', preview: 'bg-black' },
  { id: 'minimal', name: 'Modern Minimal', preview: 'bg-emerald-600' }
];

export default function Home() {
  const [articleText, setArticleText] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [activeStep, setActiveStep] = useState(1); // 1: Input, 2: Review/Edit, 3: Finale
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [isEditing, setIsEditing] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('canva_ai_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (item: GenerationResult) => {
    const newHistory = [item, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('canva_ai_history', JSON.stringify(newHistory));
  };

  const handleGenerate = async () => {
    if (!articleText.trim()) return;

    setLoading(true);
    setActiveStep(1);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleText,
          templateId: selectedTemplate.id
        })
      });

      const data: GenerationResult = await response.json();
      const resultWithId = { ...data, id: Date.now().toString(), timestamp: Date.now() };

      setResult(resultWithId);
      if (data.success) {
        saveToHistory(resultWithId);
        setActiveStep(2);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToCanva = async () => {
    if (!result) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleText: "RE-APPLYING EDITS", // Signal or just pass fields
          templateId: selectedTemplate.id,
          overrideData: {
            title: result.title,
            quote: result.quote,
            hashtags: result.hashtags,
            imageUrl: result.imageUrl
          }
        })
      });

      const data = await response.json();
      if (data.canvaUrl) {
        setResult({ ...result, canvaUrl: data.canvaUrl });
        window.open(data.canvaUrl, '_blank');
      }
    } catch (e) {
      console.error("Apply failed", e);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: GenerationResult) => {
    setResult(item);
    setActiveStep(2);
  };

  const updateResultField = (field: keyof GenerationResult, value: string) => {
    if (!result) return;
    setResult({ ...result, [field]: value });
  };

  return (
    <div className="flex h-screen bg-[#0f1115] text-gray-100 overflow-hidden font-sans">

      {/* --- SIDEBAR: HISTORY & ASSETS --- */}
      <aside className="w-72 bg-[#16191f] border-r border-gray-800 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-bold text-lg tracking-tight">Design Hub</h2>
          </div>
          <button
            onClick={() => { setResult(null); setArticleText(''); setActiveStep(1); }}
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
          >
            <Plus size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-3 px-2">Recent Articles</h3>
            <div className="space-y-1">
              {history.length === 0 ? (
                <div className="px-2 py-4 text-sm text-gray-600 italic">No history yet</div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 ${result?.id === item.id ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-gray-800'
                      }`}
                  >
                    <div className="w-8 h-8 rounded bg-gray-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={item.imageUrl} className="w-full h-full object-cover opacity-50" alt="" />
                    </div>
                    <div className="truncate">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-[10px] opacity-60">{new Date(item.timestamp!).toLocaleDateString()}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-3 px-2">Presets</h3>
            <div className="grid grid-cols-2 gap-2 px-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`p-2 rounded-lg border text-[10px] text-center transition-all ${selectedTemplate.id === t.id ? 'border-purple-500 bg-purple-500/10' : 'border-gray-800 hover:border-gray-600'
                    }`}
                >
                  <div className={`w-full aspect-video rounded mb-1.5 ${t.preview}`} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800/40 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold">JD</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">Demo User</div>
              <div className="text-[10px] text-gray-500 truncate">Free Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top Navbar */}
        <nav className="h-16 bg-[#16191f]/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${activeStep >= 1 ? 'bg-purple-500' : 'bg-gray-700'}`}>1</span>
              <span className={activeStep === 1 ? 'text-white' : 'text-gray-500'}>Input Content</span>
            </div>
            <ChevronRight size={14} className="text-gray-700" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${activeStep >= 2 ? 'bg-purple-500' : 'bg-gray-700'}`}>2</span>
              <span className={activeStep === 2 ? 'text-white' : 'text-gray-500'}>Refine Design</span>
            </div>
            <ChevronRight size={14} className="text-gray-700" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${activeStep >= 3 ? 'bg-purple-500' : 'bg-gray-700'}`}>3</span>
              <span className={activeStep === 3 ? 'text-white' : 'text-gray-500'}>Export</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-xs text-gray-400 hover:text-white transition-colors bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
              Support
            </button>
            <button className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
              Upgrade Account
            </button>
          </div>
        </nav>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-fixed">
          <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-10">

            {activeStep === 1 ? (
              /* --- STEP 1: INPUT --- */
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Create New Design
                  </h1>
                  <p className="text-gray-500">Paste your article and let AI handle the typography and visuals.</p>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative bg-[#16191f] border border-gray-800 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-semibold text-gray-300">Article Content</label>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{articleText.length} characters</span>
                      </div>
                      <textarea
                        value={articleText}
                        onChange={(e) => setArticleText(e.target.value)}
                        placeholder="Paste your blog post, news snippet or creative writing here..."
                        className="w-full h-64 bg-transparent border-none focus:ring-0 text-gray-200 placeholder-gray-600 resize-none text-lg leading-relaxed"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading || articleText.length < 20}
                    className={`w-full py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 shadow-2xl ${loading || articleText.length < 20
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100 hover:scale-[1.01] active:scale-[0.99]'
                      }`}
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" />
                        Analyzing Content...
                      </>
                    ) : (
                      <>
                        <Sparkles />
                        Generate AI Assets
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => setArticleText("The future of artificial intelligence in graphic design is not about replacement, but amplification. Imagine a world where a designer's intent is instantly translated into visual reality. By leveraging large language models like Gemini, we can bridge the gap between abstract ideas and pixel-perfect execution.")}
                      className="text-xs text-gray-500 hover:text-purple-400 underline decoration-gray-700 underline-offset-4"
                    >
                      Use a sample article
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* --- STEP 2: REFINE & REVIEW --- */
              <div className="grid lg:grid-cols-12 gap-10 items-start">

                {/* Left Panel: Preview */}
                <div className="lg:col-span-7 space-y-6 sticky top-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      Live Preview
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">Synced</span>
                    </h2>
                    <div className="flex gap-2">
                      <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"><Smartphone size={16} /></button>
                      <button className="p-2 bg-purple-500 rounded-lg"><Monitor size={16} /></button>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-25"></div>
                    <div className="relative bg-[#16191f] rounded-2xl overflow-hidden border border-gray-700 shadow-2xl scale-100 group-hover:scale-[1.01] transition-transform duration-500">
                      {result && (
                        <CanvasTemplate
                          title={result.title}
                          quote={result.quote}
                          hashtags={result.hashtags}
                          imageUrl={result.imageUrl}
                          template={result.template}
                        />
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Layout className="text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-400">Canva Smart Sync</h4>
                      <p className="text-[11px] text-gray-400">Changes made here will be automatically mapped to your Canva template slots.</p>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Editor */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-[#16191f] border border-gray-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Edit3 size={18} className="text-purple-400" />
                        Component Editor
                      </h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-xs py-1 px-3 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-colors"
                      >
                        {isEditing ? 'Save Changes' : 'Quick Edit'}
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Title Field */}
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Main Headline</label>
                        {isEditing ? (
                          <input
                            value={result?.title}
                            onChange={(e) => updateResultField('title', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                        ) : (
                          <div className="p-3 bg-gray-900/50 rounded-xl border border-transparent text-sm text-gray-300 min-h-[44px]">
                            {result?.title}
                          </div>
                        )}
                      </div>

                      {/* Quote Field */}
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Featured Insights</label>
                        {isEditing ? (
                          <textarea
                            value={result?.quote}
                            onChange={(e) => updateResultField('quote', e.target.value)}
                            rows={3}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                          />
                        ) : (
                          <div className="p-3 bg-gray-900/50 rounded-xl border border-transparent text-sm text-gray-300 italic min-h-[80px]">
                            "{result?.quote}"
                          </div>
                        )}
                      </div>

                      {/* Hashtags Field */}
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Social Tags</label>
                        {isEditing ? (
                          <input
                            value={result?.hashtags}
                            onChange={(e) => updateResultField('hashtags', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                        ) : (
                          <div className="p-3 bg-gray-900/50 rounded-xl border border-transparent text-sm text-purple-400 font-medium">
                            {result?.hashtags}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-10 space-y-3">
                      <button
                        onClick={handleApplyToCanva}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                      >
                        {loading ? <Loader className="animate-spin" /> : <ExternalLink size={18} />}
                        Export to Canva Editor
                      </button>
                      <button
                        onClick={() => setActiveStep(1)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-all"
                      >
                        <RefreshCw size={16} />
                        Start Over
                      </button>
                    </div>
                  </div>

                  {/* AI Insights Card */}
                  <div className="bg-gradient-to-br from-[#1d1f27] to-[#16191f] border border-gray-800 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400" />
                      AI Generation Logic
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Visual Context:</span>
                        <span className="text-gray-300">{result?.imagePrompt ? result.imagePrompt.substring(0, 30) + '...' : 'Generative Abstract'}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Sentiment:</span>
                        <span className="text-green-400 font-bold">Optimistic Professional</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Processing Time:</span>
                        <span className="text-gray-300">4.2s (Cloud Edge)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Area */}
        <footer className="h-10 bg-[#0f1115] border-t border-gray-900 flex items-center justify-between px-6 flex-shrink-0">
          <div className="text-[10px] text-gray-500">
            &copy; 2026 Canva AI Design Platform • Built with Next.js & Google Gemini
          </div>
          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> API Online</span>
            <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
          </div>
        </footer>

      </main>

    </div>
  );
}

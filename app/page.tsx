"use client";

import { useState } from 'react';
import { Sparkles, Loader, Copy, RefreshCw, Smartphone, Tablet, Monitor } from 'lucide-react';
import CanvasTemplate from './components/CanvasTemplate';

type GenerationResult = {
  success: boolean;
  title: string;
  quote: string;
  hashtags: string;
  imageUrl: string;
  imagePrompt: string;
  errorCode?: string;
  template?: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  error?: string;
  fallback?: any;
};

export default function Home() {
  const [articleText, setArticleText] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const exampleArticle = `Artificial intelligence is revolutionizing content creation. With tools like Google's Gemini, designers can now generate stunning graphics in seconds. This technology analyzes text, extracts key insights, and creates visual designs that would normally take hours. The future of design is automated, creative, and accessible to everyone.`;

  const handleGenerate = async () => {
    if (!articleText.trim()) {
      alert('Please enter some article text');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleText })
      });

      const data: GenerationResult = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Generation error:', error);
      setResult({
        success: false,
        title: "Error",
        quote: "Failed to generate design",
        hashtags: "#Error #TryAgain",
        imageUrl: "/fallback-bg.svg",
        imagePrompt: "error illustration",
      });
    } finally {
      setLoading(false);
    }
  };

  const useExample = () => {
    setArticleText(exampleArticle);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(articleText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAll = () => {
    setArticleText('');
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 p-3 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <header className="text-center mb-6 md:mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl sm:rounded-2xl">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent px-2">
              Canva AI Designer
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Transform any article into stunning Canva-style graphics using Google's Gemini AI.
          </p>

          {/* Responsive Indicators */}
          <div className="flex justify-center items-center gap-4 mt-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center gap-1">
              <Tablet className="w-4 h-4" />
              <span>Tablet</span>
            </div>
            <div className="flex items-center gap-1">
              <Monitor className="w-4 h-4" />
              <span>Desktop</span>
            </div>
          </div>
        </header>

        {/* Main Grid - Responsive */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {/* Left Column - Input */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Paste Your Article
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={useExample}
                    className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex-1 sm:flex-none"
                  >
                    Use Example
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-none"
                  >
                    <Copy size={14} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <textarea
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                placeholder="Paste your article here (min. 100 characters)..."
                className="w-full h-48 sm:h-64 bg-gray-900 border border-gray-700 rounded-lg md:rounded-xl p-3 md:p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm md:text-base"
                rows={6}
              />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4">
                <div className="text-xs md:text-sm text-gray-400">
                  {articleText.length > 0 && (
                    <span>{articleText.length} chars • {(articleText.length / 5).toFixed(0)} words</span>
                  )}
                </div>
                <button
                  onClick={resetAll}
                  className="px-3 py-1.5 text-xs md:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Reset All
                </button>
              </div>
            </div>

            {/* Generate Button - Responsive */}
            <button
              onClick={handleGenerate}
              disabled={loading || articleText.length < 10}
              className={`w-full py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 ${loading || articleText.length < 10
                ? 'bg-gray-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg md:shadow-xl shadow-purple-500/30'
                }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm md:text-base">Generating with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm md:text-base">Generate Canva Design</span>
                </>
              )}
            </button>

            {/* Stats - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
              <div className="bg-gray-800/30 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-purple-400">5s</div>
                <div className="text-xs md:text-sm text-gray-400">Gen Time</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-blue-400">AI</div>
                <div className="text-xs md:text-sm text-gray-400">Gemini</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-green-400">PNG</div>
                <div className="text-xs md:text-sm text-gray-400">Download</div>
              </div>
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold">AI-Generated Design</h2>
                {result && (
                  <button
                    onClick={() => handleGenerate()}
                    className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1 md:gap-2"
                  >
                    <RefreshCw size={14} />
                    <span className="text-xs md:text-sm">Regenerate</span>
                  </button>
                )}
              </div>

              {result ? (
                <>
                  {result.error && result.errorCode !== "RATE_LIMIT" ? (
                    <div className="text-center py-4 md:py-8">
                      <div className="text-red-400 mb-2 text-sm md:text-base">Error: {result.error}</div>
                      <div className="text-gray-400 text-xs md:text-sm">Using fallback design...</div>
                    </div>
                  ) : null}

                  {/* Template Container - Responsive */}
                  <div className="overflow-hidden pb-4">
                    <div className="w-full max-w-full">
                      <CanvasTemplate
                        title={result.title}
                        quote={result.quote}
                        hashtags={result.hashtags}
                        imageUrl={result.imageUrl}
                        template={result.template}
                      />
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-700">
                    <h3 className="font-medium mb-2 md:mb-3 text-sm md:text-base">AI Insights</h3>
                    <div className="space-y-2 text-xs md:text-sm">
                      <div className="flex flex-col sm:flex-row justify-between gap-1">
                        <span className="text-gray-400">Image Prompt:</span>
                        <span className="text-gray-300 text-right sm:text-left">
                          {result.imagePrompt && result.imagePrompt.length > 60 ? result.imagePrompt.substring(0, 60) + '...' : result.imagePrompt || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400">Ready</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 md:py-12 space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg md:rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-300 text-sm md:text-base">No Design Yet</h3>
                    <p className="text-gray-500 text-xs md:text-sm max-w-sm mx-auto px-4">
                      Paste an article and click generate to create your first AI-powered graphic.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions - Responsive */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-500/30">
              <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <Sparkles size={14} className="md:w-4 md:h-4" />
                How It Works
              </h3>
              <ul className="space-y-2 text-xs md:text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-purple-500/30 flex items-center justify-center text-xs mt-0.5">1</div>
                  Paste any article or text content
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-500/30 flex items-center justify-center text-xs mt-0.5">2</div>
                  Gemini AI extracts key insights
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-green-500/30 flex items-center justify-center text-xs mt-0.5">3</div>
                  Download as PNG in Canva style
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer - Responsive */}
        <footer className="mt-6 md:mt-8 lg:mt-12 pt-4 md:pt-6 lg:pt-8 border-t border-gray-800 text-center text-gray-500 text-xs md:text-sm">
          <p className="px-4">
            Built with Next.js, Google Gemini AI • Generates designs in seconds • Not affiliated with Canva Inc.
          </p>
        </footer>
      </div>
    </main>
  );
}

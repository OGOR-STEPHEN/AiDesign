"use client";

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

type TemplateProps = {
  title: string;
  quote: string;
  hashtags: string;
  imageUrl: string;
  template?: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
};

export default function CanvasTemplate({
  title,
  quote,
  hashtags,
  imageUrl,
  template = {
    backgroundColor: "#4F46E5",
    textColor: "#FFFFFF",
    accentColor: "#FBBF24"
  }
}: TemplateProps) {
  const templateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!templateRef.current) {
      alert('Template not ready. Please try again.');
      return;
    }

    setIsDownloading(true);
    try {
      console.log('Starting download...');

      // Clone and sanitize styles to avoid unsupported color functions (lab/oklab/etc)
      const element = templateRef.current.cloneNode(true) as HTMLElement;
      document.body.appendChild(element);
      element.style.position = 'fixed';
      element.style.left = '-9999px';
      element.style.top = '-9999px';

      const sanitizeColors = (el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        const props = [
          'backgroundColor',
          'color',
          'borderColor',
          'outlineColor',
          'textDecorationColor',
          'boxShadow',
          'backgroundImage'
        ];

        const needsFix = (val: string) =>
          val.includes('lab(') ||
          val.includes('lch(') ||
          val.includes('oklab') ||
          val.includes('oklch') ||
          val.includes('color-mix');

        props.forEach((prop) => {
          const val = style[prop as keyof CSSStyleDeclaration];
          if (typeof val === 'string' && needsFix(val)) {
            if (prop === 'color') {
              el.style.color = template.textColor;
            } else if (prop === 'backgroundColor' || prop === 'backgroundImage') {
              el.style.backgroundColor = template.backgroundColor;
              el.style.backgroundImage = 'none';
            } else if (prop.includes('Color')) {
              el.style.borderColor = 'transparent';
              if (prop === 'outlineColor') el.style.outlineColor = 'transparent';
              if (prop === 'textDecorationColor') el.style.textDecorationColor = 'transparent';
            } else if (prop === 'boxShadow') {
              el.style.boxShadow = 'none';
            }
          }
        });

        Array.from(el.children).forEach((child) => sanitizeColors(child as HTMLElement));
      };

      let canvas: HTMLCanvasElement;
      try {
        sanitizeColors(element);

        // html2canvas is often more reliable with external images and CORS
        canvas = await html2canvas(element, {
          useCORS: true,
          allowTaint: false,
          backgroundColor: template.backgroundColor,
          scale: 2,
          logging: false,
          removeContainer: true
        });
      } finally {
        if (element.parentElement) element.parentElement.removeChild(element);
      }

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `canva-design-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      console.log('Download successful');
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Detailed error in console';
      alert(`Download failed.\n\nPossible cause: CORS restrictions on the background image.\n\nError: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Template Preview - Responsive Container */}
      <div className="overflow-hidden rounded-lg md:rounded-2xl shadow-lg md:shadow-2xl mx-auto max-w-full">
        <div
          ref={templateRef}
          className="relative w-full aspect-[16/9]"
          style={{ backgroundColor: template.backgroundColor }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={imageUrl}
              alt="Generated background"
              className="w-full h-full object-cover opacity-40"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />
          </div>

          {/* Content - Responsive */}
          <div className="relative p-4 md:p-6 lg:p-8 h-full flex flex-col justify-between">
            {/* Title Section */}
            <div className="space-y-1 md:space-y-2">
              <div
                className="w-10 h-1 md:w-16 md:h-2 rounded-full mb-2 md:mb-4"
                style={{ backgroundColor: template.accentColor }}
              />
              <h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-snug md:leading-tight max-w-full"
                style={{ color: template.textColor }}
              >
                {title && title.length > 100 ? title.substring(0, 100) + '...' : title || 'Untitled'}
              </h2>
            </div>

            {/* Quote Section */}
            <div className="bg-white/10 backdrop-blur-sm p-3 md:p-4 lg:p-6 rounded-lg md:rounded-2xl border border-white/20 my-2 md:my-4">
              <p
                className="text-sm sm:text-base md:text-lg lg:text-xl italic"
                style={{ color: template.textColor }}
              >
                "{quote && quote.length > 150 ? quote.substring(0, 150) + '...' : quote || 'No quote available'}"
              </p>
            </div>

            {/* Hashtags - Responsive */}
            <div className="flex flex-wrap gap-1 md:gap-2">
              {(() => {
                // Ensure hashtags is a string
                const hashtagString: string = typeof hashtags === 'string'
                  ? hashtags
                  : Array.isArray(hashtags)
                    ? (hashtags as string[]).join(' ')
                    : '#AI';

                return hashtagString.split(' ').filter((tag: string) => tag.trim()).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm border border-white/30"
                    style={{
                      backgroundColor: `${template.accentColor}20`,
                      color: template.textColor
                    }}
                  >
                    {tag}
                  </span>
                ));
              })()}
            </div>

            {/* Watermark */}
            <div className="absolute bottom-2 right-2 text-white/40 text-xs md:text-sm">
              Made with AI
            </div>
          </div>
        </div>
      </div>

      {/* Download Button - Responsive */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`flex items-center justify-center gap-2 mx-auto px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold transition-opacity shadow-lg text-sm md:text-base ${isDownloading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            Download Design (1200×630)
          </>
        )}
      </button>

      {/* Size Indicator */}
      <div className="text-center text-gray-500 text-xs md:text-sm">
        <div className="flex justify-center items-center gap-4">
          <span>📱 Mobile Preview</span>
          <span>•</span>
          <span>🖥️ Desktop: 1200×630px</span>
        </div>
      </div>
    </div>
  );
}

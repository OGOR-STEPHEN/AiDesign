"use client";

import { Download, CheckCircle, Camera } from 'lucide-react';
import { useState } from 'react';

interface DownloadProps {
  templateRef: React.RefObject<HTMLDivElement | null>;
  designData: {
    title: string;
    quote: string;
    hashtags: string[];
    template: {
      backgroundColor: string;
      accentColor: string;
      textColor: string;
    };
  };
}

export default function CanvasDownload({ templateRef, designData }: DownloadProps) {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadImage = async () => {
    if (!templateRef.current) {
      setError('Design element not found');
      return;
    }

    setDownloading(true);
    setError(null);
    setSuccess(false);

    try {
      // Dynamic import to avoid SSR
      const html2canvas = (await import('html2canvas')).default;

      // Create a clean clone for html2canvas
      const element = templateRef.current.cloneNode(true) as HTMLElement;

      // Append temporarily
      document.body.appendChild(element);
      element.style.position = 'fixed';
      element.style.left = '-9999px';
      element.style.top = '-9999px';

      // Sanitize colors: recursively replace oklab/oklch with safe values
      const sanitizeColors = (el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        const props = ['backgroundColor', 'color', 'borderColor', 'outlineColor', 'textDecorationColor', 'boxShadow'];

        props.forEach(prop => {
          const val = style[prop as keyof CSSStyleDeclaration];
          if (typeof val === 'string' && (val.includes('oklab') || val.includes('oklch'))) {
            // Replace with safe fallback based on property type
            if (prop === 'color') {
              el.style.color = designData.template.textColor;
            } else if (prop === 'backgroundColor') {
              // If it's the main container or an overlay, we might want specific colors, 
              // but for general sanitization, transparent or the template bg is safer than crashing
              el.style.backgroundColor = designData.template.backgroundColor;
            } else if (prop.includes('Color')) {
              el.style.borderColor = 'transparent';
              if (prop === 'outlineColor') el.style.outlineColor = 'transparent';
            } else if (prop === 'boxShadow') {
              el.style.boxShadow = 'none';
            }
          }
        });

        // Recursively sanitize children
        Array.from(el.children).forEach(child => sanitizeColors(child as HTMLElement));
      };

      // Run sanitization
      sanitizeColors(element);

      // Use simpler configuration
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: designData.template.backgroundColor,
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: true,
      });

      // Remove temporary element
      document.body.removeChild(element);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `canva-design-${Date.now()}.png`;
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }, 'image/png', 0.95);

    } catch (err: any) {
      console.error('Download error:', err);
      setError(err.message || 'Download failed');
      fallbackDownload();
    } finally {
      setDownloading(false);
    }
  };

  const fallbackDownload = () => {
    try {
      // Simple canvas fallback - no html2canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas not supported');

      // Simple design
      ctx.fillStyle = designData.template.backgroundColor;
      ctx.fillRect(0, 0, 1200, 630);

      // Title
      ctx.fillStyle = designData.template.textColor;
      ctx.font = 'bold 60px Arial';
      ctx.fillText(designData.title, 100, 200);

      // Quote
      ctx.font = 'italic 32px Arial';
      ctx.fillText(`"${designData.quote.substring(0, 80)}..."`, 100, 300);

      // Hashtags
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = designData.template.accentColor;
      ctx.fillText(designData.hashtags.join(' '), 100, 400);

      // Watermark
      ctx.font = '20px Arial';
      ctx.fillStyle = designData.template.textColor;
      ctx.fillText('Generated with AI • Canva Style', 100, 550);

      // Download
      const link = document.createElement('a');
      link.download = `canva-fallback-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setSuccess(true);
    } catch (fallbackErr) {
      setError('All methods failed. Try right-click save.');
    }
  };

  const handleManualSave = () => {
    alert('To save manually:\n1. Right-click the design\n2. Select "Save Image As"\n3. Choose PNG format\n4. Save to computer');
  };

  return (
    <div className="space-y-4">
      <button
        onClick={downloadImage}
        disabled={downloading}
        className="w-full py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-98 shadow-xl flex items-center justify-center gap-3 disabled:opacity-70"
        style={{
          background: designData.template.accentColor,
          color: designData.template.textColor
        }}
      >
        {downloading ? (
          <>
            <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
            Generating Image...
          </>
        ) : success ? (
          <>
            <CheckCircle size={24} />
            Downloaded Successfully!
          </>
        ) : (
          <>
            <Download size={24} />
            Download PNG Design
          </>
        )}
      </button>

      <button
        onClick={handleManualSave}
        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
      >
        <Camera size={18} />
        Manual Save Instructions
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">Note: {error}</p>
          <p className="text-sm mt-1">Try manual save or the download still works despite the warning</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <p className="font-medium">✓ Design downloaded!</p>
          <p className="text-sm mt-1">Check your Downloads folder</p>
        </div>
      )}
    </div>
  );
}
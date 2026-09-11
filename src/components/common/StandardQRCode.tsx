import React, { useState, useEffect } from 'react';
import { generateQRCodeSVG, validateQRCode } from '../../services/qr/qrService';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface StandardQRCodeProps {
  url: string;
  size?: number | string;
  className?: string;
  showVerifiedBadge?: boolean;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export const StandardQRCode: React.FC<StandardQRCodeProps> = ({
  url,
  size = 180,
  className = '',
  showVerifiedBadge = false,
  errorCorrectionLevel = 'Q',
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function renderQR() {
      try {
        if (!url) return;
        const svg = await generateQRCodeSVG(url, {
          errorCorrectionLevel,
          margin: 4, // Guaranteed minimum 4-module quiet zone
        });

        // Machine decodability check with jsQR
        const validation = validateQRCode(url, errorCorrectionLevel);

        if (isMounted) {
          setSvgContent(svg);
          setIsValid(validation.success);
          if (!validation.success) {
            setError(validation.error || 'Decoding failed');
          } else {
            setError(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'QR generation error');
          setIsValid(false);
        }
      }
    }

    renderQR();
    return () => {
      isMounted = false;
    };
  }, [url, errorCorrectionLevel]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Pure White Container guaranteeing Quiet Zone & High Contrast */}
      <div
        className="bg-white p-2 rounded-xl flex items-center justify-center shadow-sm"
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
      >
        {svgContent ? (
          <div
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block select-none"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
        )}
      </div>

      {/* Validation status badge */}
      {showVerifiedBadge && (
        <div className="mt-1.5 flex items-center space-x-1 text-[10px] font-semibold">
          {isValid === true ? (
            <span className="text-emerald-600 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>ISO Validated</span>
            </span>
          ) : isValid === false ? (
            <span className="text-rose-600 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{error || 'Invalid'}</span>
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

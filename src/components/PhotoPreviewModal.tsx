import React from 'react';
import { X, Download, ZoomIn } from 'lucide-react';

interface PhotoPreviewModalProps {
  photoUrl: string | null;
  onClose: () => void;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
  photoUrl,
  onClose,
}) => {
  if (!photoUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-[#211a15] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center justify-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-[#885000] transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <img
          src={photoUrl}
          alt="Full size preview"
          className="max-h-[80vh] w-auto object-contain"
        />

        <div className="p-4 bg-[#211a15] w-full flex justify-between items-center text-white text-xs">
          <span>Garment Reference Sketch / Fabric Swatch</span>
          <a
            href={photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-1 text-[#fdbd72] hover:underline"
          >
            <Download className="w-4 h-4" /> Open Full Image
          </a>
        </div>
      </div>
    </div>
  );
};

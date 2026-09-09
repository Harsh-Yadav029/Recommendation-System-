import React from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

export function DocumentationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const pdfUrl = '/CompareX_Technical_Spec.pdf';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'CompareX_Technical_Specification.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#192A2A] border border-[#2D7D7D]/40 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Top Control Header */}
        <div className="bg-[#121E1E] text-white px-5 py-3 flex items-center justify-between shadow-md border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D7D7D] text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  CompareX: Official Technical Specification PDF
                </h3>

              </div>

            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2D7D7D] hover:bg-[#236363] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Download Original PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button 
              onClick={handleOpenNewTab}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
              title="Open PDF in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Fullscreen</span>
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer ml-1"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="flex-1 bg-slate-900 relative overflow-hidden">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full border-0"
          >
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="CompareX Technical Specification PDF"
            >
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-300">
                <p className="mb-4 text-sm">Your browser does not support embedded PDF viewing.</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#2D7D7D] text-white font-bold rounded-xl text-xs"
                >
                  Download PDF to View
                </button>
              </div>
            </iframe>
          </object>
          {/* Bottom overlay to cover GAMMA watermark */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#192A2A] z-10 pointer-events-none" />
        </div>

      </div>
    </div>
  );
}

export default DocumentationModal;

import React, { useState } from 'react';
import { Archive } from 'lucide-react';
import { DropZonePopover, StoredFile } from './DropZonePopover';

export const DropZoneWidget: React.FC = () => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isOver, setIsOver] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type || 'arquivo',
    }));

    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return (
    <div className="relative">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm ${
          isOver
            ? 'bg-blue-500/30 border-2 border-blue-400 scale-105'
            : isOpen
            ? 'bg-amber-500/20 border-amber-400/40'
            : 'bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20'
        }`}
        title={files.length > 0 ? `${files.length} arquivo(s) na prateleira. Clique para ver.` : 'Solte arquivos aqui para guardar temporariamente'}
      >
        <Archive className={`w-5 h-5 transition-colors ${files.length > 0 ? 'text-amber-400' : 'text-white/70'}`} />
        
        {files.length > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-md">
            {files.length}
          </span>
        )}
        
        <span className="text-[8px] font-medium text-white/50 leading-none mt-0.5">
          {files.length > 0 ? 'Pronto' : 'Soltar'}
        </span>
      </div>

      {isOpen && (
        <DropZonePopover
          files={files}
          onClear={clearFiles}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Archive } from 'lucide-react';

export const DropZoneWidget: React.FC = () => {
  const [fileCount, setFileCount] = useState(0);
  const [isOver, setIsOver] = useState(false);

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
    const count = e.dataTransfer.files.length;
    if (count > 0) {
      setFileCount((prev) => prev + count);
    }
  };

  const clearFiles = () => {
    if (fileCount > 0) {
      setFileCount(0);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={clearFiles}
      className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm ${
        isOver
          ? 'bg-blue-500/30 border-2 border-blue-400 scale-105'
          : 'bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20'
      }`}
      title={fileCount > 0 ? `${fileCount} arquivo(s) na prateleira. Clique para limpar.` : 'Solte arquivos aqui para guardar temporariamente'}
    >
      <Archive className={`w-5 h-5 transition-colors ${fileCount > 0 ? 'text-amber-400' : 'text-white/70'}`} />
      
      {fileCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-md">
          {fileCount}
        </span>
      )}
      
      <span className="text-[8px] font-medium text-white/50 leading-none mt-0.5">
        {fileCount > 0 ? 'Pronto' : 'Soltar'}
      </span>
    </div>
  );
};

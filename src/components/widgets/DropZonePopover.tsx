import React from 'react';
import { Trash2, ExternalLink, FileText, FolderArchive } from 'lucide-react';
import { tauriService } from '../../services/tauri';

export interface StoredFile {
  name: string;
  size: number;
  type: string;
}

interface DropZonePopoverProps {
  files: StoredFile[];
  onClear: () => void;
  onClose?: () => void;
}

export const DropZonePopover: React.FC<DropZonePopoverProps> = ({ files, onClear }) => {
  const openInExplorer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // No Windows, abre o diretório temporário ou pasta de Downloads via explorer.exe
    await tauriService.launchApp('explorer.exe');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div 
      className="absolute bottom-16 left-1/2 -translate-x-1/2 w-72 p-3.5 rounded-2xl bg-neutral-900/95 border border-white/20 shadow-2xl backdrop-blur-2xl text-white select-none z-50 animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-white">Prateleira de Arquivos</span>
        </div>
        <span className="text-[11px] font-semibold text-white/50">
          {files.length} item(ns)
        </span>
      </div>

      {/* Lista de Arquivos */}
      <div className="my-2 max-h-48 overflow-y-auto space-y-1.5 pr-1">
        {files.length === 0 ? (
          <div className="py-6 text-center text-xs text-white/40">
            Nenhum arquivo guardado no momento.
          </div>
        ) : (
          files.map((file, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-white truncate max-w-[150px]">
                    {file.name}
                  </span>
                  <span className="text-[9px] text-white/40">
                    {formatSize(file.size)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rodapé com Ações */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          onClick={openInExplorer}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-colors"
          title="Abrir pasta no Windows Explorer"
        >
          <ExternalLink className="w-3 h-3 text-blue-300" />
          <span>Explorador</span>
        </button>

        {files.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 text-xs font-medium transition-colors"
            title="Esvaziar prateleira"
          >
            <Trash2 className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

interface ScientificUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.tex,.txt';

const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  tex: '📐',
  txt: '📃',
};

function getFileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ScientificUploader: React.FC<ScientificUploaderProps> = ({
  onUpload,
  accept = ACCEPTED_EXTENSIONS,
  maxFiles = 10,
  className = '',
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const remaining = maxFiles - files.length;
    const toAdd = fileArray.slice(0, remaining).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...toAdd]);
  }, [files.length, maxFiles]);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    // Simulate per-file progress
    for (let i = 0; i < files.length; i++) {
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );
      // Simulate upload progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 80));
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, progress: Math.min(p, 100) } : f
          )
        );
      }
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'done', progress: 100 } : f
        )
      );
    }

    try {
      await onUpload(files.map((f) => f.file));
    } catch {
      // Error handling done by parent
    }
    setIsUploading(false);
  };

  return (
    <div className={['flex flex-col gap-4', className].join(' ')}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-xl cursor-pointer',
          'border-2 border-dashed transition-all duration-200',
          isDragOver
            ? 'border-accent-500 bg-accent-50/50 dark:bg-accent-950/20 scale-[1.01]'
            : 'border-slate-300 bg-slate-50/50 hover:border-accent-400 hover:bg-accent-50/30 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-accent-600 dark:hover:bg-accent-950/10',
        ].join(' ')}
      >
        <div className={[
          'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-200',
          isDragOver
            ? 'bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-400'
            : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500',
        ].join(' ')}>
          <UploadCloud className="w-7 h-7" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Arrastra tus documentos aquí
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
            o haz click para seleccionar · PDF, Word, LaTeX, TXT · Máx. {maxFiles} archivos
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((item) => {
            const ext = getFileExtension(item.file.name);
            const icon = FILE_ICONS[ext] || '📄';
            return (
              <div
                key={item.id}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200',
                  'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800',
                  item.status === 'done' ? 'border-emerald-200 dark:border-emerald-800/50' : '',
                ].join(' ')}
              >
                <span className="text-xl shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    {formatSize(item.file.size)} · .{ext.toUpperCase()}
                  </p>
                  {/* Progress Bar */}
                  {item.status === 'uploading' && (
                    <div className="mt-1.5 h-1 w-full rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-500 transition-all duration-300 ease-out"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {item.status === 'done' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : item.status === 'uploading' ? (
                    <Loader2 className="w-5 h-5 text-accent-500 animate-spin" />
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                      disabled={isUploading}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50"
                      aria-label="Remover archivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit */}
      {files.length > 0 && files.some((f) => f.status === 'pending') && (
        <Button
          variant="primary"
          icon={<UploadCloud className="w-4 h-4" />}
          isLoading={isUploading}
          onClick={handleSubmit}
          className="self-end"
        >
          {isUploading ? 'Subiendo...' : `Subir ${files.filter(f => f.status === 'pending').length} archivo(s)`}
        </Button>
      )}
    </div>
  );
};

import { useState, useCallback, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ImageDropZoneProps {
  onFileSelect: (file: File) => void;
  preview?: string;
  onRemove?: () => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  previewClassName?: string;
  onError?: (message: string) => void;
}

export const ImageDropZone = ({
  onFileSelect,
  preview,
  onRemove,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 10,
  label,
  hint,
  disabled = false,
  className,
  previewClassName,
  onError,
}: ImageDropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback((file: File) => {
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`Bildet kan ikke være større enn ${maxSizeMB} MB`);
      return;
    }
    // Validate type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      onError?.('Kun JPG, PNG og WebP er tillatt');
      return;
    }
    onFileSelect(file);
  }, [onFileSelect, accept, maxSizeMB, onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSelect(files[0]);
    }
  }, [disabled, validateAndSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelect(file);
    }
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [validateAndSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  if (preview) {
    return (
      <div className={cn("relative", className)}>
        <img
          src={preview}
          alt="Forhåndsvisning"
          className={cn("w-full h-48 object-cover rounded-lg", previewClassName)}
        />
        {onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all",
        isDragOver
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <Upload className={cn(
        "w-8 h-8 mb-2 transition-colors",
        isDragOver ? "text-primary" : "text-muted-foreground"
      )} />
      <p className="text-sm text-muted-foreground text-center px-4">
        {label || "Klikk eller dra og slipp"}
      </p>
      {hint && (
        <p className="text-xs text-muted-foreground mt-1 text-center px-4">{hint}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
};

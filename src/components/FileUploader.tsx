import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from "react";

interface Props {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUploader({ onFileSelect, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect, disabled]
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      e.target.value = "";
    },
    [onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200
        ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-4xl mb-4">
        {disabled ? (
          <div className="inline-block animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        ) : (
          <span>&#128196;</span>
        )}
      </div>
      <p className="text-lg font-medium text-gray-700">
        {disabled
          ? "Parsing..."
          : "Drop STDF file here or click to browse"}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Supports .stdf, .std, .stdf.gz
      </p>
    </div>
  );
}

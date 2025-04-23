import { useState, useRef } from 'react';
import { UploadCloud, Image, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({
  onFileSelect,
  accept = "image/*",
  maxSize = 10
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    
    // Check file type
    if (accept !== '*' && !file.type.includes(accept.replace('*', ''))) {
      setError('Invalid file type');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl cursor-pointer ${
          isDragging
            ? 'border-accent bg-primary-700'
            : 'border-primary-500 bg-primary-800'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="space-y-2 text-center">
          {selectedFile ? (
            <div className="flex flex-col items-center">
              {selectedFile.type.includes('image') ? (
                <Image className="h-12 w-12 text-primary-500 mb-2" />
              ) : (
                <FileText className="h-12 w-12 text-primary-500 mb-2" />
              )}
              <p className="text-primary-100 font-medium">{selectedFile.name}</p>
              <p className="text-xs text-primary-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB
              </p>
            </div>
          ) : (
            <>
              <UploadCloud className="mx-auto h-12 w-12 text-primary-500" />
              <div className="flex text-sm text-primary-300">
                <label className="relative cursor-pointer rounded-md font-medium text-accent hover:text-accent/90">
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept={accept}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-primary-400">
                PNG, JPG, DICOM up to {maxSize}MB
              </p>
            </>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

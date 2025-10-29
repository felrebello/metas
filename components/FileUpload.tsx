import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File, shouldReplace: boolean) => void;
  isLoading: boolean;
  hasExistingData: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading, hasExistingData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shouldReplace, setShouldReplace] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file, shouldReplace);
      // Reset the input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {hasExistingData && (
        <div className="w-full bg-base-200 p-3 rounded-lg border border-brand-yellow/30">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shouldReplace}
              onChange={(e) => setShouldReplace(e.target.checked)}
              className="checkbox checkbox-sm checkbox-warning"
              disabled={isLoading}
            />
            <span className="text-sm text-text-secondary">
              Substituir dados existentes (limpar antes de importar)
            </span>
          </label>
          {!shouldReplace && (
            <p className="text-xs text-amber-500 mt-2 ml-6">
              Os novos dados serão somados aos existentes
            </p>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx, .xls, .csv, .txt"
        disabled={isLoading}
      />
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full bg-brand-yellow hover:bg-amber-500 text-brand-gray font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processando...
          </>
        ) : 'Carregar Relatório'}
      </button>
      <p className="text-sm text-text-secondary">Arquivos .xlsx, .xls, .csv ou .txt são aceitos</p>
    </div>
  );
};

export default FileUpload;
import React, { useState } from 'react';
import FileUpload from './FileUpload';

interface AdminPanelProps {
  onFileUpload: (file: File, shouldReplace: boolean) => void;
  isLoading: boolean;
  error: string | null;
  currentTarget: number;
  onSetTarget: (newTarget: number) => void;
  onClearData: () => void;
  hasExistingData: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  onFileUpload,
  isLoading,
  error,
  currentTarget,
  onSetTarget,
  onClearData,
  hasExistingData
}) => {
  const [targetInput, setTargetInput] = useState(currentTarget.toString());

  const handleSetTarget = () => {
    const newTarget = parseFloat(targetInput);
    if (!isNaN(newTarget) && newTarget > 0) {
      onSetTarget(newTarget);
    } else {
      alert("Por favor, insira um valor numérico válido para a meta.");
    }
  };

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg border-2 border-brand-yellow/50">
      <h2 className="text-2xl font-bold mb-6 text-text-primary text-center">Painel Administrativo</h2>

      {/* Set Target Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3 text-text-primary">Definir Meta Financeira</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSetTarget()}
            placeholder="Ex: 6000000"
            className="flex-grow bg-base-300 border border-base-100 text-text-primary rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
          <button
            onClick={handleSetTarget}
            className="bg-brand-gray hover:bg-gray-800 text-brand-yellow font-bold py-2 px-4 rounded-md transition-colors duration-300"
          >
            Salvar Meta
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-text-primary">Atualizar Progresso</h3>
        <FileUpload
          onFileUpload={onFileUpload}
          isLoading={isLoading}
          hasExistingData={hasExistingData}
        />
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>

      {/* Clear Data Section */}
      {hasExistingData && (
        <div className="pt-6 border-t border-base-300">
          <button
            onClick={onClearData}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpar Todos os Dados
          </button>
          <p className="text-xs text-text-secondary text-center mt-2">
            Remove todos os dados e histórico da unidade
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
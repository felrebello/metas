import React, { useState } from 'react';
import FileUpload from './FileUpload';

interface AdminPanelProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
  currentTarget: number;
  onSetTarget: (newTarget: number) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onFileUpload, 
  isLoading, 
  error,
  currentTarget,
  onSetTarget
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
      <div>
        <h3 className="text-xl font-semibold mb-3 text-text-primary">Atualizar Progresso</h3>
        <FileUpload onFileUpload={onFileUpload} isLoading={isLoading} />
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default AdminPanel;
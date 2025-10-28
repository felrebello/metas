import React, { useState, useEffect } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (code: string) => void;
  error: string | null;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin, error }) => {
  const [code, setCode] = useState('');

  // Limpa o código quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      setCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(code);
  };

  return (
    <div 
      className="fixed inset-0 bg-base-100 bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose} // Fecha ao clicar no fundo
    >
      <div 
        className="bg-base-200 rounded-lg shadow-2xl p-8 max-w-sm w-full relative"
        onClick={(e) => e.stopPropagation()} // Impede o fechamento ao clicar dentro do modal
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-base-300 transition-colors"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-center mb-6 text-text-primary">Acesso Administrativo</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-code" className="sr-only">Código de Acesso</label>
          <input
            id="admin-code"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Digite o código de acesso"
            autoFocus
            className="w-full bg-base-300 border border-base-100 text-text-primary rounded-md px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brand-yellow hover:bg-amber-500 text-brand-gray font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
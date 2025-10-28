import React, { useState } from 'react';
import { getGroundedAnswer } from '../services/geminiService';
import { GroundingChunk } from '../types';

const GroundedSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse('');
    setSources([]);
    const result = await getGroundedAnswer(query);
    setResponse(result.text);
    setSources(result.sources);
    setIsLoading(false);
  };

  return (
    <div className="bg-base-200 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-text-primary">Perguntas e Respostas</h3>
      <p className="text-text-secondary mb-4">Faça uma pergunta para obter informações atualizadas do Google.</p>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ex: Tendências atuais do mercado"
          className="flex-grow bg-base-300 border border-base-100 text-text-primary rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="bg-brand-yellow hover:bg-amber-500 text-brand-gray font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
             <svg className="animate-spin h-5 w-5 text-brand-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : 'Perguntar'}
        </button>
      </div>
      {response && (
        <div className="mt-4 p-4 bg-base-300 rounded-md">
          <p className="text-text-primary whitespace-pre-wrap">{response}</p>
          {sources.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-text-secondary">Fontes:</h4>
              <ul className="list-disc list-inside mt-2">
                {sources.filter(s => s.web).map((source, index) => (
                  <li key={index} className="truncate">
                    <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                      {source.web?.title || source.web?.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroundedSearch;
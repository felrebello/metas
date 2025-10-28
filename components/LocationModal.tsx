import React from 'react';
import Logo from './Logo';

interface LocationModalProps {
  onSelectUnit: (unit: string) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ onSelectUnit }) => {
  const units = ['Barra da Tijuca', 'Teresópolis', 'Magé'];

  return (
    <div className="fixed inset-0 bg-base-100 bg-opacity-95 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-50">
      <div className="bg-base-200 rounded-2xl shadow-2xl p-8 sm:p-12 text-center max-w-md w-full">
        <div className="w-56 mx-auto mb-6">
          <Logo />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Bem-vindo(a)</h2>
        <p className="text-text-secondary mb-8">Por favor, selecione sua unidade para continuar.</p>
        <div className="flex flex-col gap-4">
          {units.map((unit) => (
            <button
              key={unit}
              onClick={() => onSelectUnit(unit)}
              className="w-full bg-brand-yellow hover:bg-amber-500 text-brand-gray font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
              {unit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
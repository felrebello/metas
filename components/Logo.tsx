import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tooth Icon */}
        <g transform="translate(20, 40)">
          <path
            d="M80 10 C60 10, 40 20, 40 40 C40 50, 35 60, 30 80 C25 100, 20 120, 30 130 C35 135, 45 135, 50 130 C55 125, 55 115, 60 105 C65 115, 65 125, 70 130 C75 135, 85 135, 90 130 C100 120, 95 100, 90 80 C85 60, 80 50, 80 40 C80 20, 100 10, 120 10 C140 10, 160 20, 160 40 C160 50, 165 60, 170 80 C175 100, 180 120, 170 130 C165 135, 155 135, 150 130 C145 125, 145 115, 140 105 C135 115, 135 125, 130 130 C125 135, 115 135, 110 130 C100 120, 105 100, 110 80 C115 60, 120 50, 120 40 C120 20, 100 20, 80 20 L80 10"
            fill="#FCD34D"
            stroke="#F59E0B"
            strokeWidth="3"
          />
        </g>

        {/* Text */}
        <text
          x="100"
          y="165"
          textAnchor="middle"
          className="font-bold"
          style={{ fontSize: '24px', fill: '#FCD34D' }}
        >
          NORT
        </text>
        <text
          x="100"
          y="188"
          textAnchor="middle"
          className="font-semibold"
          style={{ fontSize: '14px', fill: '#D1D5DB' }}
        >
          Radiologia Odontológica
        </text>
      </svg>
    </div>
  );
};

export default Logo;
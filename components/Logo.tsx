import React from 'react';
import logoImg from './logo.png';

const Logo: React.FC = () => {
  return (
    <img
      src={logoImg}
      alt="Nort Radiologia Odontológica Logo"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default Logo;
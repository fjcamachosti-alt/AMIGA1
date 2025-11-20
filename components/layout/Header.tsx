
import React from 'react';

interface HeaderProps {
  onLogout: () => void;
  toggleSidebar: () => void;
  userName: string;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, toggleSidebar, userName }) => {
  return (
    <header className="bg-surface h-16 flex items-center justify-between px-6 border-b border-gray-700 sticky top-0 z-30">
        <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="text-gray-400 hover:text-white md:hidden">
                <i data-lucide="menu"></i>
            </button>
            <h1 className="text-lg font-bold hidden sm:block text-gray-200">Aplicación Modular Inteligente de Gestion Avanzada</h1>
        </div>
      
      <div className="flex items-center gap-4">
        <span className="text-gray-300">Bienvenido, {userName}</span>
        <button onClick={onLogout} title="Cerrar sesión" className="text-gray-400 hover:text-white">
            <i data-lucide="log-out"></i>
        </button>
      </div>
    </header>
  );
};
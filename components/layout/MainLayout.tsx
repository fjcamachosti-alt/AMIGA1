
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Page, User } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: User | null;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout, currentPage, onNavigate, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // This is to ensure lucide icons are rendered after component mount/update
    window.lucide?.createIcons();
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} isOpen={isSidebarOpen} user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} toggleSidebar={toggleSidebar} userName={user?.nombre || 'Usuario'} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

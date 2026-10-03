'use client';

import React, { useState } from 'react';
import { UserSession } from '@/types';
import { AdminSidebar } from './AdminSidebar';
import { TeacherSidebar } from './TeacherSidebar';
import { StudentSidebar } from './StudentSidebar';
import { Navbar } from './Navbar';
import { ToastProvider } from '@/components/ui/Toast';

interface AppLayoutProps {
  user: UserSession;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ user, children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderSidebar = (onClose?: () => void) => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminSidebar onCloseMobile={onClose} />;
      case 'TEACHER':
        return <TeacherSidebar onCloseMobile={onClose} />;
      case 'STUDENT':
        return <StudentSidebar onCloseMobile={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        {renderSidebar()}
      </aside>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-64 max-w-full z-50">
            {renderSidebar(() => setIsMobileOpen(false))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Navbar user={user} onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

'use client';

import { useState, ReactNode } from 'react';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`
          min-h-screen
          transition-all duration-300 ease-out
          lg:pl-64
          ${sidebarCollapsed ? 'lg:pl-20' : ''}
        `}
      >
        {/* Header */}
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
          showMenuButton={true}
        />

        {/* Page Content */}
        <main id="main-content" className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import { Menu, X } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);

  // Auto-collapse sidebar on resize when switching to mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Premium background blurs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      {/* Backdrop overlay on mobile when sidebar is open */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 animate-fade-in"
          onClick={() => setCollapsed(true)}
        />
      )}

      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <main className="flex-1 min-w-0 overflow-x-hidden relative z-10 flex flex-col">
        {/* Mobile top navigation header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md md:hidden sticky top-0 z-20">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Menu"
          >
            {collapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-white">PS</span>
            </div>
            <span className="font-heading font-bold text-white text-sm tracking-tight">ProjectSphere</span>
          </div>
          
          <div className="w-9" />
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

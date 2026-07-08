import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Premium background blurs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 min-w-0 overflow-x-hidden relative z-10">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

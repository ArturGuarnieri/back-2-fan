
import React from 'react';
import PublicHeader from './PublicHeader';
import { Outlet } from 'react-router-dom';

const PublicPageLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <PublicHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicPageLayout;

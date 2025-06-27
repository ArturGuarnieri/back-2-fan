
import React, { useState } from 'react';
import { Coins, Menu } from 'lucide-react';
import WalletConnector from '@/components/WalletConnector';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import MobileNavbar from './MobileNavbar';
import LanguageSwitcher from './LanguageSwitcher';
import CountrySwitcher from './CountrySwitcher';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/hooks/useAdmin';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAdmin();
  
  // Salvar país em localStorage para persistência básica
  const [country, setCountry] = React.useState(() => {
    return localStorage.getItem('selectedCountry') || 'BR';
  });

  const handleSetCountry = (newCountry: string) => {
    setCountry(newCountry);
    localStorage.setItem('selectedCountry', newCountry);
    window.dispatchEvent(new Event('countryChanged'));
  };

  React.useEffect(() => {
    // sincronizar abas abertas
    const listener = () => setCountry(localStorage.getItem('selectedCountry') || 'BR');
    window.addEventListener('countryChanged', listener);
    return () => window.removeEventListener('countryChanged', listener);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-red-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img src="/lovable-uploads/8038e957-dab5-457d-a12b-6f5b1b8ca374.png" alt="Back2Fan" className="w-16 h-16" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">{t('header_brand')}</h1>
                <p className="text-sm text-gray-600">{t('hero_simple_message')}</p>
              </div>
            </Link>
            <Navbar />
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            <CountrySwitcher country={country} setCountry={handleSetCountry} />
            <LanguageSwitcher />
            <Link to="/settings">
              <Button variant="outline" size="sm">{t('configurations')}</Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                  {t('admin')}
                </Button>
              </Link>
            )}
            <WalletConnector />
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-2">
            <div className="max-w-[120px] overflow-hidden">
              <WalletConnector />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t('open_menu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 pt-8">
                <MobileNavbar />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

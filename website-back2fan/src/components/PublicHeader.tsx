
import React, { useEffect, useState } from 'react';
import { Gift, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CountrySwitcher from '@/components/CountrySwitcher';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import WalletConnector from '@/components/WalletConnector';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const PublicHeader = () => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  const [country, setCountry] = useState(() => localStorage.getItem('selectedCountry') || 'BR');
  const [language, setLanguage] = useState(() => localStorage.getItem('i18nextLng') || 'en');

  useEffect(() => {
    localStorage.setItem('selectedCountry', country);
    window.dispatchEvent(new Event('countryChanged'));
  }, [country]);

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
      localStorage.setItem('i18nextLng', language);
    }
  }, [language, i18n]);

  const MobileMenu = () => (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex flex-col space-y-3">
        <CountrySwitcher country={country} setCountry={setCountry} />
        <LanguageSwitcher language={language} setLanguage={setLanguage} />
      </div>
      <div className="pt-4 border-t">
        <WalletConnector />
      </div>
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <img src="/lovable-uploads/8038e957-dab5-457d-a12b-6f5b1b8ca374.png" alt="Back2Fan" className="w-16 h-16" />
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('header_title')}</h1>
              <p className="text-xs lg:text-sm text-gray-600">{t('hero_simple_message')}</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-lg font-bold text-gray-900">{t('header_title')}</h1>
            </div>
          </Link>

          {/* Desktop Menu */}
          {!isMobile && (
            <div className="flex items-center space-x-3">
              <CountrySwitcher country={country} setCountry={setCountry} />
              <LanguageSwitcher language={language} setLanguage={setLanguage} />
              <WalletConnector />
            </div>
          )}

          {/* Mobile Menu */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <MobileMenu />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;

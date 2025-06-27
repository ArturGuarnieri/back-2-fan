
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Coins, HandCoins, Handshake, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SheetClose } from '@/components/ui/sheet';
import CountrySwitcher from './CountrySwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';

const MobileNavbar = () => {
    const { t } = useTranslation();
    const { isAdmin } = useAdmin();
    
    // Get country state from localStorage
    const [country, setCountry] = React.useState(() => {
        return localStorage.getItem('selectedCountry') || 'BR';
    });

    const handleSetCountry = (newCountry: string) => {
        setCountry(newCountry);
        localStorage.setItem('selectedCountry', newCountry);
        window.dispatchEvent(new Event('countryChanged'));
    };

    React.useEffect(() => {
        const listener = () => setCountry(localStorage.getItem('selectedCountry') || 'BR');
        window.addEventListener('countryChanged', listener);
        return () => window.removeEventListener('countryChanged', listener);
    }, []);

    const navLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: t('nav_dashboard') },
        { to: '/staking', icon: HandCoins, label: t('nav_staking') },
        { to: '/tokens', icon: Coins, label: t('nav_fan_tokens') },
        { to: '/partners', icon: Handshake, label: t('nav_partners') },
    ];

    const activeLinkClass = "bg-red-50 text-red-600";
    const inactiveLinkClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

    return (
        <nav className="flex flex-col p-4">
            {/* Navigation Links */}
            <div className="flex flex-col space-y-2 mb-6">
                {navLinks.map(({ to, icon: Icon, label }) => (
                    <SheetClose key={to} asChild>
                        <NavLink
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`
                            }
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {label}
                        </NavLink>
                    </SheetClose>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-4"></div>

            {/* Settings Section */}
            <div className="flex flex-col space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4">
                    {t('configurations')}
                </h3>
                
                {/* Country and Language Switchers */}
                <div className="flex flex-col space-y-3 px-4">
                    <CountrySwitcher country={country} setCountry={handleSetCountry} />
                    <LanguageSwitcher />
                </div>

                {/* Settings and Admin Links */}
                <div className="flex flex-col space-y-2">
                    <SheetClose asChild>
                        <Link to="/settings">
                            <Button variant="outline" className="w-full justify-start">
                                <Settings className="w-4 h-4 mr-2" />
                                {t('configurations')}
                            </Button>
                        </Link>
                    </SheetClose>
                    
                    {isAdmin && (
                        <SheetClose asChild>
                            <Link to="/admin">
                                <Button variant="outline" className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50">
                                    <Settings className="w-4 h-4 mr-2" />
                                    {t('admin')}
                                </Button>
                            </Link>
                        </SheetClose>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default MobileNavbar;

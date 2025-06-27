
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Coins, HandCoins, Handshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t } = useTranslation();
  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav_dashboard') },
    { to: '/staking', icon: HandCoins, label: t('nav_staking') },
    { to: '/tokens', icon: Coins, label: t('nav_fan_tokens') },
    { to: '/partners', icon: Handshake, label: t('nav_partners') },
  ];

  const activeLinkClass = "bg-red-50 text-red-600";
  const inactiveLinkClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <nav className="hidden md:flex items-center space-x-2">
      {navLinks.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`
          }
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
